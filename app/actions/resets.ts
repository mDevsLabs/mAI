"use server";

import { neon } from "@neondatabase/serverless";

export interface AvailableResetItem {
  id: number;
  resetType: "all" | "api" | "mai" | "images" | "audio";
  expiresAt: string | null;
  createdAt: string;
}

export async function getUserAvailableResets(userId: string): Promise<{
  success: boolean;
  resets: AvailableResetItem[];
  error?: string;
}> {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return { success: true, resets: [] };
    }

    const sql = neon(databaseUrl);

    // Initialisation opportuniste de la table si elle n'existe pas encore
    await sql`
      CREATE TABLE IF NOT EXISTS user_pending_resets (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        reset_type VARCHAR(50) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'available',
        used_at TIMESTAMP WITH TIME ZONE NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `.catch(() => {});

    // Récupérer les identifiants alternatifs (id, username, email)
    const uRows = await sql`
      SELECT id, username, email 
      FROM users 
      WHERE id::text = ${userId}::text OR username = ${userId}::text OR email = ${userId}::text 
      LIMIT 1
    `.catch(() => []);

    const targetUserIds = [userId];
    if (uRows.length > 0) {
      if (uRows[0].id) targetUserIds.push(String(uRows[0].id));
      if (uRows[0].username) targetUserIds.push(String(uRows[0].username));
      if (uRows[0].email) targetUserIds.push(String(uRows[0].email));
    }

    const rows = await sql`
      SELECT id, reset_type, expires_at, created_at
      FROM user_pending_resets
      WHERE user_id = ANY(${targetUserIds})
        AND status = 'available'
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC
    `;

    return {
      success: true,
      resets: rows.map((r: any) => ({
        id: r.id,
        resetType: r.reset_type as AvailableResetItem["resetType"],
        expiresAt: r.expires_at ? new Date(r.expires_at).toISOString() : null,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      })),
    };
  } catch (err: any) {
    console.error("Erreur lors de la récupération des réinitialisations:", err);
    return {
      success: false,
      resets: [],
      error: "Impossible de récupérer les réinitialisations disponibles.",
    };
  }
}

export async function claimUserReset(userId: string, resetId: number): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  resetType?: string;
}> {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return { success: false, error: "Base de données non accessible." };
    }

    const sql = neon(databaseUrl);

    // Vérifier l'utilisateur
    const uRows = await sql`
      SELECT id, username, email 
      FROM users 
      WHERE id::text = ${userId}::text OR username = ${userId}::text OR email = ${userId}::text 
      LIMIT 1
    `;

    const targetUserIds = [userId];
    if (uRows.length > 0) {
      if (uRows[0].id) targetUserIds.push(String(uRows[0].id));
      if (uRows[0].username) targetUserIds.push(String(uRows[0].username));
      if (uRows[0].email) targetUserIds.push(String(uRows[0].email));
    }

    // Récupérer la réinitialisation
    const resetRows = await sql`
      SELECT id, user_id, reset_type, expires_at, status
      FROM user_pending_resets
      WHERE id = ${resetId}
        AND user_id = ANY(${targetUserIds})
      LIMIT 1
    `;

    if (resetRows.length === 0) {
      return { success: false, error: "Réinitialisation introuvable ou non autorisée." };
    }

    const reset = resetRows[0];
    if (reset.status !== "available") {
      return { success: false, error: "Cette réinitialisation a déjà été utilisée." };
    }

    if (reset.expires_at && new Date(reset.expires_at) < new Date()) {
      await sql`UPDATE user_pending_resets SET status = 'expired' WHERE id = ${resetId}`;
      return { success: false, error: "Cette réinitialisation a expiré." };
    }

    const resetType = reset.reset_type;

    // Appliquer la remise à 0 en fonction du type
    if (resetType === "all" || resetType === "api") {
      await sql`
        UPDATE mprojects_api_keys
        SET request_count = 0
        WHERE user_id = ANY(${targetUserIds})
      `;
    }

    if (resetType === "all" || resetType === "mai") {
      await sql`
        UPDATE weekly_usage
        SET tokens_used = 0
        WHERE user_id = ANY(${targetUserIds})
      `;
    }

    if (resetType === "all" || resetType === "images") {
      await sql`
        UPDATE mprojects_daily_image_usage
        SET images_generated = 0, updated_at = NOW()
        WHERE user_id = ANY(${targetUserIds})
          AND usage_date = CURRENT_DATE
      `;
    }

    if (resetType === "all" || resetType === "audio") {
      await sql`
        UPDATE weekly_speech_usage
        SET tokens_used = 0, requests_count = 0
        WHERE user_id = ANY(${targetUserIds})
      `;
    }

    // Marquer la réinitialisation comme consommée
    await sql`
      UPDATE user_pending_resets
      SET status = 'used', used_at = NOW()
      WHERE id = ${resetId}
    `;

    const labels: Record<string, string> = {
      all: "L'ensemble de vos quotas",
      api: "Votre quota d'API",
      mai: "Votre quota de tokens mAI",
      images: "Votre quota journalier d'images",
      audio: "Votre quota de synthèse vocale Audio",
    };

    return {
      success: true,
      resetType,
      message: `${labels[resetType] || "Votre quota"} a été réinitialisé à 0 avec succès !`,
    };
  } catch (err: any) {
    console.error("Erreur claimUserReset:", err);
    return {
      success: false,
      error: "Une erreur est survenue lors de la réinitialisation.",
    };
  }
}
