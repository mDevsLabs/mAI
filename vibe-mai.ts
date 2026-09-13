/**
 * ============================================================================
 * VIBE SOCIAL PLATFORM — mAI CHAT & QUOTAS (vibe-mai.ts)
 * AI Assistant chat endpoint, tool triggers, user approval flow, quotas & text
 * modulation. Sensitive tools require explicit user approval unless the
 * `mai_auto_approve_tools` setting has been enabled.
 * ============================================================================
 */

import type { Hono } from "npm:hono@4";
import { extractToken, getDb, verifyToken, getWeekData } from "./config.ts";
import type { RegisterMultiFn } from "./vibe-common.ts";
import { MAIAgentFleet, SENSITIVE_TOOLS } from "./vibe-mai-fleet.ts";

/**
 * Modèles "mAI" marketing → modèles OpenRouter réels.
 * Les ids contenant déjà "/" (ex: anthropic/claude-3.7-sonnet) passent tels quels.
 */
const MODEL_MAP: Record<string, string> = {
  "poolside/laguna-xs-2.1:free": "poolside/laguna-xs-2.1:free",
  "mai-1.5-apex": "poolside/laguna-xs-2.1:free",
  "mai-1.5-light": "poolside/laguna-xs-2.1:free",
};

function _resolveOpenRouterModel(model: string): string {
  if (MODEL_MAP[model]) return MODEL_MAP[model];
  return model.includes("/") ? model : "poolside/laguna-xs-2.1:free";
}

/** Formatte la réponse conversationnelle après exécution d'un outil. */
function formatToolReply(toolName: string, result: any, _username: string): string {
  if (toolName === "generate_vibe_image") {
    return `🎨 Voici l'image générée avec mAI :\n\n![Image générée](${result.imageUrl})\n\n*Prompt : « ${result.prompt} »*`;
  }
  if (toolName === "search_web") {
    return `🌐 **Recherche Web mAI** :\n\n${result.snippet}`;
  }
  if (toolName === "fact_check") {
    return `🛡️ **Vérification Factuelle mAI** :\n• Affirmation : « ${result.statement} »\n• Résultat : **${result.verdict}** (Indice de confiance : ${result.confidence})\n\n${result.analysis}`;
  }
  if (toolName === "rewrite_post") {
    return `✨ **Texte reformulé (${result.style})** :\n\n${result.rewritten}`;
  }
  if (toolName === "translate") {
    return `🌐 **Traduction (${result.targetLanguage})** :\n\n${result.translated}`;
  }
  if (toolName === "create_post") {
    return `🚀 Votre publication a été publiée avec succès sur Vibe :\n\n« ${result.post.content} »`;
  }
  if (toolName === "delete_post") {
    return `🗑️ ${result.message}`;
  }
  if (toolName === "analyze_trends") {
    const trendsList = result.trendingTopics.map((t: any) => `• **${t.name}** (${t.postsCount} publications) — ${t.sentiment}`).join("\n");
    return trendsList
      ? `🔥 **Tendances actuelles sur Vibe** :\n\n${trendsList}`
      : "🔍 Pas encore de tendances détectées cette semaine. Publiez avec des hashtags pour lancer la vague !";
  }
  if (toolName === "suggest_post") {
    return `💡 **Idées de publications Vibe** (thème : ${result.topic}) :\n\n${result.suggestions}\n\n*Utilisez /publish suivi du texte choisi pour publier.*`;
  }
  if (toolName === "get_account_stats") {
    return `📈 **Statistiques du compte @${result.user.username}** :\n• Publications : **${result.totalPosts}**\n• Score de réputation : **${result.profile?.reputation_score || 100} pts**\n• Forfait : **${result.user.tier || 'Free'}**`;
  }
  if (toolName === "check_quotas") {
    const q = result;
    return `📊 **Vos quotas réels (${q.tier})** :\n• Tokens mAI : **${q.weeklyTokens.used.toLocaleString()}** / ${q.weeklyTokens.limit.toLocaleString()} (${q.weeklyTokens.percent}%)\n• Images quotidiennes : **${q.dailyImages.used}** / ${q.dailyImages.limit} (${q.dailyImages.percent}%)\n• Réinitialisation : ${new Date(q.resetAt).toLocaleDateString("fr-FR")}`;
  }
  if (toolName === "update_profile") {
    return `✅ ${result.message}\n\n• Nom affiché : **${result.profile.display_name}**\n• Bio : ${result.profile.bio || "_(vide)_"}`;
  }
  if (toolName === "follow_user") {
    return `👥 ${result.message}`;
  }
  if (toolName === "get_notifications") {
    if (result.count === 0) return "🔔 Aucune notification récente.";
    const list = result.notifications.slice(0, 10).map((n: any) => `• **${n.type}** — ${n.message || (n.actor_username ? `@${n.actor_username}` : "")}`).join("\n");
    return `🔔 **Vos ${result.count} dernières notifications** :\n\n${list}`;
  }
  return "✅ Action effectuée.";
}

export function registerVibeMAIRoutes(app: Hono, registerMulti: RegisterMultiFn) {
  // ── Persistance des conversations mAI (tables migration 002, créées
  //    idempotemment au démarrage : le migrateur n'exécute pas les SQL) ──
  let maiTablesReady = false;
  const ensureMAIConversations = async () => {
    if (maiTablesReady) return;
    try {
      const sql = getDb();
      await sql`
        CREATE TABLE IF NOT EXISTS mai_conversations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) DEFAULT 'Nouvelle discussion mAI',
          model_id VARCHAR(100) DEFAULT 'mai-1.5-apex',
          system_prompt TEXT,
          is_pinned BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS mai_messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          conversation_id UUID NOT NULL REFERENCES mai_conversations(id) ON DELETE CASCADE,
          sender_role VARCHAR(20) NOT NULL,
          content TEXT,
          tool_calls JSONB,
          tool_call_id VARCHAR(100),
          tokens_input INTEGER DEFAULT 0,
          tokens_output INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      maiTablesReady = true;
    } catch (err) {
      console.warn("[vibe-mai] ensureMAIConversations skipped:", (err as any)?.message);
    }
  };
  ensureMAIConversations();

  /** Conversation active de l'utilisateur : la plus récente, créée au besoin. */
  async function getOrCreateConversation(sql: any, userId: number) {
    const existing = await sql`
      SELECT id FROM mai_conversations WHERE user_id = ${userId} ORDER BY updated_at DESC LIMIT 1
    `.catch(() => []);
    if (existing.length > 0) return existing[0].id as string;
    const created = await sql`
      INSERT INTO mai_conversations (user_id, title) VALUES (${userId}, 'Discussion mAI') RETURNING id
    `.catch(() => []);
    return created[0]?.id as string | undefined;
  }

  /** Insère un message mAI et met à jour l'horodatage de la conversation. */
  async function saveMAIMessage(sql: any, conversationId: string, role: "user" | "assistant", content: string) {
    try {
      await sql`
        INSERT INTO mai_messages (conversation_id, sender_role, content)
        VALUES (${conversationId}::uuid, ${role}, ${content})
      `;
      await sql`UPDATE mai_conversations SET updated_at = NOW() WHERE id = ${conversationId}::uuid`;
    } catch (err) {
      console.warn("[vibe-mai] saveMAIMessage:", (err as any)?.message);
    }
  }

  // Détection d'outils par commandes / ou mentions @
  function detectTool(cleanMsg: string): { toolToRun: string; toolArgs: any } | null {
    const lower = cleanMsg.toLowerCase();
    if (lower.startsWith("/image") || lower.startsWith("@image") || lower.startsWith("/draw") || lower.startsWith("@draw") || lower.startsWith("@generate_image") || lower.startsWith("génère une image")) {
      const prompt = cleanMsg.replace(/^([/@](image|draw|generate_image)|(génère|crée)\s*(une image|l'image)?)\s*:?\s*/i, "").trim();
      return { toolToRun: "generate_vibe_image", toolArgs: { prompt: prompt || "Création artistique numérique minimaliste" } };
    }
    if (lower.startsWith("/search") || lower.startsWith("@search") || lower.startsWith("/recherche") || lower.startsWith("@recherche") || lower.startsWith("@web")) {
      const q = cleanMsg.replace(/^[/@](search|recherche|web)\s*:?\s*/i, "").trim();
      return { toolToRun: "search_web", toolArgs: { query: q || "Intelligence artificielle 2026" } };
    }
    if (lower.startsWith("/fact_check") || lower.startsWith("@fact_check") || lower.startsWith("/verifier") || lower.startsWith("@verifier")) {
      const s = cleanMsg.replace(/^[/@](fact_check|verifier)\s*:?\s*/i, "").trim();
      return { toolToRun: "fact_check", toolArgs: { statement: s || cleanMsg } };
    }
    if (lower.startsWith("/rewrite") || lower.startsWith("@rewrite") || lower.startsWith("/reformuler") || lower.startsWith("@reformuler") || lower.startsWith("@style")) {
      const words = cleanMsg.replace(/^[/@](rewrite|reformuler|style)\s*:?\s*/i, "").trim().split(/\s+/);
      const style = ["viral", "pro", "humour", "concis", "poétique"].includes(words[0]?.toLowerCase()) ? words.shift() : "viral";
      return { toolToRun: "rewrite_post", toolArgs: { text: words.join(" ") || cleanMsg, style } };
    }
    if (lower.startsWith("/translate") || lower.startsWith("@translate") || lower.startsWith("/traduire") || lower.startsWith("@traduire")) {
      const words = cleanMsg.replace(/^[/@](translate|traduire)\s*:?\s*/i, "").trim().split(/\s+/);
      const lang = words[0] || "anglais";
      words.shift();
      return { toolToRun: "translate", toolArgs: { text: words.join(" ") || cleanMsg, target_language: lang } };
    }
    if (lower.startsWith("/publish") || lower.startsWith("@publish") || lower.startsWith("/publier") || lower.startsWith("@publier") || lower.startsWith("@post") || lower.startsWith("publie ")) {
      const textMatch = cleanMsg.replace(/^([/@](publish|publier|post)|(publie|poste))\s*:?\s*/i, "").trim();
      return { toolToRun: "create_post", toolArgs: { content: textMatch || cleanMsg } };
    }
    if (lower.startsWith("/follow") || lower.startsWith("@follow") || lower.startsWith("/suivre") || lower.startsWith("@suivre")) {
      const target = cleanMsg.replace(/^[/@](follow|suivre)\s*:?\s*/i, "").trim().replace(/^@/, "");
      if (target) return { toolToRun: "follow_user", toolArgs: { username: target } };
    }
    if (lower.startsWith("/trends") || lower.startsWith("@trends") || lower.startsWith("/tendances") || lower.startsWith("@tendances")) {
      return { toolToRun: "analyze_trends", toolArgs: {} };
    }
    if (lower.startsWith("/inspire") || lower.startsWith("@inspire") || lower.startsWith("/idee") || lower.startsWith("@idee") || lower.startsWith("/idée")) {
      const topic = cleanMsg.replace(/^[/@](inspire|idee|idée)(-?moi)?\s*(sur|à propos de|about)?\s*:?\s*/i, "").trim();
      return { toolToRun: "suggest_post", toolArgs: { topic: topic || "sujets d'actualité", style: "viral" } };
    }
    if (lower.startsWith("/stats") || lower.startsWith("@stats") || lower.startsWith("/compte") || lower.startsWith("@compte") || lower.includes("mes stats") || lower.includes("mon compte")) {
      return { toolToRun: "get_account_stats", toolArgs: {} };
    }
    if (lower.startsWith("/quotas") || lower.startsWith("@quotas") || lower.startsWith("/limites") || lower.includes("mes quotas") || lower.includes("mes limites")) {
      return { toolToRun: "check_quotas", toolArgs: {} };
    }
    if (lower.startsWith("/notifications") || lower.startsWith("@notifications") || lower.startsWith("/notifs") || lower.startsWith("@notifs")) {
      return { toolToRun: "get_notifications", toolArgs: {} };
    }
    return null;
  }

  async function getUserAutoApprove(sql: any, userId: number): Promise<boolean> {
    try {
      const rows = await sql`SELECT mai_auto_approve_tools FROM user_settings WHERE user_id = ${userId} LIMIT 1`;
      return Boolean(rows[0]?.mai_auto_approve_tools);
    } catch {
      return false;
    }
  }

  // ── Contexte de post joint à une question mAI ────────────────────────────
  // Le post est transmis avec ses statistiques, ses premiers commentaires et
  // ses médias. Les images sont jointes comme FICHIERS (octets récupérés puis
  // encodés en base64 data-URL), jamais comme simples URLs.
  const VISION_CAPABLE_MODELS = new Set([
    "openai/gpt-4o",
    "google/gemini-2.5-flash",
    "google/gemini-2.5-pro",
    "anthropic/claude-3.7-sonnet",
    "mai-1.5-apex",
  ]);
  const MAX_CONTEXT_IMAGES = 3;
  const MAX_CONTEXT_IMAGE_BYTES = 3.5 * 1024 * 1024;

  function bytesToBase64(bytes: Uint8Array): string {
    let binary = "";
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + CHUNK)) as any);
    }
    return btoa(binary);
  }

  async function buildPostContext(sql: any, postId: string): Promise<{ text: string; imageParts: any[] } | null> {
    try {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postId)) return null;

      const rows = await sql`
        SELECT p.id, p.content, p.likes_count, p.reposts_count, p.replies_count, p.views_count,
               p.published_at, p.created_via, p.ai_generated,
               u.username, pr.display_name
        FROM posts p
        JOIN users u ON u.id = p.author_id
        LEFT JOIN profiles pr ON pr.user_id = u.id
        WHERE p.id = ${postId}::uuid
        LIMIT 1
      `;
      if (rows.length === 0) return null;
      const post = rows[0];

      let commentsText = "";
      try {
        const comments = await sql`
          SELECT c.content, u.username
          FROM comments c
          JOIN users u ON u.id = c.author_id
          WHERE c.post_id = ${postId}::uuid AND c.is_hidden = FALSE
          ORDER BY c.depth ASC, c.likes_count DESC, c.created_at ASC
          LIMIT 10
        `;
        if (comments.length > 0) {
          const lines = comments
            .map((cm: any) => `  • @${cm.username} : ${String(cm.content || "").slice(0, 200)}`)
            .join("\n");
          commentsText = `\n\nPremiers commentaires :\n${lines}`;
        }
      } catch {}

      let media: any[] = [];
      try {
        media = await sql`SELECT url, media_type FROM media_assets WHERE post_id = ${postId}::uuid`;
      } catch {}

      const text =
        `📌 Post mentionné de @${post.username} (${post.display_name || post.username})` +
        `${post.ai_generated ? " [marqué « créé avec l'IA » par son auteur]" : ""}\n` +
        `Publié le ${new Date(post.published_at).toLocaleString("fr-FR")}\n\n` +
        `« ${post.content} »\n\n` +
        `Statistiques : ${post.likes_count} J'aime · ${post.replies_count} réponses · ${post.reposts_count} republications · ${post.views_count || 0} vues` +
        commentsText;

      const imageParts: any[] = [];
      for (const m of media) {
        if (imageParts.length >= MAX_CONTEXT_IMAGES) break;
        const url = String(m.url || "");
        const isImage =
          String(m.media_type || "").startsWith("image") ||
          /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url);
        if (!url || !isImage) continue;
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const buf = await res.arrayBuffer();
          if (buf.byteLength === 0 || buf.byteLength > MAX_CONTEXT_IMAGE_BYTES) continue;
          const contentType = res.headers.get("content-type") || "image/jpeg";
          imageParts.push({
            type: "image_url",
            image_url: { url: `data:${contentType};base64,${bytesToBase64(new Uint8Array(buf))}` },
          });
        } catch {}
      }

      return { text, imageParts };
    } catch (err) {
      console.warn("[mAI Chat] buildPostContext:", (err as any)?.message);
      return null;
    }
  }

  // 1. mAI CHAT & TOOL EXECUTION
  const handleMAIChat = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const { message, execute_tool, model, context } = await c.req.json();
      if (!message || !message.trim()) return c.json({ error: "Message requis." }, 400);

      // Modèle demandé par le client (sélecteur mAI), sinon réglage utilisateur
      const effectiveModel = model || (await MAIAgentFleet.getUserDefaultModel(userId));

      const sql = getDb();
      const userRows = await sql`SELECT username, tier FROM users WHERE id = ${userId} LIMIT 1`;
      const username = userRows[0]?.username || "Ami";

      // ── Conversation persistée : contexte complet pour chaque message ──
      await ensureMAIConversations();
      const conversationId = await getOrCreateConversation(sql, userId);
      if (conversationId) {
        await saveMAIMessage(sql, conversationId, "user", String(message).trim());
      }
      // Historique récent (20 derniers échanges, sans le message courant)
      let historyMessages: Array<{ role: "user" | "assistant"; content: string }> = [];
      if (conversationId) {
        try {
          const historyRows = await sql`
            SELECT sender_role, content FROM mai_messages
            WHERE conversation_id = ${conversationId}::uuid
            ORDER BY created_at DESC
            LIMIT 21
          `;
          historyMessages = historyRows
            .filter((r: any) => r.content && String(r.content).trim())
            .slice(1) // le message courant vient d'être inséré
            .reverse()
            .map((r: any) => ({
              role: r.sender_role === "assistant" ? "assistant" : "user",
              content: String(r.content).slice(0, 4000),
            }));
        } catch (historyErr) {
          console.warn("[vibe-mai] Historique non chargé:", historyErr);
        }
      }

      // Post mentionné : contenu + stats + premiers commentaires + médias (fichiers)
      let postContextBlock = "";
      let postImageParts: any[] = [];
      if (context?.post_id) {
        const postCtx = await buildPostContext(sql, String(context.post_id));
        if (postCtx) {
          postContextBlock = `\n\n---\n${postCtx.text}`;
          postImageParts = postCtx.imageParts;
        }
      }

      // Personnalisation du contexte (opt-in granulaire via user_settings)
      let personalContextBlock = "";
      try {
        const ctxRows = await sql`SELECT mai_context_posts, mai_context_dms, mai_context_books FROM user_settings WHERE user_id = ${userId} LIMIT 1`.catch(() => []);
        const flags = ctxRows[0] || {};
        const trunc = (s: any, n: number) => String(s || "").replace(/\s+/g, " ").trim().slice(0, n);
        if (flags.mai_context_posts) {
          const recentPosts = await sql`
            SELECT content, published_at FROM posts
            WHERE author_id = ${userId} AND COALESCE(status, 'published') = 'published'
            ORDER BY published_at DESC LIMIT 20
          `.catch(() => []);
          if (recentPosts.length > 0) {
            const list = recentPosts.map((p: any, i: number) => `${i + 1}. « ${trunc(p.content, 500)} »`).join("\n");
            personalContextBlock += `\n\nContexte : voici les publications récentes de l'utilisateur :\n${list}`;
          }
        }
        if (flags.mai_context_dms) {
          console.warn(`[vibe-mai] Contexte DM inclus pour user ${userId} (opt-in mai_context_dms=TRUE) — données confidentielles.`);
          const recentDMs = await sql`
            SELECT content, created_at FROM direct_messages
            WHERE (sender_id = ${userId} OR recipient_id = ${userId})
              AND (status IS NULL OR status = 'sent')
            ORDER BY created_at DESC LIMIT 10
          `.catch(() => []);
          if (recentDMs.length > 0) {
            const excerpt = recentDMs.map((m: any) => `— « ${trunc(m.content, 200)} »`).join("\n").slice(0, 2000);
            personalContextBlock += `\n\nContexte : extraits récents des messages privés de l'utilisateur (confidentiel, ne pas citer verbatim) :\n${excerpt}`;
          }
        }
        if (flags.mai_context_books) {
          const books = await sql`SELECT id, title FROM vibe_books WHERE user_id = ${userId} ORDER BY created_at ASC LIMIT 10`.catch(() => []);
          if (books.length > 0) {
            const titles = books.map((b: any) => `— ${trunc(b.title, 80)}`).join("\n");
            personalContextBlock += `\n\nContexte : Vibe Books de l'utilisateur :\n${titles}`;
            try {
              const bookIds = books.map((b: any) => b.id);
              const items = await sql`
                SELECT bi.book_id, p.content FROM vibe_book_items bi
                JOIN posts p ON p.id = bi.post_id
                WHERE bi.book_id = ANY(${bookIds}::uuid[])
                LIMIT 20
              `.catch(() => []);
              if (items.length > 0) {
                const itemList = items.map((it: any) => `— « ${trunc(it.content, 200)} »`).join("\n").slice(0, 2000);
                personalContextBlock += `\nPublications épinglées dans ces livres :\n${itemList}`;
              }
            } catch {}
          }
        }
      } catch (ctxErr) {
        console.warn("[vibe-mai] Contexte personnalisé ignoré:", (ctxErr as any)?.message);
      }

      let toolToRun: string | null = execute_tool?.name || null;
      let toolArgs: any = execute_tool?.args || {};

      if (!toolToRun) {
        const detected = detectTool(message.trim());
        if (detected) {
          toolToRun = detected.toolToRun;
          toolArgs = detected.toolArgs;
        }
      }

      // ── Flux d'approbation utilisateur ──────────────────────────────
      // Un outil sensible n'est exécuté que si l'utilisateur l'approuve,
      // sauf si `mai_auto_approve_tools` est activé dans ses paramètres.
      if (toolToRun && SENSITIVE_TOOLS.includes(toolToRun)) {
        const autoApprove = await getUserAutoApprove(sql, userId);
        if (!autoApprove) {
          return c.json({
            reply: `🔐 **Approbation requise** : mAI souhaite exécuter l'outil « ${toolToRun} » sur votre compte. Confirmez ou refusez dans le panneau ci-dessus.`,
            requiresApproval: true,
            pendingTool: { name: toolToRun, args: toolArgs },
            toolExecuted: null,
            modelUsed: effectiveModel,
          });
        }
      }

      let toolResult: any = null;
      if (toolToRun) {
        toolResult = await MAIAgentFleet.executeTool(toolToRun, toolArgs, userId);
      }

      const { weekStartStr } = getWeekData();
      await sql`
        INSERT INTO weekly_usage (user_id, week_start, tokens_used)
        VALUES (${userId}, ${weekStartStr}::date, 250)
        ON CONFLICT (user_id, week_start)
        DO UPDATE SET tokens_used = weekly_usage.tokens_used + 250
      `.catch(() => {});

      let reply = `Bonjour @${username} ! Je suis mAI. Comment puis-je vous aider ?`;

      if (!toolToRun) {
        const keyRows = await sql`
          SELECT api_key FROM mprojects_api_keys WHERE user_id::text = ${userId}::text LIMIT 1
        `.catch(() => []);
        const openRouterApiKey =
          (typeof (globalThis as any).Deno !== "undefined" && (globalThis as any).Deno.env?.get("OPENROUTER_API_KEY")) ||
          (typeof process !== "undefined" && process.env?.OPENROUTER_API_KEY) ||
          (keyRows.length > 0 ? keyRows[0].api_key : "");

        const resolveModel = (m: string) => {
          if (!m || m === "default" || m === "mai-1.5-light" || m === "openrouter/free") return "poolside/laguna-xs-2.1:free";
          if (m === "mai-1.5-apex") return "openai/gpt-4o";
          return m;
        };

        const hasImages = postImageParts.length > 0;
        let primaryModel = resolveModel(effectiveModel);
        // Images jointes → forcer un modèle vision si le modèle choisi ne l'est pas
        if (hasImages && !VISION_CAPABLE_MODELS.has(primaryModel)) {
          primaryModel = "openai/gpt-4o";
        }
        const modelsToTry = [primaryModel];
        if (hasImages) {
          if (!modelsToTry.includes("google/gemini-2.5-flash")) modelsToTry.push("google/gemini-2.5-flash");
        } else {
          if (!modelsToTry.includes("poolside/laguna-xs-2.1:free")) modelsToTry.push("poolside/laguna-xs-2.1:free");
          if (!modelsToTry.includes("nvidia/nemotron-3.5-lightning:free")) modelsToTry.push("nvidia/nemotron-3.5-lightning:free");
        }

        const userText = `${message.trim()}${postContextBlock}${personalContextBlock}`;
        const userContent: any = hasImages
          ? [{ type: "text", text: userText }, ...postImageParts]
          : userText;
        const systemContent =
          "Tu es mAI, l'intelligence artificielle intégrée au réseau social Vibe. Tu es concis, créatif, pertinent et tu réponds en français avec des émojis." +
          " Tu connais l'historique de la conversation en cours : apporte ta réponse en continuité naturelle avec les échanges précédents, sans redemander des informations déjà données." +
          (hasImages ? " Des images sont jointes à la publication mentionnée : analyse-les directement." : "") +
          (postContextBlock ? " Une publication Vibe est jointe à la fin du message : base ta réponse sur son contenu, ses statistiques et ses commentaires." : "");

        if (openRouterApiKey) {
          for (const candidate of modelsToTry) {
            try {
              const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${openRouterApiKey}`,
                  "Content-Type": "application/json",
                  "HTTP-Referer": "https://mai.val.run",
                  "X-Title": "mAI Social Assistant",
                },
                body: JSON.stringify({
                  model: candidate,
                  messages: [
                    {
                      role: "system",
                      content: systemContent,
                    },
                    ...historyMessages,
                    { role: "user", content: userContent },
                  ],
                }),
              });

              if (aiRes.ok) {
                const aiData = await aiRes.json();
                const textOutput = aiData.choices?.[0]?.message?.content;
                if (textOutput && textOutput.trim()) {
                  reply = textOutput.trim();
                  break;
                }
              }
            } catch (e) {
              console.warn(`[mAI Chat] Erreur sur ${candidate}, essai du suivant...`, e);
            }
          }
        }
      } else if (toolResult && toolResult.success) {
        reply = formatToolReply(toolToRun, toolResult.result, username);
      } else if (toolResult && !toolResult.success) {
        reply = `⚠️ L'action n'a pas pu être exécutée : ${toolResult.error}`;
      }

      // Persistance de la réponse mAI
      if (conversationId) {
        await saveMAIMessage(sql, conversationId, "assistant", reply);
      }

      return c.json({
        reply,
        toolExecuted: toolToRun ? { name: toolToRun, result: toolResult } : null,
        modelUsed: effectiveModel,
        conversation_id: conversationId || null,
      });
    } catch (err: any) {
      console.error("[Vibe API] mAI Chat Error:", err);
      return c.json({ error: "Erreur lors de la conversation avec mAI." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/mai/chat", "/vibe/mai/chat", "/v1/mai/chat"], handleMAIChat);

  // 1ter. HISTORIQUE DE LA CONVERSATION mAI (persistance serveur)
  const handleMAIHistory = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const sql = getDb();
      await ensureMAIConversations();
      const conversationId = await getOrCreateConversation(sql, userId);
      if (!conversationId) return c.json({ conversation_id: null, messages: [] });

      const rows = await sql`
        SELECT id, sender_role, content, created_at FROM mai_messages
        WHERE conversation_id = ${conversationId}::uuid AND content IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 50
      `.catch(() => []);

      const messages = rows
        .filter((r: any) => String(r.content || "").trim())
        .reverse()
        .map((r: any) => ({
          id: String(r.id),
          role: r.sender_role === "assistant" ? "assistant" : "user",
          content: String(r.content),
          created_at: r.created_at,
        }));

      return c.json({ conversation_id: conversationId, messages });
    } catch (err: any) {
      console.error("[Vibe API] mAI History Error:", err);
      return c.json({ conversation_id: null, messages: [] });
    }
  };

  registerMulti("get", ["/api/vibe/mai/history", "/vibe/mai/history", "/v1/mai/history"], handleMAIHistory);

  // 1quater. NOUVELLE CONVERSATION mAI
  const handleMAINewConversation = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const sql = getDb();
      await ensureMAIConversations();
      const created = await sql`
        INSERT INTO mai_conversations (user_id, title) VALUES (${userId}, 'Discussion mAI') RETURNING id
      `;
      return c.json({ success: true, conversation_id: created[0]?.id || null });
    } catch (err: any) {
      console.error("[Vibe API] mAI New Conversation Error:", err);
      return c.json({ error: "Erreur création conversation." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/mai/history/new", "/vibe/mai/history/new", "/v1/mai/history/new"], handleMAINewConversation);

  // 1bis. EXÉCUTION D'OUTIL APPROUVÉ PAR L'UTILISATEUR
  // Appelé par le front uniquement après confirmation explicite (bouton
  // "Approuver") — ou pour un outil non sensible (lecture seule).
  const handleExecuteTool = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const { name, args = {}, model } = await c.req.json();
      if (!name) return c.json({ error: "Nom d'outil requis." }, 400);

      const effectiveModel = model || (await MAIAgentFleet.getUserDefaultModel(userId));
      const result = await MAIAgentFleet.executeTool(String(name), args, userId);
      const reply = result.success ? formatToolReply(String(name), result.result, "") : `⚠️ L'action n'a pas pu être exécutée : ${result.error}`;

      return c.json({
        reply,
        toolExecuted: { name, result },
        modelUsed: effectiveModel,
      });
    } catch (err: any) {
      console.error("[Vibe API] mAI Execute Tool Error:", err);
      return c.json({ error: "Erreur lors de l'exécution de l'outil." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/mai/execute-tool", "/vibe/mai/execute-tool", "/v1/mai/execute-tool"], handleExecuteTool);

  // 2. mAI QUOTAS
  const handleMAIQuotas = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const res = await MAIAgentFleet.executeTool("check_quotas", {}, userId);
      return c.json(res.result);
    } catch {
      return c.json({ error: "Erreur quotas." }, 500);
    }
  };

  registerMulti("get", ["/api/vibe/mai/quotas", "/vibe/mai/quotas", "/v1/mai/quotas"], handleMAIQuotas);

  // 3. mAI MODULATE
  const handleMAIModulate = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      await verifyToken(token);

      const { text, tone = "executive" } = await c.req.json();
      const modulated = await MAIAgentFleet.modulateText({ text, tone });
      return c.json({ success: true, modulated });
    } catch {
      return c.json({ error: "Erreur modulation." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/mai/modulate", "/vibe/mai/modulate", "/v1/mai/modulate"], handleMAIModulate);
}
