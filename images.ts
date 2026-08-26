import type { Hono } from "npm:hono@4";
import {
  extractToken,
  getDb,
  getTierDailyImageLimit,
  getTierImageRequestCost,
  verifyToken,
} from "./config.ts";

export interface ImageModelItem {
  created: number;
  description: string;
  id: string;
  name: string;
}

export function getCometApiKey(): string {
  if (typeof Deno !== "undefined" && Deno.env) {
    return Deno.env.get("COMET_API_KEY") || "";
  }
  if (typeof process !== "undefined" && process.env) {
    return process.env.COMET_API_KEY || "";
  }
  return "";
}

export function normalizeImageSrc(url?: string | null): string {
  if (!url || typeof url !== "string") {
    return "";
  }
  const clean = url.trim().replace(/^["']|["']$/g, "");
  if (!clean) {
    return "";
  }

  if (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("data:") ||
    clean.startsWith("blob:") ||
    clean.startsWith("/")
  ) {
    return clean;
  }

  let mime = "image/png";
  if (clean.startsWith("/9j/")) {
    mime = "image/jpeg";
  } else if (clean.startsWith("R0lGOD")) {
    mime = "image/gif";
  } else if (clean.startsWith("UklGR")) {
    mime = "image/webp";
  } else if (clean.startsWith("PHN2Zy") || clean.startsWith("PD94bWw")) {
    mime = "image/svg+xml";
  }

  return `data:${mime};base64,${clean}`;
}

/**
 * Modèles de repli d'image de haute qualité
 */
const FALLBACK_IMAGE_MODELS = [
  {
    created: Math.floor(Date.now() / 1000) - 86_400 * 30,
    description:
      "Modèle de génération d'images ultra-rapide en 4 étapes par Black Forest Labs (Text-to-Image).",
    features: ["text-to-image"],
    id: "black-forest-labs/flux-1-schnell",
    model_type: "image",
    name: "FLUX.1 Schnell",
  },
  {
    created: Math.floor(Date.now() / 1000) - 86_400 * 30,
    description:
      "Modèle phare de haute précision pour la synthèse d'images photoréalistes et artistiques (Text-to-Image).",
    features: ["text-to-image"],
    id: "black-forest-labs/flux-1-dev",
    model_type: "image",
    name: "FLUX.1 Dev",
  },
  {
    created: Math.floor(Date.now() / 1000) - 86_400 * 15,
    description:
      "Le sommet de la qualité visuelle, cohérence typographique et détails avancés par Black Forest Labs.",
    features: ["text-to-image"],
    id: "black-forest-labs/flux-1.1-pro",
    model_type: "image",
    name: "FLUX 1.1 Pro",
  },
  {
    created: Math.floor(Date.now() / 1000) - 86_400 * 20,
    description:
      "Modèle de pointe de 8 milliards de paramètres de Stability AI pour une variété stylistique maximale.",
    features: ["text-to-image", "image-to-image"],
    id: "stabilityai/stable-diffusion-3.5-large",
    model_type: "image",
    name: "Stable Diffusion 3.5 Large",
  },
  {
    created: Math.floor(Date.now() / 1000) - 86_400 * 60,
    description:
      "Génération stylisée haut de gamme avec esthétique et prompt comprehension avancée.",
    features: ["text-to-image"],
    id: "midjourney/v6",
    model_type: "image",
    name: "Midjourney v6",
  },
  {
    created: Math.floor(Date.now() / 1000) - 86_400 * 10,
    description:
      "Génération vectorielle et matricielle spécialisée dans les logos, illustrations et design graphique.",
    features: ["text-to-image"],
    id: "recraft-ai/recraft-v3",
    model_type: "image",
    name: "Recraft V3",
  },
];

export function registerImageRoutes(app: Hono) {
  // ─────────────────────────────────────────────
  // GET /v1/models/images
  // ─────────────────────────────────────────────
  app.get("/v1/models/images", async (c) => {
    const userPlan = c.get("userPlan");
    const _apiKey = c.get("apiKey");
    const planStr = String(userPlan || "Free")
      .toLowerCase()
      .trim();
    const isPaidPlan = ["plus", "pro", "max"].includes(planStr);
    const shouldFilterFreeOnly = !isPaidPlan;

    const cometApiKey = getCometApiKey();

    try {
      let rawModels: any[] = [];

      if (cometApiKey) {
        const cometRes = await fetch("https://api.cometapi.com/v1/models", {
          headers: {
            Authorization: `Bearer ${cometApiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (cometRes.ok) {
          const json = await cometRes.json();
          rawModels = json.data || json.models || [];
        }
      }

      if (rawModels.length === 0) {
        rawModels = FALLBACK_IMAGE_MODELS;
      }

      // 1. Premier filtre : model_type === 'image'
      let imageModels = rawModels.filter((m) => {
        const mType = (
          m.model_type ||
          m.type ||
          m.architecture?.modality ||
          ""
        ).toLowerCase();
        const features = (m.features || m.supported_features || []).map(
          (f: string) => f.toLowerCase()
        );
        const isImg =
          mType.includes("image") ||
          features.includes("text-to-image") ||
          features.includes("image-to-image") ||
          m.id.toLowerCase().includes("flux") ||
          m.id.toLowerCase().includes("diffusion") ||
          m.id.toLowerCase().includes("dall-e") ||
          m.id.toLowerCase().includes("midjourney");
        return isImg;
      });

      // 2. Si Free : id contenant 'flux' uniquement (règle stricte)
      if (shouldFilterFreeOnly) {
        imageModels = imageModels.filter((m) => {
          const idLower = (m.id || "").toLowerCase();
          return idLower.includes("flux");
        });
      }

      // 3. Renvoyer les données : id, description, name, created et features
      const formatted = imageModels.map((m) => ({
        created: m.created || Math.floor(Date.now() / 1000),
        description:
          m.description || `Modèle de génération d'images ${m.name || m.id}.`,
        features:
          m.features ||
          m.supported_features ||
          (m.id?.toLowerCase().includes("diffusion")
            ? ["text-to-image", "image-to-image"]
            : ["text-to-image"]),
        id: m.id,
        name: m.name || m.id,
      }));

      return c.json({ data: formatted, object: "list" });
    } catch (_err) {
      // Fallback gracieux en cas d'erreur
      let fallback = FALLBACK_IMAGE_MODELS;
      if (shouldFilterFreeOnly) {
        fallback = fallback.filter((m) => m.id.toLowerCase().includes("flux"));
      }
      const formatted = fallback.map((m) => ({
        created: m.created,
        description: m.description,
        features: m.features || ["text-to-image"],
        id: m.id,
        name: m.name,
      }));
      return c.json({ data: formatted, object: "list" });
    }
  });

  // ─────────────────────────────────────────────
  // GET /v1/images/usage
  // ─────────────────────────────────────────────
  app.get("/v1/images/usage", async (c) => {
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

      const [uRows, countRows] = await Promise.all([
        sql`SELECT tier FROM users WHERE id::text = ${userId}::text OR username = ${userId}::text OR email = ${userId}::text LIMIT 1`,
        sql`
          SELECT COALESCE(SUM(images_generated::numeric), 0) as images_generated 
          FROM mprojects_daily_image_usage 
          WHERE (
            user_id = ${userId}::text 
            OR user_id IN (SELECT id::text FROM users WHERE id::text = ${userId}::text OR email = ${userId}::text OR username = ${userId}::text)
            OR user_id IN (SELECT email FROM users WHERE id::text = ${userId}::text OR email = ${userId}::text OR username = ${userId}::text)
            OR user_id IN (SELECT username FROM users WHERE id::text = ${userId}::text OR email = ${userId}::text OR username = ${userId}::text)
          ) AND usage_date = CURRENT_DATE 
          LIMIT 1
        `.catch(() => []),
      ]);

      const effectiveTier = uRows[0]?.tier || userPlan || "Free";
      const usedToday = Number(countRows[0]?.images_generated || 0);
      const dailyLimit = getTierDailyImageLimit(effectiveTier);

      // Calculer la prochaine réinitialisation (minuit UTC)
      const now = new Date();
      const tomorrowMidnight = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + 1,
          0,
          0,
          0
        )
      );

      return c.json({
        dailyLimit,
        plan: effectiveTier,
        resetAt: tomorrowMidnight.toISOString(),
        usedToday,
        userId,
      });
    } catch (err: any) {
      return c.json(
        {
          details: err.message,
          error: "Erreur lors de la récupération de l'usage image.",
        },
        500
      );
    }
  });

  // ─────────────────────────────────────────────
  // GET /v1/images/history
  // ─────────────────────────────────────────────
  app.get("/v1/images/history", async (c) => {
    try {
      const token = extractToken(c.req.raw);
      let userId = c.get("userId");

      if (token) {
        try {
          const payload = await verifyToken(token);
          userId = payload.sub as string;
        } catch {}
      }

      if (!userId) {
        return c.json({ error: "Non authentifié." }, 401);
      }

      const sql = getDb();
      const history = await sql`
        SELECT id, model, prompt, negative_prompt, width, height, image_url, status, created_at
        FROM mprojects_image_generations
        WHERE user_id = ${userId}::text
        ORDER BY created_at DESC
        LIMIT 50
      `;

      const formattedHistory = history.map((item: any) => ({
        ...item,
        image_url: normalizeImageSrc(item.image_url),
      }));

      return c.json({ data: formattedHistory, success: true });
    } catch (err: any) {
      return c.json(
        { details: err.message, error: "Erreur historique images." },
        500
      );
    }
  });

  // ─────────────────────────────────────────────
  // POST /v1/images/generations, /v1beta/models/*:generateImages (OpenAI, Google & Anthropic SDK)
  // ─────────────────────────────────────────────
  const handleImageGeneration = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      const authHeader = c.req.header("Authorization");
      const headerApiKey =
        c.req.header("x-api-key") ||
        c.req.header("X-API-Key") ||
        c.req.header("x-goog-api-key") ||
        c.req.header("X-Goog-Api-Key");
      const apiKey = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : headerApiKey || null;

      let userId = c.get("userId");
      let userPlan = c.get("userPlan") || "Free";

      if (token) {
        try {
          const payload = await verifyToken(token);
          userId = payload.sub as string;
          userPlan = (payload.tier as string) || userPlan;
        } catch {}
      }

      if (!userId) {
        return c.json(
          { error: "Non authentifié. Clé API ou token requis." },
          401
        );
      }

      const body = await c.req.json().catch(() => ({}));
      const reqPath = c.req.path || "";
      const isGoogleFormat =
        reqPath.includes(":generateImages") ||
        reqPath.includes(":predict") ||
        Boolean(body.instances || body.numberOfImages || body.aspectRatio);

      // Support des paramètres OpenAI & Google GenAI
      const rawPrompt =
        body.prompt ||
        body.instances?.[0]?.prompt ||
        body.parameters?.prompt ||
        "";
      const prompt = typeof rawPrompt === "string" ? rawPrompt.trim() : "";

      // Extraction du modèle demandé
      const pathModel = reqPath
        .replace(/^\/(v1beta|v1)\/models\//, "")
        .replace(/:(generateImages|predict).*$/, "");
      const requestedModel =
        body.model || pathModel || "black-forest-labs/flux-1-schnell";

      // Mapping des alias OpenAI (ex: dall-e-3, dall-e-2) et Google (imagen-3)
      let model = requestedModel;
      if (
        model.toLowerCase().includes("dall-e") ||
        model.toLowerCase().includes("imagen")
      ) {
        model = "black-forest-labs/flux-1-schnell";
      }

      // Résolution des dimensions (support aspectRatio Google et size OpenAI)
      let width = 1024;
      let height = 1024;

      if (body.aspectRatio) {
        const ar = String(body.aspectRatio).trim();
        if (ar === "16:9") {
          width = 1280;
          height = 720;
        } else if (ar === "9:16") {
          width = 720;
          height = 1280;
        } else if (ar === "4:3") {
          width = 1024;
          height = 768;
        } else if (ar === "3:4") {
          width = 768;
          height = 1024;
        }
      } else if (body.size) {
        const parts = String(body.size).split("x");
        if (parts.length === 2) {
          width = Number.parseInt(parts[0], 10) || 1024;
          height = Number.parseInt(parts[1], 10) || 1024;
        }
      } else {
        if (body.width) width = Number(body.width);
        if (body.height) height = Number(body.height);
      }

      const negativePrompt = body.negative_prompt || "";

      if (!prompt) {
        return c.json(
          {
            error: {
              code: "missing_prompt",
              message: "Le paramètre 'prompt' est obligatoire pour la génération d'images.",
              param: "prompt",
              type: "invalid_request_error",
            },
          },
          400
        );
      }

      const sql = getDb();

      // Vérifier le forfait utilisateur réel dans la table users
      const uRows = await sql`
        SELECT tier FROM users 
        WHERE id::text = ${userId}::text OR username = ${userId}::text 
        LIMIT 1
      `;
      const effectiveTier = uRows[0]?.tier || userPlan || "Free";
      const planStr = effectiveTier.toLowerCase().trim();
      const isPaidPlan = ["plus", "pro", "max"].includes(planStr);

      // Bloquer les utilisateurs du forfait Free pour la génération d'images via clé API
      if (!isPaidPlan) {
        return c.json(
          {
            error: {
              code: "image_generation_tier_restricted",
              message: `La génération d'images via l'API est réservée aux abonnements payants (Plus, Pro, Max). Les clés API issues d'un compte Free ne sont pas autorisées à effectuer de requêtes de génération d'images.`,
              param: null,
              type: "permission_error",
            },
          },
          403
        );
      }

      // Vérification du quota journalier (Plus: 5/j, Pro: 10/j, Max: 20/j)
      const dailyLimit = getTierDailyImageLimit(effectiveTier);

      const usageRows = await sql`
        SELECT images_generated 
        FROM mprojects_daily_image_usage 
        WHERE user_id = ${userId}::text AND usage_date = CURRENT_DATE 
        LIMIT 1
      `;
      const currentDailyUsage = usageRows[0]?.images_generated || 0;

      if (currentDailyUsage >= dailyLimit) {
        return c.json(
          {
            error: {
              code: "daily_image_quota_exceeded",
              limit: dailyLimit,
              message: `Votre quota journalier de génération d'images est épuisé (${currentDailyUsage}/${dailyLimit} par jour pour le forfait ${effectiveTier}). Réinitialisation automatique à minuit UTC.`,
              type: "quota_error",
              used: currentDailyUsage,
            },
          },
          429
        );
      }

      // Appel de Comet API
      const cometApiKey = getCometApiKey();
      let generatedImageUrl = "";
      let cometResultData: any[] = [];

      if (cometApiKey) {
        const imagePayload: Record<string, any> = {
          model,
          n: body.n || body.numberOfImages || 1,
          prompt,
          response_format: body.response_format || "url",
          size: `${width}x${height}`,
        };
        if (body.image || body.image_url) {
          imagePayload.image = body.image || body.image_url;
        }

        const cometRes = await fetch(
          "https://api.cometapi.com/v1/images/generations",
          {
            body: JSON.stringify(imagePayload),
            headers: {
              Authorization: `Bearer ${cometApiKey}`,
              "Content-Type": "application/json",
            },
            method: "POST",
          }
        );

        if (!cometRes.ok) {
          const errText = await cometRes.text().catch(() => "");
          console.error("[CometAPI] Erreur génération:", errText);
          return c.json(
            {
              details: errText,
              error: "Erreur retournée par le fournisseur Comet API.",
            },
            cometRes.status
          );
        }

        const cometJson = await cometRes.json();
        cometResultData = (cometJson.data || []).map((img: any) => {
          const rawUrl = img.url || "";
          const b64 = img.b64_json || "";
          const resolved = normalizeImageSrc(rawUrl || b64);
          return {
            ...img,
            b64_json: b64,
            url: resolved || rawUrl,
          };
        });
        if (cometResultData.length > 0) {
          generatedImageUrl = cometResultData[0].url || "";
        }
      } else {
        // Mode simulation / fallback si la clé Comet n'est pas encore renseignée
        generatedImageUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt.slice(0, 20))}/${width}/${height}`;
        cometResultData = [{ url: generatedImageUrl }];
      }

      // Incrémentation du quota journalier
      await sql`
        INSERT INTO mprojects_daily_image_usage (user_id, usage_date, images_generated, updated_at)
        VALUES (${userId}::text, CURRENT_DATE, 1, NOW())
        ON CONFLICT (user_id, usage_date)
        DO UPDATE SET 
          images_generated = mprojects_daily_image_usage.images_generated + 1,
          updated_at = NOW()
      `;

      // Enregistrement dans l'historique
      await sql`
        INSERT INTO mprojects_image_generations (
          user_id, api_key, model, prompt, negative_prompt, width, height, image_url, status
        ) VALUES (
          ${userId}::text,
          ${apiKey || null},
          ${model}::text,
          ${prompt}::text,
          ${negativePrompt || null},
          ${width}::integer,
          ${height}::integer,
          ${generatedImageUrl}::text,
          'completed'
        )
      `;

      // Incrémentation du compteur de requêtes de la clé API selon le forfait (Free: 100, Plus: 50, Pro: 25, Max: 10)
      const requestCost = getTierImageRequestCost(effectiveTier);
      if (apiKey) {
        await sql`
          UPDATE mprojects_api_keys
          SET request_count = request_count + ${requestCost}, last_used_at = NOW()
          WHERE api_key = ${apiKey}
        `;
      }

      // Enregistrement d'usage log dans mprojects_api_logs
      try {
        await sql`
          INSERT INTO mprojects_api_logs (api_key, endpoint, method, status_code, latency_ms, created_at)
          VALUES (${apiKey || "anonymous"}::text, ${reqPath || "/v1/images/generations"}::text, 'POST', 200, 1500, NOW())
        `;
      } catch {}

      // Formatage de la réponse selon le SDK appelant (Google GenAI vs OpenAI / Anthropic)
      if (isGoogleFormat) {
        return c.json({
          generatedImages: cometResultData.map((img: any) => ({
            image: {
              imageBytes: img.b64_json || "",
              mimeType: "image/jpeg",
              uri: img.url || generatedImageUrl,
            },
          })),
        });
      }

      // Format OpenAI par défaut (utilisé par OpenAI SDK & Anthropic proxy)
      return c.json({
        created: Math.floor(Date.now() / 1000),
        data: cometResultData,
        image_url: generatedImageUrl,
        usage: {
          daily_limit: dailyLimit,
          daily_used: currentDailyUsage + 1,
          plan: effectiveTier,
          request_cost: requestCost,
          requests_counted: requestCost,
        },
      });
    } catch (err: any) {
      console.error("[ImagesAPI] Erreur serveur:", err);
      return c.json(
        {
          details: err.message,
          error: "Erreur serveur lors de la génération d'image.",
        },
        500
      );
    }
  };

  // Routes OpenAI & Anthropic SDK
  app.post("/v1/images/generations", handleImageGeneration);
  app.post("/images/generations", handleImageGeneration);
  app.post("/v1/images", handleImageGeneration);
  app.post("/images", handleImageGeneration);
  app.post("/v1/images/edits", handleImageGeneration);
  app.post("/images/edits", handleImageGeneration);
  app.post("/v1/images/variations", handleImageGeneration);
  app.post("/images/variations", handleImageGeneration);

  // Routes Google GenAI / Gemini / Vertex SDK
  app.post("/v1beta/models/*:generateImages", handleImageGeneration);
  app.post("/v1/models/*:generateImages", handleImageGeneration);
  app.post("/v1beta/models/*:predict", handleImageGeneration);
  app.post("/v1/models/*:predict", handleImageGeneration);
}
