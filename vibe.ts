/**
 * ============================================================================
 * VIBE SOCIAL PLATFORM — API ADAPTER (vibe.ts)
 * Root orchestrator mounting all modular Vibe & mAI sub-routes
 * Compatible with https://mai.val.run (/v1/, /vibe/, /api/vibe/)
 * ============================================================================
 */

import type { Hono } from "npm:hono@4";
import { createRegisterMulti } from "./vibe-common.ts";
import { registerVibePostsRoutes } from "./vibe-posts.ts";
import { registerVibeUsersRoutes } from "./vibe-users.ts";
import { registerVibeDMsRoutes } from "./vibe-dms.ts";
import { registerVibeSettingsRoutes } from "./vibe-settings.ts";
import { registerVibeMAIRoutes } from "./vibe-mai.ts";

// Re-export core classes & types for external modules and tests
export {
  HybridRecommender,
  type FeedTunerWeights,
  type PostCandidate,
  type RecommendationSignal,
} from "./vibe-recommender.ts";
export { MAI_TOOLS, MAIAgentFleet } from "./vibe-mai-fleet.ts";
export { registerVibePostsRoutes } from "./vibe-posts.ts";
export { registerVibeUsersRoutes } from "./vibe-users.ts";
export { registerVibeDMsRoutes } from "./vibe-dms.ts";
export { registerVibeSettingsRoutes } from "./vibe-settings.ts";
export { registerVibeMAIRoutes } from "./vibe-mai.ts";

/**
 * Registers all Vibe Social Network and mAI Engine routes on the main Hono application
 */
export function registerVibeRoutes(app: Hono) {
  const registerMulti = createRegisterMulti(app);

  // Mount modular route domains
  registerVibePostsRoutes(app, registerMulti);
  registerVibeUsersRoutes(app, registerMulti);
  registerVibeDMsRoutes(app, registerMulti);
  registerVibeSettingsRoutes(app, registerMulti);
  registerVibeMAIRoutes(app, registerMulti);
}
