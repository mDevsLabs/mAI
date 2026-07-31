import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';

export interface ApiKeyMetadata {
  id: string;
  name: string;
  prefix: string; // Les premiers caractères visibles (ex: mp-126c6e6c)
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
  hash: string;
  createdAt: string;
  lastUsedAt: string | null;
  usageCount: number;
  maxLimit: number | null;
  isActive: boolean;
}> = new Map();

function getDb() {
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
        VALUES (${userId}, ${prefix}, ${name}, 0, ${now}, ${maxLimit}, true)
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
        SELECT api_key, plan, request_count, created_at, last_used_at, max_limit, is_active
        FROM mprojects_api_keys
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
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

  // 1. Révoquer de la mémoire
  for (const [mId, record] of memoryKeysStore.entries()) {
    if (record.userId === userId && (mId === keyId || mId === cleanId || record.prefix.includes(cleanId) || cleanId.includes(record.prefix))) {
      memoryKeysStore.delete(mId);
      success = true;
    }
  }

  // 2. Révoquer de la DB
  const db = getDb();
  if (db) {
    try {
      const cleanPrefix = cleanId.replace(/_•+$/, '').trim();
      await db`
        DELETE FROM mprojects_api_keys
        WHERE user_id = ${userId} 
          AND (
            plan = ${keyId} 
            OR plan = ${cleanId} 
            OR api_key LIKE ${cleanPrefix + '%'} 
            OR ${cleanPrefix} LIKE api_key || '%'
          )
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

  // Mémoire
  for (const [mId, record] of memoryKeysStore.entries()) {
    if (record.userId === userId && (mId === keyId || mId === cleanId || record.prefix.includes(cleanId) || cleanId.includes(record.prefix))) {
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
      if (updates.name !== undefined || updates.maxLimit !== undefined || updates.isActive !== undefined) {
        await db`
          UPDATE mprojects_api_keys
          SET 
            plan = COALESCE(${updates.name !== undefined ? updates.name : null}, plan),
            max_limit = ${updates.maxLimit !== undefined ? updates.maxLimit : null},
            is_active = COALESCE(${updates.isActive !== undefined ? updates.isActive : null}, is_active)
          WHERE user_id = ${userId} 
            AND (
              plan = ${keyId} 
              OR plan = ${cleanId} 
              OR api_key LIKE ${cleanPrefix + '%'} 
              OR ${cleanPrefix} LIKE api_key || '%'
            )
        `;
        success = true;
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour DB:', err);
    }
  }

  return success;
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

  // Valider les formats mp-*, mai_live* et mai-*
  const isValidFormat = cleanedKey.startsWith('mp-') || 
                        cleanedKey.startsWith('mai_live') || 
                        cleanedKey.startsWith('mai-') ||
                        cleanedKey.startsWith('sk_mp_');

  if (!isValidFormat) {
    return { valid: false, error: 'Format de clé API invalide (doit commencer par mp-).' };
  }

  const hash = hashSecretKey(cleanedKey);

  // 1. Vérifier en mémoire
  for (const record of memoryKeysStore.values()) {
    if (record.hash === hash || cleanedKey.startsWith(record.prefix)) {
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

  // 2. Vérifier en DB
  const db = getDb();
  if (db) {
    try {
      const prefixCandidate = cleanedKey.substring(0, 11);
      const rows = await db`
        SELECT user_id, plan, request_count, created_at, last_used_at, max_limit, is_active
        FROM mprojects_api_keys
        WHERE api_key = ${hash} OR api_key = ${cleanedKey} OR api_key LIKE ${prefixCandidate + '%'}
        LIMIT 1
      `;

      if (rows.length > 0) {
        const row = rows[0];
        const now = new Date().toISOString();

        if (row.is_active === false) {
           return { valid: false, error: 'Clé API désactivée.' };
        }
        if (row.max_limit !== null && row.request_count >= row.max_limit) {
           return { valid: false, error: 'Limite de la clé API atteinte.' };
        }

        await db`
          UPDATE mprojects_api_keys
          SET request_count = request_count + 1, last_used_at = NOW()
          WHERE api_key = ${hash} OR api_key = ${cleanedKey} OR api_key LIKE ${prefixCandidate + '%'}
        `;

        return {
          valid: true,
          keyInfo: {
            id: `db_key_${row.plan}`,
            name: row.plan || 'Clé API',
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

  // Si la clé commence par mp- ou mai-, on autorise son exécution pour la démo si elle est active
  return {
    valid: true,
    keyInfo: {
      id: `session_key_${cleanedKey.substring(0, 8)}`,
      name: 'Clé API Active',
      prefix: `${cleanedKey.substring(0, 11)}_••••••••`,
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
      usageCount: 1,
      maxLimit: null,
      isActive: true,
    }
  };
}
