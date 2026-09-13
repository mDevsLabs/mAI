/**
 * ============================================================================
 * VIBE SOCIAL PLATFORM — BOOKS / VIBE PRÉFÉRÉES (vibe-books.ts)
 * Collections personnelles de Vibe (max 5 Livres par compte), avec icône
 * lucide + titre. Chaque Livre regroupe des posts enregistrés en favoris.
 * ============================================================================
 */

import type { Hono } from "npm:hono@4";
import { extractToken, getDb, verifyToken } from "./config.ts";
import type { RegisterMultiFn } from "./vibe-common.ts";
import { attachQuotedPosts } from "./vibe-posts-core.ts";

/** Limite de Livres par compte. */
export const MAX_BOOKS_PER_USER = 5;

async function ensureBooksTables(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS vibe_books (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id INTEGER NOT NULL,
      title VARCHAR(60) NOT NULL,
      icon VARCHAR(40) NOT NULL DEFAULT 'BookHeart',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS vibe_book_items (
      book_id UUID NOT NULL REFERENCES vibe_books(id) ON DELETE CASCADE,
      post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      added_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (book_id, post_id)
    )
  `;
}

async function getAuthUserId(c: any): Promise<number | null> {
  try {
    const token = extractToken(c.req.raw);
    if (!token) return null;
    const payload = await verifyToken(token);
    const userId = Number(payload.sub || (payload as any).id || (payload as any).userId);
    return userId && !isNaN(userId) ? userId : null;
  } catch {
    return null;
  }
}

export function registerVibeBooksRoutes(app: Hono, registerMulti: RegisterMultiFn) {
  // 1. LISTE DES LIVRES DU COMPTE (+ nb de Vibe par Livre)
  const handleListBooks = async (c: any) => {
    try {
      const userId = await getAuthUserId(c);
      if (!userId) return c.json({ error: "Non authentifié." }, 401);
      const sql = getDb();
      await ensureBooksTables(sql);

      const postId = c.req.query("post_id") || "";
      const rows = await sql`
        SELECT b.id, b.title, b.icon, b.created_at,
               (SELECT COUNT(*) FROM vibe_book_items bi WHERE bi.book_id = b.id) AS items_count,
               ${postId ? sql`EXISTS (SELECT 1 FROM vibe_book_items bi2 WHERE bi2.book_id = b.id AND bi2.post_id = ${postId}::uuid)` : sql`FALSE`} AS contains_post
        FROM vibe_books b
        WHERE b.user_id = ${userId}
        ORDER BY b.created_at ASC
      `;

      return c.json({ success: true, books: rows, maxBooks: MAX_BOOKS_PER_USER });
    } catch (err: any) {
      console.error("[vibe-books] List error:", err);
      return c.json({ error: "Erreur lors de la récupération des Livres." }, 500);
    }
  };
  registerMulti("get", ["/api/vibe/books", "/vibe/books", "/v1/books"], handleListBooks);

  // 2. CRÉATION D'UN LIVRE (max 5 par compte)
  const handleCreateBook = async (c: any) => {
    try {
      const userId = await getAuthUserId(c);
      if (!userId) return c.json({ error: "Non authentifié." }, 401);
      const body = await c.req.json().catch(() => ({}));
      const title = String(body?.title || "").trim();
      const icon = String(body?.icon || "BookHeart").trim().slice(0, 40);

      if (!title) return c.json({ error: "Veuillez donner un titre à votre Livre." }, 400);
      if (title.length > 60) return c.json({ error: "Le titre est limité à 60 caractères." }, 400);

      const sql = getDb();
      await ensureBooksTables(sql);
      const countRows = await sql`SELECT COUNT(*) AS n FROM vibe_books WHERE user_id = ${userId}`;
      if (Number(countRows[0]?.n || 0) >= MAX_BOOKS_PER_USER) {
        return c.json({ error: `Vous avez atteint la limite de ${MAX_BOOKS_PER_USER} Livres par compte.` }, 403);
      }

      const inserted = await sql`
        INSERT INTO vibe_books (user_id, title, icon)
        VALUES (${userId}, ${title}, ${icon})
        RETURNING id, title, icon, created_at
      `;

      return c.json({ success: true, book: { ...inserted[0], items_count: 0, contains_post: false } }, 201);
    } catch (err: any) {
      console.error("[vibe-books] Create error:", err);
      return c.json({ error: "Erreur lors de la création du Livre." }, 500);
    }
  };
  registerMulti("post", ["/api/vibe/books", "/vibe/books", "/v1/books"], handleCreateBook);

  // 3. MISE À JOUR D'UN LIVRE (titre / icône)
  const handleUpdateBook = async (c: any) => {
    try {
      const userId = await getAuthUserId(c);
      if (!userId) return c.json({ error: "Non authentifié." }, 401);
      const bookId = c.req.param("bookId");
      const body = await c.req.json().catch(() => ({}));
      const title = body?.title !== undefined ? String(body.title).trim() : null;
      const icon = body?.icon !== undefined ? String(body.icon).trim().slice(0, 40) : null;

      if (title !== null && !title) return c.json({ error: "Le titre ne peut pas être vide." }, 400);

      const sql = getDb();
      await ensureBooksTables(sql);
      const updated = await sql`
        UPDATE vibe_books SET
          title = ${title ?? sql`title`},
          icon = ${icon ?? sql`icon`}
        WHERE id = ${bookId}::uuid AND user_id = ${userId}
        RETURNING id, title, icon, created_at
      `;
      if (updated.length === 0) return c.json({ error: "Livre introuvable." }, 404);

      return c.json({ success: true, book: updated[0] });
    } catch (err: any) {
      console.error("[vibe-books] Update error:", err);
      return c.json({ error: "Erreur lors de la mise à jour du Livre." }, 500);
    }
  };
  registerMulti("post", [
    "/api/vibe/books/:bookId/update",
    "/vibe/books/:bookId/update",
    "/v1/books/:bookId/update",
  ], handleUpdateBook);

  // 4. SUPPRESSION D'UN LIVRE (les Vibe enregistrées sont libérées, pas supprimées)
  const handleDeleteBook = async (c: any) => {
    try {
      const userId = await getAuthUserId(c);
      if (!userId) return c.json({ error: "Non authentifié." }, 401);
      const bookId = c.req.param("bookId");
      const sql = getDb();
      await ensureBooksTables(sql);
      const deleted = await sql`
        DELETE FROM vibe_books WHERE id = ${bookId}::uuid AND user_id = ${userId} RETURNING id
      `;
      if (deleted.length === 0) return c.json({ error: "Livre introuvable." }, 404);
      return c.json({ success: true });
    } catch (err: any) {
      console.error("[vibe-books] Delete error:", err);
      return c.json({ error: "Erreur lors de la suppression du Livre." }, 500);
    }
  };
  registerMulti("delete", ["/api/vibe/books/:bookId", "/vibe/books/:bookId", "/v1/books/:bookId"], handleDeleteBook);

  // 5. ENREGISTRER / RETIRER UNE VIBE D'UN LIVRE (toggle)
  const handleToggleBookItem = async (c: any) => {
    try {
      const userId = await getAuthUserId(c);
      if (!userId) return c.json({ error: "Non authentifié." }, 401);
      const bookId = c.req.param("bookId");
      const postId = c.req.param("postId");
      const sql = getDb();
      await ensureBooksTables(sql);

      const owned = await sql`SELECT id FROM vibe_books WHERE id = ${bookId}::uuid AND user_id = ${userId} LIMIT 1`;
      if (owned.length === 0) return c.json({ error: "Livre introuvable." }, 404);

      const exists = await sql`SELECT 1 FROM posts WHERE id = ${postId}::uuid LIMIT 1`;
      if (exists.length === 0) return c.json({ error: "Publication introuvable." }, 404);

      const already = await sql`
        SELECT 1 FROM vibe_book_items WHERE book_id = ${bookId}::uuid AND post_id = ${postId}::uuid
      `;
      if (already.length > 0) {
        await sql`DELETE FROM vibe_book_items WHERE book_id = ${bookId}::uuid AND post_id = ${postId}::uuid`;
        return c.json({ success: true, saved: false });
      } else {
        await sql`
          INSERT INTO vibe_book_items (book_id, post_id) VALUES (${bookId}::uuid, ${postId}::uuid)
          ON CONFLICT DO NOTHING
        `;
        return c.json({ success: true, saved: true });
      }
    } catch (err: any) {
      console.error("[vibe-books] Toggle item error:", err);
      return c.json({ error: "Erreur lors de l'enregistrement dans le Livre." }, 500);
    }
  };
  registerMulti("post", [
    "/api/vibe/books/:bookId/posts/:postId",
    "/vibe/books/:bookId/posts/:postId",
    "/v1/books/:bookId/posts/:postId",
  ], handleToggleBookItem);

  // 6. CONTENU D'UN LIVRE (liste de Vibe, même forme que le fil)
  const handleGetBookPosts = async (c: any) => {
    try {
      const userId = await getAuthUserId(c);
      if (!userId) return c.json({ error: "Non authentifié." }, 401);
      const bookId = c.req.param("bookId");
      const sql = getDb();
      await ensureBooksTables(sql);

      const bookRows = await sql`SELECT id, title, icon, created_at FROM vibe_books WHERE id = ${bookId}::uuid AND user_id = ${userId} LIMIT 1`;
      if (bookRows.length === 0) return c.json({ error: "Livre introuvable." }, 404);

      const rows = await sql`
        SELECT p.*, pr.display_name, pr.avatar_url, u.username,
               (SELECT COUNT(*) FROM post_interactions WHERE post_id = p.id AND user_id = ${userId} AND interaction_type = 'like') > 0 as has_liked,
               (SELECT COUNT(*) FROM post_interactions WHERE post_id = p.id AND user_id = ${userId} AND interaction_type = 'repost') > 0 as has_reposted,
               (SELECT COUNT(*) FROM bookmarks WHERE post_id = p.id AND user_id = ${userId}) > 0 as has_bookmarked,
               (SELECT pi.interaction_type FROM post_interactions pi WHERE pi.post_id = p.id AND pi.user_id = ${userId} AND pi.interaction_type IN ('interest_more', 'interest_less') LIMIT 1) as my_feedback,
               bi.added_at as saved_at
        FROM vibe_book_items bi
        JOIN posts p ON p.id = bi.post_id
        JOIN users u ON u.id = p.author_id
        LEFT JOIN profiles pr ON pr.user_id = u.id
        WHERE bi.book_id = ${bookId}::uuid
          AND (COALESCE(p.status, 'published') <> 'scheduled' OR p.author_id = ${userId})
        ORDER BY bi.added_at DESC
        LIMIT 200
      `;

      const ids = rows.map((r: any) => String(r.id));
      const media = ids.length
        ? await sql`SELECT post_id, url, media_type, alt_text FROM media_assets WHERE post_id = ANY(${ids}::uuid[])`
        : [];
      const byPost: Record<string, any[]> = {};
      for (const m of media) {
        (byPost[String(m.post_id)] ||= []).push(m);
      }
      const posts = rows.map((r: any) => ({ ...r, media_assets: byPost[String(r.id)] || [] }));
      await attachQuotedPosts(posts);

      return c.json({ success: true, book: bookRows[0], posts });
    } catch (err: any) {
      console.error("[vibe-books] Book posts error:", err);
      return c.json({ error: "Erreur lors de la récupération du Livre." }, 500);
    }
  };
  registerMulti("get", [
    "/api/vibe/books/:bookId/posts",
    "/vibe/books/:bookId/posts",
    "/v1/books/:bookId/posts",
  ], handleGetBookPosts);

  // 7. LIVRES CONTENANT UNE VIBE DONNÉE (badge du PostCard)
  const handleBooksForPost = async (c: any) => {
    try {
      const userId = await getAuthUserId(c);
      if (!userId) return c.json({ error: "Non authentifié." }, 401);
      const postId = c.req.param("postId");
      const sql = getDb();
      await ensureBooksTables(sql);

      const rows = await sql`
        SELECT bi.book_id FROM vibe_book_items bi
        JOIN vibe_books b ON b.id = bi.book_id
        WHERE bi.post_id = ${postId}::uuid AND b.user_id = ${userId}
      `;

      return c.json({ success: true, book_ids: rows.map((r: any) => String(r.book_id)) });
    } catch (err: any) {
      console.error("[vibe-books] Books for post error:", err);
      return c.json({ error: "Erreur lors de la vérification des Livres." }, 500);
    }
  };
  registerMulti("get", [
    "/api/vibe/books/for-post/:postId",
    "/vibe/books/for-post/:postId",
    "/v1/books/for-post/:postId",
  ], handleBooksForPost);
}
