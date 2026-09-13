/**
 * ============================================================================
 * VIBE SOCIAL PLATFORM — CIRCLE (vibe-circle.ts)
 * Cercle Privé : liste manuelle de membres autorisés à voir les posts
 * publiés avec visibility = 'circle' (à la manière des « proches amis »).
 *  - GET    /v1/circle            → membres de mon cercle
 *  - GET    /v1/circle/check/:username → suis-je... non : ce membre est-il dans MON cercle ?
 *  - POST   /v1/circle/:username  → ajouter au cercle
 *  - DELETE /v1/circle/:username  → retirer du cercle
 * ============================================================================
 */

import type { Hono } from "npm:hono@4";
import { extractToken, getDb, verifyToken } from "./config.ts";
import type { RegisterMultiFn } from "./vibe-common.ts";

let circleTableReady = false;

export async function ensureCircleTable() {
  if (circleTableReady) return;
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS user_circles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL DEFAULT 'Cercle Privé',
      description TEXT DEFAULT 'Personnes autorisées à voir mes Vibes privées',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, name)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS circle_members (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      member_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      circle_id INTEGER REFERENCES user_circles(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (user_id, member_user_id)
    )
  `;
  try {
    await sql`ALTER TABLE circle_members ADD COLUMN IF NOT EXISTS circle_id INTEGER REFERENCES user_circles(id) ON DELETE CASCADE`;
  } catch {}
  await sql`CREATE INDEX IF NOT EXISTS idx_user_circles_user ON user_circles(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_circle_member ON circle_members(member_user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_circle_user ON circle_members(user_id)`;
  circleTableReady = true;
}

export async function getOrCreateUserCircle(userId: number, name = 'Cercle Privé') {
  const sql = getDb();
  await ensureCircleTable();
  const existing = await sql`SELECT * FROM user_circles WHERE user_id = ${userId} AND name = ${name} LIMIT 1`;
  if (existing.length > 0) return existing[0];
  const inserted = await sql`
    INSERT INTO user_circles (user_id, name, description)
    VALUES (${userId}, ${name}, 'Personnes autorisées à voir mes Vibes privées')
    ON CONFLICT (user_id, name) DO UPDATE SET updated_at = NOW()
    RETURNING *
  `;
  return inserted[0];
}

export function registerVibeCircleRoutes(app: Hono, registerMulti: RegisterMultiFn) {
  // Mon cercle (liste de membres & métadonnées du cercle en base)
  const handleGetCircle = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const sql = getDb();
      await ensureCircleTable();
      const circle = await getOrCreateUserCircle(userId);
      const rows = await sql`
        SELECT u.id, u.username, u.is_verified, u.tier,
               p.display_name, p.avatar_url, cm.created_at AS added_at
        FROM circle_members cm
        JOIN users u ON u.id = cm.member_user_id
        LEFT JOIN profiles p ON p.user_id = u.id
        WHERE cm.user_id = ${userId}
        ORDER BY cm.created_at DESC
        LIMIT 500
      `;
      return c.json({ circle, members: rows });
    } catch (err: any) {
      console.error("[vibe-circle] get circle error:", err);
      return c.json({ error: "Erreur chargement du cercle." }, 500);
    }
  };

  registerMulti("get", ["/api/vibe/circle", "/vibe/circle", "/v1/circle"], handleGetCircle);

  // Le membre @username est-il dans MON cercle ? (état du bouton sur les profils)
  const handleCheckCircle = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);
      const username = String(c.req.param("username") || "").replace(/^@/, "").trim();
      if (!username) return c.json({ error: "Nom d'utilisateur requis." }, 400);

      const sql = getDb();
      await ensureCircleTable();
      const rows = await sql`
        SELECT 1 FROM circle_members cm
        JOIN users u ON u.id = cm.member_user_id
        WHERE cm.user_id = ${userId} AND LOWER(u.username) = LOWER(${username})
        LIMIT 1
      `;
      return c.json({ in_circle: rows.length > 0 });
    } catch (err: any) {
      return c.json({ error: "Erreur vérification du cercle." }, 500);
    }
  };

  registerMulti("get", ["/api/vibe/circle/check/:username", "/vibe/circle/check/:username", "/v1/circle/check/:username"], handleCheckCircle);

  // Ajouter un membre au cercle
  const handleAddCircle = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);
      const username = String(c.req.param("username") || "").replace(/^@/, "").trim();
      if (!username) return c.json({ error: "Nom d'utilisateur requis." }, 400);

      const sql = getDb();
      await ensureCircleTable();
      const target = await sql`SELECT id FROM users WHERE LOWER(username) = LOWER(${username}) LIMIT 1`;
      if (target.length === 0) return c.json({ error: "Utilisateur introuvable." }, 404);
      const memberId = Number(target[0].id);
      if (memberId === userId) return c.json({ error: "Vous ne pouvez pas vous ajouter vous-même." }, 400);

      const circle = await getOrCreateUserCircle(userId);
      await sql`
        INSERT INTO circle_members (user_id, member_user_id, circle_id)
        VALUES (${userId}, ${memberId}, ${circle.id})
        ON CONFLICT (user_id, member_user_id) DO UPDATE SET circle_id = EXCLUDED.circle_id
      `;
      await sql`UPDATE user_circles SET updated_at = NOW() WHERE id = ${circle.id}`;
      return c.json({ success: true, in_circle: true, circle_id: circle.id });
    } catch (err: any) {
      console.error("[vibe-circle] add error:", err);
      return c.json({ error: "Erreur ajout au cercle." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/circle/:username", "/vibe/circle/:username", "/v1/circle/:username"], handleAddCircle);

  // Retirer un membre du cercle
  const handleRemoveCircle = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);
      const username = String(c.req.param("username") || "").replace(/^@/, "").trim();
      if (!username) return c.json({ error: "Nom d'utilisateur requis." }, 400);

      const sql = getDb();
      await ensureCircleTable();
      const target = await sql`SELECT id FROM users WHERE LOWER(username) = LOWER(${username}) LIMIT 1`;
      if (target.length === 0) return c.json({ error: "Utilisateur introuvable." }, 404);

      const circle = await getOrCreateUserCircle(userId);
      await sql`DELETE FROM circle_members WHERE user_id = ${userId} AND member_user_id = ${Number(target[0].id)}`;
      await sql`UPDATE user_circles SET updated_at = NOW() WHERE id = ${circle.id}`;
      return c.json({ success: true, in_circle: false });
    } catch (err: any) {
      console.error("[vibe-circle] remove error:", err);
      return c.json({ error: "Erreur retrait du cercle." }, 500);
    }
  };

  registerMulti("delete", ["/api/vibe/circle/:username", "/vibe/circle/:username", "/v1/circle/:username"], handleRemoveCircle);
}
