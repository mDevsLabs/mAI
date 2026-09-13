/**
 * ============================================================================
 * VIBE SOCIAL PLATFORM — POSTS CORE HELPERS (vibe-posts-core.ts)
 * Helpers partagés purs (sans dépendance Hono/app) : prédicats, requêtes
 * d'hydratation (citations, médias, sondages, collaborateurs), publication
 * paresseuse des vibes planifiées et migrations idempotentes des colonnes.
 * Importé par vibe-posts.ts, vibe-posts-crud.ts, vibe-posts-engage.ts,
 * vibe-feed.ts, vibe-users.ts et vibe-books.ts.
 * ============================================================================
 */

import { getDb } from "./config.ts";

export const isUuid = (v: any): boolean =>
  typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

/** Prédicat SQL : un post est lisible si public, sien, partagé aux abonnés
 *  (et que le spectateur suit l'auteur) ou au cercle (et qu'il en est membre). */
export const visibilityFilter = (viewerId: number | null) => {
  const sql = getDb();
  if (!viewerId) return sql`AND p.visibility = 'public'`;
  return sql`AND (
    p.visibility = 'public'
    OR p.author_id = ${viewerId}
    OR (p.visibility = 'followers' AND EXISTS (SELECT 1 FROM follows f WHERE f.follower_id = ${viewerId} AND f.following_id = p.author_id))
    OR (p.visibility = 'circle' AND EXISTS (SELECT 1 FROM circle_members cm WHERE cm.user_id = p.author_id AND cm.member_user_id = ${viewerId}))
  )`;
};

/** Version texte brut d'un contenu riche (scan de sécurité, snippets, recherche). */
export function stripHtmlTags(text: string): string {
  if (!text || !text.includes("<")) return text || "";
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|blockquote)>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/**
 * Publication paresseuse des vibes planifiées dont la date est atteinte :
 * appelée au chargement des flux / profils (aucun cron nécessaire côté serveur).
 * Throttle 30 s pour éviter un scan de table à chaque requête.
 */
let lastPublishCheck = 0;
export async function publishDuePosts(): Promise<void> {
  const now = Date.now();
  if (now - lastPublishCheck < 30_000) return;
  lastPublishCheck = now;
  try {
    await ensurePostColumns();
    const sql = getDb();
    const due = await sql`
      UPDATE posts
      SET status = 'published', published_at = NOW(), updated_at = NOW()
      WHERE status = 'scheduled' AND scheduled_at IS NOT NULL AND scheduled_at <= NOW()
      RETURNING id, author_id
    `;
    for (const p of due) {
      await sql`
        INSERT INTO notifications (recipient_id, actor_id, type, post_id, message)
        VALUES (${p.author_id}, ${p.author_id}, 'mai_system', ${p.id}::uuid, 'Votre vibe planifiée a été publiée.')
      `.catch(() => {});
    }
  } catch (err) {
    console.warn("[vibe-posts] publishDuePosts skipped:", (err as any)?.message);
  }
}

/**
 * Attache les publications citées (quote-posts) en une requête : champ
 * `quoted_post` {username, display_name, avatar_url, content, media_assets…}.
 * Exporté pour réutilisation (posts de profil dans vibe-users.ts).
 */
export async function attachQuotedPosts(posts: any[]) {
  if (!posts || posts.length === 0) return;
  for (const p of posts) p.quoted_post = null;
  const quoteIds = Array.from(new Set(posts.map((p) => p.quoted_post_id).filter(Boolean)));
  if (quoteIds.length === 0) return;
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT q.id, q.author_id, q.content, q.format, q.likes_count, q.replies_count, q.published_at, q.created_via, q.ai_generated,
             u.username, pr.display_name, pr.avatar_url,
             (COALESCE(u.is_verified, FALSE) OR LOWER(COALESCE(u.tier, '')) IN ('plus', 'pro', 'max')) as is_verified
      FROM posts q
      JOIN users u ON u.id = q.author_id
      LEFT JOIN profiles pr ON pr.user_id = u.id
      WHERE q.id = ANY(${quoteIds}::uuid[])
    `;
    const mediaRows = await sql`
      SELECT post_id, url, media_type, alt_text FROM media_assets WHERE post_id = ANY(${quoteIds}::uuid[])
    `;
    const mediaByPost: Record<string, any[]> = {};
    for (const m of mediaRows) {
      (mediaByPost[String(m.post_id)] ||= []).push({ url: m.url, media_type: m.media_type, alt_text: m.alt_text });
    }
    const byId = new Map(rows.map((r: any) => [String(r.id), { ...r, media_assets: mediaByPost[String(r.id)] || [] }]));
    for (const p of posts) {
      if (p.quoted_post_id) p.quoted_post = byId.get(String(p.quoted_post_id)) || null;
    }
  } catch (err) {
    console.warn("[vibe-posts] attachQuotedPosts:", (err as any)?.message);
  }
}

/**
 * Hydrate `media_assets` pour une liste de posts en une seule requête.
 * Forme tagged-template uniquement : neon@1.1.0 interdit l'appel
 * fonction classique `sql(ids)` — utiliser `= ANY(${ids}::uuid[])`.
 * Exporté car utilisé par le feed ET la recherche.
 */
export async function fetchPostMedia(posts: any[]) {
  if (!posts || posts.length === 0) return;
  try {
    const sql = getDb();
    const ids = posts.map((p) => p.id);
    const media = await sql`SELECT post_id, url, media_type, alt_text FROM media_assets WHERE post_id = ANY(${ids}::uuid[]) ORDER BY position ASC, created_at ASC`;
    const byPost: Record<string, any[]> = {};
    for (const m of media) {
      const key = String(m.post_id);
      (byPost[key] ||= []).push({ url: m.url, media_type: m.media_type, alt_text: m.alt_text });
    }
    for (const p of posts) p.media_assets = byPost[String(p.id)] || [];
  } catch (mediaErr) {
    console.warn("[Vibe API] Erreur fetchPostMedia:", mediaErr);
    for (const p of posts) p.media_assets ||= [];
  }
}

/**
 * Hydrate `poll` {id, question, ends_at, total_votes, options[{id,label,votes_count,position}],
 * my_vote: option_id|null, expired} pour une liste de posts. Exporté (feed, recherche, profils).
 */
export async function attachPolls(posts: any[], currentUserId: number | null) {
  if (!posts || posts.length === 0) return;
  for (const p of posts) p.poll = null;
  try {
    const sql = getDb();
    const ids = posts.map((p) => p.id);
    const polls = await sql`
      SELECT id, post_id, question, ends_at, total_votes, created_at
      FROM post_polls WHERE post_id = ANY(${ids}::uuid[])
    `.catch(() => []);
    if (!polls || polls.length === 0) return;
    const pollIds = polls.map((pl: any) => pl.id);
    const options = await sql`
      SELECT id, poll_id, label, votes_count, position
      FROM post_poll_options WHERE poll_id = ANY(${pollIds}::uuid[])
      ORDER BY position ASC
    `.catch(() => []);
    const optsByPoll: Record<string, any[]> = {};
    for (const o of options) (optsByPoll[String(o.poll_id)] ||= []).push(o);
    let votesByPoll: Record<string, string> = {};
    if (currentUserId) {
      const votes = await sql`
        SELECT poll_id, option_id FROM post_poll_votes
        WHERE poll_id = ANY(${pollIds}::uuid[]) AND user_id = ${currentUserId}
      `.catch(() => []);
      for (const v of votes) votesByPoll[String(v.poll_id)] = String(v.option_id);
    }
    const pollByPost: Record<string, any> = {};
    for (const pl of polls) {
      pollByPost[String(pl.post_id)] = {
        ...pl,
        options: optsByPoll[String(pl.id)] || [],
        my_vote: votesByPoll[String(pl.id)] || null,
        expired: new Date(pl.ends_at).getTime() <= Date.now(),
      };
    }
    for (const p of posts) p.poll = pollByPost[String(p.id)] || null;
  } catch (err) {
    console.warn("[vibe-posts] attachPolls skipped:", (err as any)?.message);
  }
}

/**
 * Hydrate `collaborators` [{username, display_name, avatar_url, status}] pour une liste de posts.
 */
export async function attachCollaborators(posts: any[]) {
  if (!posts || posts.length === 0) return;
  for (const p of posts) p.collaborators = [];
  try {
    const sql = getDb();
    const ids = posts.map((p) => p.id);
    const rows = await sql`
      SELECT pc.post_id, pc.status, u.username, pr.display_name, pr.avatar_url
      FROM post_collaborators pc
      JOIN users u ON u.id = pc.user_id
      LEFT JOIN profiles pr ON pr.user_id = u.id
      WHERE pc.post_id = ANY(${ids}::uuid[])
    `.catch(() => []);
    const byPost: Record<string, any[]> = {};
    for (const r of rows) {
      (byPost[String(r.post_id)] ||= []).push({
        username: r.username, display_name: r.display_name,
        avatar_url: r.avatar_url, status: r.status,
      });
    }
    for (const p of posts) p.collaborators = byPost[String(p.id)] || [];
  } catch (err) {
    console.warn("[vibe-posts] attachCollaborators skipped:", (err as any)?.message);
  }
}

/** Hydratation combinée sondages + collaborateurs (une seule import côté feed). */
export async function attachPollsAndCollabs(posts: any[], currentUserId: number | null) {
  await attachPolls(posts, currentUserId).catch(() => {});
  await attachCollaborators(posts).catch(() => {});
}

let postColumnsReady = false;
export const ensurePostColumns = async () => {
  if (postColumnsReady) return;
  try {
    const sql = getDb();
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE`.catch(() => {});
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS quoted_post_id UUID REFERENCES posts(id) ON DELETE SET NULL`.catch(() => {});
    // Planification de publication (réservée Plus/Pro/Max)
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published'`.catch(() => {});
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ`.catch(() => {});
    await sql`UPDATE posts SET status = 'published' WHERE status IS NULL`.catch(() => {});
    await sql`CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status)`.catch(() => {});
    await sql`CREATE INDEX IF NOT EXISTS idx_posts_scheduled_due ON posts(status, scheduled_at) WHERE status = 'scheduled'`.catch(() => {});
    // Médias joints aux commentaires
    await sql`ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS comment_id UUID REFERENCES comments(id) ON DELETE CASCADE`.catch(() => {});
    // Table comments : rendre path optionnel et garantir les colonnes requises
    await sql`ALTER TABLE comments ALTER COLUMN path DROP NOT NULL`.catch(() => {});
    await sql`ALTER TABLE comments ALTER COLUMN path SET DEFAULT ''`.catch(() => {});
    await sql`ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE`.catch(() => {});
    await sql`ALTER TABLE comments ADD COLUMN IF NOT EXISTS depth INTEGER DEFAULT 0`.catch(() => {});
    await sql`ALTER TABLE comments ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0`.catch(() => {});
    await sql`ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE`.catch(() => {});
    // Table comment_likes pour persister les likes de commentaires
    await sql`
      CREATE TABLE IF NOT EXISTS comment_likes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id BIGINT NOT NULL,
        comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE (user_id, comment_id)
      )
    `.catch(() => {});
    // Sondages intégrés aux posts (2-4 options, vote unique modifiable)
    await sql`
      CREATE TABLE IF NOT EXISTS post_polls (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        ends_at TIMESTAMPTZ NOT NULL,
        total_votes INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `.catch(() => {});
    await sql`
      CREATE TABLE IF NOT EXISTS post_poll_options (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        poll_id UUID NOT NULL REFERENCES post_polls(id) ON DELETE CASCADE,
        label TEXT NOT NULL,
        votes_count INT DEFAULT 0,
        position INT NOT NULL
      )
    `.catch(() => {});
    await sql`
      CREATE TABLE IF NOT EXISTS post_poll_votes (
        poll_id UUID NOT NULL,
        user_id BIGINT NOT NULL,
        option_id UUID NOT NULL,
        voted_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (poll_id, user_id)
      )
    `.catch(() => {});
    await sql`CREATE INDEX IF NOT EXISTS idx_polls_post ON post_polls(post_id)`.catch(() => {});
    await sql`CREATE INDEX IF NOT EXISTS idx_poll_options_poll ON post_poll_options(poll_id)`.catch(() => {});
    // Posts collaboratifs (co-signature : pending | accepted | declined)
    await sql`
      CREATE TABLE IF NOT EXISTS post_collaborators (
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id BIGINT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        invited_at TIMESTAMPTZ DEFAULT NOW(),
        accepted_at TIMESTAMPTZ,
        PRIMARY KEY (post_id, user_id)
      )
    `.catch(() => {});
    // Brouillons multi-appareils (synchronisation serveur, complément de draftCookie local)
    await sql`
      CREATE TABLE IF NOT EXISTS post_drafts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id BIGINT NOT NULL,
        html TEXT NOT NULL,
        text TEXT NOT NULL,
        visibility VARCHAR(20) DEFAULT 'public',
        scheduled_at TIMESTAMPTZ,
        ai_generated BOOLEAN DEFAULT FALSE,
        media_assets JSONB DEFAULT '[]',
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `.catch(() => {});
    await sql`CREATE INDEX IF NOT EXISTS idx_drafts_user ON post_drafts(user_id, updated_at DESC)`.catch(() => {});
    // Ordre d'affichage des médias (carrousel + drag & drop)
    await sql`ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS position INT DEFAULT 0`.catch(() => {});
    postColumnsReady = true;
  } catch (err) {
    console.warn("[vibe-posts] ensurePostColumns skipped:", (err as any)?.message);
  }
};
