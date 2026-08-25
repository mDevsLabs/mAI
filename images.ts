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
    const apiKey = c.get("apiKey");
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
      const authHeader = c.req.header("Authorization");
      const apiKey = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;
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
        return c.json({ error: "Non authentifié." }, 401);
      }

      const sql = getDb();
      const [uRows, countRows] = await Promise.all([
        sql`SELECT tier FROM users WHERE id::text = ${userId}::text OR username = ${userId}::text LIMIT 1`,
        sql`
          SELECT images_generated 
          FROM mprojects_daily_image_usage 
          WHERE user_id = ${userId}::text AND usage_date = CURRENT_DATE 
          LIMIT 1
        `,
      ]);

      const effectiveTier = uRows[0]?.tier || userPlan || "Free";
      const usedToday = countRows[0]?.images_generated || 0;
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

      return c.json({ data: history, success: true });
    } catch (err: any) {
      return c.json(
        { details: err.message, error: "Erreur historique images." },
        500
      );
    }
  });

  // ─────────────────────────────────────────────
  // POST /v1/images/generations
  // ─────────────────────────────────────────────
  app.post("/v1/images/generations", async (c) => {
    try {
      const token = extractToken(c.req.raw);
      const authHeader = c.req.header("Authorization");
      const apiKey = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;
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
      const prompt = body.prompt;
      const model = body.model || "black-forest-labs/flux-1-schnell";
      const width =
        body.width ||
        (body.size ? Number.parseInt(body.size.split("x")[0], 10) : 1024);
      const height =
        body.height ||
        (body.size ? Number.parseInt(body.size.split("x")[1], 10) : 1024);
      const negativePrompt = body.negative_prompt || "";

      if (!prompt || typeof prompt !== "string") {
        return c.json({ error: "Le paramètre 'prompt' est obligatoire." }, 400);
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

      // Vérification des droits sur le modèle
      if (!isPaidPlan && !model.toLowerCase().includes("flux")) {
        return c.json(
          {
            error: {
              code: "image_model_access_denied",
              message: `Le modèle d'image '${model}' nécessite un forfait payant (Plus, Pro ou Max). Votre forfait actuel (${effectiveTier}) autorise les modèles Flux (ex: 'black-forest-labs/flux-1-schnell').`,
              type: "permission_error",
            },
          },
          403
        );
      }

      // Vérification du quota journalier (Free: 3/j, Plus: 5/j, Pro: 10/j, Max: 20/j)
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
          n: 1,
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
        cometResultData = cometJson.data || [];
        if (cometResultData.length > 0) {
          generatedImageUrl =
            cometResultData[0].url || cometResultData[0].b64_json || "";
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
          VALUES (${apiKey || "anonymous"}::text, '/v1/images/generations', 'POST', 200, 1500, NOW())
        `;
      } catch {}

      return c.json({
        created: Math.floor(Date.now() / 1000),
        data: cometResultData,
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
  });
}
