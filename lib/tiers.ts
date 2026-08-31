/**
 * Source unique de vérité pour les quotas par forfait.
 * Backend (Val Town) et frontend (Next.js) doivent importer depuis ce fichier.
 * Toute modification des limites doit se faire ici uniquement.
 */

// Limites de tokens hebdomadaires (Input + Output) — utilisées pour weekly_usage
export const TIER_TOKEN_LIMITS: Record<string, number> = {
  Free: 10_000_000,
  Plus: 20_000_000,
  Pro: 30_000_000,
  Max: 50_000_000,
};
// Compat: ancien nom utilisé dans config.ts / models.ts
export const TIER_LIMITS = TIER_TOKEN_LIMITS;

// Limites de tokens Speech hebdomadaires — utilisées pour weekly_speech_usage
export const TIER_SPEECH_LIMITS: Record<string, number> = {
  Free: 30_000_000,
  Gratuit: 30_000_000,
  free: 30_000_000,
  gratuit: 30_000_000,
  Plus: 75_000_000,
  plus: 75_000_000,
  Pro: 150_000_000,
  pro: 150_000_000,
  Max: 300_000_000,
  max: 300_000_000,
};

export function getTierSpeechLimit(tier?: string | null): number {
  const t = (tier || "Free").toLowerCase().trim();
  if (t === "max") return 300_000_000;
  if (t === "pro") return 150_000_000;
  if (t === "plus") return 75_000_000;
  return 30_000_000;
}

// Limites de requêtes API hebdomadaires — utilisées pour mprojects_api_keys
export const TIER_REQUEST_LIMITS: Record<string, number> = {
  Free: 500,
  Gratuit: 500,
  Plus: 1500,
  Pro: 3000,
  Max: 7500,
};

export function getTierQuotaLimit(tier?: string | null): number {
  const t = (tier || "Free").toLowerCase().trim();
  if (t === "max") return 7500;
  if (t === "pro") return 3000;
  if (t === "plus") return 1500;
  return 500;
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

// Limites quotidiennes de génération d'images — utilisées pour mprojects_daily_image_usage
export const TIER_DAILY_IMAGE_LIMITS: Record<string, number> = {
  Free: 5,
  Gratuit: 5,
  free: 5,
  gratuit: 5,
  Plus: 10,
  plus: 10,
  Pro: 20,
  pro: 20,
  Max: 35,
  max: 35,
};

export function getTierDailyImageLimit(tier?: string | null): number {
  const t = (tier || "Free").toLowerCase().trim();
  if (t === "max") return 35;
  if (t === "pro") return 20;
  if (t === "plus") return 10;
  return 5;
}

// Coût en nombre de requêtes API par génération d'image
// Free = 100 requêtes, Plus = 50 requêtes, Pro = 25 requêtes, Max = 10 requêtes
export const TIER_IMAGE_REQUEST_COST: Record<string, number> = {
  Free: 100,
  Gratuit: 100,
  free: 100,
  gratuit: 100,
  Plus: 50,
  plus: 50,
  Pro: 25,
  pro: 25,
  Max: 10,
  max: 10,
};

export function getTierImageRequestCost(tier?: string | null): number {
  const t = (tier || "Free").toLowerCase().trim();
  if (t === "max") return 10;
  if (t === "pro") return 25;
  if (t === "plus") return 50;
  return 100;
}

// Limites de stockage Cloud par tier (en bytes) — SSOT: Free 10GiB / Plus 20GiB / Pro 40GiB / Max 60GiB
const GIB = 1024 * 1024 * 1024;

export const STORAGE_LIMITS_BYTES: Record<string, number> = {
  Free: 10 * GIB,
  Plus: 20 * GIB,
  Pro: 40 * GIB,
  Max: 60 * GIB,
  // Aliases
  free: 10 * GIB,
  gratuit: 10 * GIB,
  Gratuit: 10 * GIB,
  plus: 20 * GIB,
  pro: 40 * GIB,
  max: 60 * GIB,
};
// Alias pour compat frontend (ancien CLOUD_STORAGE_LIMITS de mai-api.ts)
export const CLOUD_STORAGE_LIMITS = STORAGE_LIMITS_BYTES;

export function getTierStorageLimit(tier?: string | null): number {
  const t = (tier || "Free").toLowerCase().trim();
  if (t === "max") return 60 * GIB;
  if (t === "pro") return 40 * GIB;
  if (t === "plus") return 20 * GIB;
  return 10 * GIB;
}

export function formatStorageBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 Mo";
  const gb = 1024 * 1024 * 1024;
  const mb = 1024 * 1024;
  if (bytes >= gb) {
    const val = bytes / gb;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)} Go`;
  }
  const val = bytes / mb;
  return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)} Mo`;
}

/**
 * Calcule l'augmentation temporaire de quota active pour un utilisateur et un type de service.
 * Prend en compte les boosts globaux ('all') et les boosts ciblés par id / email / username.
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
