/**
 * ============================================================================
 * VIBE SOCIAL PLATFORM — REALTIME (realtime.ts)
 * Server-Sent Events : notifications, messages, indicateur de frappe et stats
 * de posts poussés en direct (remplace le polling 15 s côté client).
 *
 * Architecture : une table d'événements transitoires `realtime_events`
 * (fiable même multi-isolates, contrairement à un bus mémoire) lue par la
 * boucle SSE ; les notifications et messages sont quant à eux détectés par
 * lecture directe de leurs tables (aucun site d'insertion à modifier).
 * ============================================================================
 */

import type { Hono } from "npm:hono@4";
import { streamSSE } from "npm:hono/streaming";
import { extractToken, getDb, verifyToken } from "./config.ts";
import { createRegisterMulti } from "./vibe-common.ts";

// ─────────────────────────────────────────────
// Table d'événements transitoires (typing, post_stats, dm_message)
// ─────────────────────────────────────────────
let realtimeTablesReady = false;

export async function ensureRealtimeTables() {
  if (realtimeTablesReady) return;
  try {
    const sql = getDb();
    await sql`
      CREATE TABLE IF NOT EXISTS realtime_events (
        id BIGSERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        payload JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_realtime_user ON realtime_events(user_id, id)`;
    realtimeTablesReady = true;
  } catch (err) {
    console.warn("[realtime] ensureRealtimeTables skipped:", (err as any)?.message);
  }
}

/**
 * Pousse un événement temps réel vers un utilisateur (consommé par son flux SSE).
 * Jamais bloquant pour l'appelant : un échec de push ne doit pas faire échouer
 * l'action métier (like, message...).
 */
export async function pushRealtimeEvent(userId: number | string | null | undefined, type: string, payload: any) {
  const target = Number(userId);
  if (!target || isNaN(target)) return;
  try {
    await ensureRealtimeTables();
    const sql = getDb();
    await sql`
      INSERT INTO realtime_events (user_id, type, payload)
      VALUES (${target}, ${type}, ${JSON.stringify(payload || {})}::jsonb)
    `;
    // Purge opportuniste : les clients connectés lisent ces événements en <2 s
    await sql`DELETE FROM realtime_events WHERE created_at < NOW() - INTERVAL '2 minutes'`.catch(() => {});
  } catch (err) {
    console.warn("[realtime] pushRealtimeEvent failed:", (err as any)?.message);
  }
}

// ─────────────────────────────────────────────
// Limiteur de connexions simultanées par utilisateur (best-effort par isolate)
// ─────────────────────────────────────────────
const openConnections = new Map<string, number>();

const MAX_CONNECTIONS_PER_USER = 2;
const TICK_MS = 1_000;
const HEARTBEAT_TICKS = 15;
const UNREAD_TICKS = 30;
const NOTIF_POLL_TICKS = 2;

export function registerRealtimeRoutes(app: Hono) {
  const registerMulti = createRegisterMulti(app);
  const handleStream = async (c: any) => {
    // EventSource ne peut pas définir d'en-têtes : JWT accepté en ?token=
    const token = extractToken(c.req.raw) || c.req.query("token") || "";
    if (!token) return c.json({ error: "Non authentifié." }, 401);

    let userId: number;
    try {
      const payload = await verifyToken(token);
      userId = Number(payload.sub || (payload as any).id);
      if (!userId || isNaN(userId)) throw new Error("no user");
    } catch {
      return c.json({ error: "Token invalide." }, 401);
    }

    await ensureRealtimeTables();

    const key = String(userId);
    const current = openConnections.get(key) || 0;
    if (current >= MAX_CONNECTIONS_PER_USER) {
      return c.json({ error: "Trop de connexions temps réel pour ce compte." }, 429);
    }
    openConnections.set(key, current + 1);

    const sql = getDb();

    // Chevauchement initial de 3 s : rattrape ce qui a été émis juste avant la
    // connexion (le client déduplique par id côté UI).
    const seenNotificationIds = new Set<string>();
    const seenMessageIds = new Set<string>();
    let notifCursor = new Date(Date.now() - 3_000).toISOString();
    let dmCursor = new Date(Date.now() - 3_000).toISOString();
    let lastEventId = 0;
    let tick = 0;

    try {
      return streamSSE(c, async (sse: any) => {
        let aborted = false;
        sse.onAbort(() => {
          aborted = true;
        });

        const pushUnreadCounts = async () => {
          try {
            const counts = await sql`
              SELECT
                (SELECT COUNT(*) FROM notifications WHERE recipient_id = ${userId} AND is_read = FALSE) AS unread_notifications,
                (SELECT COUNT(*) FROM direct_messages WHERE recipient_id = ${userId} AND is_read = FALSE) AS unread_messages
            `;
            await sse.writeSSE({
              event: "unread_counts",
              data: JSON.stringify({
                unread_notifications: Number(counts[0]?.unread_notifications || 0),
                unread_messages: Number(counts[0]?.unread_messages || 0),
              }),
            });
          } catch {}
        };

        try {
          await sse.writeSSE({
            event: "connected",
            data: JSON.stringify({ user_id: userId, at: new Date().toISOString() }),
          });
          await pushUnreadCounts();
        } catch {
          aborted = true;
        }

        while (!aborted) {
          await sse.sleep(TICK_MS);
          if (aborted) break;
          tick += 1;

          try {
            // 1. Événements transitoires poussés (dm_message, dm_typing, post_stats)
            const events = await sql`
              SELECT id, type, payload FROM realtime_events
              WHERE user_id = ${userId} AND id > ${lastEventId}
              ORDER BY id ASC LIMIT 50
            `;
            for (const ev of events) {
              lastEventId = Number(ev.id);
              await sse.writeSSE({ event: ev.type, data: JSON.stringify(ev.payload ?? {}) });
            }
          } catch (pollErr) {
            console.warn("[realtime] events poll error:", (pollErr as any)?.message);
          }

          // 2. Nouvelles notifications (toutes types : like, repost, mention, follow, dm...)
          if (tick % NOTIF_POLL_TICKS === 0) {
            try {
              const notifs = await sql`
                SELECT n.id, n.type, n.post_id, n.comment_id, n.message, n.is_read, n.created_at,
                       a.username AS actor_username, p.display_name AS actor_display_name, p.avatar_url AS actor_avatar_url
                FROM notifications n
                LEFT JOIN users a ON a.id = n.actor_id
                LEFT JOIN profiles p ON p.user_id = n.actor_id
                WHERE n.recipient_id = ${userId} AND n.created_at > ${notifCursor}
                ORDER BY n.created_at ASC LIMIT 20
              `;
              let maxNotifAt: string | null = null;
              for (const n of notifs) {
                if (seenNotificationIds.has(String(n.id))) continue;
                seenNotificationIds.add(String(n.id));
                if (!maxNotifAt || String(n.created_at) > maxNotifAt) maxNotifAt = String(n.created_at);
                await sse.writeSSE({ event: "notification", data: JSON.stringify(n) });
              }
              if (maxNotifAt) notifCursor = maxNotifAt;
            } catch (notifErr) {
              console.warn("[realtime] notifications poll error:", (notifErr as any)?.message);
            }
          }

          // 3. Rattrapage périodique des badges (filet si un événement a été manqué)
          if (tick % UNREAD_TICKS === 0) {
            await pushUnreadCounts();
          }

          // 4. Heartbeat (keep-alive proxies)
          if (tick % HEARTBEAT_TICKS === 0) {
            try {
              await sse.writeSSE({ event: "ping", data: String(Date.now()) });
            } catch {
              break;
            }
          }
        }
      });
    } finally {
      openConnections.set(key, Math.max(0, (openConnections.get(key) || 1) - 1));
    }
  };

  registerMulti("get", ["/api/vibe/realtime/stream", "/vibe/realtime/stream", "/v1/realtime/stream", "/realtime/stream"], handleStream);

  // Indicateur de frappe : le client l'émet (throttlé) pendant la saisie d'un DM
  const handleTyping = async (c: any) => {
    try {
      const token = extractToken(c.req.raw);
      if (!token) return c.json({ error: "Non authentifié." }, 401);
      const payload = await verifyToken(token);
      const userId = Number(payload.sub || (payload as any).id);

      const body = await c.req.json().catch(() => ({} as any));
      const partnerId = Number(body?.partner_id);
      const typing = body?.typing !== false;
      if (!partnerId || isNaN(partnerId) || partnerId === userId) {
        return c.json({ error: "Partenaire requis." }, 400);
      }

      const sql = getDb();
      let actor: any = {};
      try {
        const rows = await sql`
          SELECT u.username, p.display_name
          FROM users u LEFT JOIN profiles p ON p.user_id = u.id
          WHERE u.id = ${userId} LIMIT 1
        `;
        actor = rows[0] || {};
      } catch {}

      await pushRealtimeEvent(partnerId, "dm_typing", {
        user_id: userId,
        username: actor.username || null,
        display_name: actor.display_name || null,
        typing,
      });

      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ error: err?.message || "Erreur indicateur de frappe." }, 500);
    }
  };

  registerMulti("post", ["/api/vibe/dms/typing", "/vibe/dms/typing", "/v1/dms/typing"], handleTyping);
}
