import type { Hono } from "npm:hono@4";
import { extractTierFromApiKey, getDb, getTierRequestLimit, getUserQuotaBoost, getWeekData, verifyToken } from "./config.ts";

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
      path === "/" ||
      path === "/api" ||
      path === "/api/" ||
      path === "/v1" ||
      path === "/v1/" ||
      path === "/vibe" ||
      path === "/vibe/" ||
      path === "/api/vibe" ||
      path === "/api/vibe/" ||
      path.startsWith("/v1/feed") ||
      path.startsWith("/api/vibe/feed") ||
      path.startsWith("/vibe/feed") ||
      path === "/feed" ||
      path.startsWith("/v1/posts") ||
      path.startsWith("/api/vibe/posts") ||
      path.startsWith("/v1/trends") ||
      path.startsWith("/api/vibe/trends") ||
      path.startsWith("/v1/profiles") ||
      path.startsWith("/api/vibe/profiles") ||
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
    const reqUserId = c.req.header("x-user-id") || c.req.header("X-User-Id");
    const startTime = Date.now();

    const systemMaiApiKey = Deno.env.get("MAI_API_KEY");

    let userPlan = "Free";
    let currentUserId: string | null = null;
    const currentApiKey: string | null = apiKey;
    let matchedApiKey: string | null = apiKey;
    // Authentification par clé API enregistrée (par opposition à un JWT de session ou à la clé système)
    let isRegisteredApiKey = false;

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

    // Résolution de l'authentification : Clé API utilisateur enregistrée, Clé système, ou Token JWT
    if (apiKey) {
      // Détection prioritaire du forfait directement encodé dans la clé (mai-TIER_USER-XXXXX-XXXXX)
      const keyTier = extractTierFromApiKey(apiKey);
      if (keyTier) {
        userPlan = keyTier;
      }

      const sql = getDb();
      try {
        const rows = await sql`
          SELECT k.*, u.tier as user_tier, u.id as u_id
          FROM mprojects_api_keys k
          LEFT JOIN users u ON k.user_id = u.id::text OR k.user_id = u.username OR k.user_id = u.email
          WHERE k.api_key = ${apiKey}::text
          LIMIT 1
        `;

        if (rows.length > 0) {
          const apiKeyData = rows[0];
          // Si le TIER_USER a été extrait de la clé fournie, il fait foi en priorité
          if (!keyTier) {
            const rawPlan = String(apiKeyData.plan || "").trim().toLowerCase();
            const validTiers = ["free", "plus", "pro", "max"];
            userPlan = apiKeyData.user_tier || (validTiers.includes(rawPlan) ? apiKeyData.plan : "Plus");
          }
          currentUserId = apiKeyData.user_id;
          matchedApiKey = apiKeyData.api_key || apiKey;
          isRegisteredApiKey = true;
        } else if (systemMaiApiKey && timingSafeEqual(apiKey, systemMaiApiKey)) {
          userPlan = "Plus";
          currentUserId = "system-mai";
        } else {
          // Tenter de valider le token comme un JWT de session
          try {
            const payload = await verifyToken(apiKey);
            currentUserId = String(payload.sub || "");
            userPlan = String(payload.tier || "Free");

            // Vérifier dans la table users si le forfait a changé
            if (currentUserId) {
              const uRows = await sql`
                SELECT tier FROM users
                WHERE id::text = ${currentUserId}::text OR username = ${currentUserId}::text OR email = ${currentUserId}::text
                LIMIT 1
              `;
              if (uRows.length > 0 && uRows[0].tier) {
                userPlan = uRows[0].tier;
              }
            }
          } catch {
            if (!isPublicRoute) {
              return c.json({ error: "Invalid API Key." }, 403);
            }
          }
        }
      } catch (dbErr) {
        console.error("Auth DB Error in middleware:", dbErr);
      }
    }

    // 3. En-tête x-user-id (requêtes web app / internes) : uniquement si déjà authentifié ou fallback route publique
    if (reqUserId && reqUserId !== "system-mai") {
      if (currentUserId) {
        // Déjà authentifié via clé API ou JWT : x-user-id doit correspondre, sinon on l'ignore
        if (reqUserId !== currentUserId) {
          console.warn(
            `[Auth] x-user-id mismatch: header=${reqUserId} vs auth=${currentUserId} — header ignoré`
          );
        }
      } else if (apiKey) {
        // apiKey présent mais non reconnu (route publique) : ne pas promouvoir via x-user-id seul
      } else {
        // Aucune auth vérifiée
        try {
          const sql = getDb();
          const uRows = await sql`
            SELECT tier FROM users 
            WHERE id::text = ${reqUserId}::text OR username = ${reqUserId}::text OR email = ${reqUserId}::text 
            LIMIT 1
          `;
          if (uRows.length > 0) {
            if (uRows[0].tier) {
              userPlan = uRows[0].tier;
            }
            if (isPublicRoute) {
              currentUserId = reqUserId;
            } else {
              console.warn(
                `[Auth] x-user-id sans JWT sur route privée ${path} — ignoré`
              );
            }
          }
        } catch {}
      }
    }

    // 4. Aucun identifiant et route privée
    if (!apiKey && !currentUserId && !isPublicRoute) {
      return c.json({ error: "Service Unavailable. API Key missing." }, 401);
    }

    // Enregistrer le plan et les infos de contexte
    c.set("userPlan", userPlan);
    c.set("userId", currentUserId);
    c.set("apiKey", currentApiKey);
    c.set("matchedApiKey", matchedApiKey);

    // Vérification préventive du quota de requêtes pour les clés API enregistrées.
    // Le solde est global au compte (cumul de toutes ses clés) et la période est hebdomadaire
    // (lundi 00:00 UTC), marquée par usage_period_start pour un reset idempotent.
    // Un token JWT de session ne consomme pas ce quota : la requête est exécutée directement.
    if (isRegisteredApiKey && currentUserId && currentUserId !== "system-mai") {
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

    // Log-usage & Décompte de 1 requête du quota API (chat, audio, images, web search, etc.).
    // Uniquement pour les clés API enregistrées : +1 requête au solde hebdomadaire du
    // propriétaire de la clé. Les requêtes authentifiées par JWT de session sont
    // exécutées directement, sans log-usage ni débit ensuite.
    const isExcludedRoute = path.startsWith("/v1/devices") || path === "/v1/status" || path === "/status";
    if (!isExcludedRoute && isRegisteredApiKey) {
      try {
        const sql = getDb();
        const effectiveKeyToLog = matchedApiKey || apiKey;

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
