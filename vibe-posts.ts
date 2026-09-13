/**
 * ============================================================================
 * VIBE SOCIAL PLATFORM — POSTS ROUTES ORCHESTRATOR (vibe-posts.ts)
 * Point d'entrée historique des routes posts : ré-exporte les helpers
 * (vibe-posts-core.ts) pour compatibilité ascendante et délègue
 * l'enregistrement aux modules CRUD (vibe-posts-crud.ts) et engagement
 * (vibe-posts-engage.ts), plus les flux (vibe-feed.ts).
 * L'ordre d'enregistrement des routes est strictement inchangé.
 * ============================================================================
 */

import type { Hono } from "npm:hono@4";
import type { RegisterMultiFn } from "./vibe-common.ts";
import { registerVibeFeedRoutes } from "./vibe-feed.ts";
import { ensurePostColumns } from "./vibe-posts-core.ts";
import { registerPostCrudRoutes } from "./vibe-posts-crud.ts";
import { registerPostEngagementRoutes } from "./vibe-posts-engage.ts";

export { registerVibeFeedRoutes } from "./vibe-feed.ts";
export {
  attachCollaborators,
  attachPolls,
  attachPollsAndCollabs,
  attachQuotedPosts,
  ensurePostColumns,
  fetchPostMedia,
  isUuid,
  publishDuePosts,
  stripHtmlTags,
  visibilityFilter,
} from "./vibe-posts-core.ts";

export function registerVibePostsRoutes(app: Hono, registerMulti: RegisterMultiFn) {
  // Protection contre le double enregistrement (idempotence)
  if ((app as any).__vibe_posts_registered) return;
  (app as any).__vibe_posts_registered = true;

  // Garantir les colonnes en tâche de fond dès le chargement du serveur
  ensurePostColumns().catch(() => {});

  // Enregistrer également les routes de flux et recherche si non déjà fait
  registerVibeFeedRoutes(app, registerMulti);

  // CRUD + extensions (création, sondages, stats, collab, programmés, brouillons…)
  registerPostCrudRoutes(registerMulti);

  // Engagement (likes, reposts, feedback, bookmarks, commentaires, vues, pin…)
  registerPostEngagementRoutes(registerMulti);
}
