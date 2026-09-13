/**
 * ============================================================================
 * VIBE SOCIAL PLATFORM — COMMON HELPERS (vibe-common.ts)
 * Shared utilities for routes, JWT extraction & multi-alias registration
 * ============================================================================
 */

import type { Hono } from "npm:hono@4";
import { extractToken, getDb, verifyToken } from "./config.ts";

export type RegisterMultiFn = (
  method: "get" | "post" | "put" | "patch" | "delete",
  paths: string[],
  handler: (c: any) => Promise<any> | any
) => void;

/**
 * Creates a helper that registers multiple alias paths for a single route handler
 */
export function createRegisterMulti(app: Hono): RegisterMultiFn {
  return (
    method: "get" | "post" | "put" | "patch" | "delete",
    paths: string[],
    handler: (c: any) => Promise<any> | any
  ) => {
    for (const p of paths) {
      if (method === "get") app.get(p, handler);
      else if (method === "post") app.post(p, handler);
      else if (method === "put") app.put(p, handler);
      else if (method === "patch") app.patch(p, handler);
      else if (method === "delete") app.delete(p, handler);
    }
  };
}

/**
 * Extracts and verifies the JWT user ID from request headers
 */
export async function getAuthUserId(c: any): Promise<number | null> {
  try {
    const token = extractToken(c.req.raw);
    if (!token) return null;
    const payload = await verifyToken(token);
    const userId = Number(payload.sub || (payload as any).id || (payload as any).userId);
    if (!userId || isNaN(userId)) return null;
    return userId;
  } catch {
    return null;
  }
}

/**
 * Résout les identifiants d'auteurs à exclure des flux pour un utilisateur :
 * comptes qu'il masque (mute) + comptes bloqués dans les deux sens.
 * Retourne des listes vides en cas d'absence de table (migration 009 non
 * appliquée) ou de visiteur non connecté — le filtrage est alors simplement
 * désactivé côté serveur.
 */
export async function resolveHiddenUserIds(
  currentUserId: number | null
): Promise<{ mutedIds: number[]; blockedIds: number[] }> {
  if (!currentUserId) return { mutedIds: [], blockedIds: [] };
  try {
    const sql = getDb();
    const [mutedRows, blockedRows] = await Promise.all([
      sql`SELECT muted_user_id FROM muted_users WHERE user_id = ${currentUserId}`,
      sql`
        SELECT blocked_user_id FROM blocked_users WHERE user_id = ${currentUserId}
        UNION
        SELECT user_id FROM blocked_users WHERE blocked_user_id = ${currentUserId}
      `,
    ]);
    return {
      mutedIds: mutedRows.map((r: any) => Number(r.muted_user_id)).filter(Boolean),
      blockedIds: blockedRows.map((r: any) => Number(r.blocked_user_id)).filter(Boolean),
    };
  } catch {
    return { mutedIds: [], blockedIds: [] };
  }
}

/**
 * Blocage croisé : true si l'un des deux comptes a bloqué l'autre.
 * Utilisé pour couper les notifications (mentions, likes, réponses) entre
 * comptes bloqués — le blocage doit être visible et total.
 */
export async function isBlockEitherWay(userA: number, userB: number): Promise<boolean> {
  if (!userA || !userB || userA === userB) return false;
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT 1 FROM blocked_users
      WHERE (user_id = ${userA} AND blocked_user_id = ${userB})
         OR (user_id = ${userB} AND blocked_user_id = ${userA})
      LIMIT 1
    `;
    return rows.length > 0;
  } catch {
    return false;
  }
}
