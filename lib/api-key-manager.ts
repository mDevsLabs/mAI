import 'server-only';

import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';
import { TIER_REQUEST_LIMITS, getTierQuotaLimit, getUserQuotaBoost } from './tiers';

import type { ApiKeyMetadata, CreatedApiKeyResult } from './api-key-types';

export type { ApiKeyMetadata, CreatedApiKeyResult } from './api-key-types';

// Memory fallback store (au cas où la DB locale/distant n'est pas encore connectée)
const memoryKeysStore: Map<string, {
  id: string;
  userId: string;
  name: string;
  prefix: string;
  secretKey: string;
  hash: string;
  createdAt: string;
  lastUsedAt: string | null;
  usageCount: number;
  maxLimit: number | null;
  isActive: boolean;
  plan: string;
}> = new Map();

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

// Calcule le hash SHA-256 d'un secret en clair
export function hashSecretKey(secretKey: string): string {
  return crypto.createHash('sha256').update(secretKey).digest('hex');
}

/**
 * Extrait le préfixe public exact d'une clé. Cette fonction ne doit jamais
 * retourner une clé courte entière : les formats historiques exposent au
 * maximum leurs 11 premiers caractères.
 */
export function getApiKeyRef(secretKey: string | null | undefined): string | null {
  if (!secretKey || typeof secretKey !== 'string') return null;
  const value = secretKey.trim();
  if (!value || /^[a-f0-9]{64}$/i.test(value)) return null;

  const maiMatch = value.match(/^(mai-(?:free|plus|pro|max)-[A-Z0-9]{5})-/i);
  if (maiMatch) return maiMatch[1];

  if (/^mai_live[A-Za-z0-9_-]{8,}$/.test(value)) return value.slice(0, 11);
  if (/^mp-[A-Za-z0-9_-]{12,}$/.test(value)) return value.slice(0, 11);
  if (/^sk_mp_[A-Za-z0-9_-]{8,}$/.test(value)) return value.slice(0, 11);
  return null;
}

/** Valide une référence sans caractère générique ni espace. */
export function isValidApiKeyRef(keyRef: string | null | undefined): keyRef is string {
  if (!keyRef || keyRef.length > 64 || keyRef !== keyRef.trim()) return false;
  if (/^mai-(?:free|plus|pro|max)-[A-Z0-9]{5}$/i.test(keyRef)) return true;
  if (/^mai_live[A-Za-z0-9_-]{3}$/.test(keyRef)) return true;
  if (/^mp-[A-Za-z0-9_-]{8}$/.test(keyRef)) return true;
  if (/^sk_mp_[A-Za-z0-9_-]{5}$/.test(keyRef)) return true;
  return false;
}

function escapeLikePrefix(value: string): string {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

/**
 * Résout tous les identifiants possibles d'un utilisateur (id, username, email)
 * pour retrouver ses clés quel que soit l'identifiant utilisé à la création.
 */
async function getUserIdentifiers(db: any, userId: string): Promise<string[]> {
  const ids = [userId];
  try {
    const rows = await db`
      SELECT id, username, email FROM users
      WHERE id::text = ${userId}::text OR username = ${userId}::text OR email = ${userId}::text
      LIMIT 1
    `;
    if (rows[0]) {
      if (rows[0].id) ids.push(String(rows[0].id));
      if (rows[0].username) ids.push(String(rows[0].username));
      if (rows[0].email) ids.push(String(rows[0].email));
    }
  } catch {}
  return [...new Set(ids)];
}

function normalizeValidatedPlan(plan: unknown): string {
  const value = String(plan || '').trim().toLowerCase();
  if (value === 'plus' || value === 'pro' || value === 'max') {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  return 'Free';
}

function toIsoDate(value: unknown, fallback: string): string {
  if (!value) return fallback;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

function generateRandomChars(length: number, charset: string): string {
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += charset[bytes[i] % charset.length];
  }
  return result;
}

// Génère un secret sécurisé respectant le format : mai-TIER-XXXXX-XXXXXXXX
// 5 caractères majuscules/chiffres (partie 1), puis 8 caractères alphanumériques (partie 2).
// Rétrocompatibilité : les anciennes clés mp-* / mai-TIER-XXXXX-XXXXX (5 chars) restent valides.
export function generateSecretKey(tier: string = 'free'): { secretKey: string; prefix: string } {
  const normalizedTier = ['free', 'plus', 'pro', 'max'].includes(tier.toLowerCase().trim())
    ? tier.toLowerCase().trim()
    : 'free';

  const part1Charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const part2Charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  const part1 = generateRandomChars(5, part1Charset);
  const part2 = generateRandomChars(8, part2Charset);

  const secretKey = `mai-${normalizedTier}-${part1}-${part2}`;
  const prefix = `mai-${normalizedTier}-${part1}`;
  return {
    secretKey,
    prefix,
  };
}

/**
 * Créer une nouvelle clé API pour un utilisateur.
 * Le secret respecte le format mai-TIER-XXXXX-XXXXXXXX (5 + 8 chars).
 * Rétrocompatibilité : les anciens formats mp-* / mai-TIER-XXXXX-XXXXX restent valides.
 */
export async function createApiKey(userId: string, name: string, maxLimit: number | null = null, tier?: string): Promise<CreatedApiKeyResult> {
  const db = getDb();
  let userTier = tier;
  if (!userTier && db) {
    try {
      const uRows = await db`
        SELECT tier FROM users 
        WHERE id::text = ${userId}::text OR username = ${userId}::text OR email = ${userId}::text 
        LIMIT 1
      `;
      userTier = uRows[0]?.tier || 'free';
    } catch {}
  }

  const keyId = `key_${crypto.randomBytes(8).toString('hex')}`;
  const { secretKey, prefix } = generateSecretKey(userTier || 'free');
  const hash = hashSecretKey(secretKey);
  const now = new Date().toISOString();
  const plan = normalizeValidatedPlan(userTier);
  let storedInDb = false;

  if (db) {
    try {
      await db`
        INSERT INTO mprojects_api_keys (user_id, api_key, plan, request_count, created_at, max_limit, is_active)
        VALUES (${userId}, ${secretKey}, ${name}, 0, ${now}, ${maxLimit}, true)
      `;
      storedInDb = true;
    } catch (err) {
      console.warn('Persistance DB néon impossible, enregistrement en mémoire:', err);
    }
  }

  // N'ajouter au store mémoire QUE si la DB n'a pas pu être utilisée (évite les doublons)
  if (!storedInDb) {
    memoryKeysStore.set(keyId, {
      id: keyId,
      userId,
      name,
      prefix,
      secretKey,
      hash,
      createdAt: now,
      lastUsedAt: null,
      usageCount: 0,
      maxLimit,
      isActive: true,
      plan,
    });
  }

  return {
    id: prefix,
    keyRef: prefix,
    name,
    prefix,
    secretKey,
    createdAt: now,
  };
}

/**
 * Lister les clés API d'un utilisateur. Le résultat ne contient jamais le
 * segment secret : uniquement un keyRef et des métadonnées.
 */
export async function listApiKeys(userId: string): Promise<ApiKeyMetadata[]> {
  const db = getDb();
  const results: ApiKeyMetadata[] = [];
  const seenRefs = new Set<string>();

  if (db) {
    try {
      const identifiers = await getUserIdentifiers(db, userId);
      const rows = await db`
        SELECT k.api_key, k.plan, k.request_count, k.created_at, k.last_used_at,
               k.max_limit, k.is_active, u.tier as user_tier
        FROM mprojects_api_keys k
        LEFT JOIN users u
          ON k.user_id = u.id::text OR k.user_id = u.username OR k.user_id = u.email
        WHERE k.user_id = ANY(${identifiers})
        ORDER BY k.created_at DESC
      `;

      for (const row of rows) {
        const keyRef = getApiKeyRef(row.api_key);
        // Une entrée ne peut être affichée/utilisée sans référence publique
        // non ambiguë. Aucun hash n'est exposé à ce niveau.
        if (!keyRef || seenRefs.has(keyRef)) continue;
        seenRefs.add(keyRef);
        results.push({
          id: keyRef,
          keyRef,
          name: row.plan || 'Clé API',
          prefix: keyRef,
          createdAt: toIsoDate(row.created_at, new Date().toISOString()),
          lastUsedAt: row.last_used_at ? toIsoDate(row.last_used_at, new Date().toISOString()) : null,
          usageCount: Number(row.request_count || 0),
          maxLimit: row.max_limit !== undefined && row.max_limit !== null ? Number(row.max_limit) : null,
          isActive: row.is_active !== false,
          plan: normalizeValidatedPlan(row.user_tier),
        });
      }
    } catch (err) {
      console.warn('Erreur de lecture DB des clés API:', err);
    }
  }

  memoryKeysStore.forEach((record) => {
    if (record.userId === userId && !seenRefs.has(record.prefix)) {
      seenRefs.add(record.prefix);
      results.push({
        id: record.prefix,
        keyRef: record.prefix,
        name: record.name,
        prefix: record.prefix,
        createdAt: record.createdAt,
        lastUsedAt: record.lastUsedAt,
        usageCount: record.usageCount,
        maxLimit: record.maxLimit,
        isActive: record.isActive,
        plan: record.plan,
      });
    }
  });

  return results;
}

export interface ResolvedUserApiKey {
  secretKey: string;
  keyRef: string;
  metadata: ApiKeyMetadata;
  plan: string;
}

/**
 * Résout un keyRef public pour le propriétaire indiqué. La propriété et
 * l'activité sont vérifiées avant tout usage ; une collision de préfixe est
 * rejetée plutôt que résolue arbitrairement.
 */
export async function resolveUserApiKeyByRef(
  userId: string,
  keyRef: string,
): Promise<ResolvedUserApiKey | null> {
  if (!isValidApiKeyRef(keyRef)) return null;

  const matchingMemory = [...memoryKeysStore.values()].filter(
    (record) => record.userId === userId && record.prefix === keyRef && record.isActive,
  );
  if (matchingMemory.length > 1) return null;
  const resolveFromMemory = () => {
    if (matchingMemory.length !== 1) return null;
    const record = matchingMemory[0];
    if (record.maxLimit !== null && record.usageCount >= record.maxLimit) return null;
    return {
      secretKey: record.secretKey,
      keyRef: record.prefix,
      metadata: {
        id: record.prefix,
        keyRef: record.prefix,
        name: record.name,
        prefix: record.prefix,
        createdAt: record.createdAt,
        lastUsedAt: record.lastUsedAt,
        usageCount: record.usageCount,
        maxLimit: record.maxLimit,
        isActive: true,
        plan: record.plan,
      },
      plan: record.plan,
    } satisfies ResolvedUserApiKey;
  };

  const db = getDb();
  if (!db) return resolveFromMemory();

  try {
    const identifiers = await getUserIdentifiers(db, userId);
    const rows = await db`
      SELECT k.user_id, k.api_key, k.plan, k.request_count, k.created_at,
             k.last_used_at, k.max_limit, k.is_active, u.tier as user_tier
      FROM mprojects_api_keys k
      LEFT JOIN users u
        ON k.user_id = u.id::text OR k.user_id = u.username OR k.user_id = u.email
      WHERE k.user_id = ANY(${identifiers})
        AND k.is_active IS DISTINCT FROM FALSE
        AND k.api_key LIKE ${escapeLikePrefix(keyRef) + '%'} ESCAPE E'\\\\'
      ORDER BY k.created_at DESC
      LIMIT 2
    `;

    const exactRows = rows.filter((row: any) => getApiKeyRef(row.api_key) === keyRef);
    if (exactRows.length > 1) return null;
    if (exactRows.length === 0) return resolveFromMemory();
    // La même référence en mémoire et en base est une collision : ne jamais
    // choisir arbitrairement un secret, même pour le même propriétaire.
    if (matchingMemory.length === 1) return null;
    const row = exactRows[0];
    if (row.max_limit !== null && row.max_limit !== undefined && Number(row.request_count || 0) >= Number(row.max_limit)) {
      return null;
    }

    const metadata: ApiKeyMetadata = {
      id: keyRef,
      keyRef,
      name: row.plan || 'Clé API',
      prefix: keyRef,
      createdAt: toIsoDate(row.created_at, new Date().toISOString()),
      lastUsedAt: row.last_used_at ? toIsoDate(row.last_used_at, new Date().toISOString()) : null,
      usageCount: Number(row.request_count || 0),
      maxLimit: row.max_limit !== null && row.max_limit !== undefined ? Number(row.max_limit) : null,
      isActive: true,
      plan: normalizeValidatedPlan(row.user_tier),
    };

    return {
      secretKey: String(row.api_key),
      keyRef,
      metadata,
      plan: metadata.plan,
    };
  } catch (error) {
    console.error('Erreur lors de la résolution sécurisée du keyRef:', error);
    return null;
  }
}

/**
 * Révoquer (supprimer) une clé API.
 */
export async function revokeApiKey(userId: string, keyId: string): Promise<boolean> {
  const keyRef = keyId.trim();
  if (!isValidApiKeyRef(keyRef)) return false;
  let success = false;

  // 1. Mémoire — correspondance exacte sur la clé ET le propriétaire.
  for (const [memoryId, record] of memoryKeysStore.entries()) {
    if (record.userId === userId && (memoryId === keyRef || record.prefix === keyRef)) {
      memoryKeysStore.delete(memoryId);
      success = true;
    }
  }

  // 2. DB — le préfixe est résolu sous contrainte de propriétaire, puis la
  // suppression cible le secret exact. Une collision de keyRef échoue.
  const db = getDb();
  if (db) {
    try {
      const identifiers = await getUserIdentifiers(db, userId);
      const candidates = await db`
        SELECT api_key
        FROM mprojects_api_keys
        WHERE user_id = ANY(${identifiers})
          AND api_key LIKE ${escapeLikePrefix(keyRef) + '%'} ESCAPE E'\\\\'
        LIMIT 2
      `;
      const exact = candidates.filter((row: any) => getApiKeyRef(row.api_key) === keyRef);
      if (exact.length === 1) {
        const deleted = await db`
          DELETE FROM mprojects_api_keys
          WHERE user_id = ANY(${identifiers})
            AND api_key = ${exact[0].api_key}
          RETURNING api_key
        `;
        if (deleted.length === 1) success = true;
      }
    } catch (err) {
      console.error('Erreur lors de la révocation DB:', err);
    }
  }

  return success;
}

/** Mettre à jour les propriétés d'une clé API. */
export async function updateApiKey(userId: string, keyId: string, updates: { name?: string, maxLimit?: number | null, isActive?: boolean }): Promise<boolean> {
  const keyRef = keyId.trim();
  if (!isValidApiKeyRef(keyRef)) return false;
  let success = false;

  for (const [memoryId, record] of memoryKeysStore.entries()) {
    if (record.userId === userId && (memoryId === keyRef || record.prefix === keyRef)) {
      if (updates.name !== undefined) record.name = updates.name;
      if (updates.maxLimit !== undefined) record.maxLimit = updates.maxLimit;
      if (updates.isActive !== undefined) record.isActive = updates.isActive;
      success = true;
    }
  }

  const db = getDb();
  if (db && (updates.name !== undefined || updates.maxLimit !== undefined || updates.isActive !== undefined)) {
    try {
      const identifiers = await getUserIdentifiers(db, userId);
      const candidates = await db`
        SELECT api_key
        FROM mprojects_api_keys
        WHERE user_id = ANY(${identifiers})
          AND api_key LIKE ${escapeLikePrefix(keyRef) + '%'} ESCAPE E'\\\\'
        LIMIT 2
      `;
      const exact = candidates.filter((row: any) => getApiKeyRef(row.api_key) === keyRef);
      if (exact.length === 1) {
        const updated = await db`
          UPDATE mprojects_api_keys
          SET
            plan = COALESCE(${updates.name !== undefined ? updates.name : null}, plan),
            max_limit = CASE WHEN ${updates.maxLimit !== undefined} THEN ${updates.maxLimit ?? null}::integer ELSE max_limit END,
            is_active = COALESCE(${updates.isActive !== undefined ? updates.isActive : null}, is_active)
          WHERE user_id = ANY(${identifiers})
            AND api_key = ${exact[0].api_key}
          RETURNING api_key
        `;
        if (updated.length === 1) success = true;
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour DB:', err);
    }
  }

  return success;
}

// Ré-export pour compatibilité (source unique = lib/tiers.ts)
export { TIER_REQUEST_LIMITS, getTierQuotaLimit };

/**
 * Enregistrer un log d'appel API dans mprojects_api_logs.
 */
export async function recordApiLog(params: {
  apiKey: string;
  endpoint: string;
  method?: string;
  statusCode?: number;
  latencyMs?: number;
}): Promise<void> {
  const db = getDb();
  if (!db) return;
  try {
    const cleanKey = params.apiKey ? params.apiKey.trim() : 'anonymous';
    const method = params.method || 'POST';
    const statusCode = params.statusCode || 200;
    const latencyMs = params.latencyMs || 0;

    await db`
      INSERT INTO mprojects_api_logs (api_key, endpoint, method, status_code, latency_ms, created_at)
      VALUES (${cleanKey}::text, ${params.endpoint}::text, ${method}::text, ${statusCode}::integer, ${latencyMs}::integer, NOW())
    `;
  } catch (err) {
    console.error('Erreur insertion mprojects_api_logs:', err);
  }
}

/**
 * Vérifier et consommer le quota pour un utilisateur (session web app / API).
 */
export async function checkAndTrackUserUsage(params: {
  userId: string;
  endpoint: string;
  method?: string;
  statusCode?: number;
  latencyMs?: number;
}): Promise<{ allowed: boolean; error?: string; apiKey?: string }> {
  const db = getDb();
  if (!db) {
    return { allowed: true };
  }

  try {
    const { userId, endpoint, method = 'POST', statusCode = 200, latencyMs = 0 } = params;

    // 1. Obtenir les infos de l'utilisateur et son forfait
    const userRows = await db`
      SELECT id, username, email, tier
      FROM users
      WHERE id::text = ${userId}::text OR username = ${userId}::text OR email = ${userId}::text
      LIMIT 1
    `;

    const userTier = userRows[0]?.tier || 'Free';
    const tierLimit = getTierQuotaLimit(userTier);

    // 2. Récupérer les clés de l'utilisateur
    let keys = await db`
      SELECT api_key, plan, request_count, max_limit, is_active
      FROM mprojects_api_keys
      WHERE user_id = ${userId}::text
         OR user_id = ${userRows[0]?.id ? String(userRows[0].id) : userId}::text
         OR user_id = ${userRows[0]?.username || userId}::text
         OR user_id = ${userRows[0]?.email || userId}::text
      ORDER BY created_at DESC
    `;

    if (keys.length === 0) {
      const { secretKey } = generateSecretKey();
      const now = new Date().toISOString();
      await db`
        INSERT INTO mprojects_api_keys (user_id, api_key, plan, request_count, created_at, is_active)
        VALUES (${userId}::text, ${secretKey}, 'Clé Principale', 0, ${now}, true)
      `;
      keys = [{ api_key: secretKey, plan: 'Clé Principale', request_count: 0, max_limit: null, is_active: true }];
    }

    // 3. Calculer la consommation totale
    const totalRequests = keys.reduce((acc: number, k: any) => acc + (parseInt(k.request_count, 10) || 0), 0);

    if (totalRequests >= tierLimit) {
      return {
        allowed: false,
        error: `Limite globale de requêtes API atteinte pour votre forfait (${userTier} : ${tierLimit} requêtes max/mois). Veuillez mettre à niveau votre forfait.`,
      };
    }

    // 4. Trouver une clé active
    const activeKey = keys.find((k: any) => k.is_active !== false && (k.max_limit === null || k.request_count < k.max_limit)) || keys[0];

    // 5. Incrémenter le compteur de requêtes
    await db`
      UPDATE mprojects_api_keys
      SET request_count = request_count + 1, last_used_at = NOW()
      WHERE api_key = ${activeKey.api_key}
    `;

    // 6. Enregistrer dans les logs API
    await recordApiLog({
      apiKey: activeKey.api_key,
      endpoint,
      method,
      statusCode,
      latencyMs,
    });

    return {
      allowed: true,
      apiKey: activeKey.api_key,
    };
  } catch (err) {
    console.error('Erreur checkAndTrackUserUsage:', err);
    // Fail-closed : une erreur de vérification ne doit pas ouvrir le quota
    return { allowed: false, error: 'Erreur de vérification du quota. Réessayez dans un instant.' };
  }
}

/**
 * Valider une clé secrète fournie (Bearer token).
 * Valide les formats mp-*, mai_live*, mai-TIER-XXXXX-XXXXX (5 chars, ancien) et mai-TIER-XXXXX-XXXXXXXX (8 chars, nouveau) et MAI_API_KEY.
 */
export async function validateApiKey(secretKey: string): Promise<{ valid: boolean; keyInfo?: ApiKeyMetadata; error?: string }> {
  if (!secretKey || typeof secretKey !== 'string') {
    return { valid: false, error: 'Format de clé API invalide.' };
  }

  const cleanedKey = secretKey.trim();

  // Support de MAI_API_KEY en environnement. Cette validation est une
  // égalité serveur-side exacte ; aucune valeur d'environnement n'est exposée.
  const systemMaiApiKey = process.env.MAI_API_KEY;
  if (systemMaiApiKey && cleanedKey === systemMaiApiKey) {
    const now = new Date().toISOString();
    return {
      valid: true,
      keyInfo: {
        id: 'mp-system',
        keyRef: 'mp-system',
        name: 'Clé Système MAI',
        prefix: 'mp-system',
        createdAt: now,
        lastUsedAt: now,
        usageCount: 0,
        maxLimit: null,
        isActive: true,
        plan: 'Free',
      },
    };
  }

  const isValidFormat = cleanedKey.startsWith('mp-') ||
    cleanedKey.startsWith('mai_live') ||
    cleanedKey.startsWith('mai-') ||
    cleanedKey.startsWith('sk_mp_');
  if (!isValidFormat) {
    return { valid: false, error: 'Format de clé API invalide (doit commencer par mp- ou mai-).' };
  }

  const hash = hashSecretKey(cleanedKey);

  // 1. Vérification mémoire : hash exact, propriétaire implicite à l'entrée créée.
  for (const record of memoryKeysStore.values()) {
    if (record.hash !== hash) continue;
    if (!record.isActive) return { valid: false, error: 'Clé API désactivée.' };
    if (record.maxLimit !== null && record.usageCount >= record.maxLimit) {
      return { valid: false, error: 'Limite de la clé API atteinte.' };
    }

    record.usageCount += 1;
    record.lastUsedAt = new Date().toISOString();
    return {
      valid: true,
      keyInfo: {
        id: record.prefix,
        keyRef: record.prefix,
        name: record.name,
        prefix: record.prefix,
        ownerId: record.userId,
        createdAt: record.createdAt,
        lastUsedAt: record.lastUsedAt,
        usageCount: record.usageCount,
        maxLimit: record.maxLimit,
        isActive: true,
        plan: record.plan,
      },
    };
  }

  // 2. Vérification DB : secret exact ou hash exact, jamais de correspondance floue.
  const db = getDb();
  if (db) {
    try {
      const rows = await db`
        SELECT k.user_id, k.api_key, k.plan, k.request_count, k.created_at,
               k.last_used_at, k.max_limit, k.is_active, u.tier as user_tier
        FROM mprojects_api_keys k
        LEFT JOIN users u
          ON k.user_id = u.id::text OR k.user_id = u.username OR k.user_id = u.email
        WHERE k.api_key = ${hash}
           OR k.api_key = ${cleanedKey}
        LIMIT 1
      `;

      if (rows.length > 0) {
        const row = rows[0];
        const now = new Date().toISOString();

        if (row.is_active === false) {
          return { valid: false, error: 'Clé API désactivée.' };
        }
        if (row.max_limit !== null && Number(row.request_count || 0) >= Number(row.max_limit)) {
          return { valid: false, error: 'Limite de la clé API atteinte.' };
        }

        // Le forfait provient de l'utilisateur lié à la clé après validation
        // exacte en base. Le format encodé dans une clé non vérifiée n'élève
        // jamais le compte, et le nom libre de la clé n'est pas une autorité.
        const validatedPlan = normalizeValidatedPlan(row.user_tier);
        const apiBoost = await getUserQuotaBoost(db, row.user_id, 'api');
        const tierLimit = getTierQuotaLimit(validatedPlan) + apiBoost;
        const ownerIdentifiers = await getUserIdentifiers(db, String(row.user_id));
        const countRows = await db`
          SELECT SUM(request_count) as total_requests
          FROM mprojects_api_keys
          WHERE user_id = ANY(${ownerIdentifiers})
        `;
        const globalRequestCount = Number(countRows[0]?.total_requests || 0);

        if (globalRequestCount >= tierLimit) {
          return {
            valid: false,
            error: `Limite globale de requêtes API atteinte pour votre compte (${validatedPlan} : ${tierLimit} requêtes max/mois). Veuillez mettre à niveau votre forfait.`,
          };
        }

        await db`
          UPDATE mprojects_api_keys
          SET request_count = request_count + 1, last_used_at = NOW()
          WHERE api_key = ${row.api_key}
        `;

        const keyRef = getApiKeyRef(cleanedKey);
        if (!keyRef) {
          return { valid: false, error: 'Référence de clé API invalide.' };
        }

        return {
          valid: true,
          keyInfo: {
            id: keyRef,
            keyRef,
            name: row.plan || 'Clé API',
            prefix: keyRef,
            ownerId: row.user_id ? String(row.user_id) : undefined,
            createdAt: toIsoDate(row.created_at, now),
            lastUsedAt: now,
            usageCount: Number(row.request_count || 0) + 1,
            maxLimit: row.max_limit !== undefined && row.max_limit !== null ? Number(row.max_limit) : null,
            isActive: true,
            plan: validatedPlan,
          },
        };
      }
    } catch (err) {
      console.error('Erreur lors de la validation DB:', err);
    }
  }

  return {
    valid: false,
    error: 'Clé API invalide ou introuvable. Veuillez vérifier vos clés dans la section Compte.',
  };
}
