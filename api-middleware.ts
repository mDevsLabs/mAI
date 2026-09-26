import type { Hono } from "npm:hono@4";
import {
  getDb,
  getTierRequestLimit,
  getUserQuotaBoost,
  getWeekData,
  normalizeTier,
  verifyToken,
} from "./config.ts";

export function registerMiddleware(app: Hono) {
  // Middleware global pour Auth, Rate limiting & Logging sur toutes les routes d'API
  app.use("*", async (c, next) => {
    const path = c.req.path;

    // Détection des routes d'API
    const isApiRoute =
      path.startsWith("/v1/") ||
      path.startsWith("/v1beta/") ||
      path === "/v1/models" ||
      path === "/models" ||
      path.startsWith("/models/") ||
      path === "/v1beta/models" ||
      path === "/chat/completions" ||
      path.startsWith("/chat/") ||
      path === "/messages" ||
      path.startsWith("/messages/") ||
      path === "/speech" ||
      path.startsWith("/speech/") ||
      path === "/images" ||
      path.startsWith("/images/") ||
      path === "/images/generations" ||
      path === "/mj" ||
      path.startsWith("/mj/") ||
      path.startsWith("/v1/mj/") ||
      path === "/audio/speech" ||
      path.startsWith("/audio/") ||
      path === "/usage/speech" ||
      path === "/v1/usage/speech" ||
      path === "/usage" ||
      path === "/v1/usage" ||
      path === "/log-usage" ||
      path === "/v1/log-usage" ||
      path === "/v1/status" ||
      path === "/status";

    if (!isApiRoute) {
      await next();
      return;
    }

    const isPublicRoute =
      path === "/v1/models" ||
      path === "/models" ||
      path === "/v1beta/models" ||
      path === "/v1/models/images" ||
      path === "/models/images" ||
      path === "/v1/images/models" ||
      path === "/images/models" ||
      path.startsWith("/v1/models/images/") ||
      path.startsWith("/models/images/") ||
      path === "/v1/models/speech" ||
      path === "/models/speech" ||
      path === "/v1/speech/models" ||
      path === "/speech/models" ||
      path === "/v1/speech/voices" ||
      path === "/speech/voices" ||
      path === "/v1/audio/models" ||
      path === "/v1/audio/voices" ||
      path === "/v1/models/mai" ||
      path === "/v1/mai/models" ||
      path === "/models/mai" ||
      path === "/mai/models" ||
      path === "/v1/status" ||
      path === "/status" ||
      path === "/v1/web/search" ||
      path.startsWith("/v1/web/");

    const authHeader =
      c.req.header("Authorization") || c.req.header("authorization");
    const headerApiKey =
      c.req.header("x-api-key") ||
      c.req.header("X-API-Key") ||
      c.req.header("x-goog-api-key") ||
      c.req.header("X-Goog-Api-Key");
    const queryApiKey =
      c.req.query("api_key") ||
      c.req.query("key");

    let rawApiKey =
      (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : authHeader) ||
      headerApiKey ||
      queryApiKey ||
      null;

    if (rawApiKey) {
      rawApiKey = rawApiKey.trim();
      if (
        rawApiKey === "" ||
        rawApiKey === "null" ||
        rawApiKey === "undefined" ||
        rawApiKey === "Bearer"
      ) {
        rawApiKey = null;
      }
    }

    const apiKey = rawApiKey;
    const startTime = Date.now();
    const systemMaiApiKey = Deno.env.get("MAI_API_KEY");

    let userPlan = "Free";
    let currentUserId: string | null = null;
    const currentApiKey: string | null = apiKey;
    let matchedApiKey: string | null = null;
    let hasValidAuth = false;
    let isSystemKey = false;

    function timingSafeEqual(a: string, b: string): boolean {
      if (a.length !== b.length) {
        return false;
      }
      let diff = 0;
      for (let i = 0; i < a.length; i++) {
        diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
      }
      return diff === 0;
    }

    // Aucun en-tête d'identité ni valeur fournie par le client n'est lu comme
    // une autorité. Une identité de session provient uniquement d'un JWT vérifié,
    // et un tier de clé uniquement de la ligne validée puis de son utilisateur.
    if (apiKey) {
      if (systemMaiApiKey && timingSafeEqual(apiKey, systemMaiApiKey)) {
        hasValidAuth = true;
        isSystemKey = true;
        userPlan = "Plus";
        currentUserId = "system-mai";
      } else {
        const sql = getDb();
        let databaseKeyValidated = false;
        if (sql) {
          try {
            const rows = await sql`
              SELECT k.user_id, k.api_key, u.tier as user_tier
              FROM mprojects_api_keys k
              LEFT JOIN users u
                ON k.user_id = u.id::text OR k.user_id = u.username OR k.user_id = u.email
              WHERE k.api_key = ${apiKey}::text
                AND k.is_active IS DISTINCT FROM FALSE
              LIMIT 1
            `;

            if (rows.length > 0) {
              const apiKeyData = rows[0];
              databaseKeyValidated = true;
              hasValidAuth = true;
              currentUserId = apiKeyData.user_id ? String(apiKeyData.user_id) : null;
              matchedApiKey = apiKeyData.api_key || apiKey;
              // Le nom `plan` de la clé est libre et le TIER encodé n'est pas
              // une autorité. Seul le forfait de la ligne utilisateur liée est
              // accepté, après validation exacte de la clé en base.
              userPlan = normalizeTier(apiKeyData.user_tier);
            }
          } catch (dbErr) {
            console.error("Auth DB Error in middleware:", dbErr);
          }
        }

        if (!databaseKeyValidated) {
          try {
            const payload = await verifyToken(apiKey);
            const verifiedUserId = String(payload.sub || "").trim();
            if (verifiedUserId) {
              hasValidAuth = true;
              currentUserId = verifiedUserId;
              userPlan = normalizeTier(payload.tier as string);

              const sql = getDb();
              if (sql) {
                const userRows = await sql`
                  SELECT tier FROM users
                  WHERE id::text = ${verifiedUserId}::text
                     OR username = ${verifiedUserId}::text
                     OR email = ${verifiedUserId}::text
                  LIMIT 1
                `;
                if (userRows.length > 0) {
                  userPlan = normalizeTier(userRows[0].tier);
                }
              }
            }
          } catch {
            // Une valeur non reconnue reste sans autorité. Les catalogues
            // publics continuent en Free, les routes privées sont refusées.
          }
        }
      }
    }

    if (!hasValidAuth && !isPublicRoute) {
      return c.json(
        apiKey
          ? { error: "Invalid API Key." }
          : { error: "Service Unavailable. API Key missing." },
        apiKey ? 403 : 401,
      );
    }

    // Enregistrer le contexte vérifié uniquement.
    const context = c as unknown as { set: (key: string, value: unknown) => void };
    context.set("userPlan", userPlan);
    context.set("userId", currentUserId);
    context.set("apiKey", currentApiKey);
    context.set("matchedApiKey", matchedApiKey);

    // Vérification préventive du quota de requêtes pour les clés API enregistrées.
    // Le solde est global au compte (cumul de toutes ses clés) et la période est hebdomadaire
    // (lundi 00:00 UTC), marquée par usage_period_start pour un reset idempotent.
    if (matchedApiKey && currentUserId && currentUserId !== "system-mai") {
      const sql = getDb();
      const { nextResetIso, weekStartStr } = getWeekData();
      const apiBoost = await getUserQuotaBoost(sql, currentUserId, "api");
      const limit = getTierRequestLimit(userPlan) + apiBoost;

      try {
        await sql`
          UPDATE mprojects_api_keys
          SET request_count = 0, usage_period_start = ${weekStartStr}::date
          WHERE user_id::text = ${currentUserId}::text
            AND usage_period_start IS DISTINCT FROM ${weekStartStr}::date
        `;

        const countRows = await sql`
          SELECT SUM(request_count) as total_requests
          FROM mprojects_api_keys
          WHERE user_id::text = ${currentUserId}::text
        `;
        // Neon renvoie les bigint en chaîne: Number() est obligatoire pour comparer
        const used = Number(countRows[0]?.total_requests || 0);
        const remaining = Math.max(0, limit - used);

        (c as any).set("requestQuota", { apiKey: matchedApiKey, limit, remaining, used });

        if (remaining < 1) {
          if (isPublicRoute) {
            await next();
            return;
          }
          return c.json({
            code: "quota_exceeded",
            error: "Quota exceeded for your account.",
            limit,
            remaining,
            resetAt: nextResetIso,
            used,
          }, 429);
        }
      } catch {}
    }

    await next();

    const latency = Date.now() - startTime;
    const status = c.res.status;
    const endpoint = c.req.path;
    const method = c.req.method;

    // Logging & Décompte de 1 crédit API (pour toutes les requêtes avec clé API valide incluant audio, images, web search et chat)
    const isExcludedRoute = path.startsWith("/v1/devices") || path === "/v1/status" || path === "/status";
    if (!isExcludedRoute && matchedApiKey && !isSystemKey) {
      try {
        const sql = getDb();
        const effectiveKeyToLog = matchedApiKey;

        await sql`
          INSERT INTO mprojects_api_logs (api_key, endpoint, method, status_code, latency_ms)
          VALUES (${effectiveKeyToLog}::text, ${endpoint}::text, ${method}::text, ${status}::integer, ${latency}::integer)
        `;

        // Les routes qui débitent elles-mêmes un coût multi-crédits (images) posent le fanion
        // pour éviter le double débit `cout + 1` sur la même requête.
        if (status === 200 && !(c as any).get?.("quotaDebitedByHandler")) {
          await sql`
            UPDATE mprojects_api_keys
            SET request_count = request_count + 1, last_used_at = NOW()
            WHERE api_key = ${effectiveKeyToLog}::text
          `;
        }
      } catch (err) {
        console.error("Erreur logging API & mise à jour quota:", err);
      }
    }
  });
}
