/**
 * ============================================================================
 * VIBE SOCIAL PLATFORM — FEEDS & DISCOVERY (vibe-feed.ts)
 * Timeline feeds (Pour Vous, Abonnements, Tendances), real-time trends & search
 * ============================================================================
 */

import type { Hono } from "npm:hono@4";
import { extractToken, getDb, verifyToken } from "./config.ts";
import { isBlockEitherWay, resolveHiddenUserIds, type RegisterMultiFn } from "./vibe-common.ts";
import { HybridRecommender } from "./vibe-recommender.ts";
import { ensureCircleTable } from "./vibe-circle.ts";
import {
  attachPollsAndCollabs,
  attachQuotedPosts,
  ensurePostColumns,
  fetchPostMedia,
  publishDuePosts,
} from "./vibe-posts-core.ts";

// ── Signaux d'affinement d'algorithme (« Cela m'intéresse / pas ») ──
export const FEEDBACK_STOP_WORDS = new Set([
  "avec", "dans", "cette", "pour", "plus", "moins", "tout", "tous", "être", "fait",
  "comme", "mais", "vous", "nous", "elle", "ils", "quoi", "ainsi", "alors", "très",
  "this", "that", "with", "from", "your", "have", "will", "about", "just", "they",
  "http", "https", "www",
]);

export const extractFeedbackTokens = (content: string): string[] => {
  const lower = (content || "").toLowerCase();
  const tokens: string[] = [];
  for (const m of lower.matchAll(/#([\p{L}\p{N}_]{2,30})/gu)) tokens.push(`#${m[1]}`);
  for (const w of lower.split(/[^\p{L}\p{N}#']+/u)) {
    if (w.length >= 4 && !FEEDBACK_STOP_WORDS.has(w)) tokens.push(w);
  }
  return Array.from(new Set(tokens));
};

export function registerVibeFeedRoutes(app: Hono, registerMulti: RegisterMultiFn) {
  // Protection contre le double enregistrement (idempotence)
  if ((app as any).__vibe_feed_registered) return;
  (app as any).__vibe_feed_registered = true;

  // Initialisation paresseuse des colonnes critiques en tâche de fond
  ensurePostColumns().catch(() => {});

  // 1. TIMELINE FEED
  const handleFeed = async (c: any) => {
    try {
      await ensurePostColumns().catch(() => {});
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

      // Comptes masqués (mute) et bloqués : exclus de tous les modes de feed
      // (le blocage est bidirectionnel — cf. resolveHiddenUserIds).
      const { mutedIds, blockedIds } = await resolveHiddenUserIds(currentUserId);
      const hiddenAuthorIds = new Set<number>([...mutedIds, ...blockedIds]);
      const isHiddenAuthor = (authorId: any) => hiddenAuthorIds.has(Number(authorId));

      // Publication paresseuse des vibes planifiées arrivées à échéance
      await publishDuePosts();

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

      // Médias hydratés via le helper top-level fetchPostMedia (tagged-template only).

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
                   ${currentUserId ? sql`(SELECT COUNT(*) FROM bookmarks WHERE post_id = p.id AND user_id = ${currentUserId}) > 0` : sql`FALSE`} as has_bookmarked,
                   ${currentUserId ? sql`(SELECT pi.interaction_type FROM post_interactions pi WHERE pi.post_id = p.id AND pi.user_id = ${currentUserId} AND pi.interaction_type IN ('interest_more', 'interest_less') LIMIT 1)` : sql`NULL`} as my_feedback
            FROM posts p
            JOIN users u ON u.id = p.author_id
            LEFT JOIN profiles pr ON pr.user_id = u.id
            WHERE p.visibility = 'public' AND COALESCE(p.status, 'published') = 'published' AND p.content ILIKE ('%' || ${tag} || '%')
            ORDER BY (p.likes_count * 3 + p.reposts_count * 2 + p.replies_count * 2) DESC, p.published_at DESC
            LIMIT ${PAGE_SIZE} OFFSET ${rankOffset}
          `;
        } else {
          posts = await sql`
            SELECT p.*, pr.display_name, pr.avatar_url, u.username, u.tier,
                   (COALESCE(u.is_verified, FALSE) OR LOWER(COALESCE(u.tier, '')) IN ('plus', 'pro', 'max')) as is_verified,
                   ${currentUserId ? sql`(SELECT COUNT(*) FROM post_interactions WHERE post_id = p.id AND user_id = ${currentUserId} AND interaction_type = 'like') > 0` : sql`FALSE`} as has_liked,
                   ${currentUserId ? sql`(SELECT COUNT(*) FROM post_interactions WHERE post_id = p.id AND user_id = ${currentUserId} AND interaction_type = 'repost') > 0` : sql`FALSE`} as has_reposted,
                   ${currentUserId ? sql`(SELECT COUNT(*) FROM bookmarks WHERE post_id = p.id AND user_id = ${currentUserId}) > 0` : sql`FALSE`} as has_bookmarked,
                   ${currentUserId ? sql`(SELECT pi.interaction_type FROM post_interactions pi WHERE pi.post_id = p.id AND pi.user_id = ${currentUserId} AND pi.interaction_type IN ('interest_more', 'interest_less') LIMIT 1)` : sql`NULL`} as my_feedback
            FROM posts p
            JOIN users u ON u.id = p.author_id
            LEFT JOIN profiles pr ON pr.user_id = u.id
            WHERE p.visibility = 'public' AND COALESCE(p.status, 'published') = 'published'
            ORDER BY (p.likes_count * 3 + p.reposts_count * 2 + p.replies_count * 2) DESC, p.published_at DESC
            LIMIT ${PAGE_SIZE} OFFSET ${rankOffset}
          `;
        }

        await fetchPostMedia(posts);
        await attachQuotedPosts(posts);
        await attachPollsAndCollabs(posts, currentUserId).catch(() => {});

        // Filtrage mute/block (après pagination OFFSET — les trous éventuels
        // sont acceptables pour un classement de tendances).
        const visibleTrending = posts.filter((p: any) => !isHiddenAuthor(p.author_id));

        return c.json({
          mode: "trending",
          title: tag ? `Tendances : ${tag}` : "Tendances Populaires",
          count: visibleTrending.length,
          nextCursor: posts.length === PAGE_SIZE ? `rank:${rankOffset + PAGE_SIZE}` : null,
          posts: visibleTrending,
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
          await ensureCircleTable().catch(() => {});
          posts = await sql`
            SELECT p.*, pr.display_name, pr.avatar_url, u.username, u.tier,
                   (COALESCE(u.is_verified, FALSE) OR LOWER(COALESCE(u.tier, '')) IN ('plus', 'pro', 'max')) as is_verified,
                   (SELECT COUNT(*) FROM post_interactions WHERE post_id = p.id AND user_id = ${currentUserId} AND interaction_type = 'like') > 0 as has_liked,
                   (SELECT COUNT(*) FROM post_interactions WHERE post_id = p.id AND user_id = ${currentUserId} AND interaction_type = 'repost') > 0 as has_reposted,
                   (SELECT COUNT(*) FROM bookmarks WHERE post_id = p.id AND user_id = ${currentUserId}) > 0 as has_bookmarked,
                   (SELECT pi.interaction_type FROM post_interactions pi WHERE pi.post_id = p.id AND pi.user_id = ${currentUserId} AND pi.interaction_type IN ('interest_more', 'interest_less') LIMIT 1) as my_feedback
            FROM posts p
            JOIN users u ON u.id = p.author_id
            LEFT JOIN profiles pr ON pr.user_id = u.id
            WHERE (
              p.author_id = ${currentUserId}
              OR p.author_id IN (SELECT following_id FROM follows WHERE follower_id = ${currentUserId})
            ) AND COALESCE(p.status, 'published') = 'published'
              AND (
                p.visibility = 'public'
                OR p.author_id = ${currentUserId}
                OR (p.visibility = 'followers' AND EXISTS (SELECT 1 FROM follows f2 WHERE f2.follower_id = ${currentUserId} AND f2.following_id = p.author_id))
                OR (p.visibility = 'circle' AND EXISTS (SELECT 1 FROM circle_members cm2 WHERE cm2.user_id = p.author_id AND cm2.member_user_id = ${currentUserId}))
              ) ${cursorFilter(currentUserId)}
            ORDER BY p.published_at DESC, p.id DESC
            LIMIT ${PAGE_SIZE}
          `;
        } else {
          // Visiteur non connecté : aucun abonnement
          posts = [];
        }

        await fetchPostMedia(posts);
        await attachQuotedPosts(posts);
        await attachPollsAndCollabs(posts, currentUserId).catch(() => {});

        // Filtrage mute/block dans le flux Abonnements
        const visibleStream = posts.filter((p: any) => !isHiddenAuthor(p.author_id));

        const last = visibleStream[visibleStream.length - 1];
        return c.json({
          mode: "stream",
          title: "Abonnements",
          count: visibleStream.length,
          nextCursor:
            posts.length === PAGE_SIZE && last
              ? `${new Date(last.published_at).toISOString()}|${last.id}`
              : null,
          posts: visibleStream,
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
               ${currentUserId ? sql`(SELECT COUNT(*) FROM bookmarks WHERE post_id = p.id AND user_id = ${currentUserId}) > 0` : sql`FALSE`} as has_bookmarked,
               ${currentUserId ? sql`(SELECT pi.interaction_type FROM post_interactions pi WHERE pi.post_id = p.id AND pi.user_id = ${currentUserId} AND pi.interaction_type IN ('interest_more', 'interest_less') LIMIT 1)` : sql`NULL`} as my_feedback
        FROM posts p
        JOIN users u ON u.id = p.author_id
        LEFT JOIN profiles pr ON pr.user_id = u.id
        WHERE p.visibility = 'public' AND COALESCE(p.status, 'published') = 'published'
        ORDER BY p.published_at DESC
        LIMIT 300
      `;

      await fetchPostMedia(rawCandidates);

      // Filtrage selon les paramètres utilisateur
      const filteredCandidates = rawCandidates.filter((post: any) => {
        if (shouldHideReposts && post.is_repost) return false;
        if (currentUserId && Number(post.author_id) === currentUserId) return true;
        if (isHiddenAuthor(post.author_id)) return false;
        if (blockedKeywords.length > 0) {
          const contentLc = (post.content || '').toLowerCase();
          const hasBlocked = blockedKeywords.some((kw: string) => kw && contentLc.includes(kw));
          if (hasBlocked) return false;
        }
        return true;
      });

      // Signaux d'affinement : retours « Cela m'intéresse / pas » + centres d'intérêt
      let moreAuthorWeights = new Map<number, number>();
      let lessAuthorWeights = new Map<number, number>();
      let moreTokenWeights = new Map<string, number>();
      let lessTokenWeights = new Map<string, number>();
      let interestTags: string[] = [];

      if (currentUserId) {
        try {
          const [feedbackRows, interestRows] = await Promise.all([
            sql`
              SELECT pi.interaction_type, p.author_id, p.content
              FROM post_interactions pi
              JOIN posts p ON p.id = pi.post_id
              WHERE pi.user_id = ${currentUserId}
                AND pi.interaction_type IN ('interest_more', 'interest_less')
              ORDER BY pi.created_at DESC
              LIMIT 200
            `,
            sql`SELECT interests FROM profiles WHERE user_id = ${currentUserId} LIMIT 1`,
          ]);
          for (const row of feedbackRows) {
            const authorId = Number(row.author_id);
            const isMore = row.interaction_type === 'interest_more';
            const authorMap = isMore ? moreAuthorWeights : lessAuthorWeights;
            const tokenMap = isMore ? moreTokenWeights : lessTokenWeights;
            authorMap.set(authorId, Math.min(3, (authorMap.get(authorId) || 0) + 1));
            for (const token of extractFeedbackTokens(row.content)) {
              tokenMap.set(token, Math.min(3, (tokenMap.get(token) || 0) + 1));
            }
          }
          const rawInterests = interestRows[0]?.interests;
          if (Array.isArray(rawInterests)) {
            interestTags = rawInterests.map((t: any) => String(t).toLowerCase().trim()).filter(Boolean);
          } else if (typeof rawInterests === 'string') {
            interestTags = rawInterests.split(',').map((t) => t.toLowerCase().trim()).filter(Boolean);
          }
        } catch (feedbackErr) {
          console.warn("[Vibe API] Erreur signaux feedback:", feedbackErr);
        }
      }

      const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

      const computeInterestSignal = (post: any): { signal: number; matched: string[] } => {
        if (!currentUserId) return { signal: 0, matched: [] };
        const authorId = Number(post.author_id);
        const authorDelta =
          (moreAuthorWeights.get(authorId) || 0) - (lessAuthorWeights.get(authorId) || 0);
        const tokens = extractFeedbackTokens(post.content);
        let topicDelta = 0;
        let interestMatches = 0;
        const matched: string[] = [];
        for (const token of tokens) {
          const wMore = moreTokenWeights.get(token) || 0;
          const wLess = lessTokenWeights.get(token) || 0;
          if (wMore > 0 || wLess > 0) topicDelta += wMore - wLess;
          const bare = token.replace(/^#/, "");
          if (interestTags.includes(bare) || interestTags.includes(token)) {
            interestMatches += 1;
            if (matched.length < 3) matched.push(bare);
          }
        }
        const signal = clamp(
          0.4 * (authorDelta / 3) +
            0.4 * clamp(topicDelta / 3, -3, 3) / 3 +
            0.2 * (Math.min(2, interestMatches) / 2),
          -1,
          1
        );
        return { signal, matched };
      };

      const scoredPosts = filteredCandidates.map((post: any) => {
        const interest = computeInterestSignal(post);
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
          interestSignal: interest.signal,
          matchedInterestTags: interest.matched,
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
      await attachQuotedPosts(page);
      await attachPollsAndCollabs(page, currentUserId).catch(() => {});

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
          AND visibility = 'public' AND status = 'published'
        ORDER BY (likes_count * 2 + reposts_count * 3 + replies_count) DESC
        LIMIT 300
      `;

      if (recentPosts.length < 5) {
        recentPosts = await sql`
          SELECT content, likes_count, reposts_count, replies_count, views_count, published_at
          FROM posts
          WHERE published_at > NOW() - INTERVAL '30 days'
            AND visibility = 'public' AND status = 'published'
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

  // 3. SEARCH POSTS
  const handleSearchPosts = async (c: any) => {
    try {
      await ensurePostColumns().catch(() => {});
      const q = (c.req.query("q") || c.req.query("query") || "").trim();
      if (!q) {
        return c.json({ posts: [], count: 0 });
      }
      const token = extractToken(c.req.raw);
      let currentUserId: number | null = null;
      if (token) {
        try {
          const payload = await verifyToken(token);
          currentUserId = Number(payload.sub || (payload as any).id);
        } catch {}
      }

      const sql = getDb();
      const limit = Math.min(50, Math.max(1, Number(c.req.query("limit") || 20)));
      const offset = Math.max(0, Number(c.req.query("offset") || 0));

      const cleanQ = q.startsWith("#") ? q.slice(1) : q;
      const posts = await sql`
        SELECT p.*, pr.display_name, pr.avatar_url, u.username, u.tier,
               (COALESCE(u.is_verified, FALSE) OR LOWER(COALESCE(u.tier, '')) IN ('plus', 'pro', 'max')) as is_verified,
               ${currentUserId ? sql`(SELECT COUNT(*) FROM post_interactions WHERE post_id = p.id AND user_id = ${currentUserId} AND interaction_type = 'like') > 0` : sql`FALSE`} as has_liked,
               ${currentUserId ? sql`(SELECT COUNT(*) FROM post_interactions WHERE post_id = p.id AND user_id = ${currentUserId} AND interaction_type = 'repost') > 0` : sql`FALSE`} as has_reposted,
               ${currentUserId ? sql`(SELECT COUNT(*) FROM bookmarks WHERE post_id = p.id AND user_id = ${currentUserId}) > 0` : sql`FALSE`} as has_bookmarked,
               ${currentUserId ? sql`(SELECT pi.interaction_type FROM post_interactions pi WHERE pi.post_id = p.id AND pi.user_id = ${currentUserId} AND pi.interaction_type IN ('interest_more', 'interest_less') LIMIT 1)` : sql`NULL`} as my_feedback
        FROM posts p
        JOIN users u ON u.id = p.author_id
        LEFT JOIN profiles pr ON pr.user_id = u.id
        WHERE p.visibility = 'public' AND COALESCE(p.status, 'published') = 'published'
          AND (
            p.content ILIKE ('%' || ${cleanQ} || '%')
            OR u.username ILIKE ('%' || ${cleanQ} || '%')
            OR pr.display_name ILIKE ('%' || ${cleanQ} || '%')
          )
        ORDER BY p.published_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      await fetchPostMedia(posts);
      await attachQuotedPosts(posts);
      await attachPollsAndCollabs(posts, currentUserId).catch(() => {});

      // Filtrage mute/block des résultats de recherche
      const { mutedIds: searchMuted, blockedIds: searchBlocked } = await resolveHiddenUserIds(currentUserId);
      const searchHidden = new Set<number>([...searchMuted, ...searchBlocked]);
      const visiblePosts = posts.filter((p: any) => !searchHidden.has(Number(p.author_id)));

      return c.json({
        query: q,
        count: visiblePosts.length,
        posts: visiblePosts,
      });
    } catch (err: any) {
      console.error("[Search Posts Error]:", err);
      return c.json({ error: "Erreur recherche publications." }, 500);
    }
  };

  registerMulti("get", [
    "/api/vibe/search/posts",
    "/vibe/search/posts",
    "/v1/search/posts",
    "/search/posts",
  ], handleSearchPosts);

  // 4. UNIFIED GLOBAL SEARCH (posts + users + books + DMs, limit/section)
  const handleSearchUnified = async (c: any) => {
    try {
      await ensurePostColumns().catch(() => {});
      const q = (c.req.query("q") || c.req.query("query") || "").trim();
      if (!q) {
        return c.json({ posts: [], users: [], books: [], messages: [], total: 0 });
      }
      const token = extractToken(c.req.raw);
      let currentUserId: number | null = null;
      if (token) {
        try {
          const payload = await verifyToken(token);
          currentUserId = Number(payload.sub || (payload as any).id);
        } catch {}
      }
      const sql = getDb();
      const limit = Math.min(10, Math.max(1, Number(c.req.query("limit") || 5)));
      const cleanQ = q.startsWith("#") ? q.slice(1) : q;

      const postsPromise = sql`
        SELECT p.*, pr.display_name, pr.avatar_url, u.username, u.tier,
               (COALESCE(u.is_verified, FALSE) OR LOWER(COALESCE(u.tier, '')) IN ('plus', 'pro', 'max')) as is_verified
        FROM posts p
        JOIN users u ON u.id = p.author_id
        LEFT JOIN profiles pr ON pr.user_id = u.id
        WHERE p.visibility = 'public' AND COALESCE(p.status, 'published') = 'published'
          AND (
            p.content ILIKE ('%' || ${cleanQ} || '%')
            OR u.username ILIKE ('%' || ${cleanQ} || '%')
            OR pr.display_name ILIKE ('%' || ${cleanQ} || '%')
          )
        ORDER BY p.published_at DESC
        LIMIT ${limit}
      `.catch(() => []);

      const usersPromise = sql`
        SELECT u.id, u.username, u.tier,
          (COALESCE(u.is_verified, FALSE) OR LOWER(COALESCE(u.tier, '')) IN ('plus', 'pro', 'max')) as is_verified,
          pr.display_name, pr.avatar_url, pr.bio, pr.followers_count, pr.posts_count
        FROM users u
        LEFT JOIN profiles pr ON pr.user_id = u.id
        WHERE LOWER(u.username) LIKE ${`%${q.toLowerCase()}%`}
           OR LOWER(COALESCE(pr.display_name, '')) LIKE ${`%${q.toLowerCase()}%`}
        ORDER BY COALESCE(pr.followers_count, 0) DESC
        LIMIT ${limit}
      `.catch(() => []);

      const booksPromise = currentUserId ? sql`
        SELECT b.id, b.title, b.icon, b.created_at,
               (SELECT COUNT(*) FROM vibe_book_items bi WHERE bi.book_id = b.id) AS items_count
        FROM vibe_books b
        WHERE b.user_id = ${currentUserId} AND b.title ILIKE ('%' || ${q} || '%')
        ORDER BY b.created_at DESC
        LIMIT ${limit}
      `.catch(() => []) : Promise.resolve([]);

      const messagesPromise = currentUserId ? sql`
        SELECT m.id, m.conversation_id, m.sender_id, m.recipient_id, m.content, m.is_read, m.created_at
        FROM direct_messages m
        WHERE m.content ILIKE ('%' || ${q} || '%')
          AND m.conversation_id IN (
            SELECT dm.id FROM dm_conversations dm
            WHERE dm.participant_one_id = ${currentUserId} OR dm.participant_two_id = ${currentUserId}
          )
          AND (m.status IS NULL OR m.status = 'sent')
        ORDER BY m.created_at DESC
        LIMIT ${limit}
      `.catch(() => []) : Promise.resolve([]);

      const [posts, users, books, messages] = await Promise.all([
        postsPromise, usersPromise, booksPromise, messagesPromise,
      ]);
      try { await fetchPostMedia(posts); } catch {}
      try { await attachQuotedPosts(posts); } catch {}
      try { await attachPollsAndCollabs(posts, currentUserId); } catch {}

      return c.json({
        posts, users, books, messages,
        total: posts.length + users.length + books.length + messages.length,
      });
    } catch (err: any) {
      console.error("[Search Unified Error]:", err);
      return c.json({ error: "Erreur recherche unifiée." }, 500);
    }
  };

  registerMulti("get", [
    "/api/vibe/search/unified",
    "/vibe/search/unified",
    "/v1/search/unified",
    "/search/unified",
  ], handleSearchUnified);
}
