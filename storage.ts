import type { Hono } from "npm:hono@4";
import {
  extractToken,
  getDb,
  STORAGE_LIMITS_BYTES,
  verifyToken,
} from "./config.ts";

export interface StorageNode {
  id: number;
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl: string;
}

function cleanUrl(url: string, removeDefaultPort = true): string {
  let cleaned = (url || "").trim();
  if (cleaned.endsWith("/")) {
    cleaned = cleaned.slice(0, -1);
  }
  if (removeDefaultPort) {
    // Normalise https://domaine.com:443 -> https://domaine.com pour des URLs publiques propres
    cleaned = cleaned.replace(/^https:\/\/([^/:]+):443(\/.*)?$/, "https://$1$2");
    cleaned = cleaned.replace(/^http:\/\/([^/:]+):80(\/.*)?$/, "http://$1$2");
  }
  return cleaned;
}

/**
 * 10 buckets Z1 Storage par défaut en fallback (mai-storage-1 à mai-storage-10)
 */
export const DEFAULT_Z1_FALLBACK_BUCKETS = [
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

export const TOTAL_STORAGE_NODES_COUNT = 10;

/**
 * Récupère la liste des nœuds de stockage Z1 Storage / S3 configurés.
 * Supporte jusqu'à 10 comptes/buckets distincts (S3_BUCKET_1..10 / Z1_BUCKET_1..10) pour multiplier l'espace,
 * ou une liste séparée par des virgules (S3_BUCKETS / Z1_BUCKETS),
 * ou un pool de 10 buckets Z1 Storage (mai-storage-1 à mai-storage-10) en fallback automatique.
 */
export function getStorageNodes(): StorageNode[] {
  const nodes: StorageNode[] = [];

  const baseAccessKey =
    Deno.env.get("S3_ACCESS_KEY_ID") ||
    Deno.env.get("Z1_ACCESS_KEY_ID") ||
    "";
  const baseSecretKey =
    Deno.env.get("S3_SECRET_ACCESS_KEY") ||
    Deno.env.get("Z1_SECRET_ACCESS_KEY") ||
    "";
  const baseRawEndpoint =
    Deno.env.get("S3_ENDPOINT") ||
    Deno.env.get("Z1_ENDPOINT") ||
    "https://s3.z1storage.com";
  const baseEndpoint = cleanUrl(baseRawEndpoint);
  const baseRegion =
    Deno.env.get("S3_REGION") ||
    Deno.env.get("Z1_REGION") ||
    "auto";
  const baseBucket =
    Deno.env.get("S3_BUCKET") ||
    Deno.env.get("Z1_BUCKET") ||
    "mai-storage-1";
  const basePublicUrl =
    Deno.env.get("S3_PUBLIC_URL") ||
    Deno.env.get("Z1_PUBLIC_URL");

  // 1. Détection des configurations individuelles S3_BUCKET_1 à S3_BUCKET_10 (ou Z1_BUCKET_1 à 10)
  for (let i = 1; i <= TOTAL_STORAGE_NODES_COUNT; i++) {
    const bucket =
      Deno.env.get(`S3_BUCKET_${i}`) ||
      Deno.env.get(`S3_BUCKET${i}`) ||
      Deno.env.get(`Z1_BUCKET_${i}`) ||
      Deno.env.get(`Z1_BUCKET${i}`);
    const accessKeyId =
      Deno.env.get(`S3_ACCESS_KEY_ID_${i}`) ||
      Deno.env.get(`S3_ACCESS_KEY_ID${i}`) ||
      Deno.env.get(`Z1_ACCESS_KEY_ID_${i}`) ||
      Deno.env.get(`Z1_ACCESS_KEY_ID${i}`) ||
      baseAccessKey;
    const secretAccessKey =
      Deno.env.get(`S3_SECRET_ACCESS_KEY_${i}`) ||
      Deno.env.get(`S3_SECRET_ACCESS_KEY${i}`) ||
      Deno.env.get(`Z1_SECRET_ACCESS_KEY_${i}`) ||
      Deno.env.get(`Z1_SECRET_ACCESS_KEY${i}`) ||
      baseSecretKey;
    const rawEndpoint =
      Deno.env.get(`S3_ENDPOINT_${i}`) ||
      Deno.env.get(`S3_ENDPOINT${i}`) ||
      Deno.env.get(`Z1_ENDPOINT_${i}`) ||
      Deno.env.get(`Z1_ENDPOINT${i}`) ||
      baseEndpoint;
    const endpoint = cleanUrl(rawEndpoint);
    const region =
      Deno.env.get(`S3_REGION_${i}`) ||
      Deno.env.get(`S3_REGION${i}`) ||
      Deno.env.get(`Z1_REGION_${i}`) ||
      Deno.env.get(`Z1_REGION${i}`) ||
      baseRegion;
    const rawPublicUrl =
      Deno.env.get(`S3_PUBLIC_URL_${i}`) ||
      Deno.env.get(`S3_PUBLIC_URL${i}`) ||
      Deno.env.get(`Z1_PUBLIC_URL_${i}`) ||
      Deno.env.get(`Z1_PUBLIC_URL${i}`);

    let publicUrl = "";
    if (rawPublicUrl) {
      publicUrl = cleanUrl(rawPublicUrl);
    } else if (basePublicUrl) {
      publicUrl = `${cleanUrl(basePublicUrl)}/${bucket}`;
    } else if (bucket) {
      publicUrl = `${endpoint}/${bucket}`;
    }

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

  // 2. Si S3_BUCKETS ou Z1_BUCKETS (liste séparée par des virgules) est configuré
  if (nodes.length === 0) {
    const bucketsList =
      Deno.env.get("S3_BUCKETS") ||
      Deno.env.get("Z1_BUCKETS");
    if (bucketsList) {
      const bucketNames = bucketsList
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean);

      bucketNames.forEach((bucket, idx) => {
        const id = idx + 1;
        let publicUrl = "";
        if (basePublicUrl) {
          publicUrl = `${cleanUrl(basePublicUrl)}/${bucket}`;
        } else {
          publicUrl = `${baseEndpoint}/${bucket}`;
        }

        nodes.push({
          id,
          endpoint: baseEndpoint,
          region: baseRegion,
          accessKeyId: baseAccessKey,
          secretAccessKey: baseSecretKey,
          bucket,
          publicUrl,
        });
      });
    }
  }

  // 3. Fallback automatique : 10 buckets Z1 Storage (mai-storage-1 à mai-storage-10)
  // Si moins de 10 nœuds sont configurés, on complète avec les 10 buckets Z1 Storage en fallback
  if (nodes.length < TOTAL_STORAGE_NODES_COUNT) {
    const fallbackEnvList = (
      Deno.env.get("Z1_FALLBACK_BUCKETS") ||
      Deno.env.get("S3_FALLBACK_BUCKETS") ||
      ""
    )
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean);

    for (let i = 1; i <= TOTAL_STORAGE_NODES_COUNT; i++) {
      const exists = nodes.some((n) => n.id === i);
      if (!exists) {
        let fallbackBucketName = "";
        if (fallbackEnvList[i - 1]) {
          fallbackBucketName = fallbackEnvList[i - 1];
        } else if (i === 1 && baseBucket) {
          fallbackBucketName = baseBucket;
        } else if (DEFAULT_Z1_FALLBACK_BUCKETS[i - 1]) {
          fallbackBucketName = DEFAULT_Z1_FALLBACK_BUCKETS[i - 1];
        } else {
          fallbackBucketName = `mai-storage-${i}`;
        }

        const bucket =
          Deno.env.get(`S3_BUCKET_${i}`) ||
          Deno.env.get(`S3_BUCKET${i}`) ||
          Deno.env.get(`Z1_BUCKET_${i}`) ||
          Deno.env.get(`Z1_BUCKET${i}`) ||
          fallbackBucketName;

        const accessKeyId =
          Deno.env.get(`S3_ACCESS_KEY_ID_${i}`) ||
          Deno.env.get(`S3_ACCESS_KEY_ID${i}`) ||
          Deno.env.get(`Z1_ACCESS_KEY_ID_${i}`) ||
          Deno.env.get(`Z1_ACCESS_KEY_ID${i}`) ||
          baseAccessKey;

        const secretAccessKey =
          Deno.env.get(`S3_SECRET_ACCESS_KEY_${i}`) ||
          Deno.env.get(`S3_SECRET_ACCESS_KEY${i}`) ||
          Deno.env.get(`Z1_SECRET_ACCESS_KEY_${i}`) ||
          Deno.env.get(`Z1_SECRET_ACCESS_KEY${i}`) ||
          baseSecretKey;

        const rawEndpoint =
          Deno.env.get(`S3_ENDPOINT_${i}`) ||
          Deno.env.get(`S3_ENDPOINT${i}`) ||
          Deno.env.get(`Z1_ENDPOINT_${i}`) ||
          Deno.env.get(`Z1_ENDPOINT${i}`) ||
          baseEndpoint;
        const endpoint = cleanUrl(rawEndpoint);

        const region =
          Deno.env.get(`S3_REGION_${i}`) ||
          Deno.env.get(`S3_REGION${i}`) ||
          Deno.env.get(`Z1_REGION_${i}`) ||
          Deno.env.get(`Z1_REGION${i}`) ||
          baseRegion;

        const rawPublicUrl =
          Deno.env.get(`S3_PUBLIC_URL_${i}`) ||
          Deno.env.get(`S3_PUBLIC_URL${i}`) ||
          Deno.env.get(`Z1_PUBLIC_URL_${i}`) ||
          Deno.env.get(`Z1_PUBLIC_URL${i}`);

        let publicUrl = "";
        if (rawPublicUrl) {
          publicUrl = cleanUrl(rawPublicUrl);
        } else if (basePublicUrl) {
          publicUrl = `${cleanUrl(basePublicUrl)}/${bucket}`;
        } else {
          publicUrl = `${endpoint}/${bucket}`;
        }

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
  }

  // Tri par ID croissant pour ordre déterministe
  nodes.sort((a, b) => a.id - b.id);
  return nodes;
}

/**
 * Retourne la liste ordonnée des nœuds de stockage pour le fallback.
 * Le nœud principal est placé en premier, suivi des autres buckets Z1 Storage en réserve (fallback).
 */
export function getFallbackNodes(primaryNode?: StorageNode): StorageNode[] {
  const allNodes = getStorageNodes();
  if (!primaryNode) return allNodes;
  const others = allNodes.filter((n) => n.id !== primaryNode.id);
  return [primaryNode, ...others];
}

/**
 * Effectue un upload S3 avec bascule automatique (fallback) sur les 10 nœuds/buckets
 * Z1 Storage configurés si le nœud principal échoue (erreur HTTP 4xx/5xx ou exception réseau).
 */
export async function uploadWithFallback(
  primaryNode: StorageNode,
  filePath: string,
  body: any,
  options: {
    contentType: string;
    acl?: string;
  }
): Promise<{
  success: boolean;
  activeNode: StorageNode;
  publicUrl: string;
  error?: string;
}> {
  const candidateNodes = getFallbackNodes(primaryNode);
  let lastError = "";

  for (const node of candidateNodes) {
    try {
      const s3Client = await buildS3Client(node);
      const uploadUrl = `${node.endpoint}/${node.bucket}/${filePath}`;
      const res = await s3Client.fetch(uploadUrl, {
        body,
        headers: {
          "Content-Type": options.contentType || "application/octet-stream",
          "x-amz-acl": options.acl || "public-read",
        },
        method: "PUT",
      });

      if (res.ok) {
        return {
          activeNode: node,
          publicUrl: `${node.publicUrl}/${filePath}`,
          success: true,
        };
      }

      lastError = await res.text().catch(() => `HTTP ${res.status}`);
      console.warn(
        `[Z1 Storage Fallback] Échec upload sur le bucket "${node.bucket}" (node ${node.id}, status ${res.status}): ${lastError}. Bascule sur le bucket suivant...`
      );
    } catch (err: any) {
      lastError = err?.message || String(err);
      console.warn(
        `[Z1 Storage Fallback] Exception réseau sur le bucket "${node.bucket}" (node ${node.id}): ${lastError}. Bascule sur le bucket suivant...`
      );
    }
  }

  return {
    activeNode: primaryNode,
    error: lastError,
    publicUrl: `${primaryNode.publicUrl}/${filePath}`,
    success: false,
  };
}

/**
 * Sélectionne un nœud de stockage dans le pool via un hachage déterministe (sharding équilibré).
 */
export function selectStorageNode(seed: string): StorageNode {
  const nodes = getStorageNodes();
  if (nodes.length <= 1) return nodes[0];

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0; // Convertit en entier 32 bits
  }
  const index = Math.abs(hash) % nodes.length;
  return nodes[index];
}

/**
 * Retrouve le nœud de stockage et la clé brute d'un enregistrement existant.
 */
export function findStorageNodeForRecord(
  r2Key: string,
  fileUrl?: string
): { node: StorageNode; rawKey: string } {
  const nodes = getStorageNodes();

  // 1. Format explicite taggé : node-1:bucket-name:key-path
  if (r2Key && r2Key.startsWith("node-")) {
    const parts = r2Key.split(":");
    if (parts.length >= 3) {
      const nodeId = parseInt(parts[0].replace("node-", ""), 10);
      const found = nodes.find((n) => n.id === nodeId);
      if (found) {
        return { node: found, rawKey: parts.slice(2).join(":") };
      }
    }
  }

  // 2. Recherche par nom de bucket dans la clé ou l'URL
  for (const node of nodes) {
    if (r2Key && r2Key.startsWith(`${node.bucket}/`)) {
      return { node, rawKey: r2Key.slice(node.bucket.length + 1) };
    }
    if (
      fileUrl &&
      (fileUrl.includes(`/${node.bucket}/`) ||
        fileUrl.includes(`://${node.bucket}.`))
    ) {
      return { node, rawKey: r2Key };
    }
  }

  // 3. Fallback sur le premier nœud
  return { node: nodes[0], rawKey: r2Key };
}

/**
 * Crée un client S3 (compatible Z1 Storage / Cloudflare R2 / AWS S3) pour un nœud donné.
 */
export async function buildS3Client(node?: StorageNode) {
  const targetNode = node || getStorageNodes()[0];
  const { AwsClient } = await import("npm:aws4fetch");
  return new AwsClient({
    accessKeyId: targetNode.accessKeyId,
    region: targetNode.region,
    secretAccessKey: targetNode.secretAccessKey,
    service: "s3",
  });
}

// Aliases de rétro-compatibilité
export const buildR2Client = buildS3Client;
export function getR2Endpoint(): string {
  return getStorageNodes()[0].endpoint;
}
export function getR2Bucket(): string {
  return getStorageNodes()[0].bucket;
}
export function getR2PublicBase(): string {
  return getStorageNodes()[0].publicUrl;
}

export function registerStorageRoutes(app: Hono) {
  // POST /upload-avatar & /v1/upload-avatar
  const handleUploadAvatar = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) {
        return c.json({ error: "Non authentifié." }, 401);
      }

      const payload = await verifyToken(token);
      const userId = payload.sub as string;

      const body = await c.req.parseBody();
      const file = body["avatar"];

      if (!(file instanceof File)) {
        return c.json({ error: "Fichier invalide ou non fourni." }, 400);
      }

      const primaryNode = selectStorageNode(`avatar-${userId}`);
      const ext =
        file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
      const filename = `avatars/${userId}-${Date.now()}.${ext}`;
      const arrayBuffer = await file.arrayBuffer();

      const uploadResult = await uploadWithFallback(
        primaryNode,
        filename,
        arrayBuffer,
        {
          contentType: file.type || "image/jpeg",
          acl: "public-read",
        }
      );

      if (!uploadResult.success) {
        console.error(
          "Erreur Z1 Storage S3 (avatar fallback épuisé):",
          uploadResult.error
        );
        return c.json({ error: "Erreur lors de l'upload de l'image." }, 500);
      }

      const publicUrl = uploadResult.publicUrl;

      const sql = getDb();
      await sql`UPDATE users SET avatar_url = ${publicUrl} WHERE id = ${userId}`;

      return c.json({ avatarUrl: publicUrl, success: true });
    } catch (err: any) {
      console.error("Upload Avatar Error:", err);
      return c.json({ error: "Erreur serveur lors de l'upload." }, 500);
    }
  };

  app.post("/upload-avatar", handleUploadAvatar);
  app.post("/v1/upload-avatar", handleUploadAvatar);
  app.post("/upload-avatar/", handleUploadAvatar);
  app.post("/v1/upload-avatar/", handleUploadAvatar);

  // POST /upload-file & /v1/upload-file (sécurisé: auth + validation 10MB + allowlist)
  const handleUploadFile = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) {
        return c.json({ error: "Non authentifié." }, 401);
      }
      try {
        await verifyToken(token);
      } catch {
        return c.json({ error: "Token invalide." }, 401);
      }

      const body = await c.req.parseBody();
      const file = body["file"];

      if (!(file instanceof File)) {
        return c.json({ error: "Fichier invalide ou non fourni." }, 400);
      }

      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        return c.json({ error: "Fichier trop volumineux (max 10 MB)." }, 413);
      }
      if (file.size === 0) {
        return c.json({ error: "Fichier vide." }, 400);
      }
      const ALLOWED = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/pdf",
        "text/plain",
        "text/markdown",
        "text/csv",
        "application/json",
      ];
      const isAllowed =
        ALLOWED.includes(file.type) ||
        file.type.startsWith("image/") ||
        file.type.startsWith("text/") ||
        file.type === "application/pdf" ||
        file.type === "application/json";
      if (file.type && !isAllowed) {
        return c.json({ error: "Type de fichier non autorisé." }, 400);
      }

      const cleanFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filename = `uploads/${Date.now()}-${cleanFilename}`;

      const primaryNode = selectStorageNode(cleanFilename);
      const arrayBuffer = await file.arrayBuffer();

      const uploadResult = await uploadWithFallback(
        primaryNode,
        filename,
        arrayBuffer,
        {
          contentType: file.type || "application/octet-stream",
          acl: "public-read",
        }
      );

      if (!uploadResult.success) {
        console.error(
          "Erreur Z1 Storage S3 (file fallback épuisé):",
          uploadResult.error
        );
        return c.json({ error: "Erreur lors de l'upload vers S3." }, 500);
      }

      const publicUrl = uploadResult.publicUrl;

      return c.json({
        contentType: file.type || "application/octet-stream",
        pathname: filename,
        url: publicUrl,
      });
    } catch (err: any) {
      console.error("Upload File S3 Error:", err);
      return c.json({ error: "Erreur serveur lors de l'upload S3." }, 500);
    }
  };

  app.post("/upload-file", handleUploadFile);
  app.post("/v1/upload-file", handleUploadFile);
  app.post("/upload-file/", handleUploadFile);
  app.post("/v1/upload-file/", handleUploadFile);

  // ─────────────────────────────────────────────
  // GET /cloud/storage — Consommation actuelle de stockage
  // ─────────────────────────────────────────────
  const handleGetStorage = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      let userId = c.get("userId");
      let userPlan = c.get("userPlan") || "Free";

      if (token) {
        try {
          const payload = await verifyToken(token);
          userId = (payload.sub as string) || userId;
          userPlan = (payload.tier as string) || userPlan;
        } catch {}
      }

      const sql = getDb();

      // Résolution du user_id réel via mprojects_api_keys si clé API transmise
      if (token) {
        try {
          const keyRows = await sql`
            SELECT k.user_id, u.tier, u.email, u.username
            FROM mprojects_api_keys k
            LEFT JOIN users u ON k.user_id = u.id::text OR k.user_id = u.username OR k.user_id = u.email
            WHERE k.api_key = ${token}::text
            LIMIT 1
          `;
          if (keyRows.length > 0) {
            userId = keyRows[0].user_id;
            userPlan = keyRows[0].tier || userPlan;
          }
        } catch {}
      }

      if (!userId) {
        return c.json({ error: "Non authentifié." }, 401);
      }

      const [userRes, usageRes] = await Promise.all([
        sql`SELECT tier FROM users WHERE id::text = ${userId}::text OR username = ${userId}::text OR email = ${userId}::text LIMIT 1`,
        sql`
          SELECT COALESCE(SUM(bytes_used::numeric), 0) as bytes_used, COALESCE(SUM(files_count::numeric), 0) as files_count 
          FROM cloud_storage_usage 
          WHERE (
            user_id = ${userId}::text 
            OR user_id IN (SELECT id::text FROM users WHERE id::text = ${userId}::text OR email = ${userId}::text OR username = ${userId}::text)
            OR user_id IN (SELECT email FROM users WHERE id::text = ${userId}::text OR email = ${userId}::text OR username = ${userId}::text)
            OR user_id IN (SELECT username FROM users WHERE id::text = ${userId}::text OR email = ${userId}::text OR username = ${userId}::text)
          ) LIMIT 1
        `.catch(() => []),
      ]);

      const rawTier2 = userRes[0]?.tier || userPlan || "Free";
      const tier = String(rawTier2).trim();
      const bytesUsed = Number(usageRes[0]?.bytes_used || 0);
      const filesCount = Number(usageRes[0]?.files_count || 0);
      const bytesLimit =
        STORAGE_LIMITS_BYTES[tier] ||
        STORAGE_LIMITS_BYTES[tier.toLowerCase()] ||
        STORAGE_LIMITS_BYTES[
          tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase()
        ] ||
        STORAGE_LIMITS_BYTES["Free"];
      const percentUsed =
        bytesLimit > 0 ? Math.min(100, (bytesUsed / bytesLimit) * 100) : 0;

      return c.json({
        bytes_limit: bytesLimit,
        bytes_used: bytesUsed,
        files_count: filesCount,
        over_limit: bytesUsed >= bytesLimit,
        percent_used: Math.round(percentUsed * 100) / 100,
        tier,
      });
    } catch (err: any) {
      console.error("Cloud Storage Error:", err);
      return c.json({ error: "Erreur serveur." }, 500);
    }
  };

  app.get("/cloud/storage", handleGetStorage);
  app.get("/v1/cloud/storage", handleGetStorage);
  app.get("/storage", handleGetStorage);
  app.get("/v1/storage", handleGetStorage);

  // ─────────────────────────────────────────────
  // GET /cloud/files — Liste des fichiers de l'utilisateur
  // ─────────────────────────────────────────────
  const handleGetFiles = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      let userId = c.get("userId");

      if (token) {
        try {
          const payload = await verifyToken(token);
          userId = (payload.sub as string) || userId;
        } catch {}
      }

      const sql = getDb();

      // Résolution du user_id réel via mprojects_api_keys si clé API transmise
      if (token) {
        try {
          const keyRows = await sql`
            SELECT k.user_id, u.tier, u.email, u.username
            FROM mprojects_api_keys k
            LEFT JOIN users u ON k.user_id = u.id::text OR k.user_id = u.username OR k.user_id = u.email
            WHERE k.api_key = ${token}::text
            LIMIT 1
          `;
          if (keyRows.length > 0) {
            userId = keyRows[0].user_id;
          }
        } catch {}
      }

      if (!userId) {
        return c.json({ error: "Non authentifié." }, 401);
      }

      const files = await sql`
        SELECT id, filename, original_name, url, size_bytes, mime_type, uploaded_at
        FROM cloud_files
        WHERE (
          user_id = ${userId}::text 
          OR user_id IN (SELECT id::text FROM users WHERE id::text = ${userId}::text OR email = ${userId}::text OR username = ${userId}::text)
          OR user_id IN (SELECT email FROM users WHERE id::text = ${userId}::text OR email = ${userId}::text OR username = ${userId}::text)
          OR user_id IN (SELECT username FROM users WHERE id::text = ${userId}::text OR email = ${userId}::text OR username = ${userId}::text)
        )
        ORDER BY uploaded_at DESC
        LIMIT 200
      `.catch(() => []);

      return c.json({ files, success: true });
    } catch (err: any) {
      console.error("Cloud Files Error:", err);
      return c.json({ error: "Erreur serveur." }, 500);
    }
  };

  app.get("/cloud/files", handleGetFiles);
  app.get("/v1/cloud/files", handleGetFiles);
  app.get("/files", handleGetFiles);
  app.get("/v1/files", handleGetFiles);

  // POST /cloud/upload & /v1/cloud/upload — Upload d'un fichier vers Z1 Storage avec fallback multi-buckets + mise à jour quota
  const handleCloudUpload = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) {
        return c.json({ error: "Non authentifié." }, 401);
      }

      const payload = await verifyToken(token);
      const userId = payload.sub as string;
      const sql = getDb();

      // Lire le fichier
      const body = await c.req.parseBody();
      const file = body["file"];
      if (!(file instanceof File)) {
        return c.json({ error: "Fichier invalide ou non fourni." }, 400);
      }

      const fileSize = file.size;
      if (fileSize === 0) {
        return c.json({ error: "Le fichier est vide." }, 400);
      }
      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      if (fileSize > MAX_FILE_SIZE) {
        return c.json({ error: "Fichier trop volumineux (max 10 MB)." }, 413);
      }
      const ALLOWED_CLOUD_TYPES = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/pdf",
        "text/plain",
        "text/markdown",
        "text/csv",
        "application/json",
      ];
      const isCloudAllowed =
        !file.type ||
        ALLOWED_CLOUD_TYPES.includes(file.type) ||
        file.type.startsWith("image/") ||
        file.type.startsWith("text/") ||
        file.type === "application/pdf" ||
        file.type === "application/json";
      if (file.type && !isCloudAllowed) {
        return c.json({ error: "Type de fichier non autorisé." }, 400);
      }

      // Vérifier le quota AVANT d'uploader
      const [userRes, usageRes] = await Promise.all([
        sql`SELECT tier FROM users WHERE id::text = ${userId}::text LIMIT 1`,
        sql`SELECT bytes_used FROM cloud_storage_usage WHERE user_id = ${userId}::text LIMIT 1`,
      ]);

      const rawTier = userRes[0]?.tier || "Free";
      const tier = String(rawTier).trim();
      const bytesUsed = Number(usageRes[0]?.bytes_used || 0);
      const bytesLimit =
        STORAGE_LIMITS_BYTES[tier] ||
        STORAGE_LIMITS_BYTES[tier.toLowerCase()] ||
        STORAGE_LIMITS_BYTES[
          tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase()
        ] ||
        STORAGE_LIMITS_BYTES["Free"];

      if (bytesUsed + fileSize > bytesLimit) {
        const limitMB = Math.round(bytesLimit / (1024 * 1024));
        const usedMB = Math.round(bytesUsed / (1024 * 1024));
        return c.json(
          {
            bytes_limit: bytesLimit,
            bytes_used: bytesUsed,
            error: `Quota de stockage dépassé. Vous utilisez ${usedMB} MB sur ${limitMB} MB (tier ${tier}).`,
            over_limit: true,
          },
          413
        );
      }

      // Générer une clé unique
      const ext =
        file.name
          .split(".")
          .pop()
          ?.replace(/[^a-zA-Z0-9]/g, "") || "bin";
      const uniqueId = crypto.randomUUID();
      const fileKey = `cloud/${userId}/${uniqueId}.${ext}`;
      const cleanOriginal = file.name;
      const cleanFilename = `${uniqueId}.${ext}`;

      // Sélectionner un nœud de stockage dans le pool à 10 buckets
      const primaryNode = selectStorageNode(`${userId}-${uniqueId}`);
      const arrayBuffer = await file.arrayBuffer();

      // Upload avec bascule automatique (fallback) sur les autres buckets du pool Z1 Storage
      const uploadResult = await uploadWithFallback(
        primaryNode,
        fileKey,
        arrayBuffer,
        {
          contentType: file.type || "application/octet-stream",
          acl: "public-read",
        }
      );

      if (!uploadResult.success) {
        console.error(
          "Z1 Storage Upload Error (fallback épuisé):",
          uploadResult.error
        );
        return c.json(
          { error: "Erreur lors de l'upload vers le stockage (tous les buckets en échec)." },
          500
        );
      }

      const activeNode = uploadResult.activeNode;
      const storedKey = `node-${activeNode.id}:${activeNode.bucket}:${fileKey}`;
      const publicUrl = uploadResult.publicUrl;
      const mimeType = file.type || "application/octet-stream";

      // Insérer dans cloud_files
      const inserted = await sql`
        INSERT INTO cloud_files (user_id, filename, original_name, r2_key, url, size_bytes, mime_type)
        VALUES (${userId}::text, ${cleanFilename}, ${cleanOriginal}, ${storedKey}, ${publicUrl}, ${fileSize}, ${mimeType})
        RETURNING id, filename, original_name, url, size_bytes, mime_type, uploaded_at
      `;

      // Upsert cloud_storage_usage
      await sql`
        INSERT INTO cloud_storage_usage (user_id, bytes_used, files_count, updated_at)
        VALUES (${userId}::text, ${fileSize}, 1, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET
          bytes_used   = cloud_storage_usage.bytes_used + ${fileSize},
          files_count  = cloud_storage_usage.files_count + 1,
          updated_at   = NOW()
      `;

      const newBytesUsed = bytesUsed + fileSize;
      const percentUsed =
        Math.round((newBytesUsed / bytesLimit) * 10_000) / 100;

      return c.json({
        file: inserted[0],
        percent_used: percentUsed,
        storage: {
          bytes_limit: bytesLimit,
          bytes_used: newBytesUsed,
          over_limit: newBytesUsed >= bytesLimit,
          percent_used: percentUsed,
          tier,
        },
        success: true,
      });
    } catch (err: any) {
      console.error("Cloud Upload Error:", err);
      return c.json({ error: "Erreur serveur lors de l'upload Cloud." }, 500);
    }
  };

  app.post("/cloud/upload", handleCloudUpload);
  app.post("/v1/cloud/upload", handleCloudUpload);
  app.post("/cloud/upload/", handleCloudUpload);
  app.post("/v1/cloud/upload/", handleCloudUpload);

  // DELETE /cloud/files/:id & /v1/cloud/files/:id — Suppression définitive d'un fichier
  const handleDeleteFile = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) {
        return c.json({ error: "Non authentifié." }, 401);
      }

      const payload = await verifyToken(token);
      const userId = payload.sub as string;
      const fileId = c.req.param("id");
      const sql = getDb();

      // Récupérer le fichier (vérification propriété)
      const fileRes = await sql`
        SELECT id, r2_key, url, size_bytes
        FROM cloud_files
        WHERE id = ${fileId}::uuid AND user_id = ${userId}::text
        LIMIT 1
      `;

      if (fileRes.length === 0) {
        return c.json({ error: "Fichier introuvable ou accès refusé." }, 404);
      }

      const { r2_key, url, size_bytes } = fileRes[0];

      // Identifier le nœud et supprimer de Z1 Storage
      const { node, rawKey } = findStorageNodeForRecord(r2_key, url);
      const s3Client = await buildS3Client(node);
      const deleteUrl = `${node.endpoint}/${node.bucket}/${rawKey}`;

      try {
        const delRes = await s3Client.fetch(deleteUrl, { method: "DELETE" });
        if (!delRes.ok && (!r2_key || !r2_key.startsWith("node-"))) {
          // Si suppression échoue sur nœud par défaut pour un ancien fichier, tenter sur les autres nœuds du pool
          for (const fallbackNode of getFallbackNodes(node).slice(1)) {
            try {
              const fbClient = await buildS3Client(fallbackNode);
              const fbUrl = `${fallbackNode.endpoint}/${fallbackNode.bucket}/${rawKey}`;
              await fbClient.fetch(fbUrl, { method: "DELETE" });
            } catch {}
          }
        }
      } catch (s3Err) {
        console.error("Z1 Delete Error (continuing anyway):", s3Err);
      }

      // Supprimer de la base de données
      await sql`DELETE FROM cloud_files WHERE id = ${fileId}::uuid AND user_id = ${userId}::text`;

      // Décrémenter cloud_storage_usage
      await sql`
        UPDATE cloud_storage_usage
        SET
          bytes_used  = GREATEST(0, bytes_used - ${size_bytes}),
          files_count = GREATEST(0, files_count - 1),
          updated_at  = NOW()
        WHERE user_id = ${userId}::text
      `;

      return c.json({ id: fileId, success: true });
    } catch (err: any) {
      console.error("Cloud Delete Error:", err);
      return c.json({ error: "Erreur serveur lors de la suppression." }, 500);
    }
  };

  app.delete("/cloud/files/:id", handleDeleteFile);
  app.delete("/v1/cloud/files/:id", handleDeleteFile);
}
