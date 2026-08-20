import type { Hono } from "npm:hono@4";
import { sqlite } from "https://esm.town/v/std/sqlite";
import { jwtVerify } from "npm:jose";
import { getDb, getJwtSecret, TIER_REQUEST_LIMITS } from "./config.ts";

export function registerMiddleware(app: Hono) {
  // Middleware /v1/* pour Auth & Logging
  app.use("/v1/*", async (c, next) => {
    const path = c.req.path;
    const isPublicRoute =
      path === "/v1/models" || path === "/v1/mai/models" || path === "/v1/status";

    const authHeader = c.req.header("Authorization");
    const apiKey = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const reqUserId = c.req.header("x-user-id");
    const startTime = Date.now();

    const systemMaiApiKey = Deno.env.get("MAI_API_KEY");

    let userPlan = "Free";
    let currentUserId: string | null = null;
    const currentApiKey: string | null = apiKey;
    let matchedApiKey: string | null = apiKey;

    // 1. Clé système MAI_API_KEY (accès complet aux modèles Plus/Max)
    if (systemMaiApiKey && apiKey === systemMaiApiKey) {
      userPlan = "Plus";
      currentUserId = "system-mai";
    }
    // 2. Clé API utilisateur enregistrée
    else if (apiKey) {
      const sql = getDb();
      const prefixCandidate = apiKey.substring(0, 11);
      const rows = await sql`
        SELECT k.*, u.tier as user_tier
        FROM mprojects_api_keys k
        LEFT JOIN users u ON k.user_id = u.id::text OR k.user_id = u.username OR k.user_id = u.email
        WHERE k.api_key = ${apiKey}::text 
           OR k.api_key = ${prefixCandidate}::text
           OR ${apiKey}::text LIKE (k.api_key || '%')
           OR k.api_key LIKE (${prefixCandidate} || '%')
        LIMIT 1
      `;

      const isJwtRoute = path.startsWith("/v1/devices");

      if (rows.length > 0) {
        const apiKeyData = rows[0];
        userPlan = apiKeyData.user_tier || apiKeyData.plan || "Free";
        currentUserId = apiKeyData.user_id;
        matchedApiKey = apiKeyData.api_key || apiKey;
      } else if (isJwtRoute && apiKey) {
        // Routes de compte : accepter un token JWT de session (pas une API Key)
        try {
          const blacklisted = await sqlite.execute({ args: [apiKey], sql: "SELECT 1 FROM token_blacklist WHERE token = ?" });
          if (blacklisted.rows.length > 0) {
            return c.json({ error: "Token révoqué." }, 401);
          }
          const { payload } = await jwtVerify(apiKey, getJwtSecret());
          currentUserId = String(payload.sub);
          userPlan = String(payload.tier || "Free");
        } catch (_jwtErr) {
          return c.json({ error: "Invalid API Key." }, 403);
        }
      } else if (!isPublicRoute) {
        return c.json({ error: "Invalid API Key." }, 403);
      }
    }

    // 3. En-tête x-user-id (requêtes web app / internes) : prévaut pour le forfait du compte
    if (reqUserId && reqUserId !== "system-mai") {
      try {
        const sql = getDb();
        const uRows = await sql`
          SELECT tier FROM users 
          WHERE id::text = ${reqUserId}::text OR username = ${reqUserId}::text OR email = ${reqUserId}::text 
          LIMIT 1
        `;
        if (uRows.length > 0 && uRows[0].tier) {
          userPlan = uRows[0].tier;
        }
        currentUserId = reqUserId;
      } catch (_err) {}
    }

    // 4. Aucun identifiant et route privée
    if (!apiKey && !reqUserId && !isPublicRoute) {
      return c.json({ error: "Service Unavailable. API Key missing." }, 401);
    }

    // Enregistrer le plan et les infos de contexte
    c.set("userPlan", userPlan);
    c.set("userId", currentUserId);
    c.set("apiKey", currentApiKey);
    c.set("matchedApiKey", matchedApiKey);

    // Vérification des quotas pour les clés API enregistrées
    if (apiKey && currentUserId && currentUserId !== "system-mai") {
      const tierMap: Record<string, number> = { Free: 500, Gratuit: 500, Plus: 1000, Pro: 2000, Max: 5000 };
      const limit = TIER_REQUEST_LIMITS?.[userPlan] || tierMap[userPlan] || 500;
      const sql = getDb();

      // Réinitialisation mensuelle automatique si le mois a changé
      await sql`
        UPDATE mprojects_api_keys
        SET request_count = 0
        WHERE user_id = ${currentUserId}::text
          AND last_used_at IS NOT NULL
          AND last_used_at < DATE_TRUNC('month', NOW())
      `;

      // Calculer l'usage global pour l'utilisateur
      const countRows = await sql`
        SELECT SUM(request_count) as total_requests
        FROM mprojects_api_keys
        WHERE user_id = ${currentUserId}::text
      `;
      const globalRequestCount = countRows[0]?.total_requests || 0;

      if (globalRequestCount >= limit) {
        if (isPublicRoute) {
          await next();
          return;
        }
        return c.json({ error: "Quota exceeded for your account." }, 429);
      }
    }

    await next();

    if (isPublicRoute) {
      return; // Ne pas logger les requêtes vers les routes publiques
    }

    const latency = Date.now() - startTime;
    const status = c.res.status;
    const endpoint = c.req.path;
    const method = c.req.method;

    // Logging & Mise à jour quota (uniquement pour les clés API utilisateur réelles)
    const isJwtRoute = path.startsWith("/v1/devices");
    if (!isJwtRoute && apiKey && apiKey !== systemMaiApiKey) {
      try {
        const sql = getDb();
        const effectiveKeyToLog = matchedApiKey || apiKey;
        const prefixCandidate = apiKey.substring(0, 11);

        await sql`
          INSERT INTO mprojects_api_logs (api_key, endpoint, method, status_code, latency_ms)
          VALUES (${effectiveKeyToLog}::text, ${endpoint}::text, ${method}::text, ${status}::integer, ${latency}::integer)
        `;

        await sql`
          UPDATE mprojects_api_keys
          SET request_count = request_count + 1, last_used_at = NOW()
          WHERE api_key = ${effectiveKeyToLog}::text
             OR api_key = ${apiKey}::text
             OR api_key = ${prefixCandidate}::text
             OR ${apiKey}::text LIKE (api_key || '%')
             OR api_key LIKE (${prefixCandidate} || '%')
        `;
      } catch (err) {
        console.error("Erreur logging API:", err);
      }
    }
  });
}
