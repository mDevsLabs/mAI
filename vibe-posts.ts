/**
 * ============================================================================
 * VIBE SOCIAL PLATFORM — POSTS & FEED (vibe-posts.ts)
 * Feed recommendation, real trends, post creation, likes, reposts & comments
 * ============================================================================
 */

import type { Hono } from "npm:hono@4";
import { extractToken, getDb, rateLimit, verifyToken } from "./config.ts";
import type { RegisterMultiFn } from "./vibe-common.ts";
import { HybridRecommender } from "./vibe-recommender.ts";
import { MAIAgentFleet } from "./vibe-mai-fleet.ts";

export function registerVibePostsRoutes(app: Hono, registerMulti: RegisterMultiFn) {
  // 1. TIMELINE FEED
  const handleFeed = async (c: any) => {
    try {
      const type = c.req.query("type") || "for_you";
      const token = extractToken(c.req.raw);
      let currentUserId: number | null = null;
      if (token) {
        try {
          const payload = await verifyToken(token);
          currentUserId = Number(payload.sub || (payload as any).id);
        } catch {}
      }

      const sql = getDb();

      // Pagination par curseur : soit keyset chronologique "ts|id", soit
      // rang dans une liste scorée "rank:N" (trending / pour vous).
      const PAGE_SIZE = 20;
      const rawCursor = (c.req.query("cursor") || "").trim();
      const parseKeyset = (cur: string): { ts: string; id: string } | null => {
        const [ts, id] = cur.split("|");
        if (!ts || !id || Number.isNaN(Date.parse(ts))) return null;
        return { ts, id };
      };
      const parseRank = (cur: string): number | null => {
        const m = cur.match(/^rank:(\d+)$/);
        return m ? Number(m[1]) : null;
      };

      const fetchMedia = async (posts: any[]) => {
        if (!posts || posts.length === 0) return;
        try {
          const ids = posts.map((p) => p.id);
          const media = await sql`SELECT post_id, url, media_type, alt_text FROM media_assets WHERE post_id = ANY(${ids}::uuid[])`;
          const byPost: Record<string, any[]> = {};
          for (const m of media) {
            const key = String(m.post_id);
            (byPost[key] ||= []).push({ url: m.url, media_type: m.media_type, alt_text: m.alt_text });
          }
          for (const p of posts) p.media_assets = byPost[String(p.id)] || [];
        } catch (mediaErr) {
          console.warn("[Vibe API] Erreur fetchMedia:", mediaErr);
          for (const p of posts) p.media_assets ||= [];
        }
      };

      if (type === "trending") {
        const tag = (c.req.query("tag") || "").trim();
        const rankOffset = rawCursor ? parseRank(rawCursor) ?? 0 : 0;
        let posts;
        if (tag) {
          posts = await sql`
            SELECT p.*, pr.display_name, pr.avatar_url, u.username, u.tier,
                   (COALESCE(u.is_verified, FALSE) OR LOWER(COALESCE(u.tier, '')) IN ('plus', 'pro', 'max')) as is_verified,
                   ${currentUserId ? sql`(SELECT COUNT(*) FROM post_interactions WHERE post_id = p.id AND user_id = ${currentUserId} AND interaction_type = 'like') > 0` : sql`FALSE`} as has_liked,
                   ${currentUserId ? sql`(SELECT COUNT(*) FROM post_interactions WHERE post_id = p.id AND user_id = ${currentUserId} AND interaction_type = 'repost') > 0` : sql`FALSE`} as has_reposted,
                   ${currentUserId ? sql`(SELECT COUNT(*) FROM bookmarks WHERE post_id = p.id AND user_id = ${currentUserId}) > 0` : sql`FALSE`} as has_bookmarked
            FROM posts p
            JOIN users u ON u.id = p.author_id
            LEFT JOIN profiles pr ON pr.user_id = u.id
            WHERE p.visibility = 'public' AND p.content ILIKE ('%' || ${tag} || '%')
            ORDER BY (p.likes_count * 3 + p.reposts_count * 2 + p.replies_count * 2) DESC, p.published_at DESC
            LIMIT ${PAGE_SIZE} OFFSET ${rankOffset}
          `;
        } else {
          posts = await sql`
            SELECT p.*, pr.display_name, pr.avatar_url, u.username, u.tier,
                   (COALESCE(u.is_verified, FALSE) OR LOWER(COALESCE(u.tier, '')) IN ('plus', 'pro', 'max')) as is_verified,
                   ${currentUserId ? sql`(SELECT COUNT(*) FROM post_interactions WHERE post_id = p.id AND user_id = ${currentUserId} AND interaction_type = 'like') > 0` : sql`FALSE`} as has_liked,
                   ${currentUserId ? sql`(SELECT COUNT(*) FROM post_interactions WHERE post_id = p.id AND user_id = ${currentUserId} AND interaction_type = 'repost') > 0` : sql`FALSE`} as has_reposted,
                   ${currentUserId ? sql`(SELECT COUNT(*) FROM bookmarks WHERE post_id = p.id AND user_id = ${currentUserId}) > 0` : sql`FALSE`} as has_bookmarked
            FROM posts p
            JOIN users u ON u.id = p.author_id
            LEFT JOIN profiles pr ON pr.user_id = u.id
            WHERE p.visibility = 'public'
            ORDER BY (p.likes_count * 3 + p.reposts_count * 2 + p.replies_count * 2) DESC, p.published_at DESC
            LIMIT ${PAGE_SIZE} OFFSET ${rankOffset}
          `;
        }

        await fetchMedia(posts);

        return c.json({
          mode: "trending",
          title: tag ? `Tendances : ${tag}` : "Tendances Populaires",
          count: posts.length,
          nextCursor: posts.length === PAGE_SIZE ? `rank:${rankOffset + PAGE_SIZE}` : null,
          posts,
        });
      }

      if (type === "stream" || type === "following") {
        // Keyset pagination : (published_at, id) < (ts, id) — stable et indexable
        const keyset = rawCursor ? parseKeyset(rawCursor) : null;
        const cursorFilter = (uid: number | null) =>
          keyset
            ? sql`AND (p.published_at, p.id) < (${keyset.ts}::timestamptz, ${keyset.id}::uuid)`
            : sql``;
        let posts;
        if (currentUserId) {
          posts = await sql`
            SELECT p.*, pr.display_name, pr.avatar_url, u.username, u.tier,
                   (COALESCE(u.is_verified, FALSE) OR LOWER(COALESCE(u.tier, '')) IN ('plus', 'pro', 'max')) as is_verified,
                   (SELECT COUNT(*) FROM post_interactions WHERE post_id = p.id AND user_id = ${currentUserId} AND interaction_type = 'like') > 0 as has_liked,
                   (SELECT COUNT(*) FROM post_interactions WHERE post_id = p.id AND user_id = ${currentUserId} AND interaction_type = 'repost') > 0 as has_reposted,
                   (SELECT COUNT(*) FROM bookmarks WHERE post_id = p.id AND user_id = ${currentUserId}) > 0 as has_bookmarked
            FROM posts p
            JOIN users u ON u.id = p.author_id
            LEFT JOIN profiles pr ON pr.user_id = u.id
            WHERE (
              p.author_id = ${currentUserId}
              OR p.author_id IN (SELECT following_id FROM follows WHERE follower_id = ${currentUserId})
              OR p.visibility = 'public'
            ) ${cursorFilter(currentUserId)}
            ORDER BY p.published_at DESC, p.id DESC
            LIMIT ${PAGE_SIZE}
          `;
        } else {
          posts = await sql`
            SELECT p.*, pr.display_name, pr.avatar_url, u.username, u.tier,
                   (COALESCE(u.is_verified, FALSE) OR LOWER(COALESCE(u.tier, '')) IN ('plus', 'pro', 'max')) as is_verified,
                   FALSE as has_liked, FALSE as has_reposted, FALSE as has_bookmarked
            FROM posts p
            JOIN users u ON u.id = p.author_id
            LEFT JOIN profiles pr ON pr.user_id = u.id
            WHERE p.visibility = 'public' ${cursorFilter(currentUserId)}
            ORDER BY p.published_at DESC, p.id DESC
            LIMIT ${PAGE_SIZE}
          `;
        }

        await fetchMedia(posts);

        const last = posts[posts.length - 1];
        return c.json({
          mode: "stream",
          title: "Abonnements",
          count: posts.length,
          nextCursor:
            posts.length === PAGE_SIZE && last
              ? `${new Date(last.published_at).toISOString()}|${last.id}`
              : null,
          posts,
        });
      }

      // "Pour Vous" — Algorithme de recommandation sophistiqué
      let followedAuthorIds = new Set<number>();
      let affinityByAuthor = new Map<number, number>();
      let blockedKeywords: string[] = [];
      let shouldHideReposts = false;

      if (currentUserId) {
        try {
          const [followsRows, settingsRows, affinityRows] = await Promise.all([
            sql`SELECT following_id FROM follows WHERE follower_id = ${currentUserId}`,
            sql`SELECT blocked_keywords, hide_reposts FROM user_settings WHERE user_id = ${currentUserId} LIMIT 1`,
            // Affinité réelle : historique d'interactions de l'utilisateur par auteur
            sql`
              SELECT p.author_id, COUNT(*)::int AS n
              FROM post_interactions pi
              JOIN posts p ON p.id = pi.post_id
              WHERE pi.user_id = ${currentUserId}
                AND pi.interaction_type IN ('like', 'repost')
              GROUP BY p.author_id
              ORDER BY n DESC
              LIMIT 50
            `,
          ]);
          followedAuthorIds = new Set(followsRows.map((f: any) => Number(f.following_id)));
          for (const row of affinityRows) {
            affinityByAuthor.set(Number(row.author_id), Math.min(1, Number(row.n) / 5));
          }
          if (settingsRows[0]) {
            blockedKeywords = (settingsRows[0].blocked_keywords || []).map((k: string) => k.toLowerCase().trim());
            shouldHideReposts = Boolean(settingsRows[0].hide_reposts);
          }
        } catch {}
      }

      const rawCandidates = await sql`
        SELECT p.*, pr.display_name, pr.avatar_url, u.username, u.tier,
               (COALESCE(u.is_verified, FALSE) OR LOWER(COALESCE(u.tier, '')) IN ('plus', 'pro', 'max')) as is_verified,
               ${currentUserId ? sql`(SELECT COUNT(*) FROM post_interactions WHERE post_id = p.id AND user_id = ${currentUserId} AND interaction_type = 'like') > 0` : sql`FALSE`} as has_liked,
               ${currentUserId ? sql`(SELECT COUNT(*) FROM post_interactions WHERE post_id = p.id AND user_id = ${currentUserId} AND interaction_type = 'repost') > 0` : sql`FALSE`} as has_reposted,
               ${currentUserId ? sql`(SELECT COUNT(*) FROM bookmarks WHERE post_id = p.id AND user_id = ${currentUserId}) > 0` : sql`FALSE`} as has_bookmarked
        FROM posts p
        JOIN users u ON u.id = p.author_id
        LEFT JOIN profiles pr ON pr.user_id = u.id
        WHERE p.visibility = 'public'
        ORDER BY p.published_at DESC
        LIMIT 300
      `;

      await fetchMedia(rawCandidates);

      // Filtrage selon les paramètres utilisateur
      const filteredCandidates = rawCandidates.filter((post: any) => {
        if (shouldHideReposts && post.is_repost) return false;
        if (currentUserId && Number(post.author_id) === currentUserId) return true;
        if (blockedKeywords.length > 0) {
          const contentLc = (post.content || '').toLowerCase();
          const hasBlocked = blockedKeywords.some((kw: string) => kw && contentLc.includes(kw));
          if (hasBlocked) return false;
        }
        return true;
      });

      const scoredPosts = filteredCandidates.map((post: any) => {
        const signal = HybridRecommender.scorePost({
          postId: post.id,
          authorId: Number(post.author_id),
          publishedAt: new Date(post.published_at),
          likes: Number(post.likes_count || 0),
          reposts: Number(post.reposts_count || 0),
          replies: Number(post.replies_count || 0),
          views: Number(post.views_count || 0),
          hasMedia: Array.isArray(post.media_assets) && post.media_assets.length > 0,
          isVerifiedAuthor: Boolean(post.is_verified),
          isFollowedAuthor: followedAuthorIds.has(Number(post.author_id)),
          affinity: affinityByAuthor.get(Number(post.author_id)) || 0,
          semanticSimilarity: 0.75,
          candidateSentiment: Number(post.sentiment_score || 0.5),
          toxicityScore: Number(post.toxicity_score || 0),
        });

        return {
          ...post,
          recommendationScore: signal.totalScore,
          explanation: signal.explanationText,
          scoreBreakdown: signal.breakdown,
        };
      });

      scoredPosts.sort((a: any, b: any) => b.recommendationScore - a.recommendationScore);

      // Diversification : max 3 posts consécutifs du même auteur
      const diversified: any[] = [];
      let streakAuthor: number | null = null;
      let streakLen = 0;
      const deferred: any[] = [];
      for (const post of scoredPosts) {
        const authorId = Number(post.author_id);
        if (authorId === streakAuthor && streakLen >= 3) {
          deferred.push(post);
          continue;
        }
        if (authorId === streakAuthor) streakLen += 1;
        else {
          streakAuthor = authorId;
          streakLen = 1;
        }
        diversified.push(post);
      }
      const ranked = diversified.concat(deferred);

      const rankOffset = rawCursor ? parseRank(rawCursor) ?? 0 : 0;
      const page = ranked.slice(rankOffset, rankOffset + PAGE_SIZE);

      return c.json({
        mode: "for_you",
        title: "Pour Vous",
        count: page.length,
        nextCursor: page.length === PAGE_SIZE && rankOffset + PAGE_SIZE < ranked.length ? `rank:${rankOffset + PAGE_SIZE}` : null,
        posts: page,
      });
    } catch (err: any) {
      console.error("[Vibe API] Error fetching feed:", err);
      return c.json({ error: "Erreur lors de la récupération du flux." }, 500);
    }
  };

  registerMulti("get", ["/api/vibe/feed", "/vibe/feed", "/v1/feed", "/feed"], handleFeed);

  // 2. REAL TRENDS & HASHTAGS
  const handleGetTrends = async (c: any) => {
    try {
      const sql = getDb();

      // Chercher les posts récents (48h d'abord, puis 30j si pas assez)
      let recentPosts = await sql`
        SELECT content, likes_count, reposts_count, replies_count, views_count, published_at
        FROM posts
        WHERE published_at > NOW() - INTERVAL '48 hours'
          AND visibility = 'public'
        ORDER BY (likes_count * 2 + reposts_count * 3 + replies_count) DESC
        LIMIT 300
      `;

      if (recentPosts.length < 5) {
        recentPosts = await sql`
          SELECT content, likes_count, reposts_count, replies_count, views_count, published_at
          FROM posts
          WHERE published_at > NOW() - INTERVAL '30 days'
            AND visibility = 'public'
          ORDER BY (likes_count * 2 + reposts_count * 3 + replies_count) DESC
          LIMIT 300
        `;
      }

      const tagMap: Record<string, { count: number; engagement: number; recencyBoost: number }> = {};
      const now = Date.now();

      for (const p of recentPosts) {
        const text = p.content || "";
        const matches = text.match(/#[\p{L}\p{N}_]+/gu) || [];

        const eng = Number(p.likes_count || 0) * 2
          + Number(p.reposts_count || 0) * 3
          + Number(p.replies_count || 0) * 2
          + Number(p.views_count || 0) * 0.1
          + 1;

        const ageHours = (now - new Date(p.published_at).getTime()) / (1000 * 3600);
        const recency = ageHours < 6 ? 3 : ageHours < 24 ? 1.5 : 1;

        for (const rawTag of matches) {
          const normalized = rawTag.toLowerCase().trim();
          if (normalized.length <= 1 || normalized.length > 35) continue;

          if (!tagMap[rawTag]) tagMap[rawTag] = { count: 0, engagement: 0, recencyBoost: 0 };
          tagMap[rawTag].count += 1;
          tagMap[rawTag].engagement += eng;
          tagMap[rawTag].recencyBoost += recency;
        }
      }

      const sortedTrends = Object.entries(tagMap)
        .map(([tag, data]) => {
          const score = data.engagement * data.recencyBoost + data.count * 5;
          const formatted = data.count > 1000
            ? `${(data.count / 1000).toFixed(1)}k`
            : `${data.count}`;
          const lc = tag.toLowerCase();
          const category = lc.includes('mai') || lc.includes('ia') || lc.includes('ai') || lc.includes('llm') || lc.includes('gpt')
            ? 'Intelligence Artificielle'
            : lc.includes('tech') || lc.includes('dev') || lc.includes('code') || lc.includes('web')
            ? 'Technologie'
            : lc.includes('design') || lc.includes('art') || lc.includes('photo') || lc.includes('ux')
            ? 'Design & Création'
            : lc.includes('vibe') || lc.includes('social') || lc.includes('community')
            ? 'Communauté'
            : 'Tendances';
          return { tag, category, posts: `${formatted} publications`, post_count: data.count, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      return c.json({ success: true, trends: sortedTrends });
    } catch (err: any) {
      console.error("[Get Trends Error]:", err);
      return c.json({ success: true, trends: [] });
    }
  };

  registerMulti("get", ["/api/vibe/trends", "/vibe/trends", "/v1/trends", "/trends"], handleGetTrends);

  // 3. POSTS CRUD
  const handleCreatePost = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      // Anti-spam : 10 posts / 5 min / utilisateur
      if (!rateLimit(`post:${userId}`, 10, 5 * 60_000)) {
        return c.json({ error: "Vous publiez trop vite. Patientez un instant." }, 429);
      }

      const body = await c.req.json();
      const { content, format = "micro_text", visibility = "public", media_url, media_assets = [] } = body;

      if (!content || !content.trim()) {
        return c.json({ error: "Le contenu est obligatoire." }, 400);
      }

      const safety = MAIAgentFleet.assessContentSafety(content);
      if (!safety.isSafe) {
        return c.json({ error: `Publication refusée : ${safety.flagReason}` }, 403);
      }

      const sql = getDb();
      const inserted = await sql`
        INSERT INTO posts (author_id, content, format, visibility, toxicity_score, created_via)
        VALUES (${userId}, ${content.trim()}, ${format}, ${visibility}, ${safety.toxicityScore}, 'web')
        RETURNING *
      `;

      const newPost = inserted[0];

      // Inférence du type MIME à partir de l'extension du fichier
      const inferMediaType = (url: string, fallback = "image/jpeg"): string => {
        try {
          const cleanUrl = url.split("?")[0].split("#")[0];
          const ext = cleanUrl.split(".").pop()?.toLowerCase();
          switch (ext) {
            case "png": return "image/png";
            case "webp": return "image/webp";
            case "gif": return "image/gif";
            case "svg": return "image/svg+xml";
            case "jpg":
            case "jpeg": return "image/jpeg";
            case "mp4": return "video/mp4";
            case "webm": return "video/webm";
            case "mov": return "video/quicktime";
            case "mp3": return "audio/mpeg";
            case "wav": return "audio/wav";
            case "ogg": return "audio/ogg";
            default: return fallback;
          }
        } catch {
          return fallback;
        }
      };

      // Normalisation des médias (support de media_url et de la liste media_assets)
      const normalizedMedia: Array<{
        url: string;
        media_type: string;
        file_size_bytes: number;
        alt_text: string;
      }> = [];

      if (Array.isArray(media_assets)) {
        for (const media of media_assets) {
          if (!media || !media.url) continue;
          const urlStr = String(media.url).trim();
          if (!urlStr) continue;
          normalizedMedia.push({
            url: urlStr,
            media_type: media.media_type || media.type || inferMediaType(urlStr),
            file_size_bytes: Math.max(0, Math.round(Number(media.file_size_bytes ?? media.size ?? media.file_size ?? 0) || 0)),
            alt_text: media.alt_text || media.alt || "",
          });
        }
      }

      if (media_url && typeof media_url === "string" && media_url.trim()) {
        const trimmedUrl = media_url.trim();
        const alreadyPresent = normalizedMedia.some((m) => m.url === trimmedUrl);
        if (!alreadyPresent) {
          normalizedMedia.unshift({
            url: trimmedUrl,
            media_type: body.media_type || inferMediaType(trimmedUrl),
            file_size_bytes: Math.max(0, Math.round(Number(body.file_size_bytes ?? body.size ?? body.file_size ?? 0) || 0)),
            alt_text: body.alt_text || "",
          });
        }
      }

      const insertedMediaList: any[] = [];
      for (const media of normalizedMedia) {
        const res = await sql`
          INSERT INTO media_assets (owner_id, post_id, url, media_type, file_size_bytes, alt_text)
          VALUES (${userId}, ${newPost.id}::uuid, ${media.url}, ${media.media_type}, ${media.file_size_bytes}, ${media.alt_text})
          RETURNING id, url, media_type, file_size_bytes, alt_text
        `;
        if (res && res[0]) {
          insertedMediaList.push(res[0]);
        }
      }

      await sql`UPDATE profiles SET posts_count = posts_count + 1 WHERE user_id = ${userId}`;

      const userRow = await sql`SELECT username FROM users WHERE id = ${userId} LIMIT 1`;
      const profileRow = await sql`SELECT display_name, avatar_url FROM profiles WHERE user_id = ${userId} LIMIT 1`;

      return c.json({
        success: true,
        post: {
          ...newPost,
          username: userRow[0]?.username,
          display_name: profileRow[0]?.display_name || userRow[0]?.username,
          avatar_url: profileRow[0]?.avatar_url,
          media_assets: insertedMediaList,
        },
      }, 201);
    } catch (err: any) {
      console.error("[Vibe API] Error creating post:", err);
      return c.json({ error: "Erreur serveur lors de la publication." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/posts", "/vibe/posts", "/v1/posts", "/posts"], handleCreatePost);

  const handleGetPost = async (c: any) => {
    try {
      const postId = c.req.param("id");
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
        SELECT p.*, pr.display_name, pr.avatar_url, u.username,
               ${currentUserId ? sql`(SELECT COUNT(*) FROM post_interactions WHERE post_id = p.id AND user_id = ${currentUserId} AND interaction_type = 'like') > 0` : false} as has_liked,
               ${currentUserId ? sql`(SELECT COUNT(*) FROM post_interactions WHERE post_id = p.id AND user_id = ${currentUserId} AND interaction_type = 'repost') > 0` : false} as has_reposted,
               ${currentUserId ? sql`(SELECT COUNT(*) FROM bookmarks WHERE post_id = p.id AND user_id = ${currentUserId}) > 0` : false} as has_bookmarked
        FROM posts p
        JOIN users u ON u.id = p.author_id
        LEFT JOIN profiles pr ON pr.user_id = u.id
        WHERE p.id = ${postId}::uuid
        LIMIT 1
      `;

      if (rows.length === 0) return c.json({ error: "Publication introuvable." }, 404);

      const media = await sql`SELECT * FROM media_assets WHERE post_id = ${postId}::uuid`;
      return c.json({ post: { ...rows[0], media_assets: media } });
    } catch (err: any) {
      return c.json({ error: "Erreur lors de la récupération." }, 500);
    }
  };

  registerMulti("get", ["/api/vibe/posts/:id", "/vibe/posts/:id", "/v1/posts/:id", "/posts/:id"], handleGetPost);

  const handleDeletePost = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const postId = c.req.param("id");
      const sql = getDb();

      const deleted = await sql`
        DELETE FROM posts WHERE id = ${postId}::uuid AND author_id = ${userId} RETURNING id
      `;

      if (deleted.length === 0) {
        return c.json({ error: "Publication introuvable ou non autorisée." }, 403);
      }

      await sql`UPDATE profiles SET posts_count = GREATEST(0, posts_count - 1) WHERE user_id = ${userId}`;
      return c.json({ success: true, message: "Publication supprimée." });
    } catch (err: any) {
      return c.json({ error: "Erreur suppression." }, 500);
    }
  };

  registerMulti("delete", ["/api/vibe/posts/:id", "/vibe/posts/:id", "/v1/posts/:id", "/posts/:id"], handleDeletePost);

  // 4. LIKES & REPOSTS & BOOKMARKS
  const handleLike = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const postId = c.req.param("id");
      const sql = getDb();

      const existing = await sql`
        SELECT id FROM post_interactions
        WHERE user_id = ${userId} AND post_id = ${postId}::uuid AND interaction_type = 'like'
      `;

      if (existing.length > 0) {
        await sql`DELETE FROM post_interactions WHERE id = ${existing[0].id}::uuid`;
        await sql`UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = ${postId}::uuid`;
        try {
          await sql`
            DELETE FROM notifications
            WHERE actor_id = ${userId} AND post_id = ${postId}::uuid AND type = 'like'
          `;
        } catch {}
        return c.json({ success: true, liked: false });
      } else {
        await sql`
          INSERT INTO post_interactions (user_id, post_id, interaction_type)
          VALUES (${userId}, ${postId}::uuid, 'like')
          ON CONFLICT (user_id, post_id, interaction_type) DO NOTHING
        `;
        await sql`UPDATE posts SET likes_count = likes_count + 1 WHERE id = ${postId}::uuid`;

        const postAuthor = await sql`SELECT author_id, content FROM posts WHERE id = ${postId}::uuid LIMIT 1`;
        if (postAuthor.length > 0) {
          const recipientId = Number(postAuthor[0].author_id);
          const rawContent = (postAuthor[0].content || "").trim();
          const snippet = rawContent ? ` : « ${rawContent.slice(0, 45)}${rawContent.length > 45 ? '…' : ''} »` : '';
          const msg = recipientId === userId ? `Vous avez aimé votre publication${snippet}` : `a aimé votre publication${snippet}`;
          try {
            await sql`
              INSERT INTO notifications (recipient_id, actor_id, type, post_id, message)
              VALUES (${recipientId}, ${userId}, 'like', ${postId}::uuid, ${msg})
            `;
          } catch (err) {
            console.error("[Like Notification Error]:", err);
          }
        }

        return c.json({ success: true, liked: true });
      }
    } catch (err: any) {
      return c.json({ error: err.message || "Erreur lors de l'interaction." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/posts/:id/like", "/vibe/posts/:id/like", "/v1/posts/:id/like", "/like/:id", "/api/vibe/posts/:id/likes"], handleLike);

  const handleRepost = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const postId = c.req.param("id");
      const sql = getDb();

      const existing = await sql`
        SELECT id FROM post_interactions
        WHERE user_id = ${userId} AND post_id = ${postId}::uuid AND interaction_type = 'repost'
      `;

      if (existing.length > 0) {
        await sql`DELETE FROM post_interactions WHERE id = ${existing[0].id}::uuid`;
        await sql`UPDATE posts SET reposts_count = GREATEST(0, reposts_count - 1) WHERE id = ${postId}::uuid`;
        try {
          await sql`
            DELETE FROM notifications
            WHERE actor_id = ${userId} AND post_id = ${postId}::uuid AND type = 'repost'
          `;
        } catch {}
        return c.json({ success: true, reposted: false });
      } else {
        await sql`
          INSERT INTO post_interactions (user_id, post_id, interaction_type)
          VALUES (${userId}, ${postId}::uuid, 'repost')
          ON CONFLICT (user_id, post_id, interaction_type) DO NOTHING
        `;
        await sql`UPDATE posts SET reposts_count = reposts_count + 1 WHERE id = ${postId}::uuid`;

        const postAuthor = await sql`SELECT author_id, content FROM posts WHERE id = ${postId}::uuid LIMIT 1`;
        if (postAuthor.length > 0) {
          const recipientId = Number(postAuthor[0].author_id);
          const rawContent = (postAuthor[0].content || "").trim();
          const snippet = rawContent ? ` : « ${rawContent.slice(0, 45)}${rawContent.length > 45 ? '…' : ''} »` : '';
          const msg = recipientId === userId ? `Vous avez republié votre publication${snippet}` : `a republié votre publication${snippet}`;
          try {
            await sql`
              INSERT INTO notifications (recipient_id, actor_id, type, post_id, message)
              VALUES (${recipientId}, ${userId}, 'repost', ${postId}::uuid, ${msg})
            `;
          } catch (err) {
            console.error("[Repost Notification Error]:", err);
          }
        }

        return c.json({ success: true, reposted: true });
      }
    } catch (err: any) {
      return c.json({ error: err.message || "Erreur lors du repartage." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/posts/:id/repost", "/vibe/posts/:id/repost", "/v1/posts/:id/repost", "/repost/:id", "/api/vibe/posts/:id/reposts"], handleRepost);

  const handleBookmark = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const postId = c.req.param("id");
      const sql = getDb();

      const existing = await sql`
        SELECT id FROM bookmarks WHERE user_id = ${userId} AND post_id = ${postId}::uuid
      `;

      if (existing.length > 0) {
        await sql`DELETE FROM bookmarks WHERE id = ${existing[0].id}::uuid`;
        await sql`UPDATE posts SET bookmarks_count = GREATEST(0, bookmarks_count - 1) WHERE id = ${postId}::uuid`;
        return c.json({ success: true, bookmarked: false });
      } else {
        await sql`
          INSERT INTO bookmarks (user_id, post_id) VALUES (${userId}, ${postId}::uuid)
          ON CONFLICT (user_id, post_id) DO NOTHING
        `;
        await sql`UPDATE posts SET bookmarks_count = bookmarks_count + 1 WHERE id = ${postId}::uuid`;
        return c.json({ success: true, bookmarked: true });
      }
    } catch (err: any) {
      return c.json({ error: err.message || "Erreur lors de l'enregistrement." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/posts/:id/bookmark", "/vibe/posts/:id/bookmark", "/v1/posts/:id/bookmark", "/bookmark/:id", "/api/vibe/posts/:id/bookmarks"], handleBookmark);

  // 5. COMMENTS
  const handleGetComments = async (c: any) => {
    try {
      const postId = c.req.param("id");
      const sql = getDb();

      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postId)) {
        return c.json({ count: 0, aiDigest: null, comments: [] });
      }

      let currentUserId: number | null = null;
      const token = extractToken(c.req.raw);
      if (token) {
        try {
          const payload = await verifyToken(token);
          currentUserId = Number(payload.sub || (payload as any).id);
        } catch {}
      }

      const comments = await sql`
        SELECT c.*, u.username, pr.display_name, pr.avatar_url,
               (COALESCE(u.is_verified, FALSE) OR LOWER(COALESCE(u.tier, '')) IN ('plus', 'pro', 'max')) as is_verified
        FROM comments c
        JOIN users u ON u.id = c.author_id
        LEFT JOIN profiles pr ON pr.user_id = u.id
        WHERE c.post_id = ${postId}::uuid AND c.is_hidden = FALSE
        ORDER BY c.depth ASC, c.likes_count DESC, c.created_at ASC
      `;

      let likedIds = new Set<string>();
      if (currentUserId && comments.length > 0) {
        try {
          const likedRows = await sql`
            SELECT cl.comment_id FROM comment_likes cl
            JOIN comments c ON c.id = cl.comment_id
            WHERE cl.user_id = ${currentUserId} AND c.post_id = ${postId}::uuid
          `;
          likedIds = new Set(likedRows.map((r: any) => String(r.comment_id)));
        } catch {}
      }

      const enriched = comments.map((cm: any) => ({
        ...cm,
        liked_by_me: likedIds.has(String(cm.id)),
      }));

      let aiDigest = null;
      if (enriched.length >= 2) {
        aiDigest = MAIAgentFleet.synthesizeThread(
          enriched.map((cm: any) => ({ author: cm.username, content: cm.content }))
        );
      }

      return c.json({ count: enriched.length, aiDigest, comments: enriched });
    } catch (err: any) {
      console.error("[Get Comments Error]:", err);
      return c.json({ error: "Erreur récupération réponses." }, 500);
    }
  };

  registerMulti("get", ["/api/vibe/posts/:id/comments", "/vibe/posts/:id/comments", "/v1/posts/:id/comments", "/comments/:id"], handleGetComments);

  const isUuid = (v: any) => typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

  const handleAddComment = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const postId = c.req.param("id");
      const { content, parent_comment_id } = await c.req.json();

      if (!content || !content.trim()) {
        return c.json({ error: "Commentaire vide." }, 400);
      }
      if (!isUuid(postId)) {
        return c.json({ error: "Identifiant de post invalide." }, 400);
      }

      const sql = getDb();

      // Résoudre le parent (profondeur réelle, aplatie au niveau 4 max)
      let parentDepth = 0;
      let effectiveParentId: string | null = null;
      if (parent_comment_id) {
        if (!isUuid(parent_comment_id)) {
          return c.json({ error: "Commentaire parent invalide." }, 400);
        }
        const parentRows = await sql`
          SELECT id, depth, parent_comment_id FROM comments WHERE id = ${parent_comment_id}::uuid LIMIT 1
        `;
        if (parentRows.length === 0) {
          return c.json({ error: "Commentaire parent introuvable." }, 404);
        }
        const parent = parentRows[0];
        // On répond toujours à la racine du fil si le parent est déjà profond
        if (Number(parent.depth) >= 4) {
          effectiveParentId = parent.parent_comment_id || parent.id;
          parentDepth = 3;
        } else {
          effectiveParentId = parent.id;
          parentDepth = Number(parent.depth) || 0;
        }
      }

      const inserted = await sql`
        INSERT INTO comments (post_id, author_id, parent_comment_id, content, depth)
        VALUES (${postId}::uuid, ${userId}, ${effectiveParentId || null}::uuid, ${content.trim()}, ${parentDepth + 1})
        RETURNING *
      `;

      await sql`UPDATE posts SET replies_count = replies_count + 1 WHERE id = ${postId}::uuid`;

      // Notifier l'auteur du post (ou du commentaire parent) sans se notifier soi-même
      try {
        let notifyId: number | null = null;
        let notifMsg = "a répondu à votre post";
        if (effectiveParentId) {
          const pAuthor = await sql`SELECT author_id FROM comments WHERE id = ${effectiveParentId}::uuid LIMIT 1`;
          notifyId = Number(pAuthor[0]?.author_id) || null;
          notifMsg = "a répondu à votre commentaire";
        } else {
          const pAuthor = await sql`SELECT author_id FROM posts WHERE id = ${postId}::uuid LIMIT 1`;
          notifyId = Number(pAuthor[0]?.author_id) || null;
        }
        if (notifyId && notifyId !== userId) {
          await sql`
            INSERT INTO notifications (recipient_id, actor_id, type, message)
            VALUES (${notifyId}, ${userId}, 'reply', ${notifMsg})
          `;
        }
      } catch {}

      const userRow = await sql`SELECT username FROM users WHERE id = ${userId} LIMIT 1`;
      const prRow = await sql`SELECT display_name, avatar_url FROM profiles WHERE user_id = ${userId} LIMIT 1`;

      return c.json({
        success: true,
        comment: {
          ...inserted[0],
          username: userRow[0]?.username,
          display_name: prRow[0]?.display_name || userRow[0]?.username,
          avatar_url: prRow[0]?.avatar_url,
          liked_by_me: false,
        },
      }, 201);
    } catch (err: any) {
      console.error("[Add Comment Error]:", err);
      return c.json({ error: err?.message?.includes("relation") ? "Table comments incomplète — migration requise." : "Erreur ajout commentaire." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/posts/:id/comments", "/vibe/posts/:id/comments", "/v1/posts/:id/comments", "/comments/:id"], handleAddComment);

  // 6. LIKE / UNLIKE A COMMENT
  const handleLikeComment = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);
      const commentId = c.req.param("commentId");

      if (!isUuid(commentId)) {
        return c.json({ error: "Identifiant de commentaire invalide." }, 400);
      }

      const sql = getDb();

      let alreadyLiked = false;
      try {
        const existing = await sql`
          SELECT 1 FROM comment_likes WHERE user_id = ${userId} AND comment_id = ${commentId}::uuid LIMIT 1
        `;
        alreadyLiked = existing.length > 0;
      } catch {
        // Table comment_likes absente : on retombe sur un simple compteur
      }

      if (alreadyLiked) {
        try {
          await sql`DELETE FROM comment_likes WHERE user_id = ${userId} AND comment_id = ${commentId}::uuid`;
        } catch {}
        await sql`UPDATE comments SET likes_count = GREATEST(0, COALESCE(likes_count, 0) - 1) WHERE id = ${commentId}::uuid`;
        const row = await sql`SELECT COALESCE(likes_count, 0) as likes_count FROM comments WHERE id = ${commentId}::uuid LIMIT 1`;
        return c.json({ success: true, liked: false, likes_count: Number(row[0]?.likes_count || 0) });
      } else {
        try {
          await sql`INSERT INTO comment_likes (user_id, comment_id) VALUES (${userId}, ${commentId}::uuid)`;
        } catch {}
        await sql`UPDATE comments SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = ${commentId}::uuid`;
        const row = await sql`SELECT COALESCE(likes_count, 0) as likes_count FROM comments WHERE id = ${commentId}::uuid LIMIT 1`;

        try {
          const cm = await sql`SELECT author_id, post_id FROM comments WHERE id = ${commentId}::uuid LIMIT 1`;
          const authorId = Number(cm[0]?.author_id);
          if (authorId && authorId !== userId) {
            await sql`
              INSERT INTO notifications (recipient_id, actor_id, type, message)
              VALUES (${authorId}, ${userId}, 'like', 'a aimé votre commentaire')
            `;
          }
        } catch {}

        return c.json({ success: true, liked: true, likes_count: Number(row[0]?.likes_count || 0) });
      }
    } catch (err: any) {
      console.error("[Like Comment Error]:", err);
      return c.json({ error: "Erreur lors du like du commentaire." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/posts/:id/comments/:commentId/like", "/vibe/posts/:id/comments/:commentId/like", "/v1/posts/:id/comments/:commentId/like"], handleLikeComment);
}
