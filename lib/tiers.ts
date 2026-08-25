/**
 * Source unique de vérité pour les quotas par forfait.
 * Backend (Val Town) et frontend (Next.js) doivent importer depuis ce fichier.
 * Toute modification des limites doit se faire ici uniquement.
 */

// Limites de tokens hebdomadaires (Input + Output) — utilisées pour weekly_usage
export const TIER_TOKEN_LIMITS: Record<string, number> = {
  Free: 2_000_000,
  Plus: 5_000_000,
  Pro: 10_000_000,
  Max: 20_000_000,
};
// Compat: ancien nom utilisé dans config.ts / models.ts
export const TIER_LIMITS = TIER_TOKEN_LIMITS;

// Limites de requêtes API mensuelles — utilisées pour mprojects_api_keys
export const TIER_REQUEST_LIMITS: Record<string, number> = {
  Free: 500,
  Gratuit: 500,
  Plus: 1000,
  Pro: 2000,
  Max: 5000,
};

export function getTierQuotaLimit(tier?: string | null): number {
  const t = (tier || "Free").toLowerCase().trim();
  if (t === "plus") return 1000;
  if (t === "pro") return 2000;
  if (t === "max") return 5000;
  return 500;
}

// Limites quotidiennes de génération d'images — utilisées pour mprojects_daily_image_usage
export const TIER_DAILY_IMAGE_LIMITS: Record<string, number> = {
  Free: 3,
  Gratuit: 3,
  free: 3,
  gratuit: 3,
  Plus: 5,
  plus: 5,
  Pro: 10,
  pro: 10,
  Max: 20,
  max: 20,
};

export function getTierDailyImageLimit(tier?: string | null): number {
  const t = (tier || "Free").toLowerCase().trim();
  if (t === "max") return 20;
  if (t === "pro") return 10;
  if (t === "plus") return 5;
  return 3;
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

// Limites de stockage Cloud par tier (en bytes) — SSOT: Free 500Mo / Plus 1Go / Pro 2Go / Max 5Go
export const STORAGE_LIMITS_BYTES: Record<string, number> = {
  Free: 500 * 1024 * 1024,           // 500 MB
  Plus: 1 * 1024 * 1024 * 1024,      // 1 GB
  Pro: 2 * 1024 * 1024 * 1024,       // 2 GB
  Max: 5 * 1024 * 1024 * 1024,       // 5 GB
  // Aliases
  free: 500 * 1024 * 1024,
  gratuit: 500 * 1024 * 1024,
  Gratuit: 500 * 1024 * 1024,
  plus: 1 * 1024 * 1024 * 1024,
  pro: 2 * 1024 * 1024 * 1024,
  max: 5 * 1024 * 1024 * 1024,
};
// Alias pour compat frontend (ancien CLOUD_STORAGE_LIMITS de mai-api.ts)
export const CLOUD_STORAGE_LIMITS = STORAGE_LIMITS_BYTES;

export function getTierStorageLimit(tier?: string | null): number {
  const t = (tier || "Free").toLowerCase().trim();
  if (t === "max") return 5 * 1024 * 1024 * 1024;
  if (t === "pro") return 2 * 1024 * 1024 * 1024;
  if (t === "plus") return 1 * 1024 * 1024 * 1024;
  return 500 * 1024 * 1024;
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
