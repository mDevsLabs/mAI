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

// Limites de stockage Cloud par tier (en bytes) — source backend config.ts
// Free 500 MB, Plus 5 GB, Pro 20 GB, Max 100 GB
export const STORAGE_LIMITS_BYTES: Record<string, number> = {
  Free: 500 * 1024 * 1024,
  Plus: 5 * 1024 * 1024 * 1024,
  Pro: 20 * 1024 * 1024 * 1024,
  Max: 100 * 1024 * 1024 * 1024,
};
// Alias pour compat frontend (ancien CLOUD_STORAGE_LIMITS de mai-api.ts)
export const CLOUD_STORAGE_LIMITS = STORAGE_LIMITS_BYTES;

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
