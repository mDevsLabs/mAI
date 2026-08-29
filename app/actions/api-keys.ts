"use server";

import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

import { getTierQuotaLimit, getUserQuotaBoost } from "@/lib/tiers";

// Fonction pour générer une clé API sécurisée au format : mai-TIER_USER-XXXXX-XXXXX
// 5 caractères majuscules/chiffres avant le -, puis 5 caractères majuscules ou minuscules
function generateApiKeyString(tier: string = "free"): string {
  const normalizedTier = ["free", "plus", "pro", "max"].includes(tier.toLowerCase().trim())
    ? tier.toLowerCase().trim()
    : "free";

  const part1Charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const part2Charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  let part1 = "";
  let part2 = "";
  const b1 = crypto.randomBytes(5);
  const b2 = crypto.randomBytes(5);
  for (let i = 0; i < 5; i++) part1 += part1Charset[b1[i] % part1Charset.length];
  for (let i = 0; i < 5; i++) part2 += part2Charset[b2[i] % part2Charset.length];

  return `mai-${normalizedTier}-${part1}-${part2}`;
}

export async function generateAndSaveApiKey(userId: string, plan: string = "Free") {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error("La variable d'environnement DATABASE_URL est manquante.");
    }
    
    const sql = neon(databaseUrl);
    const apiKey = generateApiKeyString(plan);
    
    // Sauvegarder la clé dans Neon
    await sql`
      INSERT INTO mprojects_api_keys (user_id, api_key, plan, request_count)
      VALUES (${userId}, ${apiKey}, ${plan}, 0)
    `;

    return {
      success: true,
      apiKey,
      message: "Clé générée avec succès"
    };
  } catch (error) {
    console.error("Erreur lors de la génération de la clé:", error);
    return {
      success: false,
      error: "Erreur lors de la création de la clé API"
    };
  }
}

export async function getUserApiUsage(userId: string) {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error("La variable d'environnement DATABASE_URL est manquante.");
    }
    
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
