/**
 * ============================================================================
 * VIBE SOCIAL PLATFORM — DMs & NOTIFICATIONS (vibe-dms.ts)
 * Private messaging, bot auto-reply, DM permissions & user notifications
 * ============================================================================
 */

import type { Hono } from "npm:hono@4";
import { extractToken, getDb, getTierMaiTokenLimit, getUserQuotaBoost, getWeekData, verifyToken } from "./config.ts";
import { MAIAgentFleet } from "./vibe-mai-fleet.ts";
import { pushRealtimeEvent } from "./realtime.ts";
import type { RegisterMultiFn } from "./vibe-common.ts";

/**
 * Crée les tables de modération DM si besoin (idempotent, exécuté une fois).
 * — blocked_users : relations de blocage
 * — dm_reports    : signalements
 * — dm_conv_meta  : métadonnées locales par utilisateur (renommage conversation)
 * — dm_reactions  : réactions emoji + colonne reply_to_id (réponses)
 */
let dmTablesReady = false;
async function ensureDMTables() {
  if (dmTablesReady) return;
  try {
    const sql = getDb();
    await sql`
      CREATE TABLE IF NOT EXISTS blocked_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id BIGINT NOT NULL,
        blocked_user_id BIGINT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (user_id, blocked_user_id)
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS muted_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id BIGINT NOT NULL,
        muted_user_id BIGINT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (user_id, muted_user_id)
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS dm_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reporter_id BIGINT NOT NULL,
        reported_user_id BIGINT,
        message_id UUID,
        reason TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS dm_conv_meta (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id BIGINT NOT NULL,
        partner_id BIGINT NOT NULL,
        custom_name TEXT,
        UNIQUE (user_id, partner_id)
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS dm_reactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        message_id UUID NOT NULL,
        user_id BIGINT NOT NULL,
        emoji TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (message_id, user_id, emoji)
      )
    `;
    await sql`ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS reply_to_id UUID`.catch(() => {});
    await sql`ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE`.catch(() => {});
    await sql`ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ`.catch(() => {});
    // Messages programmés (même mécanique que les posts planifiés)
    await sql`ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'sent'`.catch(() => {});
    await sql`ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS send_at TIMESTAMPTZ`.catch(() => {});
    await sql`UPDATE direct_messages SET status = 'sent' WHERE status IS NULL`.catch(() => {});
    await sql`CREATE INDEX IF NOT EXISTS idx_dm_scheduled ON direct_messages(status, send_at) WHERE status = 'scheduled'`.catch(() => {});
    // Messages épinglés (max 3 par conversation, visibles des deux participants)
    await sql`
      CREATE TABLE IF NOT EXISTS dm_pinned_messages (
        conversation_id UUID NOT NULL,
        message_id UUID NOT NULL REFERENCES direct_messages(id) ON DELETE CASCADE,
        pinned_by BIGINT NOT NULL,
        pinned_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (conversation_id, message_id)
      )
    `.catch(() => {});
    dmTablesReady = true;
  } catch (err) {
    console.warn("[vibe-dms] ensureDMTables skipped:", (err as any)?.message);
  }
}

/**
 * Compte officiel mAI (pseudo-utilisateur) : répond automatiquement aux DMs.
 * Seed idempotent — même pattern que la migration 005 du compte @bot.
 */
let maiAccountReady = false;
async function ensureMAIAccount() {
  if (maiAccountReady) return;
  try {
    const sql = getDb();
    await sql`
      INSERT INTO users (username, email, password_hash, tier, avatar_url, is_verified)
      VALUES (
        'mai',
        'mai@vibe.ai',
        '$2a$10$mAIvibeOfficialAccountNoLoginAllowedxxxxxxxxxxxxxxxxxxxx',
        'Max',
        'https://api.dicebear.com/7.x/bottts/svg?seed=mai-vibe',
        TRUE
      )
      ON CONFLICT (username) DO UPDATE
      SET is_verified = TRUE,
          tier = 'Max',
          avatar_url = 'https://api.dicebear.com/7.x/bottts/svg?seed=mai-vibe'
    `;
    await sql`
      INSERT INTO profiles (user_id, display_name, bio, avatar_url, is_verified)
      SELECT id, 'mAI', 'L''intelligence artificielle officielle de Vibe. Écrivez-moi en message privé : je réponds à toutes vos questions. ✨', 'https://api.dicebear.com/7.x/bottts/svg?seed=mai-vibe', TRUE
      FROM users WHERE username = 'mai'
      ON CONFLICT (user_id) DO UPDATE SET
        display_name = 'mAI',
        bio = 'L''intelligence artificielle officielle de Vibe. Écrivez-moi en message privé : je réponds à toutes vos questions. ✨',
        avatar_url = 'https://api.dicebear.com/7.x/bottts/svg?seed=mai-vibe',
        is_verified = TRUE
    `;
    await sql`
      INSERT INTO user_settings (user_id, allow_dms)
      SELECT id, 'everyone' FROM users WHERE username = 'mai'
      ON CONFLICT (user_id) DO NOTHING
    `;
    maiAccountReady = true;
  } catch (err) {
    console.warn("[vibe-dms] ensureMAIAccount skipped:", (err as any)?.message);
  }
}

/**
 * Réponse automatique du compte mAI à un DM : génère une réponse avec
 * OpenRouter en tenant compte de l'historique de la conversation, puis
 * débite l'usage hebdomadaire de l'expéditeur.
 */
async function generateMAIDMReply(sql: any, conversationId: string, senderId: number, maiUserId: number, senderMessage: string) {
  try {
    // Historique de la conversation DM (contexte complet pour mAI)
    const historyRows = await sql`
      SELECT m.content, m.sender_id, u.username as sender_username
      FROM direct_messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.conversation_id = ${conversationId}::uuid
      ORDER BY m.created_at DESC
      LIMIT 40
    `.catch(() => []);
    const transcript = historyRows
      .reverse()
      .map((m: any) => `${m.sender_id === maiUserId ? "mAI" : `@${m.sender_username}`}: ${m.content}`)
      .join("\n");

    // Quota hebdomadaire mAI de l'expéditeur
    const { weekStartStr } = getWeekData();
    const [usageRow, senderRow] = await Promise.all([
      sql`SELECT tokens_used FROM weekly_usage WHERE user_id = ${senderId} AND week_start = ${weekStartStr}::date LIMIT 1`.catch(() => []),
      sql`SELECT tier FROM users WHERE id = ${senderId} LIMIT 1`.catch(() => []),
    ]);
    const maiBoost = await getUserQuotaBoost(sql, String(senderId), "mai");
    const tokenLimit = getTierMaiTokenLimit(senderRow[0]?.tier) + maiBoost;
    const currentUsage = Number(usageRow[0]?.tokens_used || 0);

    let reply: string;
    if (currentUsage >= tokenLimit) {
      reply = "⚠️ Votre quota hebdomadaire mAI est atteint. Il se réinitialise lundi — ou passez à un forfait supérieur pour discuter davantage avec moi.";
    } else {
      const keyRows = await sql`
        SELECT api_key FROM mprojects_api_keys WHERE user_id::text = ${senderId}::text LIMIT 1
      `.catch(() => []);
      const openRouterApiKey =
        (typeof (globalThis as any).Deno !== "undefined" && (globalThis as any).Deno.env?.get("OPENROUTER_API_KEY")) ||
        (typeof process !== "undefined" && process.env?.OPENROUTER_API_KEY) ||
        (keyRows.length > 0 ? keyRows[0].api_key : "");

      const systemPrompt =
        "Tu es mAI, l'intelligence artificielle officielle du réseau social Vibe. Tu réponds aux messages privés des utilisateurs comme un vrai interlocuteur : bienveillant, concis et utile. " +
        "Tu réponds en français avec quelques émojis. Tu connais tout l'historique de la conversation : poursuis naturellement l'échange sans redemander des informations déjà données. " +
        "Ne fais AUCUNE évaluation de sécurité, n'écris JAMAIS 'User Safety: safe' ni aucun méta-commentaire.";

      const userPrompt = (transcript.trim()
        ? `Historique de la conversation :\n${transcript}\n\n`
        : "Nouvelle conversation.\n\n") +
        `L'utilisateur vient d'envoyer : « ${senderMessage} »\n\nRéponds UNIQUEMENT avec le texte de ta réponse en DM.`;

      reply = "";
      if (openRouterApiKey) {
        const candidateModels = [
          "poolside/laguna-xs-2.1:free",
          "minimax/minimax-m2.7:free",
          "liquid/lfm-2.5-2.6b:free",
          "nvidia/nemotron-3.5-lightning:free",
        ];
        for (const modelToTry of candidateModels) {
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
                model: modelToTry,
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: userPrompt },
                ],
              }),
            });
            if (aiRes.ok) {
              const aiData = await aiRes.json();
              const text = aiData.choices?.[0]?.message?.content;
              if (text && typeof text === "string" && text.trim()) {
                reply = text
                  .replace(/User Safety:\s*safe\.?/gi, "")
                  .replace(/^User Safety:[^\n]*\n*/gi, "")
                  .trim();
                break;
              }
            }
          } catch (callErr) {
            console.warn(`[vibe-dms] mAI DM modèle ${modelToTry} en échec:`, callErr);
          }
        }
      }
      if (!reply) {
        reply = "Je n'arrive pas à générer ma réponse pour le moment (service IA momentanément indisponible). Réessayez dans un instant ✨";
      }

      // Débit de l'usage hebdomadaire de l'expéditeur (chaque message compte)
      const estimatedTokens = Math.max(75, Math.ceil((userPrompt.length + reply.length) / 3));
      await sql`
        INSERT INTO weekly_usage (user_id, week_start, tokens_used)
        VALUES (${senderId}, ${weekStartStr}::date, ${estimatedTokens})
        ON CONFLICT (user_id, week_start)
        DO UPDATE SET tokens_used = weekly_usage.tokens_used + ${estimatedTokens}, updated_at = NOW()
      `.catch(() => {});
    }

    // Insertion de la réponse mAI dans la conversation
    const maiMsg = await sql`
      INSERT INTO direct_messages (conversation_id, sender_id, recipient_id, content)
      VALUES (${conversationId}::uuid, ${maiUserId}, ${senderId}, ${reply})
      RETURNING *
    `;
    await sql`
      UPDATE dm_conversations SET last_message_preview = ${reply.slice(0, 120)}, last_message_at = NOW()
      WHERE id = ${conversationId}::uuid
    `.catch(() => {});
    await sql`
      INSERT INTO notifications (recipient_id, actor_id, type, message)
      VALUES (${senderId}, ${maiUserId}, 'dm', 'vous a envoyé un message')
    `.catch(() => {});

    // Temps réel : pousse la réponse mAI à l'expéditeur (flux SSE)
    try {
      await pushRealtimeEvent(senderId, "dm_message", maiMsg[0] || {
        conversation_id: conversationId,
        sender_id: maiUserId,
        recipient_id: senderId,
        content: reply,
      });
    } catch {}
  } catch (err) {
    console.warn("[vibe-dms] generateMAIDMReply failed:", (err as any)?.message);
  }
}

/**
 * Publication paresseuse des DMs programmés arrivés à échéance (miroir
 * publishDuePosts) : appelée en tête de handleDMMessages, throttle 30 s.
 */
let lastDMpublishCheck = 0;
export async function publishScheduledDMs(): Promise<void> {
  const now = Date.now();
  if (now - lastDMpublishCheck < 30_000) return;
  lastDMpublishCheck = now;
  try {
    const sql = getDb();
    const due = await sql`
      UPDATE direct_messages
      SET status = 'sent', send_at = NULL
      WHERE status = 'scheduled' AND send_at IS NOT NULL AND send_at <= NOW()
      RETURNING *
    `.catch(() => []);
    for (const m of due || []) {
      try {
        await sql`
          INSERT INTO notifications (recipient_id, actor_id, type, message)
          VALUES (${m.recipient_id}, ${m.sender_id}, 'dm', 'vous a envoyé un message')
        `.catch(() => {});
        await pushRealtimeEvent(Number(m.recipient_id), "dm_message", m);
      } catch {}
    }
  } catch (err) {
    console.warn("[vibe-dms] publishScheduledDMs skipped:", (err as any)?.message);
  }
}

/** Résout l'UUID de conversation dm_conversations depuis (userId, partnerId). */
async function resolveConversationId(sql: any, userId: number, partnerId: number): Promise<string | null> {
  try {
    const p1 = userId < partnerId ? userId : partnerId;
    const p2 = userId < partnerId ? partnerId : userId;
    const rows = await sql`
      SELECT id FROM dm_conversations
      WHERE participant_one_id = ${p1} AND participant_two_id = ${p2}
      LIMIT 1
    `;
    return rows[0] ? String(rows[0].id) : null;
  } catch {
    return null;
  }
}

export function registerVibeDMsRoutes(app: Hono, registerMulti: RegisterMultiFn) {
  ensureDMTables();
  ensureMAIAccount();
  // 1. SEARCH USERS FOR DM
  const handleDMUsers = async (c: any) => {
    try {
      const q = (c.req.query("q") || "").trim().toLowerCase();
      if (!q) return c.json({ users: [] });

      const sql = getDb();
      const users = await sql`
        SELECT u.id, u.username, u.tier,
               (COALESCE(u.is_verified, FALSE) OR LOWER(COALESCE(u.tier, '')) IN ('plus', 'pro', 'max')) as is_verified,
               pr.display_name, pr.avatar_url
        FROM users u
        LEFT JOIN profiles pr ON pr.user_id = u.id
        WHERE LOWER(u.username) LIKE ('%' || ${q} || '%') OR LOWER(pr.display_name) LIKE ('%' || ${q} || '%')
        LIMIT 10
      `;
      return c.json({ users });
    } catch (err: any) {
      return c.json({ error: "Erreur recherche." }, 500);
    }
  };

  registerMulti("get", ["/api/vibe/dms/users", "/vibe/dms/users", "/v1/dms/users"], handleDMUsers);

  // 2. DM CONVERSATIONS
  const handleDMConversations = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const sql = getDb();
      const convs = await sql`
        SELECT dm.*,
               CASE WHEN dm.participant_one_id = ${userId} THEN u2.username ELSE u1.username END as partner_username,
               CASE WHEN dm.participant_one_id = ${userId} THEN pr2.display_name ELSE pr1.display_name END as partner_display_name,
               CASE WHEN dm.participant_one_id = ${userId} THEN pr2.avatar_url ELSE pr1.avatar_url END as partner_avatar_url,
               CASE WHEN dm.participant_one_id = ${userId} THEN dm.participant_two_id ELSE dm.participant_one_id END as partner_id,
               meta.custom_name,
               (blk.id IS NOT NULL) as is_blocked,
               COALESCE(unread.count, 0)::int as unread_count
        FROM dm_conversations dm
        JOIN users u1 ON u1.id = dm.participant_one_id
        JOIN users u2 ON u2.id = dm.participant_two_id
        LEFT JOIN profiles pr1 ON pr1.user_id = u1.id
        LEFT JOIN profiles pr2 ON pr2.user_id = u2.id
        LEFT JOIN dm_conv_meta meta
               ON meta.user_id = ${userId}
              AND meta.partner_id = CASE WHEN dm.participant_one_id = ${userId} THEN dm.participant_two_id ELSE dm.participant_one_id END
        LEFT JOIN blocked_users blk
               ON blk.user_id = ${userId}
              AND blk.blocked_user_id = CASE WHEN dm.participant_one_id = ${userId} THEN dm.participant_two_id ELSE dm.participant_one_id END
        LEFT JOIN LATERAL (
          SELECT COUNT(*)::int AS count FROM direct_messages m
          WHERE m.conversation_id = dm.id AND m.recipient_id = ${userId} AND m.is_read = FALSE
        ) unread ON TRUE
        WHERE dm.participant_one_id = ${userId} OR dm.participant_two_id = ${userId}
        ORDER BY dm.last_message_at DESC
      `;
      return c.json({ conversations: convs });
    } catch (err: any) {
      return c.json({ error: "Erreur conversations." }, 500);
    }
  };

  registerMulti("get", ["/api/vibe/dms/conversations", "/vibe/dms/conversations", "/v1/dms/conversations"], handleDMConversations);

  // 3. DM MESSAGES
  const handleDMMessages = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);
      const partnerId = Number(c.req.param("partnerId"));

      const sql = getDb();
      await ensureDMTables().catch(() => {});
      await publishScheduledDMs().catch(() => {});
      const messages = await sql`
        SELECT m.*, u.username as sender_username,
               r.content as reply_to_content,
               ru.username as reply_to_username
        FROM direct_messages m
        JOIN users u ON u.id = m.sender_id
        LEFT JOIN direct_messages r ON r.id = m.reply_to_id
        LEFT JOIN users ru ON ru.id = r.sender_id
        WHERE (m.sender_id = ${userId} AND m.recipient_id = ${partnerId})
           OR (m.sender_id = ${partnerId} AND m.recipient_id = ${userId})
        ORDER BY m.created_at ASC
        LIMIT 100
      `;

      // Réactions emoji (table dm_reactions — ignorée silencieusement si absente)
      try {
        const msgIds = messages.map((m: any) => m.id);
        if (msgIds.length > 0) {
          const reactions = await sql`
            SELECT message_id, emoji, user_id FROM dm_reactions
            WHERE message_id = ANY(${msgIds}::uuid[])
          `;
          const byMsg = new Map<string, { emoji: string; user_id: number }[]>();
          for (const r of reactions) {
            const key = String(r.message_id);
            if (!byMsg.has(key)) byMsg.set(key, []);
            byMsg.get(key)!.push({ emoji: r.emoji, user_id: Number(r.user_id) });
          }
          for (const m of messages) {
            const list = byMsg.get(String(m.id)) || [];
            const grouped: { emoji: string; count: number; mine: boolean }[] = [];
            for (const r of list) {
              const g = grouped.find((x) => x.emoji === r.emoji);
              if (g) {
                g.count += 1;
                g.mine = g.mine || r.user_id === userId;
              } else {
                grouped.push({ emoji: r.emoji, count: 1, mine: r.user_id === userId });
              }
            }
            m.reactions = grouped;
          }
        }
      } catch {}

      await sql`
        UPDATE direct_messages SET is_read = TRUE, read_at = NOW()
        WHERE recipient_id = ${userId} AND sender_id = ${partnerId} AND is_read = FALSE
        AND (status IS NULL OR status = 'sent')
      `;
      // Messages épinglés de la conversation (aperçus, max 3)
      let pinned_messages: any[] = [];
      try {
        const conversationId = await resolveConversationId(sql, userId, partnerId);
        if (conversationId) {
          pinned_messages = await sql`
            SELECT m.*, u.username as sender_username
            FROM dm_pinned_messages pm
            JOIN direct_messages m ON m.id = pm.message_id
            JOIN users u ON u.id = m.sender_id
            WHERE pm.conversation_id = ${conversationId}::uuid
            ORDER BY pm.pinned_at ASC
            LIMIT 3
          `.catch(() => []);
        }
      } catch {}
      return c.json({ messages, pinned_messages });
    } catch (err: any) {
      return c.json({ error: "Erreur messages." }, 500);
    }
  };

  registerMulti("get", ["/api/vibe/dms/messages/:partnerId", "/vibe/dms/messages/:partnerId", "/v1/dms/messages/:partnerId"], handleDMMessages);

  // 4. SEND DM
  const handleSendDM = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const { recipient_id, content, reply_to_id, send_at } = await c.req.json();
      const recId = Number(recipient_id);

      if (!recId || !content || !content.trim()) {
        return c.json({ error: "Destinataire et contenu requis." }, 400);
      }

      // Envoi programmé : date future → status 'scheduled', pas de SSE immédiat
      let scheduledAt: string | null = null;
      if (send_at) {
        const ts = Date.parse(String(send_at));
        if (Number.isNaN(ts) || ts <= Date.now()) {
          return c.json({ error: "Date d'envoi invalide ou passée." }, 400);
        }
        scheduledAt = new Date(ts).toISOString();
      }

      const sql = getDb();
      await ensureDMTables().catch(() => {});

      // Blocage : impossible d'envoyer si l'un des deux a bloqué l'autre
      const blockCheck = await sql`
        SELECT 1 FROM blocked_users
        WHERE (user_id = ${userId} AND blocked_user_id = ${recId})
           OR (user_id = ${recId} AND blocked_user_id = ${userId})
        LIMIT 1
      `;
      if (blockCheck.length > 0) {
        return c.json({ error: "Impossible d'envoyer un message : utilisateur bloqué." }, 403);
      }

      // Vérifier les paramètres de messages du destinataire
      let recipientSettings: any[] = [];
      try {
        recipientSettings = await sql`
          SELECT allow_dms, dms_enabled
          FROM user_settings
          WHERE user_id = ${recId}
          LIMIT 1
        `;
      } catch (settingsErr) {
        console.warn("[vibe-dms] Note: user_settings check skipped or table incomplete:", settingsErr);
      }

      if (recipientSettings.length > 0) {
        const s = recipientSettings[0];
        const dmPolicy = s.allow_dms || 'everyone';
        const dmsEnabled = s.dms_enabled !== false;
        if (!dmsEnabled || dmPolicy === 'nobody') {
          return c.json({ error: "Cet utilisateur n'accepte pas les messages privés." }, 403);
        }
        if (dmPolicy === 'following') {
          const isFollowing = await sql`
            SELECT 1 FROM follows WHERE follower_id = ${recId} AND following_id = ${userId} LIMIT 1
          `;
          if (isFollowing.length === 0) {
            return c.json({ error: "Cet utilisateur n'accepte les messages que de ses abonnements." }, 403);
          }
        }
      }

      const p1 = userId < recId ? userId : recId;
      const p2 = userId < recId ? recId : userId;

      const convRows = await sql`
        INSERT INTO dm_conversations (participant_one_id, participant_two_id, last_message_preview, last_message_at)
        VALUES (${p1}, ${p2}, ${content.trim()}, NOW())
        ON CONFLICT (participant_one_id, participant_two_id)
        DO UPDATE SET last_message_preview = ${content.trim()}, last_message_at = NOW()
        RETURNING id
      `;

      const conversationId = convRows[0].id;
      const validReplyTo = typeof reply_to_id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reply_to_id) ? reply_to_id : null;
      const msg = scheduledAt ? await sql`
        INSERT INTO direct_messages (conversation_id, sender_id, recipient_id, content, reply_to_id, status, send_at)
        VALUES (${conversationId}::uuid, ${userId}, ${recId}, ${content.trim()}, ${validReplyTo}, 'scheduled', ${scheduledAt}::timestamptz)
        RETURNING *
      ` : await sql`
        INSERT INTO direct_messages (conversation_id, sender_id, recipient_id, content, reply_to_id)
        VALUES (${conversationId}::uuid, ${userId}, ${recId}, ${content.trim()}, ${validReplyTo})
        RETURNING *
      `;

      // Message programmé : réponse immédiate, pas de notification ni SSE
      if (scheduledAt) {
        return c.json({ success: true, message: msg[0], scheduled: true }, 201);
      }

      try {
        await sql`
          INSERT INTO notifications (recipient_id, actor_id, type, message)
          VALUES (${recId}, ${userId}, 'dm', 'vous a envoyé un message')
        `;
      } catch {}

      // Temps réel : pousse le message au destinataire (flux SSE)
      try {
        const senderInfo = await sql`
          SELECT u.username, p.display_name, p.avatar_url
          FROM users u LEFT JOIN profiles p ON p.user_id = u.id
          WHERE u.id = ${userId} LIMIT 1
        `;
        await pushRealtimeEvent(recId, "dm_message", {
          ...msg[0],
          sender_username: senderInfo[0]?.username || null,
          sender_display_name: senderInfo[0]?.display_name || null,
          sender_avatar_url: senderInfo[0]?.avatar_url || null,
        });
      } catch (rtErr) {
        console.warn("[vibe-dms] realtime dm_message push failed:", rtErr);
      }

      // Réponse automatique pour le compte @bot de test
      const recipientUser = await sql`SELECT username FROM users WHERE id = ${recId} LIMIT 1`;
      if (recipientUser.length > 0 && recipientUser[0].username === 'bot') {
        setTimeout(async () => {
          try {
            const botMsg = await sql`
              INSERT INTO direct_messages (conversation_id, sender_id, recipient_id, content)
              VALUES (${conversationId}::uuid, ${recId}, ${userId}, 'Bot')
              RETURNING *
            `;
            await sql`
              UPDATE dm_conversations SET last_message_preview = 'Bot', last_message_at = NOW()
              WHERE id = ${conversationId}::uuid
            `;
            await pushRealtimeEvent(userId, "dm_message", botMsg[0] || { conversation_id: conversationId, sender_id: recId, recipient_id: userId, content: 'Bot' });
          } catch {}
        }, 100);
      }

      // Réponse automatique du compte officiel mAI (conversation avec historique,
      // usage hebdomadaire débité à l'expéditeur)
      if (recipientUser.length > 0 && recipientUser[0].username === 'mai') {
        const maiUserId = recId;
        const senderMessage = String(content).trim().slice(0, 4000);
        setTimeout(async () => {
          try {
            await generateMAIDMReply(sql, conversationId, userId, maiUserId, senderMessage);
          } catch (maiErr) {
            console.warn("[vibe-dms] mAI DM reply failed:", maiErr);
          }
        }, 1200 + Math.floor(Math.random() * 1800));
      }

      return c.json({ success: true, message: msg[0] }, 201);
    } catch (err: any) {
      console.error("[vibe-dms] Error in handleSendDM:", err);
      return c.json({ error: err.message || "Erreur envoi message." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/dms/messages", "/vibe/dms/messages", "/v1/dms/messages"], handleSendDM);

  // 4c. PIN / UNPIN MESSAGE (max 3 par conversation, adressage partnerId)
  const handlePinMessage = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);
      const partnerId = Number(c.req.param("partnerId"));
      if (!partnerId || partnerId === userId) return c.json({ error: "Conversation invalide." }, 400);
      const body = await c.req.json().catch(() => ({}));
      const messageId = String(body?.message_id || "");
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(messageId)) {
        return c.json({ error: "Message invalide." }, 400);
      }
      const sql = getDb();
      await ensureDMTables().catch(() => {});
      const conversationId = await resolveConversationId(sql, userId, partnerId);
      if (!conversationId) return c.json({ error: "Conversation introuvable." }, 404);
      const msgRows = await sql`SELECT id FROM direct_messages WHERE id = ${messageId}::uuid AND conversation_id = ${conversationId}::uuid LIMIT 1`;
      if (msgRows.length === 0) return c.json({ error: "Message introuvable dans cette conversation." }, 404);
      const countRows = await sql`SELECT COUNT(*) AS n FROM dm_pinned_messages WHERE conversation_id = ${conversationId}::uuid`;
      if (Number(countRows[0]?.n || 0) >= 3) {
        return c.json({ error: "Maximum 3 messages épinglés par conversation.", code: "PIN_LIMIT" }, 403);
      }
      await sql`
        INSERT INTO dm_pinned_messages (conversation_id, message_id, pinned_by)
        VALUES (${conversationId}::uuid, ${messageId}::uuid, ${userId})
        ON CONFLICT (conversation_id, message_id) DO NOTHING
      `;
      try {
        await pushRealtimeEvent(partnerId, "dm_pin_updated", { conversation_id: conversationId, message_id: messageId, pinned: true });
        await pushRealtimeEvent(userId, "dm_pin_updated", { conversation_id: conversationId, message_id: messageId, pinned: true });
      } catch {}
      return c.json({ success: true, pinned: true });
    } catch (err: any) {
      return c.json({ error: "Erreur épinglage." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/dms/conversations/:partnerId/pin", "/vibe/dms/conversations/:partnerId/pin", "/v1/dms/conversations/:partnerId/pin", "/dms/conversations/:partnerId/pin"], handlePinMessage);

  const handleUnpinMessage = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);
      const partnerId = Number(c.req.param("partnerId"));
      const messageId = String(c.req.param("messageId") || "");
      if (!partnerId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(messageId)) {
        return c.json({ error: "Paramètres invalides." }, 400);
      }
      const sql = getDb();
      const conversationId = await resolveConversationId(sql, userId, partnerId);
      if (!conversationId) return c.json({ error: "Conversation introuvable." }, 404);
      await sql`DELETE FROM dm_pinned_messages WHERE conversation_id = ${conversationId}::uuid AND message_id = ${messageId}::uuid`;
      try {
        await pushRealtimeEvent(partnerId, "dm_pin_updated", { conversation_id: conversationId, message_id: messageId, pinned: false });
        await pushRealtimeEvent(userId, "dm_pin_updated", { conversation_id: conversationId, message_id: messageId, pinned: false });
      } catch {}
      return c.json({ success: true, pinned: false });
    } catch (err: any) {
      return c.json({ error: "Erreur désépinglage." }, 500);
    }
  };

  registerMulti("delete", ["/api/vibe/dms/conversations/:partnerId/pin/:messageId", "/vibe/dms/conversations/:partnerId/pin/:messageId", "/v1/dms/conversations/:partnerId/pin/:messageId", "/dms/conversations/:partnerId/pin/:messageId"], handleUnpinMessage);

  // 4d. SEARCH IN CONVERSATION (ILIKE sur content, paire user/partner)
  const handleSearchDMMessages = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);
      const partnerId = Number(c.req.param("partnerId"));
      const q = (c.req.query("q") || "").trim();
      if (!partnerId || !q) return c.json({ messages: [] });
      const sql = getDb();
      const messages = await sql`
        SELECT m.id, m.conversation_id, m.sender_id, m.recipient_id, m.content, m.is_read, m.created_at
        FROM direct_messages m
        WHERE ((m.sender_id = ${userId} AND m.recipient_id = ${partnerId})
           OR (m.sender_id = ${partnerId} AND m.recipient_id = ${userId}))
          AND m.content ILIKE ('%' || ${q} || '%')
          AND (m.status IS NULL OR m.status = 'sent')
        ORDER BY m.created_at DESC
        LIMIT 30
      `.catch(() => []);
      return c.json({ messages });
    } catch (err: any) {
      return c.json({ error: "Erreur recherche conversation." }, 500);
    }
  };

  registerMulti("get", ["/api/vibe/dms/messages/:partnerId/search", "/vibe/dms/messages/:partnerId/search", "/v1/dms/messages/:partnerId/search", "/dms/messages/:partnerId/search"], handleSearchDMMessages);

  // 4e. MARK CONVERSATION UNREAD (re-passe le dernier message reçu en non lu)
  const handleMarkUnread = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);
      const partnerId = Number(c.req.param("partnerId"));
      if (!partnerId) return c.json({ error: "Conversation invalide." }, 400);
      const sql = getDb();
      const last = await sql`
        SELECT id FROM direct_messages
        WHERE recipient_id = ${userId} AND sender_id = ${partnerId}
          AND (status IS NULL OR status = 'sent')
        ORDER BY created_at DESC
        LIMIT 1
      `;
      if (last.length > 0) {
        await sql`UPDATE direct_messages SET is_read = FALSE, read_at = NULL WHERE id = ${last[0].id}::uuid`;
      } else {
        // Aucun message reçu : marquer le dernier envoyé pour rouvrir le fil côté client
        const own = await sql`
          SELECT id FROM direct_messages
          WHERE sender_id = ${userId} AND recipient_id = ${partnerId}
          ORDER BY created_at DESC LIMIT 1
        `;
        if (own.length === 0) return c.json({ error: "Conversation introuvable." }, 404);
      }
      return c.json({ success: true, unread: true });
    } catch (err: any) {
      return c.json({ error: "Erreur marquage non lu." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/dms/conversations/:partnerId/mark-unread", "/vibe/dms/conversations/:partnerId/mark-unread", "/v1/dms/conversations/:partnerId/mark-unread", "/dms/conversations/:partnerId/mark-unread"], handleMarkUnread);

  // 4b. REACT TO A DM MESSAGE (toggle emoji)
  const handleReactDM = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);
      const messageId = c.req.param("messageId");
      const { emoji } = await c.req.json();

      if (!messageId || !emoji || typeof emoji !== 'string' || emoji.length > 16) {
        return c.json({ error: "Message et emoji requis." }, 400);
      }

      const sql = getDb();

      // Vérifier que l'utilisateur fait bien partie de la conversation
      const msgRows = await sql`
        SELECT id, sender_id, recipient_id FROM direct_messages WHERE id = ${messageId}::uuid LIMIT 1
      `;
      if (msgRows.length === 0) return c.json({ error: "Message introuvable." }, 404);
      const msg = msgRows[0];
      if (Number(msg.sender_id) !== userId && Number(msg.recipient_id) !== userId) {
        return c.json({ error: "Accès refusé." }, 403);
      }

      const existing = await sql`
        SELECT id FROM dm_reactions WHERE message_id = ${messageId}::uuid AND user_id = ${userId} AND emoji = ${emoji} LIMIT 1
      `;

      let reacted: boolean;
      if (existing.length > 0) {
        await sql`DELETE FROM dm_reactions WHERE id = ${existing[0].id}`;
        reacted = false;
      } else {
        await sql`
          INSERT INTO dm_reactions (message_id, user_id, emoji)
          VALUES (${messageId}::uuid, ${userId}, ${emoji})
          ON CONFLICT (message_id, user_id, emoji) DO NOTHING
        `;
        reacted = true;
      }

      const all = await sql`
        SELECT emoji, user_id FROM dm_reactions WHERE message_id = ${messageId}::uuid
      `;
      const grouped: { emoji: string; count: number; mine: boolean }[] = [];
      for (const r of all) {
        const g = grouped.find((x) => x.emoji === r.emoji);
        if (g) {
          g.count += 1;
          g.mine = g.mine || Number(r.user_id) === userId;
        } else {
          grouped.push({ emoji: r.emoji, count: 1, mine: Number(r.user_id) === userId });
        }
      }

      return c.json({ success: true, reacted, reactions: grouped });
    } catch (err: any) {
      console.error("[vibe-dms] React error:", err);
      return c.json({ error: "Erreur réaction." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/dms/messages/:messageId/react", "/vibe/dms/messages/:messageId/react", "/v1/dms/messages/:messageId/react"], handleReactDM);

  // 4c. AI-GENERATED REPLY SUGGESTION (mAI dans les DMs)
  const handleDMGenerateReply = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      let partnerId = Number(c.req.param("partnerId"));
      let draft = "";
      let preset = "improve";
      let customPrompt = "";
      let toneValue = "";

      // Récupération de partner_id, draft/text, preset et customPrompt depuis le corps JSON
      try {
        const body = await c.req.json();
        if (!partnerId && body?.partner_id) {
          partnerId = Number(body.partner_id);
        }
        if (body?.draft && typeof body.draft === "string") {
          draft = body.draft.trim();
        } else if (body?.text && typeof body.text === "string") {
          draft = body.text.trim();
        }
        if (body?.preset && typeof body.preset === "string") {
          preset = body.preset;
        }
        if (body?.custom_prompt && typeof body.custom_prompt === "string") {
          customPrompt = body.custom_prompt.trim();
        }
        if (body?.tone && typeof body.tone === "string") {
          toneValue = body.tone.trim();
        }
      } catch {}

      if (!partnerId) {
        return c.json({ error: "Identifiant du destinataire manquant." }, 400);
      }

      // Refuser l'appel si aucun texte n'est présent dans la bulle de message
      if (!draft || !draft.trim()) {
        return c.json(
          { error: "Veuillez d'abord écrire un texte dans la bulle de message pour que mAI puisse l'améliorer." },
          400
        );
      }

      const sql = getDb();
      // Contexte de la conversation totale (chronologique sans limite réductrice)
      // — calculé AVANT les presets : PRESETS.improve interpole @partnerName.
      const [recent, partnerRow, userRow] = await Promise.all([
        sql`
          SELECT m.content, m.sender_id, u.username as sender_username
          FROM direct_messages m
          JOIN users u ON u.id = m.sender_id
          WHERE (m.sender_id = ${userId} AND m.recipient_id = ${partnerId})
             OR (m.sender_id = ${partnerId} AND m.recipient_id = ${userId})
          ORDER BY m.created_at ASC
          LIMIT 100
        `,
        sql`SELECT username, tier FROM users WHERE id = ${partnerId} LIMIT 1`,
        sql`SELECT username, tier FROM users WHERE id = ${userId} LIMIT 1`,
      ]);

      const partnerName = partnerRow[0]?.username || "votre contact";
      const userPlan = userRow[0]?.tier || "Free";

      // Presets d'écriture : Réduire, Allonger, Changer le ton, Améliorer, Personnalisé
      const PRESETS: Record<string, string> = {
        shorten: "Réduis ce message : rends-le plus court et percutant tout en conservant son sens essentiel. Ne perds aucune information importante, supprime les fioritures.",
        extend: "Allonge ce message : développe-le avec plus de détails, de contexte et de naturel, sans le rendre verbeux ni artificiel.",
        tone: `Change le ton de ce message : réécris-le avec un ton ${toneValue ? `« ${toneValue} »` : "plus amical et naturel"}, en gardant strictement le même fond et la même intention.`,
        improve: "Améliore, enrichis et perfectionne ce message pour qu'il réponde harmonieusement à @" + partnerName + " dans le fil de la discussion. Préserve fidèlement l'intention de l'utilisateur, améliore la formulation et le naturel en français.",
        custom: customPrompt
          ? `Applique exactement cette consigne de l'utilisateur à ce message : « ${customPrompt} ».`
          : "",
      };
      const presetInstruction = PRESETS[preset];
      if (!presetInstruction) {
        return c.json({ error: "Preset inconnu. Presets disponibles : shorten, extend, tone, improve, custom." }, 400);
      }
      if (preset === "custom" && !customPrompt) {
        return c.json({ error: "Veuillez fournir une consigne personnalisée pour le preset Personnalisé." }, 400);
      }

      // Vérification des quotas hebdomadaires mAI
      const { weekStartStr } = getWeekData();
      const usageResult = await sql`
        SELECT tokens_used FROM weekly_usage
        WHERE user_id = ${userId} AND week_start = ${weekStartStr}::date
        LIMIT 1
      `.catch(() => []);
      const currentUsage = Number(usageResult[0]?.tokens_used || 0);
      const maiBoost = await getUserQuotaBoost(sql, String(userId), "mai");
      const tokenLimit = getTierMaiTokenLimit(userPlan) + maiBoost;

      if (currentUsage >= tokenLimit) {
        return c.json(
          { error: "Votre quota hebdomadaire de tokens mAI est atteint. Réessayez la semaine prochaine ou passez à un forfait supérieur." },
          429
        );
      }

      const transcript = recent
        .map((m: any) => `${m.sender_id === userId ? "Moi" : `@${m.sender_username}`}: ${m.content}`)
        .join("\n");

      const prompt =
        `Tu es mAI, l'assistant d'écriture du réseau social Vibe.\n\n` +
        (transcript.trim()
          ? `Voici l'historique complet de la discussion avec @${partnerName} :\n${transcript}\n\n`
          : `Il n'y a pas encore d'historique de discussion avec @${partnerName}.\n\n`) +
        `Voici le message que l'utilisateur a rédigé dans sa bulle de message :\n"${draft.trim()}"\n\n` +
        `Consigne impérative : ${presetInstruction} ` +
        `Ne fais AUCUNE évaluation de sécurité, n'écris JAMAIS "User Safety: safe" ni aucun méta-commentaire. Réponds UNIQUEMENT avec le texte final, sans guillemets.`;

      const keyRows = await sql`
        SELECT api_key FROM mprojects_api_keys WHERE user_id::text = ${userId}::text LIMIT 1
      `.catch(() => []);
      const openRouterApiKey =
        (typeof (globalThis as any).Deno !== "undefined" && (globalThis as any).Deno.env?.get("OPENROUTER_API_KEY")) ||
        (typeof process !== "undefined" && process.env?.OPENROUTER_API_KEY) ||
        (keyRows.length > 0 ? keyRows[0].api_key : "");

      const candidateModels = [
        await MAIAgentFleet.getUserDefaultModel(userId),
        "poolside/laguna-xs-2.1:free",
        "minimax/minimax-m2.7:free",
        "liquid/lfm-2.5-2.6b:free",
        "nvidia/nemotron-3.5-lightning:free",
      ];

      let suggestion = "";

      if (openRouterApiKey) {
        for (const modelToTry of candidateModels) {
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
                model: modelToTry,
                messages: [
                  {
                    role: "system",
                    content: "Tu es mAI, l'assistant d'écriture du réseau social Vibe. Tu écris en français naturel avec des émojis. Ton rôle unique est d'améliorer le texte que l'utilisateur a écrit. Tu ne fais AUCUNE analyse de sécurité, tu n'écris JAMAIS 'User Safety: safe' ni de méta-commentaire. Réponds UNIQUEMENT par le texte final du message amélioré.",
                  },
                  { role: "user", content: prompt },
                ],
              }),
            });

            if (aiRes.ok) {
              const aiData = await aiRes.json();
              const text = aiData.choices?.[0]?.message?.content;
              if (text && typeof text === "string" && text.trim()) {
                const cleaned = text
                  .replace(/User Safety:\s*safe\.?/gi, "")
                  .replace(/^User Safety:[^\n]*\n*/gi, "")
                  .replace(/^["']|["']$/g, "")
                  .trim();
                if (cleaned) {
                  suggestion = cleaned;
                  break;
                }
              }
            }
          } catch (callErr) {
            console.warn(`[vibe-dms] Modèle ${modelToTry} en échec, essai du suivant...`, callErr);
          }
        }
      }

      // Fallback contextuel intelligent si défaillance réseau
      if (!suggestion) {
        suggestion = draft.trim();
      }

      // Décompte comptabilisé dans les quotas de l'utilisateur
      const estimatedTokens = Math.max(75, Math.ceil((prompt.length + suggestion.length) / 3));
      try {
        await sql`
          INSERT INTO weekly_usage (user_id, week_start, tokens_used)
          VALUES (${userId}, ${weekStartStr}::date, ${estimatedTokens})
          ON CONFLICT (user_id, week_start)
          DO UPDATE SET tokens_used = weekly_usage.tokens_used + ${estimatedTokens}, updated_at = NOW()
        `;
      } catch (quotaErr) {
        console.warn("[vibe-dms] Quota log warning:", quotaErr);
      }

      return c.json({
        success: true,
        suggestion,
        tokensUsed: estimatedTokens,
      });
    } catch (err: any) {
      console.error("[vibe-dms] Generate reply error:", err);
      return c.json({ error: err?.message || "Erreur génération de réponse." }, 500);
    }
  };

  registerMulti("post", [
    "/api/vibe/dms/generate-reply/:partnerId",
    "/vibe/dms/generate-reply/:partnerId",
    "/v1/dms/generate-reply/:partnerId",
    "/api/vibe/dms/suggest-reply",
    "/vibe/dms/suggest-reply",
    "/v1/dms/suggest-reply",
  ], handleDMGenerateReply);

  // 4d. BLOCK / UNBLOCK / LIST BLOCKED USERS
  const handleBlock = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);
      const { user_id } = await c.req.json();
      const targetId = Number(user_id);
      if (!targetId || targetId === userId) return c.json({ error: "Utilisateur invalide." }, 400);

      const sql = getDb();
      await sql`
        INSERT INTO blocked_users (user_id, blocked_user_id)
        VALUES (${userId}, ${targetId})
        ON CONFLICT (user_id, blocked_user_id) DO NOTHING
      `;
      return c.json({ success: true });
    } catch (err: any) {
      console.error("[vibe-dms] Block error:", err);
      return c.json({ error: "Erreur blocage." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/dms/block", "/vibe/dms/block", "/v1/dms/block"], handleBlock);

  const handleUnblock = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);
      const { user_id } = await c.req.json();
      const targetId = Number(user_id);
      if (!targetId) return c.json({ error: "Utilisateur invalide." }, 400);

      const sql = getDb();
      await sql`DELETE FROM blocked_users WHERE user_id = ${userId} AND blocked_user_id = ${targetId}`;
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ error: "Erreur déblocage." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/dms/unblock", "/vibe/dms/unblock", "/v1/dms/unblock"], handleUnblock);

  const handleListBlocked = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const sql = getDb();
      const rows = await sql`
        SELECT b.id, b.blocked_user_id, b.created_at,
               u.username as blocked_username,
               pr.display_name as blocked_display_name,
               pr.avatar_url as blocked_avatar_url
        FROM blocked_users b
        JOIN users u ON u.id = b.blocked_user_id
        LEFT JOIN profiles pr ON pr.user_id = u.id
        WHERE b.user_id = ${userId}
        ORDER BY b.created_at DESC
      `;
      return c.json({ blocked: rows });
    } catch (err: any) {
      return c.json({ error: "Erreur liste bloqués." }, 500);
    }
  };

  registerMulti("get", ["/api/vibe/dms/blocked", "/vibe/dms/blocked", "/v1/dms/blocked"], handleListBlocked);

  // 4e. REPORT A CONVERSATION / MESSAGE
  const handleReport = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);
      const { reported_user_id, reason, message_id } = await c.req.json();
      const targetId = Number(reported_user_id);
      if (!targetId) return c.json({ error: "Utilisateur à signaler requis." }, 400);

      const sql = getDb();
      await sql`
        INSERT INTO dm_reports (reporter_id, reported_user_id, message_id, reason)
        VALUES (${userId}, ${targetId}, ${message_id || null}, ${String(reason || 'non précisé').slice(0, 500)})
      `;
      return c.json({ success: true, message: "Signalement transmis à la modération." });
    } catch (err: any) {
      console.error("[vibe-dms] Report error:", err);
      return c.json({ error: "Erreur signalement." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/dms/report", "/vibe/dms/report", "/v1/dms/report"], handleReport);

  // 4f. RENAME A CONVERSATION (nom local, par utilisateur)
  const handleRenameConversation = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);
      const partnerId = Number(c.req.param("partnerId"));
      const { name } = await c.req.json();
      const customName = String(name || '').trim().slice(0, 50);

      const sql = getDb();
      if (!customName) {
        await sql`DELETE FROM dm_conv_meta WHERE user_id = ${userId} AND partner_id = ${partnerId}`;
      } else {
        await sql`
          INSERT INTO dm_conv_meta (user_id, partner_id, custom_name)
          VALUES (${userId}, ${partnerId}, ${customName})
          ON CONFLICT (user_id, partner_id)
          DO UPDATE SET custom_name = ${customName}
        `;
      }
      return c.json({ success: true, custom_name: customName || null });
    } catch (err: any) {
      console.error("[vibe-dms] Rename error:", err);
      return c.json({ error: "Erreur renommage." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/dms/conversations/:partnerId/rename", "/vibe/dms/conversations/:partnerId/rename", "/v1/dms/conversations/:partnerId/rename"], handleRenameConversation);

  // 4g. DELETE A CONVERSATION (côté compte courant : messages reçus/envoyés + conversation)
  const handleDeleteConversation = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);
      const partnerId = Number(c.req.param("partnerId"));
      if (!partnerId) return c.json({ error: "Partenaire invalide." }, 400);

      const sql = getDb();
      await sql`
        DELETE FROM direct_messages
        WHERE (sender_id = ${userId} AND recipient_id = ${partnerId})
           OR (sender_id = ${partnerId} AND recipient_id = ${userId})
      `;
      await sql`
        DELETE FROM dm_conversations
        WHERE (participant_one_id = ${userId} AND participant_two_id = ${partnerId})
           OR (participant_one_id = ${partnerId} AND participant_two_id = ${userId})
      `;
      await sql`DELETE FROM dm_conv_meta WHERE (user_id = ${userId} AND partner_id = ${partnerId})`;
      return c.json({ success: true });
    } catch (err: any) {
      console.error("[vibe-dms] Delete conversation error:", err);
      return c.json({ error: "Erreur suppression conversation." }, 500);
    }
  };

  registerMulti("delete", ["/api/vibe/dms/conversations/:partnerId", "/vibe/dms/conversations/:partnerId", "/v1/dms/conversations/:partnerId"], handleDeleteConversation);

  // 4h. DELETE A SINGLE MESSAGE (seulement ses propres messages)
  const handleDeleteMessage = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);
      const messageId = c.req.param("messageId");
      if (!messageId) return c.json({ error: "Message invalide." }, 400);

      const sql = getDb();
      const rows = await sql`SELECT sender_id FROM direct_messages WHERE id = ${messageId}::uuid LIMIT 1`;
      if (rows.length === 0) return c.json({ error: "Message introuvable." }, 404);
      if (Number(rows[0].sender_id) !== userId) {
        return c.json({ error: "Vous ne pouvez supprimer que vos propres messages." }, 403);
      }
      await sql`DELETE FROM dm_reactions WHERE message_id = ${messageId}::uuid`.catch(() => {});
      await sql`DELETE FROM direct_messages WHERE id = ${messageId}::uuid`;
      return c.json({ success: true });
    } catch (err: any) {
      console.error("[vibe-dms] Delete message error:", err);
      return c.json({ error: "Erreur suppression message." }, 500);
    }
  };

  registerMulti("delete", ["/api/vibe/dms/messages/:messageId", "/vibe/dms/messages/:messageId", "/v1/dms/messages/:messageId"], handleDeleteMessage);

  // 4d. EDIT DM MESSAGE (avec limite de 60 minutes)
  const handleEditMessage = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);
      const messageId = c.req.param("messageId");

      if (!messageId) return c.json({ error: "ID du message requis." }, 400);

      const { content } = await c.req.json();
      if (!content || !content.trim()) {
        return c.json({ error: "Le contenu du message ne peut pas être vide." }, 400);
      }

      const sql = getDb();
      const rows = await sql`
        SELECT * FROM direct_messages WHERE id = ${messageId}::uuid LIMIT 1
      `;
      if (rows.length === 0) {
        return c.json({ error: "Message introuvable." }, 404);
      }
      const msg = rows[0];
      if (Number(msg.sender_id) !== userId) {
        return c.json({ error: "Vous ne pouvez modifier que vos propres messages." }, 403);
      }

      // Vérifier la limite de 60 minutes
      const createdAt = new Date(msg.created_at).getTime();
      const now = Date.now();
      const diffMinutes = (now - createdAt) / (1000 * 60);
      if (diffMinutes > 60) {
        return c.json({ error: "Ce message a été envoyé il y a plus de 60 minutes et ne peut plus être modifié." }, 403);
      }

      const updated = await sql`
        UPDATE direct_messages
        SET content = ${content.trim()},
            is_edited = TRUE,
            edited_at = NOW()
        WHERE id = ${messageId}::uuid
        RETURNING *
      `;

      // Mettre à jour l'aperçu dans la conversation
      try {
        await sql`
          UPDATE dm_conversations
          SET last_message_preview = ${content.trim()}
          WHERE id = ${msg.conversation_id}::uuid
        `;
      } catch {}

      // Informer le destinataire en temps réel via SSE
      try {
        await pushRealtimeEvent(Number(msg.recipient_id), "dm_message_edited", updated[0]);
      } catch {}

      return c.json({ success: true, message: updated[0] });
    } catch (err: any) {
      console.error("[vibe-dms] Edit message error:", err);
      return c.json({ error: "Erreur lors de la modification du message." }, 500);
    }
  };

  registerMulti("patch", ["/api/vibe/dms/messages/:messageId", "/vibe/dms/messages/:messageId", "/v1/dms/messages/:messageId"], handleEditMessage);
  registerMulti("put", ["/api/vibe/dms/messages/:messageId", "/vibe/dms/messages/:messageId", "/v1/dms/messages/:messageId"], handleEditMessage);

  // 5. NOTIFICATIONS
  const handleNotifications = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const sql = getDb();
      const notifs = await sql`
        SELECT n.*,
               u.username as actor_username,
               COALESCE(u.avatar_url, pr.avatar_url) as actor_avatar_url,
               COALESCE(pr.display_name, u.username) as actor_display_name,
               (COALESCE(u.is_verified, FALSE) OR LOWER(COALESCE(u.tier, '')) IN ('plus', 'pro', 'max')) as actor_verified
        FROM notifications n
        LEFT JOIN users u ON u.id = n.actor_id
        LEFT JOIN profiles pr ON pr.user_id = u.id
        WHERE n.recipient_id = ${userId}
          AND (n.actor_id IS NULL OR (
            n.actor_id NOT IN (SELECT COALESCE(blocked_user_id, -1) FROM blocked_users WHERE user_id = ${userId})
            AND n.actor_id NOT IN (SELECT COALESCE(user_id, -1) FROM blocked_users WHERE blocked_user_id = ${userId})
            AND n.actor_id NOT IN (SELECT COALESCE(muted_user_id, -1) FROM muted_users WHERE user_id = ${userId})
          ))
        ORDER BY n.created_at DESC
        LIMIT 100
      `;
      return c.json({ notifications: notifs });
    } catch (err: any) {
      return c.json({ error: "Erreur notifications." }, 500);
    }
  };

  registerMulti("get", ["/api/vibe/notifications", "/vibe/notifications", "/v1/notifications"], handleNotifications);

  const handleMarkNotificationsRead = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      let body: any = {};
      try {
        body = await c.req.json();
      } catch {}

      const rawId = c.req.param?.("id") || body?.id || body?.notification_id;
      const notifId = rawId ? String(rawId).trim() : null;
      const sql = getDb();
      const isReadVal = body?.is_read !== undefined ? Boolean(body.is_read) : true;

      if (notifId && notifId !== "all" && notifId !== "undefined" && notifId !== "null" && notifId !== "") {
        await sql`
          UPDATE notifications
          SET is_read = ${isReadVal}
          WHERE id::text = ${notifId} AND recipient_id = ${userId}
        `;
      } else {
        await sql`
          UPDATE notifications
          SET is_read = ${isReadVal}
          WHERE recipient_id = ${userId}
        `;
      }
      return c.json({ success: true, is_read: isReadVal, id: notifId });
    } catch (err: any) {
      console.error("[vibe-dms] Error in handleMarkNotificationsRead:", err);
      return c.json({ error: "Erreur marquage notification.", details: err?.message }, 500);
    }
  };

  registerMulti("post", [
    "/api/vibe/notifications/read",
    "/vibe/notifications/read",
    "/v1/notifications/read",
    "/v1/notifications/:id/read",
    "/api/vibe/notifications/:id/read"
  ], handleMarkNotificationsRead);
  registerMulti("patch", [
    "/api/vibe/notifications/read",
    "/v1/notifications/read",
    "/v1/notifications/:id/read",
    "/api/vibe/notifications/:id/read"
  ], handleMarkNotificationsRead);

  const handleDeleteNotification = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      let body: any = {};
      try {
        body = await c.req.json();
      } catch {}

      const rawId = c.req.param?.("id") || body?.id || body?.notification_id;
      const notifId = rawId ? String(rawId).trim() : null;
      const sql = getDb();

      if (notifId && notifId !== "all" && notifId !== "clear" && notifId !== "undefined" && notifId !== "null" && notifId !== "") {
        await sql`
          DELETE FROM notifications
          WHERE id::text = ${notifId} AND recipient_id = ${userId}
        `;
      } else {
        await sql`
          DELETE FROM notifications
          WHERE recipient_id = ${userId}
        `;
      }
      return c.json({ success: true, deleted_id: notifId || "all" });
    } catch (err: any) {
      console.error("[vibe-dms] Error in handleDeleteNotification:", err);
      return c.json({ error: "Erreur suppression notification.", details: err?.message }, 500);
    }
  };

  registerMulti("delete", [
    "/api/vibe/notifications/:id",
    "/v1/notifications/:id",
    "/api/vibe/notifications",
    "/v1/notifications"
  ], handleDeleteNotification);
  registerMulti("post", [
    "/api/vibe/notifications/:id/delete",
    "/v1/notifications/:id/delete",
    "/api/vibe/notifications/delete",
    "/v1/notifications/delete",
    "/api/vibe/notifications/clear",
    "/v1/notifications/clear"
  ], handleDeleteNotification);

  // Compteur léger pour les badges — évite de charger toutes les notifications
  const handleUnreadCount = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const sql = getDb();
      const [notifRow] = await sql`
        SELECT COUNT(*)::int AS unread_notifications FROM notifications WHERE recipient_id = ${userId} AND NOT is_read
      `;
      const [dmRow] = await sql`
        SELECT COUNT(*)::int AS unread_messages FROM direct_messages
        WHERE recipient_id = ${userId} AND is_read = FALSE
      `;
      return c.json({
        unread_notifications: Number(notifRow?.unread_notifications || 0),
        unread_messages: Number(dmRow?.unread_messages || 0),
      });
    } catch (err: any) {
      return c.json({ error: "Erreur." }, 500);
    }
  };

  registerMulti("get", ["/api/vibe/notifications/unread_count", "/vibe/notifications/unread_count", "/v1/notifications/unread_count"], handleUnreadCount);
}
