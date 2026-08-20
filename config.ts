import { sqlite } from "https://esm.town/v/std/sqlite";
import { neon } from "npm:@neondatabase/serverless";
import { jwtVerify, SignJWT } from "npm:jose";

// ─────────────────────────────────────────────
// Config & Données
// ─────────────────────────────────────────────
export const JWT_EXPIRY = "14d";
export const BCRYPT_ROUNDS = 12;

// Limites de tokens hebdomadaires (Input + Output)
export const TIER_LIMITS: Record<string, number> = {
  Free: 2_000_000,
  Max: 20_000_000,
  Plus: 5_000_000,
  Pro: 10_000_000,
};

export const TIER_REQUEST_LIMITS: Record<string, number> = {
  Free: 500,
  Max: 5000,
  Plus: 1000,
  Pro: 2000,
};

// Limites de stockage Cloud par tier (en bytes)
export const STORAGE_LIMITS_BYTES: Record<string, number> = {
  Free: 500 * 1024 * 1024,           // 500 MB
  Max: 100 * 1024 * 1024 * 1024,     // 100 GB
  Plus: 5 * 1024 * 1024 * 1024,      // 5 GB
  Pro: 20 * 1024 * 1024 * 1024,      // 20 GB
};

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
export async function signToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<Record<string, unknown>> {
  const result = await sqlite.execute({
    args: [token],
    sql: "SELECT 1 FROM token_blacklist WHERE token = ?",
  });
  if (result.rows.length > 0) {
    throw new Error("Token révoqué.");
  }
  const { payload } = await jwtVerify(token, getJwtSecret());
  return payload as Record<string, unknown>;
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
  } else if (uaLower.includes("windows nt 10.0") || uaLower.includes("windows 11") || uaLower.includes("windows 10")) {
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
    if (match) version = `v${match[1].split('.')[0]}`;
  } else if (uaLower.includes("opr/") || uaLower.includes("opera/")) {
    model = "Opera";
    const match = ua.match(/(?:OPR|Opera)\/([0-9.]+)/i);
    if (match) version = `v${match[1].split('.')[0]}`;
  } else if (uaLower.includes("chrome/")) {
    model = "Google Chrome";
    const match = ua.match(/Chrome\/([0-9.]+)/i);
    if (match) version = `v${match[1].split('.')[0]}`;
  } else if (uaLower.includes("firefox/")) {
    model = "Mozilla Firefox";
    const match = ua.match(/Firefox\/([0-9.]+)/i);
    if (match) version = `v${match[1].split('.')[0]}`;
  } else if (uaLower.includes("safari/") && !uaLower.includes("chrome")) {
    model = "Apple Safari";
    const match = ua.match(/Version\/([0-9.]+)/i);
    if (match) version = `v${match[1].split('.')[0]}`;
  }

  const fullVersion = version ? `${osVersion} • ${version}` : osVersion;
  const osLabel = os === "apple" ? "Apple" : os === "microsoft" ? "Windows" : os === "google" ? "Google" : "Linux";
  const deviceName = `${model} (${osLabel})`;

  return { os, device_model: model, device_version: fullVersion, device_name: deviceName };
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
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const code = Math.floor(min + Math.random() * (max - min)).toString();
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
