/**
 * ============================================================================
 * VIBE SOCIAL PLATFORM — SETTINGS & PRIVACY (vibe-settings.ts)
 * User settings management, usage logging & GDPR data export
 * ============================================================================
 */

import type { Hono } from "npm:hono@4";
import { extractToken, getDb, verifyToken, getWeekData } from "./config.ts";
import type { RegisterMultiFn } from "./vibe-common.ts";

export function registerVibeSettingsRoutes(app: Hono, registerMulti: RegisterMultiFn) {
  // Colonnes de personnalisation ajoutées paresseusement (idempotent)
  let personalizationColumnsReady = false;
  const ensurePersonalizationColumns = async () => {
    if (personalizationColumnsReady) return;
    try {
      const sql = getDb();
      await sql`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS accent_color TEXT`;
      await sql`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS font_size TEXT`;
      await sql`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS mai_auto_approve_tools BOOLEAN DEFAULT FALSE`;
      personalizationColumnsReady = true;
    } catch (err) {
      console.warn("[vibe-settings] ensurePersonalizationColumns skipped:", (err as any)?.message);
    }
  };

  // 1. USAGE LOGGING
  const handleLogUsage = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ success: true, logged: false });
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);
      if (!userId) return c.json({ success: true, logged: false });

      const body = await c.req.json().catch(() => ({}));
      const { endpoint = "api_call", tokens = 10, action_type = "request" } = body;

      const sql = getDb();
      const { weekStartStr } = getWeekData();

      await Promise.all([
        sql`
          INSERT INTO weekly_usage (user_id, week_start, tokens_used)
          VALUES (${userId}, ${weekStartStr}::date, ${tokens})
          ON CONFLICT (user_id, week_start)
          DO UPDATE SET tokens_used = weekly_usage.tokens_used + ${tokens}, updated_at = NOW()
        `,
        sql`
          INSERT INTO usage_logs (user_id, action_type, endpoint, metadata, tokens_used, timestamp)
          VALUES (${userId}, ${action_type}, ${endpoint}, ${JSON.stringify({ endpoint, timestamp: new Date().toISOString() })}::jsonb, ${tokens}, NOW())
        `.catch(() => {}),
      ]);

      return c.json({ success: true, logged: true });
    } catch (err: any) {
      return c.json({ success: false, error: err.message });
    }
  };

  registerMulti("post", ["/api/vibe/usage/log", "/vibe/usage/log", "/v1/usage/log", "/usage/log"], handleLogUsage);

  // 2. GET SETTINGS
  const handleSettings = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const sql = getDb();
      const rows = await sql`SELECT * FROM user_settings WHERE user_id = ${userId} LIMIT 1`;
      return c.json({ settings: rows[0] || {} });
    } catch (err: any) {
      return c.json({ error: "Erreur paramètres." }, 500);
    }
  };

  registerMulti("get", ["/api/vibe/settings", "/vibe/settings", "/v1/settings"], handleSettings);

  // 3. UPDATE SETTINGS
  const handleUpdateSettings = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const body = await c.req.json();
      const sql = getDb();
      await ensurePersonalizationColumns();

      await sql`
        INSERT INTO user_settings (
          user_id, email_notifications, push_notifications, notify_on_like,
          notify_on_repost, notify_on_reply, notify_on_dm, content_filter_level,
          blur_sensitive_content, age_restriction_enabled, allow_dms, dms_enabled,
          feed_default_mode, hide_reposts, blocked_keywords, two_factor_auth, allow_mentions,
          theme_preference, accent_color, font_size, mai_auto_approve_tools
        )
        VALUES (
          ${userId},
          ${body.email_notifications ?? true},
          ${body.push_notifications ?? true},
          ${body.notify_on_like ?? true},
          ${body.notify_on_repost ?? true},
          ${body.notify_on_reply ?? true},
          ${body.notify_on_dm ?? true},
          ${body.content_filter_level || 'medium'},
          ${body.blur_sensitive_content ?? true},
          ${body.age_restriction_enabled ?? false},
          ${body.allow_dms || 'everyone'},
          ${body.dms_enabled ?? true},
          ${body.feed_default_mode || 'for_you'},
          ${body.hide_reposts ?? false},
          ${body.blocked_keywords || []},
          ${body.two_factor_auth ?? false},
          ${body.allow_mentions || 'everyone'},
          ${body.theme_preference || 'light'},
          ${body.accent_color || null},
          ${body.font_size || null},
          ${body.mai_auto_approve_tools ?? false}
        )
        ON CONFLICT (user_id)
        DO UPDATE SET
          email_notifications = CASE WHEN ${body.email_notifications !== undefined} THEN EXCLUDED.email_notifications ELSE user_settings.email_notifications END,
          push_notifications = CASE WHEN ${body.push_notifications !== undefined} THEN EXCLUDED.push_notifications ELSE user_settings.push_notifications END,
          notify_on_like = CASE WHEN ${body.notify_on_like !== undefined} THEN EXCLUDED.notify_on_like ELSE user_settings.notify_on_like END,
          notify_on_repost = CASE WHEN ${body.notify_on_repost !== undefined} THEN EXCLUDED.notify_on_repost ELSE user_settings.notify_on_repost END,
          notify_on_reply = CASE WHEN ${body.notify_on_reply !== undefined} THEN EXCLUDED.notify_on_reply ELSE user_settings.notify_on_reply END,
          notify_on_dm = CASE WHEN ${body.notify_on_dm !== undefined} THEN EXCLUDED.notify_on_dm ELSE user_settings.notify_on_dm END,
          content_filter_level = CASE WHEN ${body.content_filter_level !== undefined} THEN EXCLUDED.content_filter_level ELSE user_settings.content_filter_level END,
          blur_sensitive_content = CASE WHEN ${body.blur_sensitive_content !== undefined} THEN EXCLUDED.blur_sensitive_content ELSE user_settings.blur_sensitive_content END,
          age_restriction_enabled = CASE WHEN ${body.age_restriction_enabled !== undefined} THEN EXCLUDED.age_restriction_enabled ELSE user_settings.age_restriction_enabled END,
          allow_dms = CASE WHEN ${body.allow_dms !== undefined || body.allow_dms_from !== undefined} THEN EXCLUDED.allow_dms ELSE user_settings.allow_dms END,
          dms_enabled = CASE WHEN ${body.dms_enabled !== undefined} THEN EXCLUDED.dms_enabled ELSE user_settings.dms_enabled END,
          feed_default_mode = CASE WHEN ${body.feed_default_mode !== undefined} THEN EXCLUDED.feed_default_mode ELSE user_settings.feed_default_mode END,
          hide_reposts = CASE WHEN ${body.hide_reposts !== undefined} THEN EXCLUDED.hide_reposts ELSE user_settings.hide_reposts END,
          blocked_keywords = CASE WHEN ${body.blocked_keywords !== undefined} THEN EXCLUDED.blocked_keywords ELSE user_settings.blocked_keywords END,
          two_factor_auth = CASE WHEN ${body.two_factor_auth !== undefined} THEN EXCLUDED.two_factor_auth ELSE user_settings.two_factor_auth END,
          allow_mentions = CASE WHEN ${body.allow_mentions !== undefined} THEN EXCLUDED.allow_mentions ELSE user_settings.allow_mentions END,
          theme_preference = CASE WHEN ${body.theme_preference !== undefined} THEN EXCLUDED.theme_preference ELSE user_settings.theme_preference END,
          accent_color = CASE WHEN ${body.accent_color !== undefined} THEN EXCLUDED.accent_color ELSE user_settings.accent_color END,
          font_size = CASE WHEN ${body.font_size !== undefined} THEN EXCLUDED.font_size ELSE user_settings.font_size END,
          mai_auto_approve_tools = CASE WHEN ${body.mai_auto_approve_tools !== undefined} THEN EXCLUDED.mai_auto_approve_tools ELSE user_settings.mai_auto_approve_tools END,
          updated_at = NOW()
      `;

      return c.json({ success: true, message: "Paramètres mis à jour avec succès." });
    } catch (err: any) {
      console.error("[Update Settings Error]:", err);
      return c.json({ error: "Erreur mise à jour paramètres." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/settings/update", "/vibe/settings/update", "/v1/settings/update"], handleUpdateSettings);

  // 4. PRIVACY — DATA EXPORT
  const handlePrivacyExport = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const sql = getDb();

      const [userRows, profileRows, postRows, settingsRows, followersRows, followingRows] = await Promise.all([
        sql`SELECT id, username, email, tier, created_at FROM users WHERE id = ${userId} LIMIT 1`,
        sql`SELECT display_name, bio, avatar_url, banner_url, interests, followers_count, following_count, posts_count FROM profiles WHERE user_id = ${userId} LIMIT 1`,
        sql`SELECT id, content, format, visibility, likes_count, reposts_count, replies_count, published_at FROM posts WHERE author_id = ${userId} ORDER BY published_at DESC LIMIT 200`,
        sql`SELECT email_notifications, push_notifications, content_filter_level, allow_dms, allow_mentions, feed_default_mode, hide_reposts, blocked_keywords, two_factor_auth FROM user_settings WHERE user_id = ${userId} LIMIT 1`,
        sql`SELECT u.username FROM follows f JOIN users u ON u.id = f.following_id WHERE f.follower_id = ${userId} LIMIT 500`,
        sql`SELECT u.username FROM follows f JOIN users u ON u.id = f.follower_id WHERE f.following_id = ${userId} LIMIT 500`,
      ]);

      return c.json({
        success: true,
        export_date: new Date().toISOString(),
        user: userRows[0] || null,
        profile: profileRows[0] || null,
        settings: settingsRows[0] || null,
        posts: postRows,
        following: followingRows.map((r: any) => r.username),
        followers: followersRows.map((r: any) => r.username),
        posts_count: postRows.length,
        following_count: followingRows.length,
        followers_count: followersRows.length,
      });
    } catch (err: any) {
      console.error("[Privacy Export Error]:", err);
      return c.json({ error: "Erreur lors de l'export des données." }, 500);
    }
  };

  registerMulti("get", ["/api/vibe/privacy/export", "/vibe/privacy/export", "/v1/privacy/export"], handlePrivacyExport);
}
