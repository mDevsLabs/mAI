"use server";

import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

// Fonction pour générer une clé API sécurisée
function generateApiKeyString(): string {
  const prefix = "mai-";
  const randomStr = crypto.randomBytes(32).toString("hex");
  return `${prefix}${randomStr}`;
}

export async function generateAndSaveApiKey(userId: string, plan: string = "Free") {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error("La variable d'environnement DATABASE_URL est manquante.");
    }
    
    const sql = neon(databaseUrl);
    const apiKey = generateApiKeyString();
    
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

    return {
      success: true,
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
