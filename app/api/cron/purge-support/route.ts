import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { AwsClient } from "aws4fetch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manquante");
  return neon(url);
}

function cleanUrl(url: string) {
  let c = (url || "").trim();
  if (c.endsWith("/")) c = c.slice(0, -1);
  return c;
}

interface StorageNode {
  id: number;
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl: string;
}

function getStorageNodes(): StorageNode[] {
  const nodes: StorageNode[] = [];
  const baseAccessKey = process.env.S3_ACCESS_KEY_ID || process.env.Z1_ACCESS_KEY_ID || "";
  const baseSecretKey = process.env.S3_SECRET_ACCESS_KEY || process.env.Z1_SECRET_ACCESS_KEY || "";
  const baseEndpoint = cleanUrl(process.env.S3_ENDPOINT || process.env.Z1_ENDPOINT || "https://s3.z1storage.com");
  const baseRegion = process.env.S3_REGION || process.env.Z1_REGION || "auto";
  for (let i = 1; i <= 10; i++) {
    const bucket = process.env[`S3_BUCKET_${i}`] || process.env[`Z1_BUCKET_${i}`];
    const accessKeyId = process.env[`S3_ACCESS_KEY_ID_${i}`] || process.env[`Z1_ACCESS_KEY_ID_${i}`] || baseAccessKey;
    const secretAccessKey = process.env[`S3_SECRET_ACCESS_KEY_${i}`] || process.env[`Z1_SECRET_ACCESS_KEY_${i}`] || baseSecretKey;
    const endpoint = cleanUrl(process.env[`S3_ENDPOINT_${i}`] || process.env[`Z1_ENDPOINT_${i}`] || baseEndpoint);
    const region = process.env[`S3_REGION_${i}`] || process.env[`Z1_REGION_${i}`] || baseRegion;
    const publicUrl = process.env[`S3_PUBLIC_URL_${i}`] || process.env[`Z1_PUBLIC_URL_${i}`] ? cleanUrl(process.env[`S3_PUBLIC_URL_${i}`] || process.env[`Z1_PUBLIC_URL_${i}`] as string) : `${endpoint}/${bucket}`;
    if (bucket && accessKeyId && secretAccessKey) {
      nodes.push({ id: i, endpoint, region, accessKeyId, secretAccessKey, bucket, publicUrl: publicUrl || `${endpoint}/${bucket}` });
    }
  }
  if (nodes.length === 0 && baseAccessKey && baseSecretKey) {
    const b = process.env.S3_BUCKET || "mai-storage-1";
    nodes.push({ id: 1, endpoint: baseEndpoint, region: baseRegion, accessKeyId: baseAccessKey, secretAccessKey: baseSecretKey, bucket: b, publicUrl: `${baseEndpoint}/${b}` });
  }
  return nodes;
}

function findNodeForKey(fileKey: string, fileUrl?: string): { node: StorageNode; rawKey: string } | null {
  const nodes = getStorageNodes();
  if (fileKey && fileKey.startsWith("node-")) {
    const parts = fileKey.split(":");
    if (parts.length >= 3) {
      const nodeId = parseInt(parts[0].replace("node-", ""), 10);
      const found = nodes.find((n) => n.id === nodeId);
      if (found) return { node: found, rawKey: parts.slice(2).join(":") };
    }
  }
  for (const node of nodes) {
    if (fileKey && fileKey.startsWith(`${node.bucket}/`)) return { node, rawKey: fileKey.slice(node.bucket.length + 1) };
    if (fileUrl && (fileUrl.includes(`/${node.bucket}/`) || fileUrl.includes(`://${node.bucket}.`))) return { node, rawKey: fileKey };
  }
  if (nodes[0]) return { node: nodes[0], rawKey: fileKey };
  return null;
}

export async function GET(req: NextRequest) {
  // Vérif secret cron (Vercel) ou header interne
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization") || req.headers.get("x-cron-secret") || "";
  const urlSecret = req.nextUrl.searchParams.get("secret") || "";
  const provided = authHeader.replace(/^Bearer\s+/i, "").trim() || urlSecret.trim();

  if (cronSecret && provided !== cronSecret) {
    // Autoriser aussi les appels internes sans secret en dev si pas de CRON_SECRET configuré? Non, bloquer si secret défini
    // En dev, si pas de secret, on autorise
    if (cronSecret) {
      return NextResponse.json({ success: false, error: "Non autorisé (CRON_SECRET invalide)." }, { status: 401 });
    }
  }

  try {
    const sql = getSql();

    // 1. Lister les fichiers à purger AVANT suppression (pour delete Z1)
    let fileKeys: Array<{ file_key: string; file_url: string }> = [];
    try {
      const rows: any[] = await sql`
        SELECT a.file_key, a.file_url FROM support_ticket_attachments a
        JOIN support_tickets t ON t.id = a.ticket_id
        WHERE t.updated_at < NOW() - INTERVAL '365 days'
      `;
      fileKeys = rows as Array<{ file_key: string; file_url: string }>;
    } catch (e: any) {
      if (!String(e?.message || "").includes("does not exist")) {
        console.error("purge list files error", e);
      }
    }

    // 2. Appeler la fonction SQL qui supprime les tickets (cascade)
    let deletedCount = 0;
    try {
      const res = await sql`SELECT purge_inactive_support_tickets() as deleted`;
      deletedCount = parseInt(res[0]?.deleted || "0", 10);
    } catch (e: any) {
      // Fallback si fonction n'existe pas : DELETE direct
      if (String(e?.message || "").includes("does not exist")) {
        const res2 = await sql`DELETE FROM support_tickets WHERE updated_at < NOW() - INTERVAL '365 days' RETURNING id`;
        deletedCount = res2.length;
      } else {
        throw e;
      }
    }

    // 3. Purger Z1 Storage
    let purgedFiles = 0;
    let failedFiles = 0;
    for (const f of fileKeys) {
      const parsed = findNodeForKey(f.file_key, f.file_url);
      if (!parsed) continue;
      try {
        const client = new AwsClient({
          accessKeyId: parsed.node.accessKeyId,
          secretAccessKey: parsed.node.secretAccessKey,
          region: parsed.node.region,
          service: "s3",
        });
        const url = `${parsed.node.endpoint}/${parsed.node.bucket}/${parsed.rawKey}`;
        const res = await client.fetch(url, { method: "DELETE" });
        if (res.ok || res.status === 204 || res.status === 404) purgedFiles++;
        else failedFiles++;
      } catch {
        failedFiles++;
      }
    }

    return NextResponse.json({
      success: true,
      deletedTickets: deletedCount,
      purgedFiles,
      failedFiles,
      checkedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("purge-support error", err);
    return NextResponse.json({ success: false, error: err?.message || "Erreur purge" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
