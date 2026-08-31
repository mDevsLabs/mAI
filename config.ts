import { sqlite } from "https://esm.town/v/std/sqlite";
import { neon } from "npm:@neondatabase/serverless";
import { jwtVerify, SignJWT } from "npm:jose";

// ─────────────────────────────────────────────
// Config & Données
// ─────────────────────────────────────────────
export const JWT_EXPIRY = "14d";
export const BCRYPT_ROUNDS = 12;

export type Tier = "Free" | "Plus" | "Pro" | "Max";

const TIER_ALIASES: Record<string, Tier> = {
  free: "Free",
  gratuit: "Free",
  plus: "Plus",
  pro: "Pro",
  max: "Max",
};

/**
 * Normalise n'importe quelle représentation de forfait venant de la base, d'une clé API
 * ou d'un JWT ("gratuit", " PRO ", "max") en tier canonique.
 * Une valeur vide ou inconnue retombe sur "Free", comme l'ancien `MAP[t] || MAP["Free"]`.
 */
export function normalizeTier(tier?: string | null): Tier {
  return TIER_ALIASES[String(tier || "").trim().toLowerCase()] || "Free";
}

export function isPaidTier(tier?: string | null): boolean {
  return normalizeTier(tier) !== "Free";
}

// Limites de tokens mAI hebdomadaires (Input + Output)
export const TIER_LIMITS: Record<Tier, number> = {
  Free: 10_000_000,
  Plus: 20_000_000,
  Pro: 30_000_000,
  Max: 50_000_000,
};

export function getTierMaiTokenLimit(tier?: string | null): number {
  return TIER_LIMITS[normalizeTier(tier)];
}

// Limites de tokens Speech hebdomadaires
export const TIER_SPEECH_LIMITS: Record<Tier, number> = {
  Free: 30_000_000,
  Plus: 75_000_000,
  Pro: 150_000_000,
  Max: 300_000_000,
};

export function getTierSpeechLimit(tier?: string | null): number {
  return TIER_SPEECH_LIMITS[normalizeTier(tier)];
}

// Limites de requêtes API hebdomadaires (remise à zéro le lundi 00:00 UTC)
export const TIER_REQUEST_LIMITS: Record<Tier, number> = {
  Free: 500,
  Plus: 1500,
  Pro: 3000,
  Max: 7500,
};

export function getTierRequestLimit(tier?: string | null): number {
  return TIER_REQUEST_LIMITS[normalizeTier(tier)];
}

/**
 * Extrait le forfait (TIER_USER) encodé directement dans une clé API au format :
 * mai-TIER_USER-XXXXX-XXXXX (ex: mai-free-ABC12-defgh, mai-plus-..., mai-pro-..., mai-max-...)
 * Renvoie "Free", "Plus", "Pro", "Max" ou null si non présent.
 */
export function extractTierFromApiKey(apiKey: string | null | undefined): "Free" | "Plus" | "Pro" | "Max" | null {
  if (!apiKey || typeof apiKey !== "string") return null;
  const match = apiKey.trim().match(/^mai-(free|plus|pro|max)-/i);
  if (!match) return null;
  const t = match[1].toLowerCase();
  if (t === "free") return "Free";
  if (t === "plus") return "Plus";
  if (t === "pro") return "Pro";
  if (t === "max") return "Max";
  return null;
}

/**
 * Calcule l'augmentation temporaire de quota active pour un utilisateur et un type de service.
 */
export async function getUserQuotaBoost(
  sql: any,
  userId: string | null | undefined,
  quotaType: "mai" | "api" | "images" | "audio"
): Promise<number> {
  if (!sql || !userId) return 0;
  try {
    const rows = await sql`
      SELECT COALESCE(SUM(boost_amount), 0) as total_boost
      FROM user_quota_boosts
      WHERE (
        user_id = 'all'
        OR user_id = ${userId}::text
        OR user_id IN (
          SELECT id::text FROM users WHERE id::text = ${userId}::text OR email = ${userId}::text OR username = ${userId}::text
        )
        OR user_id IN (
          SELECT email FROM users WHERE id::text = ${userId}::text OR email = ${userId}::text OR username = ${userId}::text
        )
        OR user_id IN (
          SELECT username FROM users WHERE id::text = ${userId}::text OR email = ${userId}::text OR username = ${userId}::text
        )
      )
        AND quota_type = ${quotaType}
        AND is_active = TRUE
        AND starts_at <= NOW()
        AND expires_at >= NOW()
    `;
    return Number(rows[0]?.total_boost || 0);
  } catch {
    return 0;
  }
}

// Limites quotidiennes de génération d'images
export const TIER_DAILY_IMAGE_LIMITS: Record<Tier, number> = {
  Free: 5,
  Plus: 10,
  Pro: 20,
  Max: 35,
};

export function getTierDailyImageLimit(tier?: string | null): number {
  return TIER_DAILY_IMAGE_LIMITS[normalizeTier(tier)];
}

// Coût en requêtes API par image générée (multiplié par le nombre d'images demandées)
export const TIER_IMAGE_REQUEST_COST: Record<Tier, number> = {
  Free: 100,
  Plus: 50,
  Pro: 25,
  Max: 10,
};

export function getTierImageRequestCost(tier?: string | null): number {
  return TIER_IMAGE_REQUEST_COST[normalizeTier(tier)];
}

// Limites de stockage Cloud par tier (en octets)
const GIB = 1024 * 1024 * 1024;

export const STORAGE_LIMITS_BYTES: Record<Tier, number> = {
  Free: 10 * GIB,
  Plus: 20 * GIB,
  Pro: 40 * GIB,
  Max: 60 * GIB,
};

export function getTierStorageLimitBytes(tier?: string | null): number {
  return STORAGE_LIMITS_BYTES[normalizeTier(tier)];
}

export function getDb() {
  const url = Deno.env.get("DATABASE_URL");
  if (!url) {
    throw new Error("DATABASE_URL not set");
  }
  return neon(url);
}

export function getJwtSecret(): Uint8Array {
  const secret = Deno.env.get("MAI_JWT_SECRET");
  if (!secret) {
    throw new Error("MAI_JWT_SECRET not set");
  }
  return new TextEncoder().encode(secret);
}

// ─────────────────────────────────────────────
// Helpers d'authentification & Utilitaires
// ─────────────────────────────────────────────
export async function signToken(
  payload: Record<string, unknown>
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getJwtSecret());
}

export async function verifyToken(
  token: string
): Promise<Record<string, unknown>> {
  // Vérif SQLite (legacy Val Town) + Postgres (nouveau)
  const sqliteResult = await sqlite.execute({
    args: [token],
    sql: "SELECT 1 FROM token_blacklist WHERE token = ?",
  });
  if (sqliteResult.rows.length > 0) {
    throw new Error("Token révoqué.");
  }
  // Vérif Postgres token_blacklist avec TTL 14j
  try {
    const sql = getDb();
    const pgResult =
      await sql`SELECT 1 FROM token_blacklist WHERE token = ${token} LIMIT 1`;
    if (pgResult.length > 0) {
      throw new Error("Token révoqué.");
    }
  } catch (e: any) {
    if (e?.message === "Token révoqué.") {
      throw e;
    }
    // ignore DB errors (table not yet exists)
  }
  const { payload } = await jwtVerify(token, getJwtSecret());
  return payload as Record<string, unknown>;
}

export async function blacklistToken(token: string) {
  const expiresAt = new Date(
    Date.now() + 14 * 24 * 60 * 60 * 1000
  ).toISOString();
  try {
    await sqlite.execute({
      args: [token],
      sql: "INSERT OR IGNORE INTO token_blacklist (token) VALUES (?)",
    });
  } catch {}
  try {
    const sql = getDb();
    await sql`INSERT INTO token_blacklist (token, revoked_at, expires_at) VALUES (${token}, NOW(), ${expiresAt}::timestamp) ON CONFLICT (token) DO NOTHING`;
  } catch {}
  // Nettoyage opportuniste des vieux tokens
  try {
    const sql = getDb();
    await sql`DELETE FROM token_blacklist WHERE expires_at < NOW() OR revoked_at < NOW() - INTERVAL '14 days'`;
  } catch {}
  try {
    await sqlite.execute({
      sql: "DELETE FROM token_blacklist WHERE revoked_at < datetime('now', '-14 days')",
    });
  } catch {}
}

export function extractToken(req: Request): string | null {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return null;
  }
  return auth.slice(7);
}

export function parseUserAgent(ua: string) {
  const uaLower = ua.toLowerCase();
  let os = "linux";
  let osVersion = "Linux";

  if (uaLower.includes("iphone")) {
    os = "apple";
    osVersion = "iPhone (iOS)";
  } else if (uaLower.includes("ipad")) {
    os = "apple";
    osVersion = "iPad (iPadOS)";
  } else if (uaLower.includes("mac os") || uaLower.includes("macintosh")) {
    os = "apple";
    osVersion = "macOS";
  } else if (
    uaLower.includes("windows nt 10.0") ||
    uaLower.includes("windows 11") ||
    uaLower.includes("windows 10")
  ) {
    os = "microsoft";
    osVersion = "Windows 10/11";
  } else if (uaLower.includes("win")) {
    os = "microsoft";
    osVersion = "Windows";
  } else if (uaLower.includes("android")) {
    os = "google";
    osVersion = "Android";
  } else if (uaLower.includes("ubuntu")) {
    os = "linux";
    osVersion = "Ubuntu Linux";
  } else if (uaLower.includes("debian")) {
    os = "linux";
    osVersion = "Debian Linux";
  } else if (uaLower.includes("fedora")) {
    os = "linux";
    osVersion = "Fedora Linux";
  }

  let model = "Navigateur Web";
  let version = "";

  if (uaLower.includes("mai-cli") || uaLower.includes("mai cli")) {
    model = "mAI CLI";
    version = "Terminal";
  } else if (uaLower.includes("pulse-extension") || uaLower.includes("pulse")) {
    model = "Pulse Extension";
    version = "Extension";
  } else if (uaLower.includes("edg/")) {
    model = "Microsoft Edge";
    const match = ua.match(/Edg\/([0-9.]+)/i);
    if (match) {
      version = `v${match[1].split(".")[0]}`;
    }
  } else if (uaLower.includes("opr/") || uaLower.includes("opera/")) {
    model = "Opera";
    const match = ua.match(/(?:OPR|Opera)\/([0-9.]+)/i);
    if (match) {
      version = `v${match[1].split(".")[0]}`;
    }
  } else if (uaLower.includes("chrome/")) {
    model = "Google Chrome";
    const match = ua.match(/Chrome\/([0-9.]+)/i);
    if (match) {
      version = `v${match[1].split(".")[0]}`;
    }
  } else if (uaLower.includes("firefox/")) {
    model = "Mozilla Firefox";
    const match = ua.match(/Firefox\/([0-9.]+)/i);
    if (match) {
      version = `v${match[1].split(".")[0]}`;
    }
  } else if (uaLower.includes("safari/") && !uaLower.includes("chrome")) {
    model = "Apple Safari";
    const match = ua.match(/Version\/([0-9.]+)/i);
    if (match) {
      version = `v${match[1].split(".")[0]}`;
    }
  }

  const fullVersion = version ? `${osVersion} • ${version}` : osVersion;
  const osLabel =
    os === "apple"
      ? "Apple"
      : os === "microsoft"
        ? "Windows"
        : os === "google"
          ? "Google"
          : "Linux";
  const deviceName = `${model} (${osLabel})`;

  return {
    device_model: model,
    device_name: deviceName,
    device_version: fullVersion,
    os,
  };
}

export function getWeekData() {
  const now = new Date();
  const day = now.getUTCDay() || 7;

  const weekStart = new Date(now);
  weekStart.setUTCDate(now.getUTCDate() - (day - 1));
  weekStart.setUTCHours(0, 0, 0, 0);

  const nextReset = new Date(weekStart);
  nextReset.setUTCDate(weekStart.getUTCDate() + 7);

  return {
    nextResetIso: nextReset.toISOString(),
    weekStartStr: weekStart.toISOString().split("T")[0],
  };
}

// ─────────────────────────────────────────────
// E-mails & Vérification (SQLite)
// ─────────────────────────────────────────────
export async function initSQLite() {
  await sqlite.execute(`
    CREATE TABLE IF NOT EXISTS verification_codes (
      email TEXT,
      code TEXT,
      action TEXT,
      expires_at DATETIME,
      PRIMARY KEY (email, action)
    );
  `);
  await sqlite.execute(`
    CREATE TABLE IF NOT EXISTS token_blacklist (
      token TEXT PRIMARY KEY,
      revoked_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function generateVerificationCode(
  email: string,
  action: string
): Promise<string> {
  const isDeletion = action === "delete_account";
  const length = isDeletion ? 8 : 6;
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  // Crypto PRNG (corrige Math.random prévisible)
  const range = max - min;
  const randomValue =
    crypto.getRandomValues(new Uint32Array(1))[0] / 0xff_ff_ff_ff;
  const code = Math.floor(min + randomValue * range)
    .toString()
    .padStart(length, "0");
  const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString(); // 10 minutes

  await sqlite.execute({
    args: [email, code, action, expiresAt],
    sql: "INSERT OR REPLACE INTO verification_codes (email, code, action, expires_at) VALUES (?, ?, ?, ?)",
  });

  return code;
}

export async function verifyVerificationCode(
  email: string,
  code: string,
  action: string
): Promise<boolean> {
  const result = await sqlite.execute({
    args: [email, action],
    sql: "SELECT code, expires_at FROM verification_codes WHERE email = ? AND action = ?",
  });

  if (result.rows.length === 0) {
    return false;
  }

  const storedCode = result.rows[0][0] as string;
  const expiresAt = new Date(result.rows[0][1] as string);

  if (expiresAt < new Date()) {
    await sqlite.execute({
      args: [email, action],
      sql: "DELETE FROM verification_codes WHERE email = ? AND action = ?",
    });
    return false;
  }

  if (storedCode === code) {
    await sqlite.execute({
      args: [email, action],
      sql: "DELETE FROM verification_codes WHERE email = ? AND action = ?",
    });
    return true;
  }

  return false;
}

export { sqlite };
