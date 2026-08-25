import type { Hono } from "npm:hono@4";
import {
  extractToken,
  getDb,
  getTierSpeechLimit,
  getWeekData,
  TIER_LIMITS,
  verifyToken,
} from "./config.ts";
import { maiModelsList } from "./maiModels.ts";

function getOpenRouterApiKey(userCustomKey?: string | null): string {
  if (userCustomKey && userCustomKey.trim().startsWith("sk-or-")) {
    return userCustomKey.trim();
  }
  return Deno.env.get("OPENROUTER_API_KEY") || "";
}

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
      const [usageResult, userResult, speechResult] = await Promise.all([
        sql`SELECT tokens_used FROM weekly_usage WHERE user_id = ${userId} AND week_start = ${weekStartStr}`,
        sql`SELECT tier, email, username, phone, avatar_url FROM users WHERE id = ${userId} LIMIT 1`,
        sql`SELECT tokens_used FROM weekly_speech_usage WHERE user_id = ${userId}::text AND week_start = ${weekStartStr}::date LIMIT 1`.catch(() => []),
      ]);

      const user = userResult[0];
      const tokensUsed = usageResult[0]?.tokens_used || 0;
      const speechTokensUsed = Number(speechResult?.[0]?.tokens_used || 0);
      const userTier = user?.tier || "Free";
      const limit = TIER_LIMITS[userTier] || TIER_LIMITS["Free"];
      const speechLimit = getTierSpeechLimit(userTier);

      return c.json({
        avatarUrl: user?.avatar_url,
        email: user?.email,
        id: userId,
        limit,
        phone: user?.phone,
        resetAt: nextResetIso,
        speechLimit,
        speechTokensUsed,
        tier: userTier,
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

  // ─────────────────────────────────────────────
  // GET /v1/models, /models & /v1beta/models
  // ─────────────────────────────────────────────
  const handleGetModels = async (c: any) => {
    const userPlan = c.get("userPlan");
    const planStr = String(userPlan || "Free")
      .toLowerCase()
      .trim();
    const isPaidPlan = ["plus", "pro", "max"].includes(planStr);
    const shouldFilterFreeOnly = !isPaidPlan;

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
          architecture: m.architecture,
          created: m.created || Math.floor(Date.now() / 1000),
          description: m.description || "",
          id: m.id,
          maxContext: m.context_length || 128_000,
          maxOutput: m.top_provider?.max_completion_tokens || 4096,
          name: m.name || m.id,
          object: "model",
          owned_by: m.id.split("/")[0] || "openrouter",
          supported_parameters: m.supported_parameters || [
            "temperature",
            "top_p",
            "max_tokens",
            "stream",
            "stop",
            "tools",
            "response_format",
          ],
        }));

      if (shouldFilterFreeOnly) {
        filtered = filtered.filter((m) =>
          (m.id || "").toLowerCase().includes(":free")
        );
      }

      return c.json({ data: filtered, object: "list" });
    } catch (_err) {
      let fallback = [
        {
          architecture: {
            input_modalities: ["text", "image", "file"],
            modality: "text+image->text",
            output_modalities: ["text"],
          },
          created: 0,
          description:
            "Modèle multimodal ultra-rapide de Google conçu pour des tâches à haut débit et de raisonnement avec un très grand contexte.",
          id: "google/gemini-2.5-flash:free",
          maxContext: 1_048_576,
          maxOutput: 65_535,
          name: "Google: Gemini 2.5 Flash",
          object: "model",
          owned_by: "google",
          supported_parameters: [
            "temperature",
            "top_p",
            "top_k",
            "max_tokens",
            "tools",
            "response_format",
            "seed",
          ],
        },
        {
          architecture: {
            input_modalities: ["text"],
            modality: "text->text",
            output_modalities: ["text"],
          },
          created: 0,
          description:
            "Modèle phare de Meta Llama 3.3 70B offrant des compétences avancées de programmation, logique et résolution de problèmes complexes.",
          id: "meta-llama/llama-3.3-70b-instruct:free",
          maxContext: 131_072,
          maxOutput: 128_000,
          name: "Meta: Llama 3.3 70B Instruct",
          object: "model",
          owned_by: "meta-llama",
          supported_parameters: [
            "temperature",
            "top_p",
            "max_tokens",
            "tools",
            "response_format",
            "frequency_penalty",
          ],
        },
        {
          architecture: {
            input_modalities: ["text"],
            modality: "text->text",
            output_modalities: ["text"],
          },
          created: 0,
          description:
            "Modèle de code spécialisé de haute précision par Alibaba Cloud, optimisé pour la synthèse de code, le refactoring et le debug.",
          id: "qwen/qwen-2.5-coder-32b-instruct:free",
          maxContext: 32_768,
          maxOutput: 8192,
          name: "Qwen: Qwen 2.5 Coder 32B Instruct",
          object: "model",
          owned_by: "qwen",
          supported_parameters: [
            "temperature",
            "top_p",
            "max_tokens",
            "stop",
            "tools",
          ],
        },
        {
          architecture: {
            input_modalities: ["text"],
            modality: "text->text",
            output_modalities: ["text"],
          },
          created: 0,
          description:
            "Modèle de raisonnement logique étape par étape de premier ordre par DeepSeek pour les mathématiques et la logique complexe.",
          id: "deepseek/deepseek-r1:free",
          maxContext: 163_840,
          maxOutput: 16_000,
          name: "DeepSeek: DeepSeek R1",
          object: "model",
          owned_by: "deepseek",
          supported_parameters: [
            "temperature",
            "top_p",
            "max_tokens",
            "stream",
            "thinking",
            "reasoning",
          ],
        },
      ];

      if (shouldFilterFreeOnly) {
        fallback = fallback.filter((m) =>
          (m.id || "").toLowerCase().includes(":free")
        );
      }

      return c.json({ data: fallback, object: "list" });
    }
  };

  app.get("/v1/models", handleGetModels);
  app.get("/models", handleGetModels);
  app.get("/v1beta/models", handleGetModels);

  // ─────────────────────────────────────────────
  // GET /v1/models/mai & GET /v1/mai/models
  // ─────────────────────────────────────────────
  const handleGetMaiModels = (c: any) => {
    const formatted = maiModelsList.map((m) => ({
      capabilities: m.capabilities,
      context_length: m.contextWindow,
      created:
        Math.floor(new Date(m.releaseDate).getTime() / 1000) ||
        Math.floor(Date.now() / 1000),
      description: m.description,
      huggingface_tag: m.huggingFaceTag,
      id: m.id,
      license: m.license,
      max_output_tokens: m.maxOutputTokens,
      name: m.name,
      object: "model",
      ollama_tag: m.ollamaTag,
      owned_by: "mDevsLabs",
      parameters: m.parameters,
      recommended_hardware: m.recommendedHardware,
      status: m.status,
      tagline: m.tagline,
      usable_in_cloud_chat: false,
      version: m.version,
    }));
    return c.json({ data: formatted, object: "list" });
  };

  app.get("/v1/models/mai", handleGetMaiModels);
  app.get("/v1/mai/models", handleGetMaiModels);
  app.get("/models/mai", handleGetMaiModels);
  app.get("/mai/models", handleGetMaiModels);

  // ─────────────────────────────────────────────
  // GET /v1/status
  // ─────────────────────────────────────────────
  const handleGetStatus = async (c: any) => {
    try {
      const res = await fetch("https://mai.instatus.com/summary.json");
      const data = await res.json();
      return c.json(data);
    } catch {
      return c.json({ error: "Failed to fetch status" }, 500);
    }
  };

  app.get("/v1/status", handleGetStatus);
  app.get("/status", handleGetStatus);

  // ─────────────────────────────────────────────
  // POST /v1/chat/completions & /chat/completions (OpenAI Compatible)
  // ─────────────────────────────────────────────
  const handleChatCompletions = async (c: any) => {
    try {
      const userPlan = c.get("userPlan") || "Free";
      const body = await c.req.json().catch(() => ({}));
      const modelRequested = body.model;
      const modelStr = String(modelRequested || "").toLowerCase().trim();

      // Vérifier si c'est un modèle mAI (local uniquement)
      const isMaiLocal =
        modelStr.startsWith("mai-") ||
        modelStr.startsWith("mdevslabs/") ||
        modelStr.includes("mai-1.") ||
        modelStr === "mai-1" ||
        modelStr === "mai-1-light";

      if (isMaiLocal) {
        return c.json(
          {
            error: {
              code: "mai_model_not_supported_for_cloud_chat",
              message: `Le modèle '${modelRequested}' est un modèle mAI destiné à une exécution locale (via Ollama / HuggingFace) et n'est pas directement utilisable en chat completions cloud.`,
              param: "model",
              type: "invalid_request_error",
            },
          },
          400
        );
      }

      const planStr = String(userPlan || "Free")
        .toLowerCase()
        .trim();
      const isPaidPlan = ["plus", "pro", "max"].includes(planStr);
      const isFreePlan = !isPaidPlan;
      const isFreeModel = modelStr.includes(":free");

      // Bloquer avec 403 les requêtes pour les modèles payants avec une clé ou JWT free
      if (isFreePlan && !isFreeModel) {
        return c.json(
          {
            error: {
              code: "model_access_denied",
              message: `Le modèle '${modelRequested || "inconnu"}' nécessite un forfait payant (Plus, Pro ou Max). Votre forfait actuel (${userPlan}) autorise uniquement les modèles contenant ':free' dans leur identifiant (ex: 'google/gemini-2.5-flash:free', 'meta-llama/llama-3.3-70b-instruct:free').`,
              param: "model",
              type: "permission_error",
            },
          },
          403
        );
      }

      let userId = c.get("userId");
      if (!userId) {
        const token = extractToken(c.req.raw);
        if (token) {
          try {
            const payload = await verifyToken(token);
            userId = payload.sub as string;
          } catch {}
        }
      }

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
      const limit =
        TIER_LIMITS[String(userPlan || "Free")] || TIER_LIMITS["Free"];

      if (currentUsage >= limit) {
        return c.json(
          { error: "Votre limite hebdomadaire est épuisée. Quota atteint." },
          429
        );
      }

      const keyRows = await sql`
        SELECT api_key FROM mprojects_api_keys WHERE user_id = ${userId}::text LIMIT 1
      `;
      const apiKey = getOpenRouterApiKey(
        keyRows.length > 0 ? keyRows[0].api_key : null
      );

      if (!apiKey) {
        return c.json({ error: "Clé fournisseur OpenRouter manquante." }, 500);
      }

      try {
        await sql`
          INSERT INTO weekly_usage (user_id, week_start, tokens_used)
          VALUES (${userId}::text, ${weekStartStr}, 1)
          ON CONFLICT (user_id, week_start)
          DO UPDATE SET tokens_used = weekly_usage.tokens_used + 1
        `;
      } catch (_e) {}

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
  };

  app.post("/v1/chat/completions", handleChatCompletions);
  app.post("/chat/completions", handleChatCompletions);

  // ─────────────────────────────────────────────
  // POST /v1/messages & /messages (Proxy Anthropic SDK)
  // ─────────────────────────────────────────────
  const handleMessages = async (c: any) => {
    try {
      const userPlan = c.get("userPlan") || "Free";
      const body = await c.req.json().catch(() => ({}));
      const modelRequested = body.model;
      const modelStr = String(modelRequested || "").toLowerCase().trim();

      const planStr = String(userPlan || "Free")
        .toLowerCase()
        .trim();
      const isPaidPlan = ["plus", "pro", "max"].includes(planStr);
      const isFreePlan = !isPaidPlan;
      const isFreeModel = modelStr.includes(":free");

      // Bloquer avec 403 les requêtes pour les modèles payants avec une clé ou JWT free
      if (isFreePlan && !isFreeModel) {
        return c.json(
          {
            error: {
              code: "model_access_denied",
              message: `Le modèle '${modelRequested || "inconnu"}' nécessite un forfait payant (Plus, Pro ou Max). Votre forfait actuel (${userPlan}) autorise uniquement les modèles gratuits dont l'ID contient ':free' (ex: 'meta-llama/llama-3.3-70b-instruct:free', 'deepseek/deepseek-r1:free').`,
              param: "model",
              type: "permission_error",
            },
          },
          403
        );
      }

      let userId = c.get("userId");
      if (!userId) {
        const token = extractToken(c.req.raw);
        if (token) {
          try {
            const payload = await verifyToken(token);
            userId = payload.sub as string;
          } catch {}
        }
      }

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
      const limit =
        TIER_LIMITS[String(userPlan || "Free")] || TIER_LIMITS["Free"];

      if (currentUsage >= limit) {
        return c.json(
          { error: "Votre limite hebdomadaire est épuisée. Quota atteint." },
          429
        );
      }

      const keyRows = await sql`
        SELECT api_key FROM mprojects_api_keys WHERE user_id = ${userId}::text LIMIT 1
      `;
      const apiKey = getOpenRouterApiKey(
        keyRows.length > 0 ? keyRows[0].api_key : null
      );

      if (!apiKey) {
        return c.json({ error: "Clé fournisseur OpenRouter manquante." }, 500);
      }

      try {
        await sql`
          INSERT INTO weekly_usage (user_id, week_start, tokens_used)
          VALUES (${userId}::text, ${weekStartStr}, 1)
          ON CONFLICT (user_id, week_start)
          DO UPDATE SET tokens_used = weekly_usage.tokens_used + 1
        `;
      } catch (_e) {}

      const openRouterRes = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          body: JSON.stringify(body),
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://mai.val.run",
            "X-Title": "mAI Public API (Anthropic)",
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
  };

  app.post("/v1/messages", handleMessages);
  app.post("/messages", handleMessages);

  // ─────────────────────────────────────────────
  // POST /v1beta/models/* & /v1/models/* (Proxy Google Gemini SDK)
  // ─────────────────────────────────────────────
  const handleGeminiGenerate = async (c: any) => {
    try {
      const userPlan = c.get("userPlan") || "Free";
      const body = await c.req.json().catch(() => ({}));

      const fullPath = c.req.path;
      // Extraire le modèle depuis l'URL (ex: /v1beta/models/google/gemini-2.5-flash:free:generateContent -> google/gemini-2.5-flash:free)
      const pathModel = fullPath
        .replace(/^\/(v1beta|v1)\/models\//, "")
        .replace(/:(generateContent|streamGenerateContent).*$/, "");

      const paramModel = c.req.param("model");
      const modelRequested = body.model || paramModel || pathModel;
      const modelStr = String(modelRequested || "").toLowerCase().trim();

      const planStr = String(userPlan || "Free")
        .toLowerCase()
        .trim();
      const isPaidPlan = ["plus", "pro", "max"].includes(planStr);
      const isFreePlan = !isPaidPlan;
      const isFreeModel = modelStr.includes(":free");

      // Bloquer avec 403 les requêtes pour les modèles payants avec une clé ou JWT free
      if (isFreePlan && !isFreeModel) {
        return c.json(
          {
            error: {
              code: 403,
              message: `Le modèle '${modelRequested || "inconnu"}' nécessite un forfait payant (Plus, Pro ou Max). Votre forfait actuel (${userPlan}) autorise uniquement les modèles gratuits contenant ':free' dans leur identifiant (ex: 'google/gemini-2.5-flash:free').`,
              status: "PERMISSION_DENIED",
            },
          },
          403
        );
      }

      let userId = c.get("userId");
      if (!userId) {
        const token = extractToken(c.req.raw);
        if (token) {
          try {
            const payload = await verifyToken(token);
            userId = payload.sub as string;
          } catch {}
        }
      }

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
      const limit =
        TIER_LIMITS[String(userPlan || "Free")] || TIER_LIMITS["Free"];

      if (currentUsage >= limit) {
        return c.json(
          { error: "Votre limite hebdomadaire est épuisée. Quota atteint." },
          429
        );
      }

      const keyRows = await sql`
        SELECT api_key FROM mprojects_api_keys WHERE user_id = ${userId}::text LIMIT 1
      `;
      const apiKey = getOpenRouterApiKey(
        keyRows.length > 0 ? keyRows[0].api_key : null
      );

      if (!apiKey) {
        return c.json({ error: "Clé fournisseur OpenRouter manquante." }, 500);
      }

      try {
        await sql`
          INSERT INTO weekly_usage (user_id, week_start, tokens_used)
          VALUES (${userId}::text, ${weekStartStr}, 1)
          ON CONFLICT (user_id, week_start)
          DO UPDATE SET tokens_used = weekly_usage.tokens_used + 1
        `;
      } catch (_e) {}

      const openRouterPayload = {
        ...body,
        model: body.model || modelRequested,
      };

      const openRouterRes = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          body: JSON.stringify(openRouterPayload),
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://mai.val.run",
            "X-Title": "mAI Public API (Gemini)",
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
      return c.json({ error: "Failed to process Google Gemini request." }, 500);
    }
  };

  app.post("/v1beta/models/*", handleGeminiGenerate);
  app.post("/v1/models/*:generateContent", handleGeminiGenerate);
  app.post("/v1/models/*:streamGenerateContent", handleGeminiGenerate);
}
