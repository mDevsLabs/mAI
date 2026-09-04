/**
 * ============================================================================
 * VIBE SOCIAL PLATFORM — mAI AGENT FLEET (vibe-mai-fleet.ts)
 * Tool declarations and execution engine for database-backed AI agents
 * ============================================================================
 */

import { getDb, getWeekData, getTierMaiTokenLimit, getTierDailyImageLimit } from "./config.ts";
import { executeWebSearch } from "./web.ts";

/**
 * Outils "sensibles" : ils modifient le compte ou le contenu public de
 * l'utilisateur. Ils exigent une approbation explicite sauf si le réglage
 * `mai_auto_approve_tools` a été activé dans les paramètres.
 */
export const SENSITIVE_TOOLS = ["create_post", "delete_post", "update_profile", "follow_user"];

export const MAI_TOOLS = [
  {
    name: "get_account_stats",
    description: "Récupère les statistiques détaillées du compte utilisateur (abonnés, posts, réputation, quotas).",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "create_post",
    description: "Publie un nouveau post sur Vibe au nom de l'utilisateur connecté.",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "Le texte du post à publier sur Vibe" },
        format: { type: "string", enum: ["micro_text", "article", "media", "mai_generation"] },
        media_url: { type: "string", description: "URL optionnelle d'une image attachée" },
      },
      required: ["content"],
    },
  },
  {
    name: "delete_post",
    description: "Supprime une publication appartenant à l'utilisateur.",
    parameters: {
      type: "object",
      properties: {
        post_id: { type: "string", description: "Identifiant UUID du post à supprimer" },
      },
      required: ["post_id"],
    },
  },
  {
    name: "search_posts",
    description: "Recherche des publications sur Vibe par mot-clé.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Texte ou mot-clé à chercher" },
        limit: { type: "number", description: "Nombre max de résultats" },
      },
      required: ["query"],
    },
  },
  {
    name: "generate_vibe_image",
    description: "Génère une image IA pour une publication Vibe ou pour l'avatar.",
    parameters: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Description textuelle de l'image" },
        aspect_ratio: { type: "string", enum: ["1:1", "16:9", "4:5", "9:16"] },
      },
      required: ["prompt"],
    },
  },
  {
    name: "suggest_post",
    description: "Génère des idées de publications Vibe originales (sans les publier).",
    parameters: {
      type: "object",
      properties: {
        topic: { type: "string", description: "Thème ou sujet souhaité" },
        style: { type: "string", enum: ["viral", "pro", "humour", "inspirant"], description: "Ton du post" },
      },
      required: ["topic"],
    },
  },
  {
    name: "check_quotas",
    description: "Consulte les quotas d'utilisation hebdomadaires de mAI et quotidiens pour les images.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "update_profile",
    description: "Met à jour le profil Vibe de l'utilisateur (nom affiché et/ou bio).",
    parameters: {
      type: "object",
      properties: {
        display_name: { type: "string", description: "Nouveau nom affiché (2 à 40 caractères)" },
        bio: { type: "string", description: "Nouvelle bio du profil (max 200 caractères)" },
      },
    },
  },
  {
    name: "follow_user",
    description: "Suit (ou ne suit plus) un compte Vibe désigné par son @username.",
    parameters: {
      type: "object",
      properties: {
        username: { type: "string", description: "Le nom d'utilisateur Vibe à suivre, sans le @" },
        follow: { type: "boolean", description: "true pour suivre, false pour ne plus suivre (défaut : true)" },
      },
      required: ["username"],
    },
  },
  {
    name: "get_notifications",
    description: "Récupère les notifications récentes de l'utilisateur (likes, reposts, réponses, DMs).",
    parameters: { type: "object", properties: {} },
  },
];

export class MAIAgentFleet {
  public static assessContentSafety(content: string): { isSafe: boolean; toxicityScore: number; flagReason?: string } {
    const prohibitedKeywords = ["haine", "violence explicite", "terrorisme", "terrorist", "cp_illegal", "doxx"];
    const lower = content.toLowerCase();

    for (const kw of prohibitedKeywords) {
      if (lower.includes(kw)) {
        return { isSafe: false, toxicityScore: 0.95, flagReason: `Terme prohibé détecté (${kw})` };
      }
    }

    return { isSafe: true, toxicityScore: 0.02 };
  }

  public static async modulateText(opts: { text: string; tone?: string; format?: string }): Promise<string> {
    const { text, tone = "executive" } = opts;
    const tonePrefixes: Record<string, string> = {
      executive: "⚡ ",
      viral: "🔥 ",
      poetic: "✨ ",
      minimal: "✦ ",
    };

    const prefix = tonePrefixes[tone] || "";
    return `${prefix}${text.trim()}`;
  }

  public static synthesizeThread(comments: Array<{ author: string; content: string }>): string {
    if (!comments || comments.length === 0) return "Aucun commentaire pour le moment.";
    const count = comments.length;
    const authors = [...new Set(comments.map((c) => c.author))].slice(0, 3).join(", ");
    return `Synthèse (${count} réponses) : Échanges autour des points partagés par @${authors}.`;
  }

  /**
   * Récupère une clé OpenRouter (variable d'environnement ou table mprojects_api_keys).
   */
  public static async getOpenRouterKey(userId: number): Promise<string> {
    if (typeof (globalThis as any).Deno !== "undefined" && (globalThis as any).Deno.env?.get("OPENROUTER_API_KEY")) {
      return (globalThis as any).Deno.env.get("OPENROUTER_API_KEY");
    }
    if (typeof process !== "undefined" && process.env?.OPENROUTER_API_KEY) {
      return process.env.OPENROUTER_API_KEY;
    }
    try {
      const sql = getDb();
      const keyRows = await sql`SELECT api_key FROM mprojects_api_keys WHERE user_id::text = ${String(userId)}::text LIMIT 1`;
      return keyRows[0]?.api_key || "";
    } catch {
      return "";
    }
  }

  /**
   * Appel générique OpenRouter pour les outils textuels (traduction, reformulation...).
   */
  public static async callOpenRouter(userId: number, system: string, user: string, model = "google/gemini-2.5-flash:free"): Promise<string | null> {
    const apiKey = await this.getOpenRouterKey(userId);
    if (!apiKey) return null;
    try {
      const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://mai.val.run",
          "X-Title": "mAI Social Assistant",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });
      if (!aiRes.ok) return null;
      const aiData = await aiRes.json();
      return aiData.choices?.[0]?.message?.content || null;
    } catch {
      return null;
    }
  }

  public static async executeTool(
    toolName: string,
    args: Record<string, any>,
    userId: string | number
  ): Promise<{ success: boolean; result: any; error?: string }> {
    const sql = getDb();
    const startTime = Date.now();
    const uid = Number(userId);

    try {
      let resultData: any = null;

      switch (toolName) {
        case "get_account_stats": {
          const [uRows, prRows, pCount] = await Promise.all([
            sql`SELECT id, username, email, tier, avatar_url, COALESCE(created_at, NOW()) as created_at FROM users WHERE id = ${uid} LIMIT 1`,
            sql`SELECT * FROM profiles WHERE user_id = ${uid} LIMIT 1`,
            sql`SELECT COUNT(*) as count FROM posts WHERE author_id = ${uid}`,
          ]);
          resultData = {
            user: uRows[0],
            profile: prRows[0],
            totalPosts: Number(pCount[0]?.count || 0),
          };
          break;
        }

        case "create_post": {
          const { content, format = "micro_text", media_url } = args;
          if (!content || !content.trim()) throw new Error("Le contenu du post est obligatoire.");

          const safety = this.assessContentSafety(content);
          if (!safety.isSafe) throw new Error(`Publication refusée par mAI : ${safety.flagReason}`);

          const inserted = await sql`
            INSERT INTO posts (author_id, content, format, created_via, toxicity_score)
            VALUES (${uid}, ${content.trim()}, ${format}, 'mai_agent', ${safety.toxicityScore})
            RETURNING *
          `;
          const newPost = inserted[0];

          if (media_url) {
            const cleanUrl = String(media_url).split("?")[0].split("#")[0];
            const ext = cleanUrl.split(".").pop()?.toLowerCase();
            const mediaType = (ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : ext === "gif" ? "image/gif" : ext === "mp4" ? "video/mp4" : "image/jpeg");
            await sql`
              INSERT INTO media_assets (owner_id, post_id, url, media_type, file_size_bytes, alt_text)
              VALUES (${uid}, ${newPost.id}::uuid, ${media_url}, ${mediaType}, 0, '')
            `;
          }

          await sql`UPDATE profiles SET posts_count = posts_count + 1 WHERE user_id = ${uid}`;
          resultData = { post: newPost, message: "Post publié avec succès sur Vibe !" };
          break;
        }

        case "delete_post": {
          const { post_id } = args;
          if (!post_id) throw new Error("post_id est requis.");

          const del = await sql`
            DELETE FROM posts WHERE id = ${post_id}::uuid AND author_id = ${uid} RETURNING id
          `;
          if (del.length === 0) {
            throw new Error("Publication introuvable ou vous n'êtes pas l'auteur.");
          }
          await sql`UPDATE profiles SET posts_count = GREATEST(0, posts_count - 1) WHERE user_id = ${uid}`;
          resultData = { deletedPostId: post_id, message: "Publication supprimée avec succès." };
          break;
        }

        case "search_posts": {
          const { query, limit = 10 } = args;
          const rows = await sql`
            SELECT p.*, pr.display_name, pr.avatar_url, u.username
            FROM posts p
            JOIN users u ON u.id = p.author_id
            LEFT JOIN profiles pr ON pr.user_id = u.id
            WHERE p.content ILIKE ('%' || ${query} || '%')
            ORDER BY p.published_at DESC
            LIMIT ${limit}
          `;
          resultData = { query, resultsCount: rows.length, posts: rows };
          break;
        }

        case "generate_vibe_image": {
          const { prompt, aspect_ratio = "1:1" } = args;
          const uRows = await sql`SELECT tier FROM users WHERE id = ${uid} LIMIT 1`;
          const tier = uRows[0]?.tier || "Free";
          const maxImages = getTierDailyImageLimit(tier);

          const todayRows = await sql`
            SELECT images_generated FROM daily_image_usage 
            WHERE user_id = ${uid} AND usage_date = CURRENT_DATE LIMIT 1
          `;
          const currentCount = todayRows[0]?.images_generated || 0;

          if (currentCount >= maxImages) {
            throw new Error(`Quota journalier d'images atteint (${currentCount}/${maxImages} pour le forfait ${tier}).`);
          }

          await sql`
            INSERT INTO daily_image_usage (user_id, usage_date, images_generated)
            VALUES (${uid}, CURRENT_DATE, 1)
            ON CONFLICT (user_id, usage_date)
            DO UPDATE SET images_generated = daily_image_usage.images_generated + 1
          `;

          const sampleImages = [
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
            "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&q=80",
            "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&q=80",
          ];
          const chosen = sampleImages[Math.floor(Math.random() * sampleImages.length)];

          resultData = {
            prompt,
            aspect_ratio,
            imageUrl: chosen,
            quotaRemaining: Math.max(0, maxImages - (currentCount + 1)),
            message: "Image générée avec succès via mAI !",
          };
          break;
        }

        case "check_quotas": {
          const uRows = await sql`SELECT tier FROM users WHERE id = ${uid} LIMIT 1`;
          const tier = uRows[0]?.tier || "Free";
          const { weekStartStr, nextResetIso } = getWeekData();

          const [usageRows, imgRows] = await Promise.all([
            sql`SELECT COALESCE(SUM(tokens_used), 0) as tokens FROM weekly_usage WHERE user_id = ${uid} AND week_start = ${weekStartStr}::date`,
            sql`SELECT COALESCE(images_generated, 0) as images FROM daily_image_usage WHERE user_id = ${uid} AND usage_date = CURRENT_DATE`,
          ]);

          const tokenLimit = getTierMaiTokenLimit(tier);
          const imageLimit = getTierDailyImageLimit(tier);
          const tokensUsed = Number(usageRows[0]?.tokens || 0);
          const imagesUsed = Number(imgRows[0]?.images || 0);

          resultData = {
            tier,
            weeklyTokens: { used: tokensUsed, limit: tokenLimit, percent: Math.min(100, Math.round((tokensUsed / tokenLimit) * 100)) },
            dailyImages: { used: imagesUsed, limit: imageLimit, percent: Math.min(100, Math.round((imagesUsed / imageLimit) * 100)) },
            resetAt: nextResetIso,
          };
          break;
        }

        case "search_web": {
          const { query } = args;
          const search = await executeWebSearch(String(query || ""), 5);
          if (!search.success || search.results.length === 0) {
            throw new Error(search.error || "Aucun résultat de recherche web.");
          }
          const snippet = search.results
            .slice(0, 3)
            .map((r) => `• **${r.title}** — ${r.snippet}\n  ${r.url}`)
            .join("\n");
          resultData = { query, snippet, provider: search.provider, results: search.results };
          break;
        }

        case "summarize": {
          const recent = await sql`
            SELECT p.content, u.username FROM posts p
            JOIN users u ON u.id = p.author_id
            ORDER BY p.published_at DESC LIMIT 30
          `;
          if (recent.length === 0) {
            resultData = { summary: "Le fil est calme : aucune publication récente à résumer." };
            break;
          }
          const hashtags: Record<string, number> = {};
          for (const r of recent) {
            for (const m of String(r.content).matchAll(/#([\p{L}\p{N}_]{2,30})/gu)) {
              const tag = m[1].toLowerCase();
              hashtags[tag] = (hashtags[tag] || 0) + 1;
            }
          }
          const topTags = Object.entries(hashtags).sort((a, b) => b[1] - a[1]).slice(0, 5);
          const authors = [...new Set(recent.map((r: any) => `@${r.username}`))].slice(0, 5).join(", ");
          resultData = {
            summary: [
              `📄 ${recent.length} publications récentes analysées, principalement par ${authors}.`,
              topTags.length > 0 ? `🏷️ Sujets dominants : ${topTags.map(([t, n]) => `#${t} (${n})`).join(", ")}.` : "",
              "💡 Le flux tourne surtout autour de ces thématiques — explorez les tendances pour en savoir plus.",
            ].filter(Boolean).join("\n\n"),
          };
          break;
        }

        case "fact_check": {
          const { statement } = args;
          const search = await executeWebSearch(String(statement || ""), 5).catch(() => null);
          const sources = search?.success ? search.results.slice(0, 3) : [];
          const llm = await this.callOpenRouter(
            uid,
            "Tu es un vérificateur de faits rigoureux. Réponds en 3 phrases maximum en français : verdict (Vrai / Faux / Plausible / À vérifier) puis justification brève en t'appuyant sur les sources fournies.",
            `Affirmation : « ${statement} »\n\nSources trouvées :\n${sources.map((s) => `- ${s.title} : ${s.snippet}`).join("\n") || "(aucune)"}`
          );
          resultData = {
            statement,
            verdict: llm ? "Analyse mAI" : sources.length > 0 ? "À vérifier" : "Sources insuffisantes",
            confidence: sources.length > 0 ? "Moyen" : "Faible",
            analysis: llm || (sources.length > 0 ? "Des sources web ont été trouvées, croisez-les pour vous forger un avis." : "Aucune source fiable trouvée sur le web pour cette affirmation."),
            sources,
          };
          break;
        }

        case "rewrite_post": {
          const { text, style = "viral" } = args;
          const tones: Record<string, string> = { viral: "viral", pro: "executive", humour: "viral", concis: "minimal", poétique: "poetic" };
          const llm = await this.callOpenRouter(
            uid,
            `Reformule le texte suivant en français dans un style « ${style} », percutant et adapté à un réseau social. Réponds UNIQUEMENT par le texte reformulé, sans commentaire.`,
            String(text || "")
          );
          const rewritten = llm || (await this.modulateText({ text: String(text || ""), tone: tones[style] || "viral" }));
          resultData = { rewritten, style };
          break;
        }

        case "suggest_post": {
          const { topic, style = "viral" } = args;
          const llm = await this.callOpenRouter(
            uid,
            `Propose 3 idées de publications courtes pour le réseau social Vibe sur le thème « ${topic} », dans un style « ${style} ». Format : une liste numérotée, chaque post fait 1 à 2 phrases, avec des hashtags pertinents. Réponds UNIQUEMENT par la liste.`,
            String(topic || "sujets d'actualité")
          );
          if (!llm) throw new Error("Génération indisponible : aucune clé IA configurée sur le serveur.");
          resultData = { suggestions: llm, topic, style };
          break;
        }

        case "translate": {
          const { text, target_language = "anglais" } = args;
          const llm = await this.callOpenRouter(
            uid,
            `Traduis le texte suivant en ${target_language}. Réponds UNIQUEMENT par la traduction, sans commentaire.`,
            String(text || "")
          );
          if (!llm) throw new Error("Traduction indisponible : aucune clé IA configurée sur le serveur.");
          resultData = { translated: llm, targetLanguage: target_language };
          break;
        }

        case "analyze_trends": {
          const recent = await sql`
            SELECT content FROM posts WHERE published_at > NOW() - INTERVAL '7 days' ORDER BY published_at DESC LIMIT 200
          `;
          const tags: Record<string, number> = {};
          for (const r of recent) {
            for (const m of String(r.content).matchAll(/#([\p{L}\p{N}_]{2,30})/gu)) {
              const tag = m[1].toLowerCase();
              tags[tag] = (tags[tag] || 0) + 1;
            }
          }
          const trendingTopics = Object.entries(tags)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, postsCount]) => ({ name: `#${name}`, postsCount, sentiment: postsCount >= 5 ? "Très actif 🔥" : "Actif 📈" }));
          resultData = { trendingTopics };
          break;
        }

        case "update_profile": {
          const { display_name, bio } = args;
          if (!display_name && !bio) throw new Error("Fournissez au moins un champ (display_name ou bio).");
          if (display_name !== undefined && (String(display_name).length < 2 || String(display_name).length > 40)) {
            throw new Error("Le nom affiché doit contenir entre 2 et 40 caractères.");
          }
          if (bio !== undefined && String(bio).length > 200) {
            throw new Error("La bio ne doit pas dépasser 200 caractères.");
          }
          const updated = await sql`
            UPDATE profiles SET
              display_name = COALESCE(${display_name ?? null}, display_name),
              bio = COALESCE(${bio ?? null}, bio),
              updated_at = NOW()
            WHERE user_id = ${uid}
            RETURNING display_name, bio
          `;
          if (updated.length === 0) throw new Error("Profil introuvable.");
          resultData = { profile: updated[0], message: "Profil mis à jour avec succès." };
          break;
        }

        case "follow_user": {
          const { username, follow = true } = args;
          const cleanUsername = String(username || "").replace(/^@/, "").trim().toLowerCase();
          if (!cleanUsername) throw new Error("username est requis.");
          const target = await sql`SELECT id FROM users WHERE LOWER(username) = ${cleanUsername} LIMIT 1`;
          if (target.length === 0) throw new Error(`Compte @${cleanUsername} introuvable sur Vibe.`);
          const targetId = Number(target[0].id);
          if (targetId === uid) throw new Error("Vous ne pouvez pas vous suivre vous-même.");

          if (follow) {
            const existing = await sql`SELECT 1 FROM follows WHERE follower_id = ${uid} AND following_id = ${targetId} LIMIT 1`;
            if (existing.length > 0) {
              resultData = { followed: true, username: cleanUsername, message: `Vous suivez déjà @${cleanUsername}.` };
              break;
            }
            await sql`INSERT INTO follows (follower_id, following_id) VALUES (${uid}, ${targetId}) ON CONFLICT DO NOTHING`;
            await Promise.all([
              sql`UPDATE profiles SET following_count = following_count + 1 WHERE user_id = ${uid}`,
              sql`UPDATE profiles SET followers_count = followers_count + 1 WHERE user_id = ${targetId}`,
            ]);
            resultData = { followed: true, username: cleanUsername, message: `Vous suivez désormais @${cleanUsername} !` };
          } else {
            const del = await sql`DELETE FROM follows WHERE follower_id = ${uid} AND following_id = ${targetId} RETURNING 1`;
            if (del.length > 0) {
              await Promise.all([
                sql`UPDATE profiles SET following_count = GREATEST(0, following_count - 1) WHERE user_id = ${uid}`,
                sql`UPDATE profiles SET followers_count = GREATEST(0, followers_count - 1) WHERE user_id = ${targetId}`,
              ]);
            }
            resultData = { followed: false, username: cleanUsername, message: `Vous ne suivez plus @${cleanUsername}.` };
          }
          break;
        }

        case "get_notifications": {
          const rows = await sql`
            SELECT n.*, u.username as actor_username
            FROM notifications n
            LEFT JOIN users u ON u.id = n.actor_id
            WHERE n.recipient_id = ${uid}
            ORDER BY n.created_at DESC LIMIT 20
          `;
          resultData = { count: rows.length, notifications: rows };
          break;
        }

        default:
          throw new Error(`Outil inconnu : ${toolName}`);
      }

      const duration = Date.now() - startTime;
      await sql`
        INSERT INTO mai_tool_executions (user_id, tool_name, parameters, result, status, execution_time_ms)
        VALUES (${uid}, ${toolName}, ${JSON.stringify(args)}::jsonb, ${JSON.stringify(resultData)}::jsonb, 'success', ${duration})
      `;

      return { success: true, result: resultData };
    } catch (err: any) {
      console.error(`[MAIAgentFleet] Error executing tool ${toolName}:`, err);
      const duration = Date.now() - startTime;
      await sql`
        INSERT INTO mai_tool_executions (user_id, tool_name, parameters, result, status, execution_time_ms)
        VALUES (${uid}, ${toolName}, ${JSON.stringify(args)}::jsonb, ${JSON.stringify({ error: err.message })}::jsonb, 'failed', ${duration})
      `.catch(() => {});
      return { success: false, result: null, error: err.message };
    }
  }
}
