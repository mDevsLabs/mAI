/**
 * ============================================================================
 * VIBE SOCIAL PLATFORM — USERS & PROFILES (vibe-users.ts)
 * User authentication, profile querying, avatar upload, follow graph & search
 * ============================================================================
 */

import type { Hono } from "npm:hono@4";
import {
  extractToken,
  getDb,
  verifyToken,
  getWeekData,
  getTierMaiTokenLimit,
  getTierDailyImageLimit,
} from "./config.ts";
import type { RegisterMultiFn } from "./vibe-common.ts";
import { selectStorageNode, uploadWithFallback } from "./storage.ts";
import { attachPollsAndCollabs, attachQuotedPosts, publishDuePosts } from "./vibe-posts-core.ts";
import { ensureCircleTable } from "./vibe-circle.ts";

export function registerVibeUsersRoutes(app: Hono, registerMulti: RegisterMultiFn) {
  // 1. CURRENT USER PROFILE & QUOTAS VIA JWT
  const handleMe = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id || (payload as any).userId);

      if (!userId || isNaN(userId)) {
        return c.json({ error: "Jeton JWT invalide." }, 401);
      }

      const sql = getDb();
      const userRows = await sql`
        SELECT u.id, u.username, u.email, u.tier, u.avatar_url,
               COALESCE(u.created_at, NOW()) as created_at,
               (COALESCE(u.is_verified, FALSE) OR LOWER(COALESCE(u.tier, '')) IN ('plus', 'pro', 'max')) as is_verified,
               pr.display_name, pr.bio, pr.banner_url, pr.interests, pr.followers_count, pr.following_count, pr.posts_count
        FROM users u
        LEFT JOIN profiles pr ON pr.user_id = u.id
        WHERE u.id = ${userId}
        LIMIT 1
      `;

      if (userRows.length === 0) {
        return c.json({ error: "Utilisateur introuvable." }, 404);
      }

      const row = userRows[0];
      const { weekStartStr, nextResetIso } = getWeekData();
      const [usageRows, imgRows] = await Promise.all([
        sql`SELECT COALESCE(SUM(tokens_used), 0) as tokens FROM weekly_usage WHERE user_id = ${userId} AND week_start = ${weekStartStr}::date`,
        sql`SELECT COALESCE(images_generated, 0) as images FROM daily_image_usage WHERE user_id = ${userId} AND usage_date = CURRENT_DATE`,
      ]);

      const tier = row.tier || "Free";
      const tokenLimit = getTierMaiTokenLimit(tier);
      const imageLimit = getTierDailyImageLimit(tier);
      const tokensUsed = Number(usageRows[0]?.tokens || 0);
      const imagesUsed = Number(imgRows[0]?.images || 0);

      const quotas = {
        tier,
        weeklyTokens: { used: tokensUsed, limit: tokenLimit, percent: Math.min(100, Math.round((tokensUsed / tokenLimit) * 100)) },
        dailyImages: { used: imagesUsed, limit: imageLimit, percent: Math.min(100, Math.round((imagesUsed / imageLimit) * 100)) },
        resetAt: nextResetIso,
      };

      return c.json({
        user: {
          id: row.id,
          username: row.username,
          email: row.email,
          tier: row.tier,
          avatar_url: row.avatar_url,
          is_verified: Boolean(row.is_verified),
          created_at: row.created_at,
        },
        profile: {
          id: row.id,
          username: row.username,
          displayName: row.display_name || row.username,
          bio: row.bio || "",
          avatarUrl: row.avatar_url,
          bannerUrl: row.banner_url,
          interests: row.interests || [],
          followersCount: row.followers_count || 0,
          followingCount: row.following_count || 0,
          postsCount: row.posts_count || 0,
          is_verified: Boolean(row.is_verified),
        },
        quotas,
      });
    } catch (err: any) {
      console.error("[Me Handler Error]:", err);
      return c.json({ error: err.message || "Session expirée ou invalide." }, 401);
    }
  };

  registerMulti("get", ["/api/vibe/me", "/vibe/me", "/v1/me", "/me"], handleMe);

  // 2. SUGGESTED USERS
  const handleSuggestedUsers = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      let currentUserId: number | null = null;
      if (token) {
        try {
          const payload = await verifyToken(token);
          currentUserId = Number(payload.sub || (payload as any).id);
        } catch {}
      }

      const sql = getDb();
      const rows = await sql`
        SELECT u.id, u.username, u.tier,
               (COALESCE(u.is_verified, FALSE) OR LOWER(COALESCE(u.tier, '')) IN ('plus', 'pro', 'max')) as is_verified,
               COALESCE(pr.display_name, u.username) as display_name,
               COALESCE(pr.avatar_url, u.avatar_url) as avatar_url,
               COALESCE(pr.bio, 'Membre Vibe') as bio,
               COALESCE(pr.followers_count, 0) as followers_count
        FROM users u
        LEFT JOIN profiles pr ON pr.user_id = u.id
        WHERE (${currentUserId ? sql`u.id != ${currentUserId}` : true})
        ORDER BY pr.followers_count DESC, u.id DESC
        LIMIT 5
      `;

      return c.json({ users: rows });
    } catch {
      return c.json({ users: [] });
    }
  };

  registerMulti("get", ["/api/vibe/users/suggested", "/vibe/users/suggested", "/v1/users/suggested", "/users/suggested"], handleSuggestedUsers);

  // 3. SEARCH USERS
  const handleSearchUsers = async (c: any) => {
    try {
      const q = (c.req.query("q") || "").trim().toLowerCase();
      if (!q || q.length < 1) return c.json({ users: [] });

      const sql = getDb();
      const users = await sql`
        SELECT
          u.id, u.username, u.tier,
          (COALESCE(u.is_verified, FALSE) OR LOWER(COALESCE(u.tier, '')) IN ('plus', 'pro', 'max')) as is_verified,
          pr.display_name, pr.avatar_url, pr.bio,
          pr.followers_count, pr.posts_count
        FROM users u
        LEFT JOIN profiles pr ON pr.user_id = u.id
        WHERE
          LOWER(u.username) LIKE ${`%${q}%`}
          OR LOWER(COALESCE(pr.display_name, '')) LIKE ${`%${q}%`}
        ORDER BY
          CASE WHEN LOWER(u.username) = ${q} THEN 0
               WHEN LOWER(u.username) LIKE ${`${q}%`} THEN 1
               ELSE 2 END,
          COALESCE(pr.followers_count, 0) DESC
        LIMIT 10
      `;
      return c.json({ users });
    } catch {
      return c.json({ users: [] });
    }
  };

  registerMulti("get", ["/api/vibe/search/users", "/vibe/search/users", "/v1/search/users"], handleSearchUsers);

  // 3b. ONBOARDING SUGGESTIONS (10 comptes populaires non suivis)
  const handleOnboardingSuggestions = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);
      const sql = getDb();
      const users = await sql`
        SELECT u.id, u.username, u.tier,
          (COALESCE(u.is_verified, FALSE) OR LOWER(COALESCE(u.tier, '')) IN ('plus', 'pro', 'max')) as is_verified,
          pr.display_name, pr.avatar_url, pr.bio, pr.followers_count
        FROM users u
        LEFT JOIN profiles pr ON pr.user_id = u.id
        WHERE u.id <> ${userId}
          AND u.id NOT IN (SELECT following_id FROM follows WHERE follower_id = ${userId})
          AND LOWER(u.username) NOT IN ('bot', 'mai')
        ORDER BY COALESCE(pr.followers_count, 0) DESC
        LIMIT 10
      `.catch(() => []);
      return c.json({ users });
    } catch (err: any) {
      return c.json({ error: "Erreur suggestions onboarding." }, 500);
    }
  };

  registerMulti("get", ["/api/vibe/onboarding/suggestions", "/vibe/onboarding/suggestions", "/v1/onboarding/suggestions", "/onboarding/suggestions"], handleOnboardingSuggestions);

  // 3c. ONBOARDING COMPLETE
  const handleOnboardingComplete = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);
      const sql = getDb();
      await sql`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE`.catch(() => {});
      await sql`
        INSERT INTO user_settings (user_id, onboarding_completed)
        VALUES (${userId}, TRUE)
        ON CONFLICT (user_id) DO UPDATE SET onboarding_completed = TRUE, updated_at = NOW()
      `;
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ error: "Erreur validation onboarding." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/onboarding/complete", "/vibe/onboarding/complete", "/v1/onboarding/complete", "/onboarding/complete"], handleOnboardingComplete);

  // 4. GET PROFILE
  const handleGetProfile = async (c: any) => {
    try {
      const rawParam = c.req.param("username") || "";
      const username = rawParam.toLowerCase().trim().replace(/^@/, "");
      const sql = getDb();

      let currentUserId: number | null = null;
      const token = extractToken(c.req.raw);
      if (token) {
        try {
          const payload = await verifyToken(token);
          currentUserId = Number(payload.sub || (payload as any).id);
        } catch {}
      }

      const userRows = await sql`
        SELECT u.id, u.username, u.email, u.tier, u.avatar_url,
               COALESCE(u.created_at, NOW()) as created_at,
               (COALESCE(u.is_verified, FALSE) OR LOWER(COALESCE(u.tier, '')) IN ('plus', 'pro', 'max')) as is_verified,
               pr.display_name, pr.bio, pr.banner_url, pr.interests, pr.followers_count, pr.following_count, pr.posts_count
        FROM users u
        LEFT JOIN profiles pr ON pr.user_id = u.id
        WHERE LOWER(u.username) = ${username}
        LIMIT 1
      `;

      if (userRows.length === 0) {
        return c.json({ error: "Profil introuvable." }, 404);
      }

      const row = userRows[0];
      let isFollowing = false;
      let blockedByMe = false;
      let blockedMe = false;
      let mutedByMe = false;
      if (currentUserId && currentUserId !== Number(row.id)) {
        try {
          const followRows = await sql`
            SELECT 1 FROM follows WHERE follower_id = ${currentUserId} AND following_id = ${row.id} LIMIT 1
          `;
          isFollowing = followRows.length > 0;
        } catch {}
        // Statuts sociaux pour l'UI (bannière de blocage, option « Masquer »)
        try {
          const socialRows = await sql`
            SELECT
              EXISTS (SELECT 1 FROM blocked_users WHERE user_id = ${currentUserId} AND blocked_user_id = ${row.id}) AS blocked_by_me,
              EXISTS (SELECT 1 FROM blocked_users WHERE user_id = ${row.id} AND blocked_user_id = ${currentUserId}) AS blocked_me,
              EXISTS (SELECT 1 FROM muted_users WHERE user_id = ${currentUserId} AND muted_user_id = ${row.id}) AS muted_by_me
          `;
          blockedByMe = Boolean(socialRows[0]?.blocked_by_me);
          blockedMe = Boolean(socialRows[0]?.blocked_me);
          mutedByMe = Boolean(socialRows[0]?.muted_by_me);
        } catch {}
      }

      let posts: any[] = [];
      try {
        // Publication paresseuse des vibes planifiées arrivées à échéance
        await publishDuePosts();
        await ensureCircleTable().catch(() => {});
        posts = await sql`
          SELECT p.*, pr.display_name, pr.avatar_url, u.username, u.tier,
                 (COALESCE(u.is_verified, FALSE) OR LOWER(COALESCE(u.tier, '')) IN ('plus', 'pro', 'max')) as is_verified,
                 ${currentUserId ? sql`(SELECT COUNT(*) FROM post_interactions WHERE post_id = p.id AND user_id = ${currentUserId} AND interaction_type = 'like') > 0` : sql`FALSE`} as has_liked,
                 ${currentUserId ? sql`(SELECT COUNT(*) FROM post_interactions WHERE post_id = p.id AND user_id = ${currentUserId} AND interaction_type = 'repost') > 0` : sql`FALSE`} as has_reposted,
                 ${currentUserId ? sql`(SELECT COUNT(*) FROM bookmarks WHERE post_id = p.id AND user_id = ${currentUserId}) > 0` : sql`FALSE`} as has_bookmarked
          FROM posts p
          JOIN users u ON u.id = p.author_id
          LEFT JOIN profiles pr ON pr.user_id = u.id
          WHERE p.author_id = ${row.id}
            AND (COALESCE(p.status, 'published') = 'published' OR ${currentUserId}::bigint = p.author_id)
            AND (
              p.visibility = 'public'
              OR ${currentUserId ? sql`p.author_id = ${currentUserId}
                OR (p.visibility = 'followers' AND EXISTS (SELECT 1 FROM follows f3 WHERE f3.follower_id = ${currentUserId} AND f3.following_id = p.author_id))
                OR (p.visibility = 'circle' AND EXISTS (SELECT 1 FROM circle_members cm3 WHERE cm3.user_id = p.author_id AND cm3.member_user_id = ${currentUserId}))` : sql`FALSE`}
            )
          ORDER BY p.is_pinned DESC, p.published_at DESC
          LIMIT 40
        `;

        // Charger tous les médias en une seule requête (évite le N+1)
        if (posts.length > 0) {
          const postIds = posts.map((p) => p.id);
          const allMedia = await sql`
            SELECT post_id, url, media_type, alt_text
            FROM media_assets
            WHERE post_id = ANY(${postIds}::uuid[])
          `;
          const mediaByPost = new Map<string, any[]>();
          for (const m of allMedia) {
            const key = String(m.post_id);
            if (!mediaByPost.has(key)) mediaByPost.set(key, []);
            mediaByPost.get(key)!.push({ url: m.url, media_type: m.media_type, alt_text: m.alt_text });
          }
          for (const p of posts) {
            p.media_assets = mediaByPost.get(String(p.id)) || [];
          }
        }
        await attachQuotedPosts(posts);
        await attachPollsAndCollabs(posts, currentUserId).catch(() => {});
      } catch (postErr: any) {
        console.error("[Get Profile] Erreur chargement posts:", postErr);
        posts = [];
      }

      return c.json({
        profile: {
          id: row.id,
          username: row.username,
          tier: row.tier || 'Free',
          displayName: row.display_name || row.username,
          bio: row.bio || "",
          avatarUrl: row.avatar_url,
          bannerUrl: row.banner_url,
          interests: row.interests || [],
          followersCount: row.followers_count || 0,
          followingCount: row.following_count || 0,
          postsCount: row.posts_count || posts.length,
          is_verified: Boolean(row.is_verified),
          isFollowing,
          blocked_by_me: blockedByMe,
          blocked_me: blockedMe,
          muted_by_me: mutedByMe,
        },
        posts,
      });
    } catch {
      return c.json({ error: "Erreur profil." }, 500);
    }
  };

  registerMulti("get", ["/api/vibe/profiles/:username", "/vibe/profiles/:username", "/v1/profiles/:username", "/profiles/:username", "/profile/:username"], handleGetProfile);

  // 4b. GET USER LIKED POSTS
  const handleGetUserLikedPosts = async (c: any) => {
    try {
      const rawParam = c.req.param("username") || "";
      const username = rawParam.toLowerCase().trim().replace(/^@/, "");
      const sql = getDb();

      let currentUserId: number | null = null;
      const token = extractToken(c.req.raw);
      if (token) {
        try {
          const payload = await verifyToken(token);
          currentUserId = Number(payload.sub || (payload as any).id);
        } catch {}
      }

      const userRows = await sql`
        SELECT id FROM users WHERE LOWER(username) = ${username} LIMIT 1
      `;
      if (userRows.length === 0) {
        return c.json({ error: "Utilisateur introuvable." }, 404);
      }
      const targetUserId = userRows[0].id;

      const posts = await sql`
        SELECT p.*, pr.display_name, pr.avatar_url, u.username, u.tier,
               (COALESCE(u.is_verified, FALSE) OR LOWER(COALESCE(u.tier, '')) IN ('plus', 'pro', 'max')) as is_verified,
               ${currentUserId ? sql`(SELECT COUNT(*) FROM post_interactions WHERE post_id = p.id AND user_id = ${currentUserId} AND interaction_type = 'like') > 0` : sql`FALSE`} as has_liked,
               ${currentUserId ? sql`(SELECT COUNT(*) FROM post_interactions WHERE post_id = p.id AND user_id = ${currentUserId} AND interaction_type = 'repost') > 0` : sql`FALSE`} as has_reposted,
               ${currentUserId ? sql`(SELECT COUNT(*) FROM bookmarks WHERE post_id = p.id AND user_id = ${currentUserId}) > 0` : sql`FALSE`} as has_bookmarked
        FROM post_interactions pi
        JOIN posts p ON p.id = pi.post_id
        JOIN users u ON u.id = p.author_id
        LEFT JOIN profiles pr ON pr.user_id = u.id
        WHERE pi.user_id = ${targetUserId} AND pi.interaction_type = 'like' AND p.visibility = 'public'
        ORDER BY pi.created_at DESC
        LIMIT 40
      `;

      if (posts.length > 0) {
        const postIds = posts.map((p) => p.id);
        const allMedia = await sql`
          SELECT post_id, url, media_type, alt_text
          FROM media_assets
          WHERE post_id = ANY(${postIds}::uuid[])
        `;
        const mediaByPost = new Map<string, any[]>();
        for (const m of allMedia) {
          const key = String(m.post_id);
          if (!mediaByPost.has(key)) mediaByPost.set(key, []);
          mediaByPost.get(key)!.push({ url: m.url, media_type: m.media_type, alt_text: m.alt_text });
        }
        for (const p of posts) {
          p.media_assets = mediaByPost.get(String(p.id)) || [];
        }
      }
      await attachQuotedPosts(posts);
      await attachPollsAndCollabs(posts, currentUserId).catch(() => {});

      return c.json({ posts });
    } catch (err: any) {
      console.error("[Get User Liked Posts] Erreur:", err);
      return c.json({ error: "Erreur récupération des likes." }, 500);
    }
  };

  registerMulti("get", [
    "/api/vibe/profiles/:username/likes",
    "/vibe/profiles/:username/likes",
    "/v1/profiles/:username/likes",
    "/profiles/:username/likes",
  ], handleGetUserLikedPosts);

  // 5. UPDATE PROFILE
  const handleUpdateProfile = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const body = await c.req.json();
      const { username, displayName, bio, interests, avatarUrl, bannerUrl } = body;
      const sql = getDb();

      // Vérifier et mettre à jour le nom d'utilisateur avec vérification stricte de non-duplication
      if (username !== undefined && username !== null) {
        const rawUser = String(username).trim();
        if (rawUser) {
          const cleanUser = rawUser.toLowerCase().replace(/^@/, "").replace(/[^a-z0-9_]/g, "").trim();
          if (cleanUser.length < 2) {
            return c.json(
              { error: "Le nom d'utilisateur doit contenir au moins 2 caractères (lettres, chiffres, _)." },
              400
            );
          }
          const taken = await sql`
            SELECT id FROM users
            WHERE LOWER(username) = ${cleanUser}
              AND id::text != ${String(userId)}
            LIMIT 1
          `;
          if (taken.length > 0) {
            return c.json({ error: "Ce nom d'utilisateur est déjà pris par un autre compte." }, 400);
          }
          await sql`UPDATE users SET username = ${cleanUser} WHERE id::text = ${String(userId)}`;
        }
      }

      if (avatarUrl) {
        await sql`UPDATE users SET avatar_url = ${avatarUrl} WHERE id = ${userId}`;
      }

      // Écriture réelle des champs fournis (les champs vides sont bien enregistrés
      // comme vides au lieu d'être ignorés par l'ancien COALESCE).
      const nextDisplayName = displayName !== undefined ? (displayName || null) : undefined;
      const nextBio = bio !== undefined ? (bio || null) : undefined;
      const nextInterests = interests !== undefined ? (Array.isArray(interests) ? interests : []) : undefined;
      const nextAvatarUrl = avatarUrl !== undefined ? (avatarUrl || null) : undefined;
      const nextBannerUrl = bannerUrl !== undefined ? (bannerUrl || null) : undefined;

      await sql`
        INSERT INTO profiles (user_id, display_name, bio, interests, avatar_url, banner_url)
        VALUES (
          ${userId},
          ${nextDisplayName !== undefined ? nextDisplayName : null},
          ${nextBio !== undefined ? nextBio : null},
          ${nextInterests !== undefined ? (nextInterests as string[]) : []},
          ${nextAvatarUrl !== undefined ? nextAvatarUrl : null},
          ${nextBannerUrl !== undefined ? nextBannerUrl : null}
        )
        ON CONFLICT (user_id)
        DO UPDATE SET
          display_name = ${nextDisplayName !== undefined ? nextDisplayName : sql`profiles.display_name`},
          bio = ${nextBio !== undefined ? nextBio : sql`profiles.bio`},
          interests = ${nextInterests !== undefined ? (nextInterests as string[]) : sql`profiles.interests`},
          avatar_url = ${nextAvatarUrl !== undefined ? nextAvatarUrl : sql`profiles.avatar_url`},
          banner_url = ${nextBannerUrl !== undefined ? nextBannerUrl : sql`profiles.banner_url`},
          updated_at = NOW()
      `;

      // Renvoyer le profil à jour (avec le username potentiellement modifié)
      const updated = await sql`
        SELECT u.username, u.avatar_url,
               (COALESCE(u.is_verified, FALSE) OR LOWER(COALESCE(u.tier, '')) IN ('plus', 'pro', 'max')) as is_verified,
               pr.display_name, pr.bio, pr.banner_url, pr.interests, pr.followers_count, pr.following_count, pr.posts_count
        FROM users u
        LEFT JOIN profiles pr ON pr.user_id = u.id
        WHERE u.id::text = ${String(userId)}
        LIMIT 1
      `;
      const r = updated[0] || {};

      return c.json({
        success: true,
        message: "Profil mis à jour.",
        profile: {
          username: r.username,
          displayName: r.display_name || r.username,
          bio: r.bio || "",
          avatarUrl: r.avatar_url,
          bannerUrl: r.banner_url,
          interests: r.interests || [],
          followersCount: r.followers_count || 0,
          followingCount: r.following_count || 0,
          postsCount: r.posts_count || 0,
          is_verified: Boolean(r.is_verified),
        },
      });
    } catch (err: any) {
      console.error("[Update Profile Error]:", err);
      return c.json({ error: "Erreur mise à jour profil." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/profile/update", "/vibe/profile/update", "/v1/profile/update"], handleUpdateProfile);

  // 6. UPDATE AVATAR
  const handleUpdateAvatar = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);
      const sql = getDb();

      let avatarUrl = "";

      try {
        const body = await c.req.parseBody();
        const file = body["avatar"] || body["file"];
        if (file instanceof File && file.size > 0) {
          const cleanFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const filename = `avatars/${userId}-${Date.now()}-${cleanFilename}`;
          const primaryNode = selectStorageNode(`avatar-${userId}`);
          const arrayBuffer = await file.arrayBuffer();
          const uploadResult = await uploadWithFallback(
            primaryNode,
            filename,
            arrayBuffer,
            { contentType: file.type || "image/jpeg", acl: "public-read" }
          );
          if (uploadResult.success) {
            avatarUrl = uploadResult.publicUrl;
          }
        }
      } catch {}

      if (!avatarUrl) {
        try {
          const json = await c.req.json();
          avatarUrl = json.avatarUrl || json.avatar_url || "";
        } catch {}
      }

      if (!avatarUrl) {
        return c.json({ error: "Fichier ou URL d'avatar requis." }, 400);
      }

      await sql`UPDATE users SET avatar_url = ${avatarUrl} WHERE id = ${userId}`;
      await sql`
        INSERT INTO profiles (user_id, avatar_url)
        VALUES (${userId}, ${avatarUrl})
        ON CONFLICT (user_id)
        DO UPDATE SET avatar_url = ${avatarUrl}, updated_at = NOW()
      `;

      return c.json({ success: true, avatarUrl, message: "Avatar synchronisé avec succès." });
    } catch (err: any) {
      console.error("[Update Avatar Error]:", err);
      return c.json({ error: "Erreur lors de la mise à jour de l'avatar." }, 500);
    }
  };

  // NB : /upload-avatar et /v1/upload-avatar sont gérés par registerStorageRoutes (storage.ts),
  // seule source de vérité pour l'upload d'avatar. Ici on ne garde que /profile/avatar
  // pour la mise à jour via URL JSON (multipart accepté aussi pour compat).
  registerMulti("post", ["/api/vibe/profile/avatar", "/vibe/profile/avatar", "/v1/profile/avatar"], handleUpdateAvatar);

  // 7. FOLLOW / UNFOLLOW
  const handleFollow = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const currentUserId = Number(payload.sub || (payload as any).id);
      const rawParam = c.req.param("username") || "";
      const targetUsername = rawParam.toLowerCase().trim().replace(/^@/, "");

      const sql = getDb();
      const targetUser = await sql`SELECT id FROM users WHERE LOWER(username) = ${targetUsername} LIMIT 1`;
      if (targetUser.length === 0) return c.json({ error: "Utilisateur introuvable." }, 404);
      const targetId = Number(targetUser[0].id);

      if (targetId === currentUserId) return c.json({ error: "Impossible de se suivre soi-même." }, 400);

      const existing = await sql`
        SELECT 1 FROM follows WHERE follower_id = ${currentUserId} AND following_id = ${targetId}
      `;

      if (existing.length > 0) {
        await sql`DELETE FROM follows WHERE follower_id = ${currentUserId} AND following_id = ${targetId}`;
        await sql`UPDATE profiles SET following_count = GREATEST(0, following_count - 1) WHERE user_id = ${currentUserId}`;
        await sql`UPDATE profiles SET followers_count = GREATEST(0, followers_count - 1) WHERE user_id = ${targetId}`;
        return c.json({ success: true, following: false });
      } else {
        // Blocage (dans un sens ou l'autre) : interdit de s'abonner
        try {
          const blockRows = await sql`
            SELECT 1 FROM blocked_users
            WHERE (user_id = ${currentUserId} AND blocked_user_id = ${targetId})
               OR (user_id = ${targetId} AND blocked_user_id = ${currentUserId})
            LIMIT 1
          `;
          if (blockRows.length > 0) {
            return c.json({ error: "Impossible de suivre ce compte : un blocage est actif.", blocked: true }, 403);
          }
        } catch {}

        await sql`INSERT INTO follows (follower_id, following_id) VALUES (${currentUserId}, ${targetId})`;
        await sql`UPDATE profiles SET following_count = following_count + 1 WHERE user_id = ${currentUserId}`;
        await sql`UPDATE profiles SET followers_count = followers_count + 1 WHERE user_id = ${targetId}`;

        try {
          await sql`
            INSERT INTO notifications (recipient_id, actor_id, type, message)
            VALUES (${targetId}, ${currentUserId}, 'follow', 'a commencé à vous suivre')
          `;
        } catch {}

        return c.json({ success: true, following: true });
      }
    } catch {
      return c.json({ error: "Erreur follow." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/profiles/:username/follow", "/vibe/profiles/:username/follow", "/v1/profiles/:username/follow"], handleFollow);

  // 7b. POST NOTIFICATIONS SUBSCRIPTION — être notifié des posts d'un compte
  const ensurePostSubscriptionsTable = async (sql: any) => {
    await sql`
      CREATE TABLE IF NOT EXISTS post_subscriptions (
        subscriber_id INTEGER NOT NULL,
        author_id INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (subscriber_id, author_id)
      )
    `;
  };

  // Statut d'abonnement aux notifications de posts d'un compte
  const handleGetSubscription = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const currentUserId = Number(payload.sub || (payload as any).id);
      const rawParam = c.req.param("username") || "";
      const targetUsername = rawParam.toLowerCase().trim().replace(/^@/, "");

      const sql = getDb();
      await ensurePostSubscriptionsTable(sql);
      const targetUser = await sql`SELECT id FROM users WHERE LOWER(username) = ${targetUsername} LIMIT 1`;
      if (targetUser.length === 0) return c.json({ error: "Utilisateur introuvable." }, 404);

      const rows = await sql`
        SELECT 1 FROM post_subscriptions
        WHERE subscriber_id = ${currentUserId} AND author_id = ${Number(targetUser[0].id)}
      `;
      return c.json({ success: true, subscribed: rows.length > 0 });
    } catch (err: any) {
      console.error("[vibe-users] Get subscription error:", err);
      return c.json({ error: "Erreur lecture abonnement." }, 500);
    }
  };
  registerMulti("get", ["/api/vibe/profiles/:username/subscribe", "/vibe/profiles/:username/subscribe", "/v1/profiles/:username/subscribe"], handleGetSubscription);

  // Toggle : s'abonner / se désabonner aux notifications de posts
  const handleToggleSubscription = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const currentUserId = Number(payload.sub || (payload as any).id);
      const rawParam = c.req.param("username") || "";
      const targetUsername = rawParam.toLowerCase().trim().replace(/^@/, "");

      const sql = getDb();
      await ensurePostSubscriptionsTable(sql);
      const targetUser = await sql`SELECT id FROM users WHERE LOWER(username) = ${targetUsername} LIMIT 1`;
      if (targetUser.length === 0) return c.json({ error: "Utilisateur introuvable." }, 404);
      const targetId = Number(targetUser[0].id);

      if (targetId === currentUserId) {
        return c.json({ error: "Impossible de s'abonner à ses propres posts." }, 400);
      }

      const existing = await sql`
        SELECT 1 FROM post_subscriptions WHERE subscriber_id = ${currentUserId} AND author_id = ${targetId}
      `;

      if (existing.length > 0) {
        await sql`DELETE FROM post_subscriptions WHERE subscriber_id = ${currentUserId} AND author_id = ${targetId}`;
        return c.json({ success: true, subscribed: false });
      } else {
        await sql`INSERT INTO post_subscriptions (subscriber_id, author_id) VALUES (${currentUserId}, ${targetId}) ON CONFLICT DO NOTHING`;
        return c.json({ success: true, subscribed: true });
      }
    } catch (err: any) {
      console.error("[vibe-users] Toggle subscription error:", err);
      return c.json({ error: "Erreur abonnement." }, 500);
    }
  };
  registerMulti("post", ["/api/vibe/profiles/:username/subscribe", "/vibe/profiles/:username/subscribe", "/v1/profiles/:username/subscribe"], handleToggleSubscription);

  // 8. MUTE / UNMUTE — masquage silencieux (l'autre compte n'est pas informé)
  // Table créée paresseusement ici + en migration 009 (idempotent).
  let socialTablesReady = false;
  const ensureSocialTables = async () => {
    if (socialTablesReady) return;
    try {
      const sql = getDb();
      await sql`
        CREATE TABLE IF NOT EXISTS muted_users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id BIGINT NOT NULL,
          muted_user_id BIGINT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE (user_id, muted_user_id)
        )
      `;
      socialTablesReady = true;
    } catch (err) {
      console.warn("[vibe-users] ensureSocialTables skipped:", (err as any)?.message);
    }
  };

  const handleMuteUser = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const currentUserId = Number(payload.sub || (payload as any).id);

      const rawParam = c.req.param("username") || "";
      const targetUsername = rawParam.toLowerCase().trim().replace(/^@/, "");
      const body = await c.req.json().catch(() => ({} as any));
      const muted = body.muted !== false; // défaut : masquer

      await ensureSocialTables();
      const sql = getDb();
      const targetUser = await sql`SELECT id FROM users WHERE LOWER(username) = ${targetUsername} LIMIT 1`;
      if (targetUser.length === 0) return c.json({ error: "Utilisateur introuvable." }, 404);
      const targetId = Number(targetUser[0].id);
      if (targetId === currentUserId) {
        return c.json({ error: "Impossible de se masquer soi-même." }, 400);
      }

      if (muted) {
        await sql`
          INSERT INTO muted_users (user_id, muted_user_id)
          VALUES (${currentUserId}, ${targetId})
          ON CONFLICT (user_id, muted_user_id) DO NOTHING
        `;
      } else {
        await sql`DELETE FROM muted_users WHERE user_id = ${currentUserId} AND muted_user_id = ${targetId}`;
      }
      return c.json({ success: true, muted });
    } catch (err: any) {
      console.error("[Mute User Error]:", err);
      return c.json({ error: "Erreur lors du masquage du compte." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/users/:username/mute", "/vibe/users/:username/mute", "/v1/users/:username/mute"], handleMuteUser);

  const handleListMuted = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const currentUserId = Number(payload.sub || (payload as any).id);

      await ensureSocialTables();
      const sql = getDb();
      const rows = await sql`
        SELECT m.id, m.muted_user_id, u.username AS muted_username,
               COALESCE(pr.display_name, u.username) AS muted_display_name,
               COALESCE(pr.avatar_url, u.avatar_url) AS muted_avatar_url,
               m.created_at
        FROM muted_users m
        JOIN users u ON u.id = m.muted_user_id
        LEFT JOIN profiles pr ON pr.user_id = u.id
        WHERE m.user_id = ${currentUserId}
        ORDER BY m.created_at DESC
      `;
      return c.json({ muted: rows });
    } catch (err: any) {
      console.error("[List Muted Error]:", err);
      return c.json({ muted: [] });
    }
  };

  registerMulti("get", ["/api/vibe/users/muted", "/vibe/users/muted", "/v1/users/muted"], handleListMuted);
}
