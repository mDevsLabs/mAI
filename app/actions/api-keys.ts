"use server";

import { getUserQuotaBoost } from "@/lib/tiers";
import { getSessionIdentity } from "@/lib/session-auth";
import { getDb, listApiKeys } from "@/lib/api-key-manager";

/**
 * Métadonnées d'usage API sûres pour les écrans compte.
 *
 * Contrat stable pour le coordinateur et les écrans compte :
 * - `keyRef` est le préfixe public exact servant à la sélection serveur ;
 * - aucun champ `key`, `apiKey`, `secretKey` ou segment secret n'est sérialisé.
 */
export interface UserApiKeyUsage {
  keyRef: string;
  name: string;
  plan: string;
  requestCount: number;
  createdAt: string;
  lastUsedAt: string | null;
  maxLimit: number | null;
  isActive: boolean;
}

export type GetUserApiUsageResult =
  | {
      success: true;
      apiBoost: number;
      keys: UserApiKeyUsage[];
    }
  | {
      success: false;
      error: string;
    };

export async function getUserApiUsage(): Promise<GetUserApiUsageResult> {
  try {
    const identity = await getSessionIdentity();
    if (!identity) {
      return { success: false, error: "Authentification requise." };
    }

    const keys = await listApiKeys(identity.userId);
    const database = getDb();
    const apiBoost = database ? await getUserQuotaBoost(database, identity.userId, "api") : 0;

    return {
      success: true,
      apiBoost,
      keys: keys.map((key) => ({
        keyRef: key.keyRef,
        name: key.name,
        plan: key.plan,
        requestCount: key.usageCount,
        createdAt: key.createdAt,
        lastUsedAt: key.lastUsedAt,
        maxLimit: key.maxLimit,
        isActive: key.isActive,
      })),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de l'usage API:", error);
    return { success: false, error: "Impossible de récupérer l'usage API" };
  }
}
