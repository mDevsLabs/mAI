import type { Hono } from "npm:hono@4";
import { extractToken, getDb, STORAGE_LIMITS_BYTES, verifyToken } from "./config.ts";

// Helper : retourne le client S3/R2 (réutilise les variables S3_* existantes)
export async function buildR2Client() {
  const { AwsClient } = await import("npm:aws4fetch");
  return new AwsClient({
    accessKeyId: Deno.env.get("S3_ACCESS_KEY_ID") || "",
    region: Deno.env.get("S3_REGION") || "auto",
    secretAccessKey: Deno.env.get("S3_SECRET_ACCESS_KEY") || "",
    service: "s3",
  });
}

export function getR2Endpoint(): string {
  const endpoint = Deno.env.get("S3_ENDPOINT") || "";
  return endpoint.endsWith("/") ? endpoint.slice(0, -1) : endpoint;
}

export function getR2Bucket(): string {
  return Deno.env.get("S3_BUCKET") || "";
}

export function getR2PublicBase(): string {
  const pub = Deno.env.get("S3_PUBLIC_URL");
  if (pub) return pub.endsWith("/") ? pub.slice(0, -1) : pub;
  return `${getR2Endpoint()}/${getR2Bucket()}`;
}

export function registerStorageRoutes(app: Hono) {
  // POST /upload-avatar
  app.post("/upload-avatar", async (c) => {
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

      const { AwsClient } = await import("npm:aws4fetch");

      const s3Client = new AwsClient({
        accessKeyId: Deno.env.get("S3_ACCESS_KEY_ID") || "",
        region: Deno.env.get("S3_REGION") || "auto",
        secretAccessKey: Deno.env.get("S3_SECRET_ACCESS_KEY") || "",
        service: "s3",
      });

      const endpoint = Deno.env.get("S3_ENDPOINT") || "";
      const bucket = Deno.env.get("S3_BUCKET") || "";

      const ext = file.name.split(".").pop();
      const filename = `avatars/${userId}-${Date.now()}.${ext}`;

      let url = endpoint;
      if (url.endsWith("/")) {
        url = url.slice(0, -1);
      }

      const uploadUrl = `${url}/${bucket}/${filename}`;
      const arrayBuffer = await file.arrayBuffer();

      const uploadRes = await s3Client.fetch(uploadUrl, {
        body: arrayBuffer,
        headers: {
          "Content-Type": file.type,
        },
        method: "PUT",
      });

      if (!uploadRes.ok) {
        console.error("Erreur S3:", await uploadRes.text());
        return c.json({ error: "Erreur lors de l'upload de l'image." }, 500);
      }

      const publicBase = Deno.env.get("S3_PUBLIC_URL") || `${url}/${bucket}`;
      const publicUrl = `${publicBase}/${filename}`;

      const sql = getDb();
      await sql`UPDATE users SET avatar_url = ${publicUrl} WHERE id = ${userId}`;

      return c.json({ avatarUrl: publicUrl, success: true });
    } catch (err: any) {
      console.error(err);
      return c.json({ error: "Erreur serveur lors de l'upload." }, 500);
    }
  });

  // POST /upload-file (sécurisé: auth + validation 10MB + allowlist)
  app.post("/upload-file", async (c) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
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

      const { AwsClient } = await import("npm:aws4fetch");

      const s3Client = new AwsClient({
        accessKeyId: Deno.env.get("S3_ACCESS_KEY_ID") || "",
        region: Deno.env.get("S3_REGION") || "auto",
        secretAccessKey: Deno.env.get("S3_SECRET_ACCESS_KEY") || "",
        service: "s3",
      });

      const endpoint = Deno.env.get("S3_ENDPOINT") || "";
      const bucket = Deno.env.get("S3_BUCKET") || "";

      const cleanFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filename = `uploads/${Date.now()}-${cleanFilename}`;

      let url = endpoint;
      if (url.endsWith("/")) {
        url = url.slice(0, -1);
      }

      const uploadUrl = `${url}/${bucket}/${filename}`;
      const arrayBuffer = await file.arrayBuffer();

      const uploadRes = await s3Client.fetch(uploadUrl, {
        body: arrayBuffer,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        method: "PUT",
      });

      if (!uploadRes.ok) {
        console.error("Erreur S3:", await uploadRes.text());
        return c.json({ error: "Erreur lors de l'upload vers S3." }, 500);
      }

      const publicBase = Deno.env.get("S3_PUBLIC_URL") || `${url}/${bucket}`;
      const publicUrl = `${publicBase}/${filename}`;

      return c.json({
        contentType: file.type || "application/octet-stream",
        pathname: filename,
        url: publicUrl,
      });
    } catch (err: any) {
      console.error("Upload File S3 Error:", err);
      return c.json({ error: "Erreur serveur lors de l'upload S3." }, 500);
    }
  });

  // GET /cloud/storage — Consommation actuelle de stockage
  app.get("/cloud/storage", async (c) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);

      const payload = await verifyToken(token);
      const userId = payload.sub as string;
      const sql = getDb();

      const [userRes, usageRes] = await Promise.all([
        sql`SELECT tier FROM users WHERE id::text = ${userId}::text LIMIT 1`,
        sql`SELECT bytes_used, files_count FROM cloud_storage_usage WHERE user_id = ${userId}::text LIMIT 1`,
      ]);

      const rawTier2 = userRes[0]?.tier || "Free";
      const tier = String(rawTier2).trim();
      const bytesUsed = Number(usageRes[0]?.bytes_used || 0);
      const filesCount = Number(usageRes[0]?.files_count || 0);
      const bytesLimit =
        STORAGE_LIMITS_BYTES[tier] ||
        STORAGE_LIMITS_BYTES[tier.toLowerCase()] ||
        STORAGE_LIMITS_BYTES[tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase()] ||
        STORAGE_LIMITS_BYTES["Free"];
      const percentUsed = bytesLimit > 0 ? Math.min(100, (bytesUsed / bytesLimit) * 100) : 0;

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
  });

  // GET /cloud/files — Liste des fichiers de l'utilisateur
  app.get("/cloud/files", async (c) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);

      const payload = await verifyToken(token);
      const userId = payload.sub as string;
      const sql = getDb();

      const files = await sql`
        SELECT id, filename, original_name, url, size_bytes, mime_type, uploaded_at
        FROM cloud_files
        WHERE user_id = ${userId}::text
        ORDER BY uploaded_at DESC
        LIMIT 200
      `;

      return c.json({ files, success: true });
    } catch (err: any) {
      console.error("Cloud Files Error:", err);
      return c.json({ error: "Erreur serveur." }, 500);
    }
  });

  // POST /cloud/upload — Upload d'un fichier vers R2 + mise à jour quota
  app.post("/cloud/upload", async (c) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);

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

      // Vérifier le quota AVANT d'uploader (SSOT 500/1/2/5Go)
      const [userRes, usageRes] = await Promise.all([
        sql`SELECT tier FROM users WHERE id::text = ${userId}::text LIMIT 1`,
        sql`SELECT bytes_used FROM cloud_storage_usage WHERE user_id = ${userId}::text LIMIT 1`,
      ]);

      const rawTier = userRes[0]?.tier || "Free";
      const tier = String(rawTier).trim();
      // lookup case-insensitive (config a désormais clés lower)
      const bytesLimit =
        STORAGE_LIMITS_BYTES[tier] ||
        STORAGE_LIMITS_BYTES[tier.toLowerCase()] ||
        STORAGE_LIMITS_BYTES[tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase()] ||
        STORAGE_LIMITS_BYTES["Free"];

      if (bytesUsed + fileSize > bytesLimit) {
        const limitMB = Math.round(bytesLimit / (1024 * 1024));
        const usedMB = Math.round(bytesUsed / (1024 * 1024));
        return c.json({
          bytes_limit: bytesLimit,
          bytes_used: bytesUsed,
          error: `Quota de stockage dépassé. Vous utilisez ${usedMB} MB sur ${limitMB} MB (tier ${tier}).`,
          over_limit: true,
        }, 413);
      }

      // Générer une clé R2 unique
      const ext = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "bin";
      const uniqueId = crypto.randomUUID();
      const r2Key = `cloud/${userId}/${uniqueId}.${ext}`;
      const cleanOriginal = file.name;
      const cleanFilename = `${uniqueId}.${ext}`;

      // Uploader vers R2
      const r2Client = await buildR2Client();
      const uploadUrl = `${getR2Endpoint()}/${getR2Bucket()}/${r2Key}`;
      const arrayBuffer = await file.arrayBuffer();

      const uploadRes = await r2Client.fetch(uploadUrl, {
        body: arrayBuffer,
        headers: { "Content-Type": file.type || "application/octet-stream" },
        method: "PUT",
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        console.error("R2 Upload Error:", errText);
        return c.json({ error: "Erreur lors de l'upload vers R2." }, 500);
      }

      const publicUrl = `${getR2PublicBase()}/${r2Key}`;
      const mimeType = file.type || "application/octet-stream";

      // Insérer dans cloud_files
      const inserted = await sql`
        INSERT INTO cloud_files (user_id, filename, original_name, r2_key, url, size_bytes, mime_type)
        VALUES (${userId}::text, ${cleanFilename}, ${cleanOriginal}, ${r2Key}, ${publicUrl}, ${fileSize}, ${mimeType})
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
      const percentUsed = Math.round((newBytesUsed / bytesLimit) * 10000) / 100;

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
  });

  // DELETE /cloud/files/:id — Suppression définitive d'un fichier
  app.delete("/cloud/files/:id", async (c) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);

      const payload = await verifyToken(token);
      const userId = payload.sub as string;
      const fileId = c.req.param("id");
      const sql = getDb();

      // Récupérer le fichier (vérification propriété)
      const fileRes = await sql`
        SELECT id, r2_key, size_bytes
        FROM cloud_files
        WHERE id = ${fileId}::uuid AND user_id = ${userId}::text
        LIMIT 1
      `;

      if (fileRes.length === 0) {
        return c.json({ error: "Fichier introuvable ou accès refusé." }, 404);
      }

      const { r2_key, size_bytes } = fileRes[0];

      // Supprimer de R2
      const r2Client = await buildR2Client();
      const deleteUrl = `${getR2Endpoint()}/${getR2Bucket()}/${r2_key}`;
      try {
        await r2Client.fetch(deleteUrl, { method: "DELETE" });
      } catch (r2Err) {
        console.error("R2 Delete Error (continuing anyway):", r2Err);
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
  });
}
