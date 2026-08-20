import type { Hono } from "npm:hono@4";
import { extractToken, getDb, getWeekData, TIER_LIMITS, verifyToken } from "./config.ts";

export function registerModelRoutes(app: Hono) {
  // GET /usage
  app.get("/usage", async (c) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) {
        return c.json({ error: "Non authentifié." }, 401);
      }

      const payload = await verifyToken(token);
      const userId = payload.sub as string;
      const { weekStartStr, nextResetIso } = getWeekData();

      const sql = getDb();
      const [usageResult, userResult] = await Promise.all([
        sql`SELECT tokens_used FROM weekly_usage WHERE user_id = ${userId} AND week_start = ${weekStartStr}`,
        sql`SELECT tier, email, username, phone, avatar_url FROM users WHERE id = ${userId} LIMIT 1`,
      ]);

      const user = userResult[0];
      const tokensUsed = usageResult[0]?.tokens_used || 0;
      const limit = TIER_LIMITS[user?.tier] || TIER_LIMITS["Free"];

      return c.json({
        avatarUrl: user?.avatar_url,
        email: user?.email,
        limit,
        phone: user?.phone,
        resetAt: nextResetIso,
        tier: user?.tier || "Free",
        tokensUsed,
        username: user?.username,
        weekStart: weekStartStr,
      });
    } catch {
      return c.json({ error: "Erreur serveur." }, 500);
    }
  });

  // POST /log-usage
  app.post("/log-usage", async (c) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) {
        return c.json({ error: "Non authentifié." }, 401);
      }

      const payload = await verifyToken(token);
      const userId = payload.sub as string;

      const { tokensUsed = 0 } = await c.req.json();
      const { weekStartStr } = getWeekData();

      const sql = getDb();
      const userRes =
        await sql`SELECT tier FROM users WHERE id = ${userId} LIMIT 1`;
      const tier = userRes.length > 0 ? userRes[0].tier : "Free";
      const limit = TIER_LIMITS[tier] || TIER_LIMITS["Free"];

      const usageResult = await sql`
        SELECT tokens_used FROM weekly_usage
        WHERE user_id = ${userId} AND week_start = ${weekStartStr}
        LIMIT 1
      `;
      const currentUsage = usageResult[0]?.tokens_used || 0;

      if (currentUsage + tokensUsed > limit) {
        return c.json(
          { error: "Limite atteinte.", limit, used: currentUsage },
          429
        );
      }

      await sql`
        INSERT INTO weekly_usage (user_id, week_start, tokens_used)
        VALUES (${userId}, ${weekStartStr}, ${tokensUsed})
        ON CONFLICT (user_id, week_start)
        DO UPDATE SET tokens_used = weekly_usage.tokens_used + ${tokensUsed}
      `;

      return c.json({
        limit,
        success: true,
        weeklyUsed: currentUsage + tokensUsed,
      });
    } catch {
      return c.json({ error: "Erreur serveur." }, 500);
    }
  });

  // PROXY : CHAT COMPLETIONS (CLI)
  app.post("/chat/completions", async (c) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) {
        return c.json({ error: "Non authentifié." }, 401);
      }

      const payload = await verifyToken(token);
      const userId = payload.sub as string;

      // Vérification des limites avant d'autoriser la requête
      const sql = getDb();
      const userRes =
        await sql`SELECT tier FROM users WHERE id = ${userId} LIMIT 1`;
      const tier = userRes.length > 0 ? userRes[0].tier : "Free";
      const limit = TIER_LIMITS[tier] || TIER_LIMITS["Free"];

      const { weekStartStr } = getWeekData();
      const usageResult = await sql`
        SELECT tokens_used FROM weekly_usage
        WHERE user_id = ${userId} AND week_start = ${weekStartStr}
        LIMIT 1
      `;
      const currentUsage = usageResult[0]?.tokens_used || 0;

      if (currentUsage >= limit) {
        return c.json({ error: "Votre limite hebdomadaire est épuisée." }, 429);
      }

      // Le corps de la requête du CLI
      const body = await c.req.json();
      
      const keyRows = await sql`
        SELECT api_key FROM mprojects_api_keys WHERE user_id = ${userId}::text LIMIT 1
      `;
      const apiKey = keyRows.length > 0 ? keyRows[0].api_key : Deno.env.get("OPENROUTER_API_KEY");

      if (!apiKey) {
        return c.json({ error: "Clé fournisseur manquante." }, 500);
      }

      try {
        await sql`
          INSERT INTO weekly_usage (user_id, week_start, tokens_used)
          VALUES (${userId}::text, ${weekStartStr}, 1)
          ON CONFLICT (user_id, week_start)
          DO UPDATE SET tokens_used = weekly_usage.tokens_used + 1
        `;
      } catch(e) {}

      // Redirection de la requête vers OpenRouter
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          body: JSON.stringify(body),
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://mai.val.run",
            "X-Title": "mAI CLI",
          },
          method: "POST",
        }
      );

      // Retourne le stream ou la réponse directement au CLI
      return new Response(response.body, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type":
            response.headers.get("Content-Type") || "application/json",
        },
        status: response.status,
      });
    } catch {
      return c.json({ error: "Erreur serveur proxy." }, 500);
    }
  });

  // GET /v1/models
  app.get("/v1/models", async (c) => {
    const userPlan = c.get("userPlan");
    const apiKey = c.get("apiKey");
    const planStr = String(userPlan || "Free").toLowerCase().trim();
    const isPaidPlan = ["plus", "pro", "max"].includes(planStr);
    const shouldFilterFreeOnly = !isPaidPlan || !apiKey;

    try {
      const res = await fetch("https://openrouter.ai/api/v1/models");
      if (!res.ok) {
        throw new Error("OpenRouter fetch error");
      }
      const json = await res.json();
      const rawModels: any[] = json.data || [];

      let filtered = rawModels
        .filter((m) => m && m.id && !m.id.startsWith("openrouter/"))
        .filter((m) => {
          const modality = m.architecture?.modality || "";
          const outputModalities = m.architecture?.output_modalities || [];
          return (
            outputModalities.includes("text") ||
            modality.endsWith("text") ||
            modality.includes("->text")
          );
        })
        .map((m) => ({
          created: m.created || Math.floor(Date.now() / 1000),
          id: m.id,
          maxContext: m.context_length || 128_000,
          maxOutput: m.top_provider?.max_completion_tokens || 4096,
          object: "model",
          owned_by: m.id.split("/")[0] || "openrouter",
        }));

      if (shouldFilterFreeOnly) {
        filtered = filtered.filter((m) => m.id.toLowerCase().includes("free"));
      }

      return c.json({ data: filtered, object: "list" });
    } catch (_err) {
      let fallback = [
        {
          created: 0,
          id: "google/gemini-2.5-flash:free",
          object: "model",
          owned_by: "google",
        },
        {
          created: 0,
          id: "meta-llama/llama-3.3-70b-instruct:free",
          object: "model",
          owned_by: "meta-llama",
        },
        {
          created: 0,
          id: "qwen/qwen-2.5-coder-32b-instruct:free",
          object: "model",
          owned_by: "qwen",
        },
        {
          created: 0,
          id: "deepseek/deepseek-r1:free",
          object: "model",
          owned_by: "deepseek",
        },
      ];

      if (shouldFilterFreeOnly) {
        fallback = fallback.filter((m) => m.id.toLowerCase().includes("free"));
      }

      return c.json({ data: fallback, object: "list" });
    }
  });

  // GET /v1/mai/models
  app.get("/v1/mai/models", async (c) => {
    const maiModelsList = [
      {
        created: Math.floor(Date.now() / 1000),
        id: "mDevsLabs/mAI-1.2-Light",
        object: "model",
        owned_by: "mDevsLabs",
      },
      {
        created: Math.floor(Date.now() / 1000),
        id: "mDevsLabs/mAI-1.2-Apex",
        object: "model",
        owned_by: "mDevsLabs",
      },
      {
        created: Math.floor(Date.now() / 1000),
        id: "mDevsLabs/mAI-1.2-Opal",
        object: "model",
        owned_by: "mDevsLabs",
      },
    ];
    return c.json({ data: maiModelsList, object: "list" });
  });

  // GET /v1/status
  app.get("/v1/status", async (c) => {
    try {
      const res = await fetch("https://mai.instatus.com/summary.json");
      const data = await res.json();
      return c.json(data);
    } catch {
      return c.json({ error: "Failed to fetch status" }, 500);
    }
  });

  // POST /v1/chat/completions
  app.post("/v1/chat/completions", async (c) => {
    try {
      const userPlan = c.get("userPlan");
      const body = await c.req.json();
      const modelRequested = body.model;

      const planStr = String(userPlan || "Free")
        .toLowerCase()
        .trim();
      const isPaidPlan = ["plus", "pro", "max"].includes(planStr);
      const isFreePlan = !isPaidPlan;

      const modelStr = String(modelRequested || "").toLowerCase();
      const isFreeModel = modelStr.includes("free");

      if (isFreePlan && !isFreeModel) {
        return c.json(
          {
            error: {
              code: "model_access_denied",
              message: `Le modèle '${modelRequested || "inconnu"}' nécessite un forfait payant (Plus, Pro ou Max). Votre forfait actuel (${userPlan}) autorise uniquement les modèles contenant 'free'.`,
              param: "model",
              type: "permission_error",
            },
          },
          403
        );
      }

      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Non authentifié." }, 401);
      }

      const sql = getDb();
      const { weekStartStr } = getWeekData();
      const usageResult = await sql`
        SELECT tokens_used FROM weekly_usage
        WHERE user_id = ${userId}::text AND week_start = ${weekStartStr}
        LIMIT 1
      `;
      const currentUsage = usageResult[0]?.tokens_used || 0;
      const limit = TIER_LIMITS[String(userPlan || "Free")] || TIER_LIMITS["Free"];

      if (currentUsage >= limit) {
        return c.json({ error: "Votre limite hebdomadaire est épuisée. Quota atteint." }, 429);
      }

      const keyRows = await sql`
        SELECT api_key FROM mprojects_api_keys WHERE user_id = ${userId}::text LIMIT 1
      `;
      const apiKey = keyRows.length > 0 ? keyRows[0].api_key : Deno.env.get("OPENROUTER_API_KEY");

      if (!apiKey) {
        return c.json({ error: "Clé fournisseur manquante." }, 500);
      }

      try {
        await sql`
          INSERT INTO weekly_usage (user_id, week_start, tokens_used)
          VALUES (${userId}::text, ${weekStartStr}, 1)
          ON CONFLICT (user_id, week_start)
          DO UPDATE SET tokens_used = weekly_usage.tokens_used + 1
        `;
      } catch(e) {}

      const openRouterRes = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          body: JSON.stringify(body),
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://mai.val.run",
            "X-Title": "mAI Public API",
          },
          method: "POST",
        }
      );

      return new Response(openRouterRes.body, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type":
            openRouterRes.headers.get("Content-Type") || "application/json",
        },
        status: openRouterRes.status,
      });
    } catch {
      return c.json({ error: "Failed to process chat completion." }, 500);
    }
  });

  // POST /v1/messages (Proxy Anthropic SDK)
  app.post("/v1/messages", async (c) => {
    try {
      const userPlan = c.get("userPlan");
      const body = await c.req.json();
      const modelRequested = body.model;

      const planStr = String(userPlan || "Free")
        .toLowerCase()
        .trim();
      const isFreePlan = planStr === "free" || planStr === "gratuit";
      const isFreeModel = Boolean(
        modelRequested && modelRequested.includes(":free")
      );

      if (isFreePlan && !isFreeModel) {
        return c.json(
          {
            error: {
              code: "model_access_denied",
              message: `Le modèle '${modelRequested || "inconnu"}' nécessite un forfait payant (Plus, Pro ou Max). Votre forfait actuel (Free) autorise uniquement les modèles gratuits dont l'ID contient ':free' tel que 'poolside/laguna-xs-2.1:free'.`,
              param: "model",
              type: "permission_error",
            },
          },
          403
        );
      }

      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Non authentifié." }, 401);
      }

      const sql = getDb();
      const { weekStartStr } = getWeekData();
      const usageResult = await sql`
        SELECT tokens_used FROM weekly_usage
        WHERE user_id = ${userId}::text AND week_start = ${weekStartStr}
        LIMIT 1
      `;
      const currentUsage = usageResult[0]?.tokens_used || 0;
      const limit = TIER_LIMITS[String(userPlan || "Free")] || TIER_LIMITS["Free"];

      if (currentUsage >= limit) {
        return c.json({ error: "Votre limite hebdomadaire est épuisée. Quota atteint." }, 429);
      }

      const keyRows = await sql`
        SELECT api_key FROM mprojects_api_keys WHERE user_id = ${userId}::text LIMIT 1
      `;
      const apiKey = keyRows.length > 0 ? keyRows[0].api_key : Deno.env.get("OPENROUTER_API_KEY");

      if (!apiKey) {
        return c.json({ error: "Clé fournisseur manquante." }, 500);
      }

      try {
        await sql`
          INSERT INTO weekly_usage (user_id, week_start, tokens_used)
          VALUES (${userId}::text, ${weekStartStr}, 1)
          ON CONFLICT (user_id, week_start)
          DO UPDATE SET tokens_used = weekly_usage.tokens_used + 1
        `;
      } catch(e) {}

      const openRouterRes = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          body: JSON.stringify(body),
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://mai.val.run",
            "X-Title": "mAI Public API",
          },
          method: "POST",
        }
      );

      return new Response(openRouterRes.body, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type":
            openRouterRes.headers.get("Content-Type") || "application/json",
        },
        status: openRouterRes.status,
      });
    } catch {
      return c.json({ error: "Failed to process Anthropic request." }, 500);
    }
  });

  // POST /v1beta/models/:model:generateContent (Proxy Google SDK)
  app.post("/v1beta/models/:model:generateContent", async (c) => {
    try {
      const userPlan = c.get("userPlan");
      const body = await c.req.json().catch(() => ({}));
      const modelRequested = c.req.param("model");

      const planStr = String(userPlan || "Free")
        .toLowerCase()
        .trim();
      const isFreePlan = planStr === "free" || planStr === "gratuit";
      const isFreeModel = Boolean(
        modelRequested && modelRequested.includes(":free")
      );

      if (isFreePlan && !isFreeModel) {
        return c.json(
          {
            error: {
              code: "model_access_denied",
              message: `Le modèle '${modelRequested || "inconnu"}' nécessite un forfait payant (Plus, Pro ou Max). Votre forfait actuel (Free) autorise uniquement les modèles gratuits dont l'ID contient ':free' tel que 'poolside/laguna-xs-2.1:free'.`,
              param: "model",
              type: "permission_error",
            },
          },
          403
        );
      }

      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Non authentifié." }, 401);
      }

      const sql = getDb();
      const { weekStartStr } = getWeekData();
      const usageResult = await sql`
        SELECT tokens_used FROM weekly_usage
        WHERE user_id = ${userId}::text AND week_start = ${weekStartStr}
        LIMIT 1
      `;
      const currentUsage = usageResult[0]?.tokens_used || 0;
      const limit = TIER_LIMITS[String(userPlan || "Free")] || TIER_LIMITS["Free"];

      if (currentUsage >= limit) {
        return c.json({ error: "Votre limite hebdomadaire est épuisée. Quota atteint." }, 429);
      }

      const keyRows = await sql`
        SELECT api_key FROM mprojects_api_keys WHERE user_id = ${userId}::text LIMIT 1
      `;
      const apiKey = keyRows.length > 0 ? keyRows[0].api_key : Deno.env.get("OPENROUTER_API_KEY");

      if (!apiKey) {
        return c.json({ error: "Clé fournisseur manquante." }, 500);
      }

      try {
        await sql`
          INSERT INTO weekly_usage (user_id, week_start, tokens_used)
          VALUES (${userId}::text, ${weekStartStr}, 1)
          ON CONFLICT (user_id, week_start)
          DO UPDATE SET tokens_used = weekly_usage.tokens_used + 1
        `;
      } catch(e) {}

      // Google payload is different, we send it to OpenRouter's endpoint.
      const openRouterRes = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          body: JSON.stringify(body),
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://mai.val.run",
            "X-Title": "mAI Public API",
          },
          method: "POST",
        }
      );

      return new Response(openRouterRes.body, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type":
            openRouterRes.headers.get("Content-Type") || "application/json",
        },
        status: openRouterRes.status,
      });
    } catch {
      return c.json({ error: "Failed to process Google request." }, 500);
    }
  });
}
