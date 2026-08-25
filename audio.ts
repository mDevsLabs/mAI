import type { Hono } from "npm:hono@4";
import {
  extractToken,
  getDb,
  getTierSpeechLimit,
  getWeekData,
  verifyToken,
} from "./config.ts";

export interface SpeechModelItem {
  created: number;
  description: string;
  id: string;
  name: string;
  voices?: string[];
}

function cleanModelName(name: string): string {
  return (name || "")
    .replace(/\s*\((free|gratuit|free tier)\)/gi, "")
    .replace(/:free/gi, "")
    .trim();
}

function getOpenRouterApiKey(userCustomKey?: string | null): string {
  if (userCustomKey && userCustomKey.trim().startsWith("sk-or-")) {
    return userCustomKey.trim();
  }
  if (typeof Deno !== "undefined" && Deno.env) {
    return Deno.env.get("OPENROUTER_API_KEY") || "";
  }
  if (typeof process !== "undefined" && process.env) {
    return process.env.OPENROUTER_API_KEY || "";
  }
  return "";
}

/**
 * Modèles Speech de repli avec voix disponibles et noms nettoyés sans (Free)
 */
const FALLBACK_SPEECH_MODELS = [
  {
    architecture: {
      input_modalities: ["text"],
      modality: "text->speech",
      output_modalities: ["speech"],
    },
    created: Math.floor(Date.now() / 1000) - 86_400 * 30,
    description:
      "Modèle Text-to-Speech (TTS) ultra-rapide et haute fidélité par Deepgram.",
    id: "deepgram/flux-tts:free",
    name: "Deepgram: Flux TTS",
    object: "model",
    owned_by: "deepgram",
    supported_parameters: ["voice", "speed", "response_format"],
    voices: [
      "flux-alexis-en",
      "flux-michael-en",
      "flux-stacy-en",
      "flux-sam-en",
      "flux-asteria-en",
      "flux-orion-en",
    ],
  },
];

let speechTablesInitialized = false;
async function ensureSpeechTables(sql: any) {
  if (speechTablesInitialized) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS weekly_speech_usage (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        week_start DATE NOT NULL,
        tokens_used BIGINT NOT NULL DEFAULT 0,
        requests_count INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT weekly_speech_usage_user_week_unique UNIQUE (user_id, week_start)
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS mprojects_speech_generations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        api_key TEXT,
        model TEXT NOT NULL DEFAULT 'deepgram/flux-tts:free',
        voice TEXT DEFAULT 'flux-alexis-en',
        input_text TEXT NOT NULL,
        audio_url TEXT,
        tokens_count INTEGER NOT NULL DEFAULT 0,
        character_count INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'completed',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    await sql`ALTER TABLE mprojects_speech_generations ADD COLUMN IF NOT EXISTS audio_url TEXT`;
    speechTablesInitialized = true;
  } catch (err) {
    console.error("[Speech API] Error initializing speech tables:", err);
  }
}

export function registerAudioRoutes(app: Hono) {
  try {
    ensureSpeechTables(getDb()).catch(() => {});
  } catch {}
  // ─────────────────────────────────────────────
  // GET /v1/models/speech, /models/speech & /v1/audio/models
  // ─────────────────────────────────────────────
  const handleGetSpeechModels = async (c: any) => {
    try {
      const res = await fetch(
        "https://openrouter.ai/api/v1/models?output_modalities=speech"
      );

      let rawModels: any[] = [];
      if (res.ok) {
        const json = await res.json();
        rawModels = json.data || [];
      }

      if (rawModels.length === 0) {
        rawModels = FALLBACK_SPEECH_MODELS;
      }

      // Règle stricte : filtrer par l'ID contenant ':free' quel que soit le forfait
      const freeSpeechModels = rawModels
        .filter((m) => m && m.id && (m.id || "").toLowerCase().includes(":free"))
        .map((m) => {
          const rawName = m.name || m.id;
          const cleanedName = cleanModelName(rawName) || cleanModelName(m.id);
          return {
            architecture: m.architecture || {
              input_modalities: ["text"],
              modality: "text->speech",
              output_modalities: ["speech"],
            },
            created: m.created || Math.floor(Date.now() / 1000),
            description:
              m.description ||
              `Modèle de synthèse vocale (TTS) ${cleanedName}.`,
            id: m.id,
            name: cleanedName,
            object: "model",
            owned_by: (m.id || "").split("/")[0] || "openrouter",
            supported_parameters: m.supported_parameters || [
              "voice",
              "speed",
              "response_format",
            ],
            voices: m.voices || [
              "flux-alexis-en",
              "flux-michael-en",
              "flux-stacy-en",
              "flux-sam-en",
              "flux-asteria-en",
              "flux-orion-en",
            ],
          };
        });

      const finalModels =
        freeSpeechModels.length > 0 ? freeSpeechModels : FALLBACK_SPEECH_MODELS;

      return c.json({ data: finalModels, object: "list" });
    } catch (_err) {
      return c.json({ data: FALLBACK_SPEECH_MODELS, object: "list" });
    }
  };

  app.get("/v1/models/speech", handleGetSpeechModels);
  app.get("/models/speech", handleGetSpeechModels);
  app.get("/v1/speech/models", handleGetSpeechModels);
  app.get("/speech/models", handleGetSpeechModels);
  app.get("/v1/audio/models", handleGetSpeechModels);
  app.get("/audio/models", handleGetSpeechModels);

  // ─────────────────────────────────────────────
  // GET /v1/speech/voices & /v1/audio/voices
  // ─────────────────────────────────────────────
  const handleGetSpeechVoices = (c: any) => {
    return c.json({
      data: [
        {
          description: "Voix féminine chaleureuse, naturelle et claire.",
          gender: "female",
          id: "flux-alexis-en",
          language: "fr/en",
          name: "Alexis",
        },
        {
          description: "Voix masculine posée, fluide et professionnelle.",
          gender: "male",
          id: "flux-michael-en",
          language: "fr/en",
          name: "Michael",
        },
        {
          description: "Voix féminine expressive, vive et dynamique.",
          gender: "female",
          id: "flux-stacy-en",
          language: "fr/en",
          name: "Stacy",
        },
        {
          description: "Voix masculine profonde, idéale pour narration & podcast.",
          gender: "male",
          id: "flux-sam-en",
          language: "fr/en",
          name: "Sam",
        },
        {
          description: "Voix féminine moderne, douce et mélodieuse.",
          gender: "female",
          id: "flux-asteria-en",
          language: "fr/en",
          name: "Asteria",
        },
        {
          description: "Voix masculine cinématique, intense et charismatique.",
          gender: "male",
          id: "flux-orion-en",
          language: "fr/en",
          name: "Orion",
        },
      ],
      object: "list",
    });
  };

  app.get("/v1/speech/voices", handleGetSpeechVoices);
  app.get("/speech/voices", handleGetSpeechVoices);
  app.get("/v1/audio/voices", handleGetSpeechVoices);
  app.get("/audio/voices", handleGetSpeechVoices);

  // ─────────────────────────────────────────────
  // GET /v1/speech/usage, /speech/usage, /v1/audio/usage & /usage/speech
  // ─────────────────────────────────────────────
  const handleGetSpeechUsage = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
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
      const { weekStartStr, nextResetIso } = getWeekData();

      const [uRows, usageRows] = await Promise.all([
        sql`SELECT tier FROM users WHERE id::text = ${userId}::text OR username = ${userId}::text LIMIT 1`,
        sql`
          SELECT tokens_used, requests_count 
          FROM weekly_speech_usage 
          WHERE user_id = ${userId}::text AND week_start = ${weekStartStr}::date 
          LIMIT 1
        `.catch(() => []),
      ]);

      const effectiveTier = uRows[0]?.tier || userPlan || "Free";
      const tokensUsed = Number(usageRows[0]?.tokens_used || 0);
      const requestsCount = Number(usageRows[0]?.requests_count || 0);
      const weeklyLimit = getTierSpeechLimit(effectiveTier);

      return c.json({
        plan: effectiveTier,
        requestsCount,
        resetAt: nextResetIso,
        tokensUsed,
        userId,
        weekStart: weekStartStr,
        weeklyLimit,
      });
    } catch (err: any) {
      return c.json(
        {
          details: err.message,
          error: "Erreur lors de la récupération de l'usage Speech.",
        },
        500
      );
    }
  };

  app.get("/v1/audio/usage", handleGetSpeechUsage);
  app.get("/v1/speech/usage", handleGetSpeechUsage);
  app.get("/audio/usage", handleGetSpeechUsage);
  app.get("/speech/usage", handleGetSpeechUsage);
  app.get("/usage/speech", handleGetSpeechUsage);

  // ─────────────────────────────────────────────
  // GET /v1/audio/history & /v1/speech/history
  // ─────────────────────────────────────────────
  const handleGetSpeechHistory = async (c: any) => {
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
        SELECT id, model, voice, input_text, audio_url, tokens_count, character_count, status, created_at
        FROM mprojects_speech_generations
        WHERE user_id = ${userId}::text
        ORDER BY created_at DESC
        LIMIT 50
      `.catch(() => []);

      return c.json({ data: history, success: true });
    } catch (err: any) {
      return c.json(
        { details: err.message, error: "Erreur historique audio." },
        500
      );
    }
  };

  app.get("/v1/audio/history", handleGetSpeechHistory);
  app.get("/v1/speech/history", handleGetSpeechHistory);
  app.get("/audio/history", handleGetSpeechHistory);
  app.get("/speech/history", handleGetSpeechHistory);

  // ─────────────────────────────────────────────
  // DELETE /v1/audio/history/:id & /v1/speech/history/:id
  // ─────────────────────────────────────────────
  const handleDeleteSpeechHistory = async (c: any) => {
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

      const id = c.req.param("id") || c.req.query("id");
      if (!id) {
        return c.json({ error: "ID manquant." }, 400);
      }

      const sql = getDb();
      await sql`
        DELETE FROM mprojects_speech_generations
        WHERE id::text = ${id}::text AND user_id = ${userId}::text
      `;

      return c.json({ message: "Audio supprimé avec succès", success: true });
    } catch (err: any) {
      return c.json(
        { details: err.message, error: "Erreur suppression audio." },
        500
      );
    }
  };

  app.delete("/v1/audio/history/:id", handleDeleteSpeechHistory);
  app.delete("/v1/audio/history", handleDeleteSpeechHistory);
  app.delete("/v1/speech/history/:id", handleDeleteSpeechHistory);
  app.delete("/v1/speech/history", handleDeleteSpeechHistory);
  app.delete("/audio/history/:id", handleDeleteSpeechHistory);
  app.delete("/audio/history", handleDeleteSpeechHistory);

  // ─────────────────────────────────────────────
  // POST /v1/speech, /v1/audio/speech, /v1beta/models/*:synthesizeSpeech (OpenAI, Google & Anthropic SDK)
  // ─────────────────────────────────────────────
  const OPENAI_VOICE_MAP: Record<string, string> = {
    alloy: "flux-alexis-en",
    echo: "flux-michael-en",
    fable: "flux-orion-en",
    nova: "flux-stacy-en",
    onyx: "flux-sam-en",
    shimmer: "flux-asteria-en",
  };

  const handleAudioSpeech = async (c: any) => {
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
          userId = (payload.sub as string) || userId;
          userPlan = (payload.tier as string) || userPlan;
        } catch {}
      }

      if (!userId) {
        return c.json(
          { error: "Non authentifié. Clé API ou token Bearer requis." },
          401
        );
      }

      const body = await c.req.json().catch(() => ({}));
      const reqPath = c.req.path || "";
      const isGoogleTts =
        reqPath.includes(":synthesizeSpeech") ||
        reqPath.includes(":synthesize") ||
        Boolean(body.audioConfig);

      // Extraction du texte / prompt (support OpenAI, Anthropic et Google Cloud TTS / Gemini)
      const rawInput =
        (typeof body.input === "object" ? body.input?.text : body.input) ||
        body.text ||
        body.prompt ||
        "";
      const input = typeof rawInput === "string" ? rawInput.trim() : "";

      // Extraction du modèle demandé
      const pathModel = reqPath
        .replace(/^\/(v1beta|v1)\/models\//, "")
        .replace(/:(synthesizeSpeech|synthesize).*$/, "");
      const requestedModel =
        body.model || pathModel || "deepgram/flux-tts:free";

      // Mapping automatique des modèles OpenAI standards (tts-1, tts-1-hd) vers deepgram/flux-tts:free
      let model = requestedModel;
      if (
        model === "tts-1" ||
        model === "tts-1-hd" ||
        model === "speech" ||
        model.toLowerCase().includes("gemini")
      ) {
        model = "deepgram/flux-tts:free";
      }

      // Extraction et mapping des voix (support des voix OpenAI alloy, echo, etc.)
      const rawVoice =
        (typeof body.voice === "object" ? body.voice?.name : body.voice) ||
        "flux-alexis-en";
      let voice = String(rawVoice).trim();
      if (OPENAI_VOICE_MAP[voice.toLowerCase()]) {
        voice = OPENAI_VOICE_MAP[voice.toLowerCase()];
      }

      const response_format =
        body.response_format ||
        (body.audioConfig?.audioEncoding === "OGG_OPUS" ? "opus" : "mp3");
      const speed =
        body.speed !== undefined
          ? body.speed
          : body.audioConfig?.speakingRate !== undefined
            ? body.audioConfig.speakingRate
            : 1.0;

      if (!input) {
        return c.json(
          {
            error: {
              code: "missing_input",
              message: "Le paramètre 'input' ou 'prompt' est obligatoire pour la synthèse vocale.",
              param: "input",
              type: "invalid_request_error",
            },
          },
          400
        );
      }

      // Règle stricte : filtrer par l'ID contenant ':free' quel que soit le forfait
      const modelStr = String(model).toLowerCase().trim();
      if (!modelStr.includes(":free")) {
        return c.json(
          {
            error: {
              code: "speech_model_free_required",
              message: `Pour l'API Speech, seuls les modèles avec ':free' sont autorisés (ex: 'deepgram/flux-tts:free'). Le modèle '${model}' n'est pas autorisé.`,
              param: "model",
              type: "permission_error",
            },
          },
          403
        );
      }

      const sql = getDb();
      const { weekStartStr, nextResetIso } = getWeekData();

      // Vérifier le forfait réel de l'utilisateur
      const uRows = await sql`
        SELECT tier FROM users 
        WHERE id::text = ${userId}::text OR username = ${userId}::text 
        LIMIT 1
      `.catch(() => []);
      const effectiveTier = uRows[0]?.tier || userPlan || "Free";
      const weeklyLimit = getTierSpeechLimit(effectiveTier);

      // Estimation des tokens utilisés (environ 1 token pour ~3.5 caractères, min 1 token)
      const estimatedTokens = Math.max(1, Math.ceil(input.length / 3.5));

      // Vérification du quota hebdomadaire
      const usageRows = await sql`
        SELECT tokens_used 
        FROM weekly_speech_usage 
        WHERE user_id = ${userId}::text AND week_start = ${weekStartStr}::date 
        LIMIT 1
      `.catch(() => []);
      const currentUsage = Number(usageRows[0]?.tokens_used || 0);

      if (currentUsage + estimatedTokens > weeklyLimit) {
        return c.json(
          {
            error: {
              code: "weekly_speech_quota_exceeded",
              limit: weeklyLimit,
              message: `Votre quota hebdomadaire de tokens Speech est épuisé (${currentUsage}/${weeklyLimit} tokens pour le forfait ${effectiveTier}). Prochain renouvellement le ${nextResetIso}.`,
              type: "quota_error",
              used: currentUsage,
            },
          },
          429
        );
      }

      // Récupération de la clé OpenRouter
      const keyRows = await sql`
        SELECT api_key FROM mprojects_api_keys WHERE user_id = ${userId}::text LIMIT 1
      `.catch(() => []);
      const openRouterApiKey = getOpenRouterApiKey(
        keyRows.length > 0 ? keyRows[0].api_key : null
      );

      if (!openRouterApiKey) {
        return c.json(
          { error: "Clé fournisseur OpenRouter manquante côté serveur." },
          500
        );
      }

      const openRouterPayload: Record<string, any> = {
        input,
        model,
        response_format,
        speed,
        voice,
      };

      const openRouterRes = await fetch(
        "https://openrouter.ai/api/v1/audio/speech",
        {
          body: JSON.stringify(openRouterPayload),
          headers: {
            Authorization: `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://mai.val.run",
            "X-Title": "mAI Public API (Speech)",
          },
          method: "POST",
        }
      );

      if (!openRouterRes.ok) {
        const errText = await openRouterRes.text().catch(() => "");
        console.error("[OpenRouter Speech] Erreur retournée:", errText);
        return c.json(
          {
            details: errText,
            error: "Erreur retournée par le fournisseur OpenRouter pour Speech.",
          },
          openRouterRes.status
        );
      }

      // Récupérer le buffer binaire audio
      const arrayBuf = await openRouterRes.arrayBuffer();
      const bytes = new Uint8Array(arrayBuf);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Audio = btoa(binary);
      const mimeType =
        response_format === "opus"
          ? "audio/opus"
          : response_format === "wav"
            ? "audio/wav"
            : "audio/mpeg";
      const dataUrl = `data:${mimeType};base64,${base64Audio}`;

      // Incrémentation atomique du quota hebdomadaire de tokens Speech
      try {
        await sql`
          INSERT INTO weekly_speech_usage (user_id, week_start, tokens_used, requests_count, updated_at)
          VALUES (${userId}::text, ${weekStartStr}::date, ${estimatedTokens}, 1, NOW())
          ON CONFLICT (user_id, week_start)
          DO UPDATE SET 
            tokens_used = weekly_speech_usage.tokens_used + ${estimatedTokens},
            requests_count = weekly_speech_usage.requests_count + 1,
            updated_at = NOW()
        `;
      } catch (err) {
        console.error("[Speech API] Erreur update weekly_speech_usage:", err);
      }

      // Log dans l'historique mprojects_speech_generations
      let savedId = Date.now();
      try {
        const insertRes = await sql`
          INSERT INTO mprojects_speech_generations (
            user_id, api_key, model, voice, input_text, audio_url, tokens_count, character_count, status, created_at
          ) VALUES (
            ${userId}::text,
            ${apiKey || null},
            ${model}::text,
            ${voice}::text,
            ${input}::text,
            ${dataUrl}::text,
            ${estimatedTokens}::integer,
            ${input.length}::integer,
            'completed',
            NOW()
          ) RETURNING id
        `;
        if (insertRes.length > 0 && insertRes[0].id) {
          savedId = insertRes[0].id;
        }
      } catch (e) {}

      // Log dans mprojects_api_logs
      try {
        await sql`
          INSERT INTO mprojects_api_logs (api_key, endpoint, method, status_code, latency_ms, created_at)
          VALUES (${apiKey || "jwt"}::text, ${reqPath || "/v1/speech"}::text, 'POST', 200, 500, NOW())
        `;
      } catch (e) {}

      // Vérifier si le client attend du JSON (outil IA, studio web, ou Google TTS)
      const acceptsJson =
        c.req.header("accept")?.includes("application/json") ||
        body.return_json ||
        body.response_format === "json" ||
        body.format === "json" ||
        isGoogleTts;

      if (acceptsJson) {
        return c.json({
          audio_url: dataUrl,
          audioContent: base64Audio,
          character_count: input.length,
          created: Math.floor(Date.now() / 1000),
          format: response_format,
          id: savedId,
          model: cleanModelName(model),
          model_id: model,
          status: "completed",
          text: input,
          tokens_used: estimatedTokens,
          usage: {
            requests_count: currentUsage + 1,
            tokens_used: estimatedTokens,
            weekly_limit: weeklyLimit,
            weekly_used: currentUsage + estimatedTokens,
          },
          voice,
        });
      }

      // Format binaire standard pour OpenAI SDK & requêtes natives
      return new Response(bytes, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": mimeType,
          "x-audio-id": String(savedId),
          "x-speech-limit": String(weeklyLimit),
          "x-speech-used": String(currentUsage + estimatedTokens),
          "x-tokens-used": String(estimatedTokens),
        },
        status: 200,
      });
    } catch (err: any) {
      console.error("[Speech API] Erreur serveur:", err);
      return c.json(
        {
          details: err.message,
          error: "Erreur serveur lors du traitement Speech.",
        },
        500
      );
    }
  };

  // Routes OpenAI & Anthropic SDK
  app.post("/v1/speech", handleAudioSpeech);
  app.post("/speech", handleAudioSpeech);
  app.post("/v1/speech/generations", handleAudioSpeech);
  app.post("/speech/generations", handleAudioSpeech);
  app.post("/v1/audio/speech", handleAudioSpeech);
  app.post("/v1/audio/generations", handleAudioSpeech);
  app.post("/audio/speech", handleAudioSpeech);
  app.post("/audio/generations", handleAudioSpeech);

  // Routes Google Cloud TTS / Gemini SDK
  app.post("/v1beta/models/*:synthesizeSpeech", handleAudioSpeech);
  app.post("/v1/models/*:synthesizeSpeech", handleAudioSpeech);
  app.post("/v1beta/speech:synthesize", handleAudioSpeech);
  app.post("/v1/speech:synthesize", handleAudioSpeech);
}