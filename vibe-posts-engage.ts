/**
 * ============================================================================
 * VIBE SOCIAL PLATFORM — POSTS ENGAGEMENT (vibe-posts-engage.ts)
 * Likes, reposts, feedback algorithmique, bookmarks, commentaires & fils,
 * comptage de vues et épinglage sur le profil.
 * Enregistré par vibe-posts.ts (registerVibePostsRoutes) via
 * registerPostEngagementRoutes — l'ordre des registerMulti est inchangé.
 * ============================================================================
 */

import { extractToken, getDb, verifyToken } from "./config.ts";
import { isBlockEitherWay, type RegisterMultiFn } from "./vibe-common.ts";
import { MAIAgentFleet } from "./vibe-mai-fleet.ts";
import { pushRealtimeEvent } from "./realtime.ts";
import { ensureCircleTable } from "./vibe-circle.ts";
import {
  ensurePostColumns,
  isUuid,
  stripHtmlTags,
} from "./vibe-posts-core.ts";

export function registerPostEngagementRoutes(registerMulti: RegisterMultiFn) {
  // 2. LIKES & REPOSTS & BOOKMARKS
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
        // Temps réel : compteurs actualisés pour l'auteur (flux SSE)
        try {
          const statsRows = await sql`SELECT author_id, likes_count, reposts_count, replies_count FROM posts WHERE id = ${postId}::uuid LIMIT 1`;
          if (statsRows[0]) {
            await pushRealtimeEvent(statsRows[0].author_id, "post_stats", {
              post_id: postId,
              likes_count: Number(statsRows[0].likes_count || 0),
              reposts_count: Number(statsRows[0].reposts_count || 0),
              replies_count: Number(statsRows[0].replies_count || 0),
            });
          }
        } catch {}
        return c.json({ success: true, liked: false });
      } else {
        await sql`
          INSERT INTO post_interactions (user_id, post_id, interaction_type)
          VALUES (${userId}, ${postId}::uuid, 'like')
          ON CONFLICT (user_id, post_id, interaction_type) DO NOTHING
        `;
        await sql`UPDATE posts SET likes_count = likes_count + 1 WHERE id = ${postId}::uuid`;

        const postAuthor = await sql`SELECT author_id, content, likes_count, reposts_count, replies_count FROM posts WHERE id = ${postId}::uuid LIMIT 1`;
        if (postAuthor.length > 0) {
          // Temps réel : compteurs actualisés pour l'auteur (flux SSE)
          pushRealtimeEvent(postAuthor[0].author_id, "post_stats", {
            post_id: postId,
            likes_count: Number(postAuthor[0].likes_count || 0),
            reposts_count: Number(postAuthor[0].reposts_count || 0),
            replies_count: Number(postAuthor[0].replies_count || 0),
          }).catch(() => {});

          const recipientId = Number(postAuthor[0].author_id);
          if (recipientId !== userId && !(await isBlockEitherWay(userId, recipientId))) {
            const rawContent = (postAuthor[0].content || "").trim();
            const snippet = rawContent ? ` : « ${rawContent.slice(0, 45)}${rawContent.length > 45 ? '…' : ''} »` : '';
            const msg = `a aimé votre publication${snippet}`;
            try {
              await sql`
                INSERT INTO notifications (recipient_id, actor_id, type, post_id, message)
                VALUES (${recipientId}, ${userId}, 'like', ${postId}::uuid, ${msg})
              `;
            } catch (err) {
              console.error("[Like Notification Error]:", err);
            }
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
        // Temps réel : compteurs actualisés pour l'auteur (flux SSE)
        try {
          const statsRows = await sql`SELECT author_id, likes_count, reposts_count, replies_count FROM posts WHERE id = ${postId}::uuid LIMIT 1`;
          if (statsRows[0]) {
            await pushRealtimeEvent(statsRows[0].author_id, "post_stats", {
              post_id: postId,
              likes_count: Number(statsRows[0].likes_count || 0),
              reposts_count: Number(statsRows[0].reposts_count || 0),
              replies_count: Number(statsRows[0].replies_count || 0),
            });
          }
        } catch {}
        return c.json({ success: true, reposted: false });
      } else {
        await sql`
          INSERT INTO post_interactions (user_id, post_id, interaction_type)
          VALUES (${userId}, ${postId}::uuid, 'repost')
          ON CONFLICT (user_id, post_id, interaction_type) DO NOTHING
        `;
        await sql`UPDATE posts SET reposts_count = reposts_count + 1 WHERE id = ${postId}::uuid`;

        const postAuthor = await sql`SELECT author_id, content, likes_count, reposts_count, replies_count FROM posts WHERE id = ${postId}::uuid LIMIT 1`;
        if (postAuthor.length > 0) {
          // Temps réel : compteurs actualisés pour l'auteur (flux SSE)
          pushRealtimeEvent(postAuthor[0].author_id, "post_stats", {
            post_id: postId,
            likes_count: Number(postAuthor[0].likes_count || 0),
            reposts_count: Number(postAuthor[0].reposts_count || 0),
            replies_count: Number(postAuthor[0].replies_count || 0),
          }).catch(() => {});

          const recipientId = Number(postAuthor[0].author_id);
          if (recipientId !== userId && !(await isBlockEitherWay(userId, recipientId))) {
            const rawContent = (postAuthor[0].content || "").trim();
            const snippet = rawContent ? ` : « ${rawContent.slice(0, 45)}${rawContent.length > 45 ? '…' : ''} »` : '';
            const msg = `a republié votre publication${snippet}`;
            try {
              await sql`
                INSERT INTO notifications (recipient_id, actor_id, type, post_id, message)
                VALUES (${recipientId}, ${userId}, 'repost', ${postId}::uuid, ${msg})
              `;
            } catch (err) {
              console.error("[Repost Notification Error]:", err);
            }
          }
        }

        return c.json({ success: true, reposted: true });
      }
    } catch (err: any) {
      return c.json({ error: err.message || "Erreur lors du repartage." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/posts/:id/repost", "/vibe/posts/:id/repost", "/v1/posts/:id/repost", "/repost/:id", "/api/vibe/posts/:id/reposts"], handleRepost);

  // 2bis. FEEDBACK ALGORITHMIQUE (« Cela m'intéresse » / « Cela ne m'intéresse pas »)
  const handlePostFeedback = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const postId = c.req.param("id");
      if (!isUuid(postId)) {
        return c.json({ error: "Identifiant de post invalide." }, 400);
      }

      const body = await c.req.json().catch(() => ({} as any));
      const value = body?.value;
      if (value !== "more" && value !== "less" && value !== null && value !== undefined) {
        return c.json({ error: "Valeur de feedback invalide (more | less | null)." }, 400);
      }

      const sql = getDb();
      // Toggle : supprime les deux types puis réinsère si un nouveau choix
      await sql`
        DELETE FROM post_interactions
        WHERE user_id = ${userId} AND post_id = ${postId}::uuid
          AND interaction_type IN ('interest_more', 'interest_less')
      `;
      if (value === "more" || value === "less") {
        const interactionType = value === "more" ? "interest_more" : "interest_less";
        await sql`
          INSERT INTO post_interactions (user_id, post_id, interaction_type)
          VALUES (${userId}, ${postId}::uuid, ${interactionType})
          ON CONFLICT (user_id, post_id, interaction_type) DO NOTHING
        `;
      }

      return c.json({ success: true, my_feedback: value ?? null });
    } catch (err: any) {
      console.error("[Post Feedback Error]:", err);
      return c.json({ error: "Erreur lors de l'enregistrement du feedback." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/posts/:id/feedback", "/vibe/posts/:id/feedback", "/v1/posts/:id/feedback", "/feedback/:id"], handlePostFeedback);

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

  // 3. COMMENTS
  const handleGetComments = async (c: any) => {
    try {
      const postId = c.req.param("id");
      const sql = getDb();

      if (!isUuid(postId)) {
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

      // Visibilité du post parent : les commentaires d'un post à audience
      // restreinte (Abonnés / Cercle Privé) ne fuient pas par cette route.
      await ensureCircleTable().catch(() => {});
      const parentPost = await sql`SELECT author_id, visibility FROM posts WHERE id = ${postId}::uuid LIMIT 1`;
      if (parentPost.length > 0) {
        const vis = String(parentPost[0].visibility || "public");
        const authorId = Number(parentPost[0].author_id);
        let canView = vis === "public" || (currentUserId != null && authorId === currentUserId);
        if (!canView && currentUserId != null && vis === "followers") {
          const followerRows = await sql`SELECT 1 FROM follows WHERE follower_id = ${currentUserId} AND following_id = ${authorId} LIMIT 1`;
          canView = followerRows.length > 0;
        } else if (!canView && currentUserId != null && vis === "circle") {
          const memberRows = await sql`SELECT 1 FROM circle_members WHERE user_id = ${authorId} AND member_user_id = ${currentUserId} LIMIT 1`;
          canView = memberRows.length > 0;
        }
        if (!canView) return c.json({ count: 0, aiDigest: null, comments: [] });
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

      // Médias joints aux commentaires (3 images / 1 vidéo, légendes incluses)
      try {
        const commentIds = enriched.map((cm: any) => String(cm.id));
        if (commentIds.length > 0) {
          const mediaRows = await sql`
            SELECT comment_id, url, media_type, alt_text
            FROM media_assets
            WHERE comment_id = ANY(${commentIds}::uuid[])
          `;
          const mediaByComment: Record<string, any[]> = {};
          for (const m of mediaRows) {
            (mediaByComment[String(m.comment_id)] ||= []).push({
              url: m.url,
              media_type: m.media_type,
              alt_text: m.alt_text,
            });
          }
          for (const cm of enriched) {
            cm.media_assets = mediaByComment[String(cm.id)] || [];
          }
        }
      } catch (mediaErr) {
        console.warn("[vibe-posts] Comment media hydratation:", mediaErr);
      }

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

  // 2ter. COMPTAGE D'IMPRESSIONS / VUES
  // Le client dédoublonne par session (IntersectionObserver + dwell 1 s,
  // cf. src/algorithms/viewTracking.ts) ; le serveur incrémente simplement.
  const handlePostView = async (c: any) => {
    try {
      const postId = c.req.param("id");
      if (!isUuid(postId)) {
        return c.json({ error: "Identifiant de post invalide." }, 400);
      }
      const sql = getDb();
      const updated = await sql`
        UPDATE posts
        SET views_count = COALESCE(views_count, 0) + 1
        WHERE id = ${postId}::uuid
        RETURNING views_count
      `;
      if (updated.length === 0) {
        return c.json({ error: "Publication introuvable." }, 404);
      }
      return c.json({ success: true, views_count: Number(updated[0].views_count || 0) });
    } catch (err: any) {
      console.warn("[Post View Error]:", err);
      return c.json({ success: false, views_count: null });
    }
  };

  registerMulti("post", ["/api/vibe/posts/:id/view", "/vibe/posts/:id/view", "/v1/posts/:id/view"], handlePostView);

  // 2quater. ÉPINGLAGE SUR LE PROFIL (maximum 3 posts épinglés par auteur)
  const MAX_PINNED_POSTS = 3;
  const handlePinPost = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const postId = c.req.param("id");
      if (!isUuid(postId)) {
        return c.json({ error: "Identifiant de post invalide." }, 400);
      }

      const body = await c.req.json().catch(() => ({} as any));
      const pinned = Boolean(body.pinned);

      const sql = getDb();
      const owned = await sql`
        SELECT id FROM posts WHERE id = ${postId}::uuid AND author_id = ${userId} LIMIT 1
      `;
      if (owned.length === 0) {
        return c.json({ error: "Publication introuvable ou non autorisée." }, 403);
      }

      if (pinned) {
        const alreadyPinned = await sql`
          SELECT 1 FROM posts WHERE id = ${postId}::uuid AND is_pinned = TRUE LIMIT 1
        `;
        if (alreadyPinned.length === 0) {
          const countRows = await sql`
            SELECT COUNT(*)::int AS n FROM posts WHERE author_id = ${userId} AND is_pinned = TRUE
          `;
          if (Number(countRows[0]?.n || 0) >= MAX_PINNED_POSTS) {
            return c.json({
              error: `Vous ne pouvez épingler que ${MAX_PINNED_POSTS} publications sur votre profil.`,
              code: "PIN_LIMIT",
            }, 400);
          }
        }
      }

      await sql`
        UPDATE posts SET is_pinned = ${pinned} WHERE id = ${postId}::uuid AND author_id = ${userId}
      `;
      const countRows = await sql`
        SELECT COUNT(*)::int AS n FROM posts WHERE author_id = ${userId} AND is_pinned = TRUE
      `;
      return c.json({ success: true, pinned, pinned_count: Number(countRows[0]?.n || 0) });
    } catch (err: any) {
      console.error("[Pin Post Error]:", err);
      return c.json({ error: "Erreur lors de l'épinglage." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/posts/:id/pin", "/vibe/posts/:id/pin", "/v1/posts/:id/pin"], handlePinPost);

  const handleAddComment = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const postId = c.req.param("id");
      const body = await c.req.json().catch(() => ({} as any));
      const content = body?.content ?? "";
      const parent_comment_id = body?.parent_comment_id;
      const commentMedia = Array.isArray(body?.media_assets) ? body.media_assets : [];

      if ((!content || !String(content).trim()) && commentMedia.length === 0) {
        return c.json({ error: "Commentaire vide." }, 400);
      }
      if (!isUuid(postId)) {
        return c.json({ error: "Identifiant de post invalide." }, 400);
      }

      // Validation des médias de commentaire : max 3 images + 1 vidéo
      const normalizedCommentMedia: Array<{ url: string; media_type: string; alt_text: string }> = [];
      let mediaImages = 0;
      let mediaVideos = 0;
      for (const m of commentMedia) {
        if (!m || !m.url || typeof m.url !== "string") continue;
        const type = String(m.media_type || m.type || "");
        const isVideo = type.startsWith("video") || /\.(mp4|webm|mov)(\?|$)/i.test(m.url);
        if (isVideo) mediaVideos++;
        else mediaImages++;
        if (mediaImages > 3 || mediaVideos > 1) {
          return c.json({ error: "Maximum 3 images et 1 vidéo par réponse." }, 400);
        }
        normalizedCommentMedia.push({
          url: m.url.trim().slice(0, 2048),
          media_type: type || (isVideo ? "video/mp4" : "image/jpeg"),
          alt_text: String(m.alt_text || m.alt || "").slice(0, 500),
        });
      }

      const sql = getDb();
      await ensurePostColumns();

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
        VALUES (${postId}::uuid, ${userId}, ${effectiveParentId || null}::uuid, ${String(content || '').trim()}, ${parentDepth + 1})
        RETURNING *
      `;

      // Insertion des médias joints au commentaire
      const insertedCommentMedia: any[] = [];
      for (const m of normalizedCommentMedia) {
        try {
          const res = await sql`
            INSERT INTO media_assets (owner_id, post_id, comment_id, url, media_type, alt_text)
            VALUES (${userId}, ${postId}::uuid, ${inserted[0].id}::uuid, ${m.url}, ${m.media_type}, ${m.alt_text})
            RETURNING id, url, media_type, alt_text
          `;
          if (res && res[0]) insertedCommentMedia.push(res[0]);
        } catch (mediaInsertErr) {
          console.warn("[vibe-posts] Comment media insert:", mediaInsertErr);
        }
      }

      await sql`UPDATE posts SET replies_count = replies_count + 1 WHERE id = ${postId}::uuid`;

      // Temps réel : replies_count actualisé pour l'auteur du post (flux SSE)
      try {
        const statsRows = await sql`SELECT author_id, likes_count, reposts_count, replies_count FROM posts WHERE id = ${postId}::uuid LIMIT 1`;
        if (statsRows[0]) {
          await pushRealtimeEvent(statsRows[0].author_id, "post_stats", {
            post_id: postId,
            likes_count: Number(statsRows[0].likes_count || 0),
            reposts_count: Number(statsRows[0].reposts_count || 0),
            replies_count: Number(statsRows[0].replies_count || 0),
          });
        }
      } catch {}

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
        if (notifyId && notifyId !== userId && !(await isBlockEitherWay(userId, notifyId))) {
          await sql`
            INSERT INTO notifications (recipient_id, actor_id, type, post_id, comment_id, message)
            VALUES (${notifyId}, ${userId}, 'reply', ${postId}::uuid, ${inserted[0]?.id}::uuid, ${notifMsg})
          `;
        }

        // Détection et notification des mentions @username dans les commentaires
        try {
          const plainComment = stripHtmlTags(String(content || ''));
          const mentionMatches = Array.from(new Set(plainComment.match(/@([a-zA-Z0-9_]{1,30})/g) || [])).map((m: string) => m.slice(1).toLowerCase());
          if (mentionMatches.length > 0) {
            const mentionedUsers = await sql`
              SELECT id, username FROM users
              WHERE LOWER(username) = ANY(${mentionMatches}) AND id <> ${userId}
            `;
            const snippet = plainComment.length > 45 ? `${plainComment.slice(0, 45)}…` : plainComment;
            for (const u of mentionedUsers) {
              if (Number(u.id) !== notifyId && !(await isBlockEitherWay(userId, Number(u.id)))) {
                await sql`
                  INSERT INTO notifications (recipient_id, actor_id, type, post_id, comment_id, message)
                  VALUES (${u.id}, ${userId}, 'mention', ${postId}::uuid, ${inserted[0]?.id}::uuid, ${`vous a mentionné dans un commentaire : « ${snippet} »`})
                `.catch(() => {});
              }
            }
          }
        } catch (mentionErr) {
          console.warn("[Vibe API] Erreur notification mention commentaire:", mentionErr);
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
          media_assets: insertedCommentMedia,
        },
      }, 201);
    } catch (err: any) {
      console.error("[Add Comment Error]:", err);
      const isMissingTable =
        err?.code === "42P01" ||
        (err?.message?.includes("does not exist") && (err?.message?.includes("comments") || err?.message?.includes("relation")));
      return c.json(
        {
          error: isMissingTable
            ? "Table comments incomplète — migration requise."
            : (err?.message || "Erreur ajout commentaire."),
        },
        500
      );
    }
  };

  registerMulti("post", ["/api/vibe/posts/:id/comments", "/vibe/posts/:id/comments", "/v1/posts/:id/comments", "/comments/:id"], handleAddComment);

  // 4. LIKE / UNLIKE A COMMENT
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
          if (authorId && authorId !== userId && !(await isBlockEitherWay(userId, authorId))) {
            await sql`
              INSERT INTO notifications (recipient_id, actor_id, type, post_id, comment_id, message)
              VALUES (${authorId}, ${userId}, 'like', ${cm[0]?.post_id}::uuid, ${commentId}::uuid, 'a aimé votre commentaire')
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
