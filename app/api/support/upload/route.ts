import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { AwsClient } from "aws4fetch";
import {
  SUPPORT_ATTACHMENT_LIMITS,
  isAllowedSupportMime,
  isAdminUser,
} from "@/app/actions/support-utils";
import { authenticateSession } from "@/lib/session-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manquante");
  return neon(url);
}

// Reprend la logique de storage.ts mais adaptée Node (process.env)
interface StorageNode {
  id: number;
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl: string;
}

function cleanUrl(url: string) {
  let c = (url || "").trim();
  if (c.endsWith("/")) c = c.slice(0, -1);
  c = c.replace(/^https:\/\/([^/:]+):443(\/.*)?$/, "https://$1$2");
  c = c.replace(/^http:\/\/([^/:]+):80(\/.*)?$/, "http://$1$2");
  return c;
}

const DEFAULT_FALLBACK = [
  "mai-storage-1",
  "mai-storage-2",
  "mai-storage-3",
  "mai-storage-4",
  "mai-storage-5",
  "mai-storage-6",
  "mai-storage-7",
  "mai-storage-8",
  "mai-storage-9",
  "mai-storage-10",
];

function getStorageNodes(): StorageNode[] {
  const nodes: StorageNode[] = [];
  const baseAccessKey = process.env.S3_ACCESS_KEY_ID || process.env.Z1_ACCESS_KEY_ID || "";
  const baseSecretKey = process.env.S3_SECRET_ACCESS_KEY || process.env.Z1_SECRET_ACCESS_KEY || "";
  const baseEndpoint = cleanUrl(process.env.S3_ENDPOINT || process.env.Z1_ENDPOINT || "https://s3.z1storage.com");
  const baseRegion = process.env.S3_REGION || process.env.Z1_REGION || "auto";
  const baseBucket = process.env.S3_BUCKET || process.env.Z1_BUCKET || "mai-storage-1";
  const basePublicUrl = process.env.S3_PUBLIC_URL || process.env.Z1_PUBLIC_URL;

  for (let i = 1; i <= 10; i++) {
    const bucket =
      process.env[`S3_BUCKET_${i}`] ||
      process.env[`S3_BUCKET${i}`] ||
      process.env[`Z1_BUCKET_${i}`] ||
      process.env[`Z1_BUCKET${i}`];
    const accessKeyId =
      process.env[`S3_ACCESS_KEY_ID_${i}`] ||
      process.env[`S3_ACCESS_KEY_ID${i}`] ||
      process.env[`Z1_ACCESS_KEY_ID_${i}`] ||
      process.env[`Z1_ACCESS_KEY_ID${i}`] ||
      baseAccessKey;
    const secretAccessKey =
      process.env[`S3_SECRET_ACCESS_KEY_${i}`] ||
      process.env[`S3_SECRET_ACCESS_KEY${i}`] ||
      process.env[`Z1_SECRET_ACCESS_KEY_${i}`] ||
      process.env[`Z1_SECRET_ACCESS_KEY${i}`] ||
      baseSecretKey;
    const rawEndpoint =
      process.env[`S3_ENDPOINT_${i}`] ||
      process.env[`S3_ENDPOINT${i}`] ||
      process.env[`Z1_ENDPOINT_${i}`] ||
      process.env[`Z1_ENDPOINT${i}`] ||
      baseEndpoint;
    const endpoint = cleanUrl(rawEndpoint);
    const region =
      process.env[`S3_REGION_${i}`] ||
      process.env[`S3_REGION${i}`] ||
      process.env[`Z1_REGION_${i}`] ||
      process.env[`Z1_REGION${i}`] ||
      baseRegion;
    const rawPublicUrl =
      process.env[`S3_PUBLIC_URL_${i}`] ||
      process.env[`S3_PUBLIC_URL${i}`] ||
      process.env[`Z1_PUBLIC_URL_${i}`] ||
      process.env[`Z1_PUBLIC_URL${i}`];

    let publicUrl = "";
    if (rawPublicUrl) publicUrl = cleanUrl(rawPublicUrl);
    else if (basePublicUrl) publicUrl = `${cleanUrl(basePublicUrl)}/${bucket}`;
    else if (bucket) publicUrl = `${endpoint}/${bucket}`;

    if (bucket && accessKeyId && secretAccessKey) {
      nodes.push({
        id: i,
        endpoint,
        region,
        accessKeyId,
        secretAccessKey,
        bucket,
        publicUrl: publicUrl || `${endpoint}/${bucket}`,
      });
    }
  }

  if (nodes.length < 10) {
    const fallbackEnvList = (process.env.Z1_FALLBACK_BUCKETS || process.env.S3_FALLBACK_BUCKETS || "")
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean);
    for (let i = 1; i <= 10; i++) {
      if (nodes.some((n) => n.id === i)) continue;
      let fallbackBucketName = "";
      if (fallbackEnvList[i - 1]) fallbackBucketName = fallbackEnvList[i - 1];
      else if (i === 1 && baseBucket) fallbackBucketName = baseBucket;
      else if (DEFAULT_FALLBACK[i - 1]) fallbackBucketName = DEFAULT_FALLBACK[i - 1];
      else fallbackBucketName = `mai-storage-${i}`;

      const bucket =
        process.env[`S3_BUCKET_${i}`] ||
        process.env[`S3_BUCKET${i}`] ||
        process.env[`Z1_BUCKET_${i}`] ||
        process.env[`Z1_BUCKET${i}`] ||
        fallbackBucketName;

      const accessKeyId =
        process.env[`S3_ACCESS_KEY_ID_${i}`] ||
        process.env[`S3_ACCESS_KEY_ID${i}`] ||
        process.env[`Z1_ACCESS_KEY_ID_${i}`] ||
        process.env[`Z1_ACCESS_KEY_ID${i}`] ||
        baseAccessKey;
      const secretAccessKey =
        process.env[`S3_SECRET_ACCESS_KEY_${i}`] ||
        process.env[`S3_SECRET_ACCESS_KEY${i}`] ||
        process.env[`Z1_SECRET_ACCESS_KEY_${i}`] ||
        process.env[`Z1_SECRET_ACCESS_KEY${i}`] ||
        baseSecretKey;

      const rawEndpoint =
        process.env[`S3_ENDPOINT_${i}`] ||
        process.env[`S3_ENDPOINT${i}`] ||
        process.env[`Z1_ENDPOINT_${i}`] ||
        process.env[`Z1_ENDPOINT${i}`] ||
        baseEndpoint;
      const endpoint = cleanUrl(rawEndpoint);
      const region =
        process.env[`S3_REGION_${i}`] ||
        process.env[`S3_REGION${i}`] ||
        process.env[`Z1_REGION_${i}`] ||
        process.env[`Z1_REGION${i}`] ||
        baseRegion;
      const rawPublicUrl =
        process.env[`S3_PUBLIC_URL_${i}`] ||
        process.env[`S3_PUBLIC_URL${i}`] ||
        process.env[`Z1_PUBLIC_URL_${i}`] ||
        process.env[`Z1_PUBLIC_URL${i}`];
      let publicUrl = "";
      if (rawPublicUrl) publicUrl = cleanUrl(rawPublicUrl);
      else if (basePublicUrl) publicUrl = `${cleanUrl(basePublicUrl)}/${bucket}`;
      else publicUrl = `${endpoint}/${bucket}`;

      nodes.push({
        id: i,
        endpoint,
        region,
        accessKeyId,
        secretAccessKey,
        bucket,
        publicUrl,
      });
    }
  }

  nodes.sort((a, b) => a.id - b.id);
  return nodes;
}

function selectStorageNode(seed: string): StorageNode {
  const nodes = getStorageNodes();
  if (nodes.length === 0) throw new Error("Aucun nœud Z1 configuré");
  if (nodes.length === 1) return nodes[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % nodes.length;
  return nodes[idx];
}

async function uploadWithFallback(primaryNode: StorageNode, filePath: string, body: ArrayBuffer, contentType: string) {
  const all = getStorageNodes();
  const ordered = [primaryNode, ...all.filter((n) => n.id !== primaryNode.id)];
  let lastErr = "";
  for (const node of ordered) {
    try {
      const client = new AwsClient({
        accessKeyId: node.accessKeyId,
        secretAccessKey: node.secretAccessKey,
        region: node.region,
        service: "s3",
      });
      const url = `${node.endpoint}/${node.bucket}/${filePath}`;
      const res = await client.fetch(url, {
        method: "PUT",
        body,
        headers: {
          "Content-Type": contentType || "application/octet-stream",
          "x-amz-acl": "public-read",
        },
      });
      if (res.ok) {
        return { success: true as const, node, publicUrl: `${node.publicUrl}/${filePath}` };
      }
      lastErr = await res.text().catch(() => `HTTP ${res.status}`);
      console.warn(`[Z1 Upload] bucket ${node.bucket} fail ${res.status}: ${lastErr}`);
    } catch (e: any) {
      lastErr = e?.message || String(e);
      console.warn(`[Z1 Upload] bucket ${node.bucket} exception: ${lastErr}`);
    }
  }
  return { success: false as const, error: lastErr, node: primaryNode, publicUrl: `${primaryNode.publicUrl}/${filePath}` };
}

export async function POST(req: NextRequest) {
  try {
    // Garde anti-DoS : refuse avant de bufferiser le body (le plafond file.size seul arrive trop tard)
    const contentLength = parseInt(req.headers.get("content-length") || "0", 10);
    const maxRequestSize = SUPPORT_ATTACHMENT_LIMITS.MAX_FILE_SIZE + 1024 * 1024; // marge multipart
    if (Number.isFinite(contentLength) && contentLength > maxRequestSize) {
      return NextResponse.json({ success: false, error: "Fichier trop volumineux (max 8 Mo)." }, { status: 413 });
    }

    // Identité vérifiée côté serveur (session signée) — jamais depuis le formulaire
    const auth = await authenticateSession(req);
    if (!auth.ok) return auth.response;

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const ticketIdRaw = (form.get("ticketId") as string | null)?.trim() || null;

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "Fichier manquant." }, { status: 400 });
    }
    if (ticketIdRaw && !UUID_RE.test(ticketIdRaw)) {
      return NextResponse.json({ success: false, error: "ticketId invalide." }, { status: 400 });
    }
    const ticketId = ticketIdRaw;

    // Validation taille
    if (file.size === 0) return NextResponse.json({ success: false, error: "Fichier vide." }, { status: 400 });
    if (file.size > SUPPORT_ATTACHMENT_LIMITS.MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: `Fichier trop volumineux (max 8 Mo). Taille reçue : ${(file.size / 1024 / 1024).toFixed(2)} Mo` }, { status: 413 });
    }

    // Validation MIME / extension (allowlist stricte, SVG/HTML refusés)
    const mime = file.type || "";
    if (!isAllowedSupportMime(mime, file.name)) {
      return NextResponse.json({ success: false, error: `Type de fichier non autorisé (${mime || "inconnu"}). Autorisés : images, .txt, .md uniquement.` }, { status: 400 });
    }

    const sql = getSql();

    // Identité et rôle dérivés de la session + DB (pas du formulaire)
    const userRows = await sql`
      SELECT email, username FROM users WHERE id::text = ${auth.identity.userId}::text LIMIT 1
    `;
    const uploaderEmail = String(userRows[0]?.email || "").trim().toLowerCase();
    if (!uploaderEmail) {
      return NextResponse.json({ success: false, error: "Compte introuvable. Reconnectez-vous." }, { status: 403 });
    }
    const uploaderId = auth.identity.userId;
    const isAdmin = isAdminUser(uploaderEmail);
    const uploaderRole = isAdmin ? "admin" : "user";

    // Compteur 5 par rôle par ticket (si ticketId fourni)
    if (ticketId) {
      try {
        // Vérifier existence ticket
        const tRows = await sql`SELECT id, user_id, user_email FROM support_tickets WHERE id = ${ticketId}::uuid LIMIT 1`;
        if (tRows.length === 0) return NextResponse.json({ success: false, error: "Ticket introuvable." }, { status: 404 });
        // Vérif accès : admin ou owner
        const ownerOk = isAdmin || String(tRows[0].user_id) === uploaderId || String(tRows[0].user_email || "").toLowerCase() === uploaderEmail;
        if (!ownerOk) return NextResponse.json({ success: false, error: "Non autorisé sur ce ticket." }, { status: 403 });

        const cntRows = await sql`SELECT COUNT(*) as cnt FROM support_ticket_attachments WHERE ticket_id = ${ticketId}::uuid AND uploader_role = ${uploaderRole}`;
        const cnt = parseInt(cntRows[0]?.cnt || "0", 10);
        if (cnt >= SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET) {
          return NextResponse.json({ success: false, error: `Limite atteinte : ${SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET} fichiers maximum pour ${uploaderRole === "admin" ? "l'administrateur" : "l'utilisateur"} sur cette conversation (déjà ${cnt}).` }, { status: 413 });
        }
      } catch (e: any) {
        // Table pas encore migrée : toléré. Toute autre erreur DB doit échouer (fail-closed).
        if (!String(e?.message || "").includes("does not exist")) {
          console.error("count error", e);
          throw e;
        }
      }
    }

    // Nom fichier nettoyage + clé Z1
    const cleanOriginal = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "fichier";
    const ext = (cleanOriginal.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
    const uuid = crypto.randomUUID();
    const safeExt = ext.slice(0, 10);
    const keyFolder = ticketId ? `support/${ticketId}/${uploaderRole}` : `support/pending/${uploaderRole}`;
    const fileKey = `${keyFolder}/${uuid}.${safeExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const primaryNode = selectStorageNode(`${uploaderId}-${file.name}-${Date.now()}`);

    const uploadRes = await uploadWithFallback(primaryNode, fileKey, arrayBuffer, mime || "application/octet-stream");
    if (!uploadRes.success) {
      console.error("Z1 upload failed", uploadRes.error);
      return NextResponse.json({ success: false, error: "Échec de l'upload vers le stockage. Réessayez plus tard." }, { status: 500 });
    }

    const storedKey = `node-${uploadRes.node.id}:${uploadRes.node.bucket}:${fileKey}`;
    const publicUrl = uploadRes.publicUrl;

    // Insertion DB (support_ticket_attachments)
    try {
      let inserted: any[];
      if (ticketId) {
        inserted = await sql`
          INSERT INTO support_ticket_attachments (ticket_id, uploader_id, uploader_email, uploader_role, file_url, file_key, file_name, file_size, mime_type)
          VALUES (${ticketId}::uuid, ${uploaderId}, ${uploaderEmail}, ${uploaderRole}, ${publicUrl}, ${storedKey}, ${cleanOriginal}, ${file.size}, ${mime || "application/octet-stream"})
          RETURNING id, ticket_id, file_url, file_key, file_name, file_size, mime_type, created_at
        `;
      } else {
        inserted = await sql`
          INSERT INTO support_ticket_attachments (ticket_id, uploader_id, uploader_email, uploader_role, file_url, file_key, file_name, file_size, mime_type)
          VALUES (NULL, ${uploaderId}, ${uploaderEmail}, ${uploaderRole}, ${publicUrl}, ${storedKey}, ${cleanOriginal}, ${file.size}, ${mime || "application/octet-stream"})
          RETURNING id, ticket_id, file_url, file_key, file_name, file_size, mime_type, created_at
        `;
      }
      const row = inserted[0];
      return NextResponse.json({
        success: true,
        attachment: {
          id: row.id,
          ticket_id: row.ticket_id,
          file_url: row.file_url,
          file_key: row.file_key,
          file_name: row.file_name,
          file_size: row.file_size,
          mime_type: row.mime_type,
        },
        url: publicUrl,
        fileKey: storedKey,
      });
    } catch (dbErr: any) {
      // Rattachage impossible : le fichier ne doit pas rester orphelin en prétendant un succès
      console.error("DB insert attachment failed", dbErr);
      return NextResponse.json(
        { success: false, error: "Upload stocké mais rattachement impossible. Réessayez ou contactez le support." },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("Support upload error", err);
    return NextResponse.json({ success: false, error: "Erreur serveur upload." }, { status: 500 });
  }
}
