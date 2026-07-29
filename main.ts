/**
 * mAI CLI — Val Town HTTP Proxy & Auth Backend
 * URL : https://mai.val.run/
 */

import { Hono } from "npm:hono@4";
import { cors } from "npm:hono/cors";
import { neon } from "npm:@neondatabase/serverless";
import bcrypt from "npm:bcryptjs";
import { jwtVerify, SignJWT } from "npm:jose";

// ─────────────────────────────────────────────
// Config & Données
// ─────────────────────────────────────────────
const JWT_EXPIRY = "14d";
const BCRYPT_ROUNDS = 12;

// Limites de tokens hebdomadaires (Input + Output)
const TIER_LIMITS: Record<string, number> = {
  Free: 2_000_000,
  Plus: 5_000_000,
  Pro: 10_000_000,
  Max: 20_000_000,
};

function getDb() {
  const url = Deno.env.get("DATABASE_URL");
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

function getJwtSecret(): Uint8Array {
  const secret = Deno.env.get("MAI_JWT_SECRET");
  if (!secret) throw new Error("MAI_JWT_SECRET not set");
  return new TextEncoder().encode(secret);
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
async function signToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getJwtSecret());
}

async function verifyToken(token: string): Promise<Record<string, unknown>> {
  const { payload } = await jwtVerify(token, getJwtSecret());
  return payload as Record<string, unknown>;
}

function extractToken(req: Request): string | null {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

function getWeekData() {
  const now = new Date();
  const day = now.getUTCDay() || 7;

  const weekStart = new Date(now);
  weekStart.setUTCDate(now.getUTCDate() - (day - 1));
  weekStart.setUTCHours(0, 0, 0, 0);

  const nextReset = new Date(weekStart);
  nextReset.setUTCDate(weekStart.getUTCDate() + 7);

  return {
    weekStartStr: weekStart.toISOString().split("T")[0],
    nextResetIso: nextReset.toISOString(),
  };
}

// ─────────────────────────────────────────────
// App Hono
// ─────────────────────────────────────────────
const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  }),
);

// ─────────────────────────────────────────────
// ROUTE PAR DÉFAUT (Pour éviter le 404 en preview)
// ─────────────────────────────────────────────
app.get("/", (c) => {
  return c.text("mAI Backend is running!");
});

// ─────────────────────────────────────────────
// AUTHENTIFICATION
// ─────────────────────────────────────────────
app.post("/register", async (c) => {
  try {
    const { email, username, password } = await c.req.json();
    if (!email || !username || !password) {
      return c.json({ error: "Champs manquants." }, 400);
    }

    const sql = getDb();
    const existing =
      await sql`SELECT id FROM users WHERE email = ${email} OR username = ${username} LIMIT 1`;
    if (existing.length > 0) {
      return c.json({ error: "Email ou nom d'utilisateur déjà pris." }, 400);
    }

    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const result = await sql`
      INSERT INTO users (email, username, password_hash, tier)
      VALUES (${email}, ${username}, ${hash}, 'Free')
      RETURNING id, tier
    `;

    const user = result[0];
    const token = await signToken({ sub: user.id, tier: user.tier });

    return c.json({ success: true, token, tier: user.tier });
  } catch (err: any) {
    return c.json({ error: "Erreur serveur." }, 500);
  }
});

app.post("/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) {
      return c.json({ error: "Champs manquants." }, 400);
    }

    const sql = getDb();
    const users =
      await sql`SELECT id, password_hash, tier FROM users WHERE email = ${email} LIMIT 1`;
    if (users.length === 0) {
      return c.json({ error: "Identifiants invalides." }, 401);
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return c.json({ error: "Identifiants invalides." }, 401);
    }

    const token = await signToken({ sub: user.id, tier: user.tier });
    return c.json({ success: true, token, tier: user.tier });
  } catch (err: any) {
    return c.json({ error: "Erreur serveur." }, 500);
  }
});

app.post("/verify-code", async (c) => {
  try {
    const token = extractToken(c.req.raw);
    if (!token) return c.json({ error: "Non authentifié." }, 401);

    const payload = await verifyToken(token);
    const userId = payload.sub as string;

    const { code } = await c.req.json();

    // Les codes sont définis dans les variables d'environnement de Val Town
    const upgradeCodes: Record<string, string> = {
      [Deno.env.get("MAI_PLUS_CODE") || ""]: "Plus",
      [Deno.env.get("MAI_PRO_CODE") || ""]: "Pro",
      [Deno.env.get("MAI_MAX_CODE") || ""]: "Max",
    };

    const newTier = upgradeCodes[code.toUpperCase()];

    if (!newTier) {
      return c.json({ error: "Code invalide ou expiré." }, 400);
    }

    const sql = getDb();
    await sql`UPDATE users SET tier = ${newTier} WHERE id = ${userId}`;

    // On regénère le token pour inclure le nouveau tier
    const newToken = await signToken({ sub: userId, tier: newTier });

    return c.json({ success: true, tier: newTier, token: newToken });
  } catch (err: any) {
    return c.json({ error: "Erreur serveur." }, 500);
  }
});

// ─────────────────────────────────────────────
// CATALOGUE & USAGE
// ─────────────────────────────────────────────

app.get("/usage", async (c) => {
  try {
    const token = extractToken(c.req.raw);
    if (!token) return c.json({ error: "Non authentifié." }, 401);

    const payload = await verifyToken(token);
    const userId = payload.sub as string;
    const { weekStartStr, nextResetIso } = getWeekData();

    const sql = getDb();
    const [usageResult, userResult] = await Promise.all([
      sql`SELECT tokens_used FROM weekly_usage WHERE user_id = ${userId} AND week_start = ${weekStartStr}`,
      sql`SELECT tier, email, username FROM users WHERE id = ${userId} LIMIT 1`,
    ]);

    const user = userResult[0];
    const tokensUsed = usageResult[0]?.tokens_used || 0;
    const limit = TIER_LIMITS[user?.tier] || TIER_LIMITS["Free"];

    return c.json({
      tier: user?.tier || "Free",
      email: user?.email,
      username: user?.username,
      tokensUsed,
      limit,
      weekStart: weekStartStr,
      resetAt: nextResetIso,
    });
  } catch (err: any) {
    return c.json({ error: "Erreur serveur." }, 500);
  }
});

app.post("/log-usage", async (c) => {
  try {
    const token = extractToken(c.req.raw);
    if (!token) return c.json({ error: "Non authentifié." }, 401);

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
        429,
      );
    }

    await sql`
      INSERT INTO weekly_usage (user_id, week_start, tokens_used)
      VALUES (${userId}, ${weekStartStr}, ${tokensUsed})
      ON CONFLICT (user_id, week_start)
      DO UPDATE SET tokens_used = weekly_usage.tokens_used + ${tokensUsed}
    `;

    return c.json({
      success: true,
      weeklyUsed: currentUsage + tokensUsed,
      limit,
    });
  } catch (err: any) {
    return c.json({ error: "Erreur serveur." }, 500);
  }
});

// ─────────────────────────────────────────────
// PROXY : CHAT COMPLETIONS
// ─────────────────────────────────────────────
app.post("/chat/completions", async (c) => {
  try {
    const token = extractToken(c.req.raw);
    if (!token) return c.json({ error: "Non authentifié." }, 401);

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
    const apiKey = Deno.env.get("OPENROUTER_API_KEY");

    if (!apiKey) {
      return c.json({ error: "Clé fournisseur manquante." }, 500);
    }

    // Redirection de la requête vers OpenRouter
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://mai.val.run",
          "X-Title": "mAI CLI",
        },
        body: JSON.stringify(body),
      },
    );

    // Retourne le stream ou la réponse directement au CLI
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ||
          "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    return c.json({ error: "Erreur serveur proxy." }, 500);
  }
});

export default app.fetch;