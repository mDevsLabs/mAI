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

function resolveOpenRouterModel(model: string): string {
  if (MODEL_MAP[model]) return MODEL_MAP[model];
  return model.includes("/") ? model : "poolside/laguna-xs-2.1:free";
}

/** Formatte la réponse conversationnelle après exécution d'un outil. */
function formatToolReply(toolName: string, result: any, username: string): string {
  if (toolName === "generate_vibe_image") {
    return `🎨 Voici l'image générée avec mAI :\n\n![Image générée](${result.imageUrl})\n\n*Prompt : « ${result.prompt} »*`;
  }
  if (toolName === "search_web") {
    return `🌐 **Recherche Web mAI** :\n\n${result.snippet}`;
  }
  if (toolName === "summarize") {
    return `${result.summary}`;
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
    if (lower.startsWith("/summarize") || lower.startsWith("@summarize") || lower.startsWith("/resumer") || lower.startsWith("@resumer")) {
      const t = cleanMsg.replace(/^[/@](summarize|resumer)\s*:?\s*/i, "").trim();
      return { toolToRun: "summarize", toolArgs: { target: t || "récents" } };
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

  // 1. mAI CHAT & TOOL EXECUTION
  const handleMAIChat = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const { message, execute_tool, model = "poolside/laguna-xs-2.1:free" } = await c.req.json();
      if (!message || !message.trim()) return c.json({ error: "Message requis." }, 400);

      const sql = getDb();
      const userRows = await sql`SELECT username, tier FROM users WHERE id = ${userId} LIMIT 1`;
      const username = userRows[0]?.username || "Ami";

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
            modelUsed: model,
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

      let reply = `Bonjour @${username} ! Je suis mAI (modèle ${model}). Comment puis-je vous aider ?`;

      if (!toolToRun) {
        // Appel direct au endpoint OpenRouter avec le modèle sélectionné
        const openRouterApiKey = await MAIAgentFleet.getOpenRouterKey(userId);

        const resolveModel = (m: string) => {
          if (!m || m === "default" || m === "mai-1.5-light") return "openrouter/free";
          if (m === "mai-1.5-apex") return "openai/gpt-4o";
          return m;
        };

        const primaryModel = resolveModel(model);
        const modelsToTry = [primaryModel];
        if (primaryModel !== "openrouter/free") modelsToTry.push("openrouter/free");
        if (!modelsToTry.includes("nvidia/nemotron-3.5-lightning:free")) modelsToTry.push("nvidia/nemotron-3.5-lightning:free");

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
                      content: "Tu es mAI, l'intelligence artificielle intégrée au réseau social Vibe. Tu es concis, créatif, pertinent et tu réponds en français avec des émojis.",
                    },
                    { role: "user", content: message.trim() },
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

      return c.json({
        reply,
        toolExecuted: toolToRun ? { name: toolToRun, result: toolResult } : null,
        modelUsed: model,
      });
    } catch (err: any) {
      console.error("[Vibe API] mAI Chat Error:", err);
      return c.json({ error: "Erreur lors de la conversation avec mAI." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/mai/chat", "/vibe/mai/chat", "/v1/mai/chat"], handleMAIChat);

  // 1bis. EXÉCUTION D'OUTIL APPROUVÉ PAR L'UTILISATEUR
  // Appelé par le front uniquement après confirmation explicite (bouton
  // "Approuver") — ou pour un outil non sensible (lecture seule).
  const handleExecuteTool = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const { name, args = {}, model = "poolside/laguna-xs-2.1:free" } = await c.req.json();
      if (!name) return c.json({ error: "Nom d'outil requis." }, 400);

      const result = await MAIAgentFleet.executeTool(String(name), args, userId);
      const reply = result.success ? formatToolReply(String(name), result.result, "") : `⚠️ L'action n'a pas pu être exécutée : ${result.error}`;

      return c.json({
        reply,
        toolExecuted: { name, result },
        modelUsed: model,
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
    } catch (err: any) {
      return c.json({ error: "Erreur quotas." }, 500);
    }
  };

  registerMulti("get", ["/api/vibe/mai/quotas", "/vibe/mai/quotas", "/v1/mai/quotas"], handleMAIQuotas);

  // 3. mAI MODULATE
  const handleMAIModulate = async (c: any) => {
    try {
      const { text, tone = "executive" } = await c.req.json();
      const modulated = await MAIAgentFleet.modulateText({ text, tone });
      return c.json({ success: true, modulated });
    } catch (err: any) {
      return c.json({ error: "Erreur modulation." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/mai/modulate", "/vibe/mai/modulate", "/v1/mai/modulate"], handleMAIModulate);
}
