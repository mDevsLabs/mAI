"use server";

import { neon } from "@neondatabase/serverless";

import { getUserQuotaBoost } from "@/lib/tiers";
import { getSessionIdentity } from "@/lib/session-auth";

export async function getUserApiUsage() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error("La variable d'environnement DATABASE_URL est manquante.");
    }

    const identity = await getSessionIdentity();
    if (!identity) {
      return {
        success: false,
        error: "Authentification requise."
      };
    }
    const userId = identity.userId;
    
    const sql = neon(databaseUrl);
    
    const keys = await sql`
      SELECT k.api_key, k.plan, k.request_count, k.created_at, k.last_used_at, k.max_limit
      FROM mprojects_api_keys k
      LEFT JOIN users u ON k.user_id = u.id::text OR k.user_id = u.username OR k.user_id = u.email
      WHERE k.user_id = ${userId}::text
         OR u.id::text = ${userId}::text
         OR u.username = ${userId}::text
         OR u.email = ${userId}::text
      ORDER BY k.created_at DESC
    `;

    const apiBoost = await getUserQuotaBoost(sql, userId, "api");

    return {
      success: true,
      apiBoost,
      keys: keys.map(k => ({
        key: k.api_key,
        plan: k.plan,
        requestCount: k.request_count,
        createdAt: k.created_at,
        lastUsedAt: k.last_used_at,
        maxLimit: k.max_limit
      }))
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de l'usage API:", error);
    return {
      success: false,
      error: "Impossible de récupérer l'usage API"
    };
  }
}
