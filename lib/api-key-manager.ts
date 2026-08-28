import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';
import { TIER_REQUEST_LIMITS, getTierQuotaLimit } from './tiers';

export interface ApiKeyMetadata {
  id: string;
  name: string;
  prefix: string; // Les premiers caractères visibles (ex: mp-126c6e6c)
  apiKey?: string; // Clé complète pour exécution dans le studio
  createdAt: string;
  lastUsedAt: string | null;
  usageCount: number;
  maxLimit: number | null;
  isActive: boolean;
}

export interface CreatedApiKeyResult {
  id: string;
  name: string;
  prefix: string;
  secretKey: string; // Retourné une seule et unique fois à la création
  createdAt: string;
}

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

// Génère un secret sécurisé commençant obligatoirement par mp-
export function generateSecretKey(): { secretKey: string; prefix: string } {
  const randomHex = crypto.randomBytes(24).toString('hex'); // 48 caractères hex
  const secretKey = `mp-${randomHex}`;
  return {
    secretKey,
    prefix: `mp-${randomHex.substring(0, 8)}`,
  };
}

/**
 * Créer une nouvelle clé API pour un utilisateur.
 * Le secret commence par mp-. Uniquement persistant en DB si disponible, sinon en mémoire.
 */
export async function createApiKey(userId: string, name: string, maxLimit: number | null = null): Promise<CreatedApiKeyResult> {
  const keyId = `key_${crypto.randomBytes(8).toString('hex')}`;
  const { secretKey, prefix } = generateSecretKey();
  const hash = hashSecretKey(secretKey);
  const now = new Date().toISOString();

  const db = getDb();
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
    });
  }

  return {
    id: keyId,
    name,
    prefix: `${prefix}_••••••••`,
    secretKey,
    createdAt: now,
  };
}

/**
 * Lister les clés API d'un utilisateur (dédupliqué pour éviter le doublon DB + Mémoire).
 */
export async function listApiKeys(userId: string): Promise<ApiKeyMetadata[]> {
  const db = getDb();
  const results: ApiKeyMetadata[] = [];
  const seenPrefixes = new Set<string>();

  if (db) {
    try {
      const rows = await db`
        SELECT k.api_key, k.plan, k.request_count, k.created_at, k.last_used_at, k.max_limit, k.is_active
        FROM mprojects_api_keys k
        LEFT JOIN users u ON k.user_id = u.id::text OR k.user_id = u.username OR k.user_id = u.email
        WHERE k.user_id = ${userId}::text
           OR u.id::text = ${userId}::text
           OR u.username = ${userId}::text
           OR u.email = ${userId}::text
        ORDER BY k.created_at DESC
      `;

      rows.forEach((row: any, idx: number) => {
        const keyVal = row.api_key || 'mp-key';
        const prefix = keyVal.startsWith('mp-') || keyVal.startsWith('mai-') || keyVal.startsWith('mai_live')
          ? keyVal.substring(0, 11)
          : keyVal.substring(0, 8);

        if (!seenPrefixes.has(prefix)) {
          seenPrefixes.add(prefix);
          results.push({
            id: `db_key_${idx}_${prefix}`,
            name: row.plan || 'Clé API',
            prefix: `${prefix}_••••••••`,
            apiKey: keyVal,
            createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
            lastUsedAt: row.last_used_at ? new Date(row.last_used_at).toISOString() : null,
            usageCount: row.request_count || 0,
            maxLimit: row.max_limit !== undefined ? row.max_limit : null,
            isActive: row.is_active !== undefined ? row.is_active : true,
          });
        }
      });
    } catch (err) {
      console.warn('Erreur de lecture DB, bascule en mémoire:', err);
    }
  }

  // Ajouter les clés mémoire uniquement si elles ne sont pas déjà en DB
  memoryKeysStore.forEach((k) => {
    if (k.userId === userId) {
      if (!seenPrefixes.has(k.prefix)) {
        seenPrefixes.add(k.prefix);
        results.push({
          id: k.id,
          name: k.name,
          prefix: `${k.prefix}_••••••••`,
          apiKey: k.secretKey,
          createdAt: k.createdAt,
          lastUsedAt: k.lastUsedAt,
          usageCount: k.usageCount,
          maxLimit: k.maxLimit,
          isActive: k.isActive,
        });
      }
    }
  });

  return results;
}

/**
 * Révoquer (supprimer) une clé API.
 */
export async function revokeApiKey(userId: string, keyId: string): Promise<boolean> {
  let success = false;
  
  let cleanId = keyId;
  if (keyId.startsWith('db_key_')) {
    const match = keyId.match(/db_key_\d+_(.*)/);
    if (match) {
      cleanId = match[1];
    }
  }

  // 1. Révoquer de la mémoire — match exact uniquement
  for (const [mId, record] of memoryKeysStore.entries()) {
    if (record.userId === userId && (mId === keyId || mId === cleanId || record.prefix === cleanId)) {
      memoryKeysStore.delete(mId);
      success = true;
    }
  }

  // 2. Révoquer de la DB — prefix exact (pas de LIKE inversé)
  const db = getDb();
  if (db) {
    try {
      const cleanPrefix = cleanId.replace(/_•+$/, '').trim();
      // Nombre minimal de caractères pour éviter suppression massive par préfixe trop court
      if (cleanPrefix.length < 8) throw new Error('Préfixe trop court');
      await db`
        DELETE FROM mprojects_api_keys
        WHERE user_id = ${userId} 
          AND api_key LIKE ${cleanPrefix + '%'}
      `;
      success = true;
    } catch (err) {
      console.error('Erreur lors de la révocation DB:', err);
    }
  }

  return success;
}

/**
 * Mettre à jour les propriétés d'une clé API.
 */
export async function updateApiKey(userId: string, keyId: string, updates: { name?: string, maxLimit?: number | null, isActive?: boolean }): Promise<boolean> {
  let success = false;

  let cleanId = keyId;
  if (keyId.startsWith('db_key_')) {
    const match = keyId.match(/db_key_\d+_(.*)/);
    if (match) {
      cleanId = match[1];
    }
  }

  // Mémoire — match exact
  for (const [mId, record] of memoryKeysStore.entries()) {
    if (record.userId === userId && (mId === keyId || mId === cleanId || record.prefix === cleanId)) {
      if (updates.name !== undefined) record.name = updates.name;
      if (updates.maxLimit !== undefined) record.maxLimit = updates.maxLimit;
      if (updates.isActive !== undefined) record.isActive = updates.isActive;
      success = true;
    }
  }

  const db = getDb();
  if (db) {
    try {
      const cleanPrefix = cleanId.replace(/_•+$/, '').trim();
      if (cleanPrefix.length < 8) throw new Error('Préfixe trop court');
      if (updates.name !== undefined || updates.maxLimit !== undefined || updates.isActive !== undefined) {
        await db`
          UPDATE mprojects_api_keys
          SET 
            plan = COALESCE(${updates.name !== undefined ? updates.name : null}, plan),
            max_limit = ${updates.maxLimit !== undefined ? updates.maxLimit : null},
            is_active = COALESCE(${updates.isActive !== undefined ? updates.isActive : null}, is_active)
          WHERE user_id = ${userId} 
            AND api_key LIKE ${cleanPrefix + '%'}
        `;
        success = true;
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
    return { allowed: true };
  }
}

/**
 * Valider une clé secrète fournie (Bearer token).
 * Valide les formats mp-*, mai_live*, mai-* et MAI_API_KEY.
 */
export async function validateApiKey(secretKey: string): Promise<{ valid: boolean; keyInfo?: ApiKeyMetadata; error?: string }> {
  if (!secretKey || typeof secretKey !== 'string') {
    return { valid: false, error: 'Format de clé API invalide.' };
  }

  const cleanedKey = secretKey.trim();

  // Support de MAI_API_KEY en environnement
  const systemMaiApiKey = process.env.MAI_API_KEY;
  if (systemMaiApiKey && cleanedKey === systemMaiApiKey) {
    return {
      valid: true,
      keyInfo: {
        id: 'system_mai_key',
        name: 'Clé Système MAI',
        prefix: 'mp-system',
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
        usageCount: 0,
        maxLimit: null,
        isActive: true
      }
    };
  }

  // Valider les formats mp-*, mai_live*, mai-* et sk_mp_*
  const isValidFormat = cleanedKey.startsWith('mp-') || 
                        cleanedKey.startsWith('mai_live') || 
                        cleanedKey.startsWith('mai-') ||
                        cleanedKey.startsWith('sk_mp_');

  if (!isValidFormat) {
    return { valid: false, error: 'Format de clé API invalide (doit commencer par mp- ou mai-).' };
  }

  const hash = hashSecretKey(cleanedKey);

  // 1. Vérifier en mémoire — match exact sur hash uniquement
  for (const record of memoryKeysStore.values()) {
    if (record.hash === hash) {
      if (!record.isActive) return { valid: false, error: 'Clé API désactivée.' };
      if (record.maxLimit !== null && record.usageCount >= record.maxLimit) return { valid: false, error: 'Limite de la clé API atteinte.' };

      record.usageCount += 1;
      record.lastUsedAt = new Date().toISOString();
      return {
        valid: true,
        keyInfo: {
          id: record.id,
          name: record.name,
          prefix: `${record.prefix}_••••••••`,
          createdAt: record.createdAt,
          lastUsedAt: record.lastUsedAt,
          usageCount: record.usageCount,
          maxLimit: record.maxLimit,
          isActive: record.isActive,
        },
      };
    }
  }

  // 2. Vérifier en DB — comparaison exacte uniquement (pas de LIKE fuzzy)
  const db = getDb();
  if (db) {
    try {
      const rows = await db`
        SELECT k.user_id, k.api_key, k.plan, k.request_count, k.created_at, k.last_used_at, k.max_limit, k.is_active, u.tier as user_tier
        FROM mprojects_api_keys k
        LEFT JOIN users u ON k.user_id = u.id::text OR k.user_id = u.username OR k.user_id = u.email
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

        // Vérification de la limite individuelle de la clé
        if (row.max_limit !== null && row.request_count >= row.max_limit) {
           return { valid: false, error: 'Limite de la clé API atteinte.' };
        }

        // Vérification de la limite globale du forfait du compte
        const userTier = row.user_tier || row.plan || 'Free';
        const tierLimit = getTierQuotaLimit(userTier);

        const countRows = await db`
          SELECT SUM(request_count) as total_requests
          FROM mprojects_api_keys
          WHERE user_id = ${row.user_id}::text
        `;
        const globalRequestCount = parseInt(countRows[0]?.total_requests || '0', 10);

        if (globalRequestCount >= tierLimit) {
          return {
            valid: false,
            error: `Limite globale de requêtes API atteinte pour votre compte (${userTier} : ${tierLimit} requêtes max/mois). Veuillez mettre à niveau votre forfait.`
          };
        }

        // Incrémenter le compteur de requêtes sur la clé identifiée — exact match
        await db`
          UPDATE mprojects_api_keys
          SET request_count = request_count + 1, last_used_at = NOW()
          WHERE api_key = ${row.api_key}
        `;

        const resolvedPlan = row.plan || row.user_tier || 'Free';

        return {
          valid: true,
          keyInfo: {
            id: `db_key_${resolvedPlan}`,
            name: resolvedPlan,
            prefix: `${cleanedKey.substring(0, 11)}_••••••••`,
            createdAt: row.created_at ? new Date(row.created_at).toISOString() : now,
            lastUsedAt: now,
            usageCount: (row.request_count || 0) + 1,
            maxLimit: row.max_limit !== undefined ? row.max_limit : null,
            isActive: row.is_active !== undefined ? row.is_active : true,
          },
        };
      }
    } catch (err) {
      console.error('Erreur lors de la validation DB:', err);
    }
  }

  // Clé introuvable dans la base de données
  return {
    valid: false,
    error: 'Clé API invalide ou introuvable. Veuillez vérifier vos clés dans la section Compte.',
  };
}
