"use server";

import { neon } from "@neondatabase/serverless";
import {
  sendSupportTicketCreatedEmail,
  sendSupportTicketUpdateEmail,
  type SupportTicketEmailPayload,
} from "@/email";

function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("La variable d'environnement DATABASE_URL est manquante.");
  }
  return neon(databaseUrl);
}

function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://m-ai.fr";
}

export interface SupportTicket {
  id: string;
  ticket_number: number;
  user_id: string;
  user_email: string;
  user_name: string;
  user_tier: string;
  title: string;
  description: string;
  category: string;
  project: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "waiting_user" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  metadata?: any;
  message_count?: number;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_email: string;
  sender_name: string;
  sender_role: "user" | "admin" | "system";
  message: string;
  action_type: "message" | "status_change" | "priority_change" | "created";
  created_at: string;
}

export const ADMIN_EMAIL = "mathias.tss2012@gmail.com";

export function isAdminUser(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

/**
 * Crée un nouveau ticket de support et alerte l'administrateur
 */
export async function createSupportTicket(data: {
  userId: string;
  userEmail: string;
  userName: string;
  userTier?: string;
  title: string;
  description: string;
  category: string;
  project: string;
  priority: "low" | "medium" | "high" | "urgent";
  metadata?: Record<string, any>;
}) {
  try {
    const sql = getSql();

    if (!data.title?.trim() || !data.description?.trim()) {
      return { success: false, error: "Le titre et la description sont requis." };
    }

    const tier = data.userTier || "Free";

    // 1. Insertion du ticket dans Neon Postgres
    const result = await sql`
      INSERT INTO support_tickets (
        user_id,
        user_email,
        user_name,
        user_tier,
        title,
        description,
        category,
        project,
        priority,
        status,
        metadata
      ) VALUES (
        ${data.userId},
        ${data.userEmail},
        ${data.userName},
        ${tier},
        ${data.title.trim()},
        ${data.description.trim()},
        ${data.category || "Autre"},
        ${data.project || "mAI Web"},
        ${data.priority || "medium"},
        'open',
        ${JSON.stringify(data.metadata || {})}::jsonb
      )
      RETURNING *
    `;

    const ticket = result[0] as SupportTicket;

    // 2. Création du premier message d'historique
    await sql`
      INSERT INTO support_ticket_messages (
        ticket_id,
        sender_id,
        sender_email,
        sender_name,
        sender_role,
        message,
        action_type
      ) VALUES (
        ${ticket.id},
        ${data.userId},
        ${data.userEmail},
        ${data.userName},
        'user',
        ${data.description.trim()},
        'created'
      )
    `;

    // 3. Envoi du mail de notification à l'administrateur
    try {
      const emailPayload: SupportTicketEmailPayload = {
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        user_id: ticket.user_id,
        user_email: ticket.user_email,
        user_name: ticket.user_name,
        user_tier: ticket.user_tier,
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        project: ticket.project,
        priority: ticket.priority,
        status: ticket.status,
        created_at: ticket.created_at,
      };

      await sendSupportTicketCreatedEmail({
        ticket: emailPayload,
        appUrl: getAppUrl(),
      });
    } catch (mailErr) {
      console.error("[SUPPORT EMAIL ERROR]", mailErr);
    }

    return {
      success: true,
      ticket,
    };
  } catch (error: any) {
    console.error("Erreur lors de la création du ticket:", error);
    return {
      success: false,
      error: error?.message || "Une erreur est survenue lors de la création du ticket.",
    };
  }
}

/**
 * Récupère les tickets d'un utilisateur (ou tous les tickets pour l'admin)
 */
export async function getTicketsList({
  userId,
  userEmail,
  status,
  project,
  priority,
  search,
}: {
  userId: string;
  userEmail?: string;
  status?: string;
  project?: string;
  priority?: string;
  search?: string;
}) {
  try {
    const sql = getSql();
    const isAdmin = isAdminUser(userEmail);

    // Requête de base
    let rows: any[] = [];

    if (isAdmin) {
      rows = await sql`
        SELECT 
          t.*,
          (SELECT COUNT(*) FROM support_ticket_messages m WHERE m.ticket_id = t.id) as message_count
        FROM support_tickets t
        WHERE (
          ${!status || status === 'all'} OR t.status = ${status || ''}
        )
        AND (
          ${!project || project === 'all'} OR t.project = ${project || ''}
        )
        AND (
          ${!priority || priority === 'all'} OR t.priority = ${priority || ''}
        )
        AND (
          ${!search} OR 
          t.title ILIKE ${'%' + (search || '') + '%'} OR 
          t.user_name ILIKE ${'%' + (search || '') + '%'} OR 
          t.user_email ILIKE ${'%' + (search || '') + '%'} OR 
          t.ticket_number::text = ${search || ''}
        )
        ORDER BY t.created_at DESC
      `;
    } else {
      rows = await sql`
        SELECT 
          t.*,
          (SELECT COUNT(*) FROM support_ticket_messages m WHERE m.ticket_id = t.id) as message_count
        FROM support_tickets t
        WHERE (t.user_id = ${userId} OR t.user_email = ${userEmail || ''})
        AND (
          ${!status || status === 'all'} OR t.status = ${status || ''}
        )
        AND (
          ${!project || project === 'all'} OR t.project = ${project || ''}
        )
        AND (
          ${!priority || priority === 'all'} OR t.priority = ${priority || ''}
        )
        AND (
          ${!search} OR 
          t.title ILIKE ${'%' + (search || '') + '%'} OR 
          t.ticket_number::text = ${search || ''}
        )
        ORDER BY t.created_at DESC
      `;
    }

    const tickets: SupportTicket[] = rows.map((r) => ({
      id: r.id,
      ticket_number: r.ticket_number,
      user_id: r.user_id,
      user_email: r.user_email,
      user_name: r.user_name,
      user_tier: r.user_tier || "Free",
      title: r.title,
      description: r.description,
      category: r.category,
      project: r.project,
      priority: r.priority,
      status: r.status,
      created_at: new Date(r.created_at).toISOString(),
      updated_at: new Date(r.updated_at).toISOString(),
      resolved_at: r.resolved_at ? new Date(r.resolved_at).toISOString() : null,
      metadata: r.metadata,
      message_count: parseInt(r.message_count || "0", 10),
    }));

    return {
      success: true,
      tickets,
      isAdmin,
    };
  } catch (error: any) {
    console.error("Erreur lors de la récupération des tickets:", error);
    return {
      success: false,
      error: error?.message || "Impossible de récupérer les tickets.",
      tickets: [],
    };
  }
}

/**
 * Récupère le détail d'un ticket et tout son fil de messages
 */
export async function getTicketDetails(ticketId: string, userEmail?: string, userId?: string) {
  try {
    const sql = getSql();
    const isAdmin = isAdminUser(userEmail);

    const ticketRows = await sql`
      SELECT * FROM support_tickets WHERE id = ${ticketId}::uuid LIMIT 1
    `;

    if (ticketRows.length === 0) {
      return { success: false, error: "Ticket introuvable." };
    }

    const r = ticketRows[0];

    // Vérification de sécurité : seul l'admin ou le propriétaire peut voir le ticket
    if (!isAdmin && userId && r.user_id !== userId && userEmail && r.user_email !== userEmail) {
      return { success: false, error: "Vous n'avez pas l'autorisation d'accéder à ce ticket." };
    }

    const messagesRows = await sql`
      SELECT * FROM support_ticket_messages
      WHERE ticket_id = ${ticketId}::uuid
      ORDER BY created_at ASC
    `;

    const ticket: SupportTicket = {
      id: r.id,
      ticket_number: r.ticket_number,
      user_id: r.user_id,
      user_email: r.user_email,
      user_name: r.user_name,
      user_tier: r.user_tier || "Free",
      title: r.title,
      description: r.description,
      category: r.category,
      project: r.project,
      priority: r.priority,
      status: r.status,
      created_at: new Date(r.created_at).toISOString(),
      updated_at: new Date(r.updated_at).toISOString(),
      resolved_at: r.resolved_at ? new Date(r.resolved_at).toISOString() : null,
      metadata: r.metadata,
    };

    const messages: SupportMessage[] = messagesRows.map((m) => ({
      id: m.id,
      ticket_id: m.ticket_id,
      sender_id: m.sender_id,
      sender_email: m.sender_email,
      sender_name: m.sender_name,
      sender_role: m.sender_role,
      message: m.message,
      action_type: m.action_type,
      created_at: new Date(m.created_at).toISOString(),
    }));

    return {
      success: true,
      ticket,
      messages,
      isAdmin,
    };
  } catch (error: any) {
    console.error("Erreur lors de la récupération du ticket:", error);
    return {
      success: false,
      error: error?.message || "Impossible de charger le ticket.",
    };
  }
}

/**
 * Ajoute une réponse ou met à jour le statut d'un ticket
 */
export async function addTicketResponse({
  ticketId,
  senderId,
  senderEmail,
  senderName,
  message,
  newStatus,
}: {
  ticketId: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
  message: string;
  newStatus?: "open" | "in_progress" | "waiting_user" | "resolved" | "closed";
}) {
  try {
    const sql = getSql();
    const isAdmin = isAdminUser(senderEmail);
    const role = isAdmin ? "admin" : "user";

    // 1. Récupérer le ticket actuel
    const ticketRows = await sql`
      SELECT * FROM support_tickets WHERE id = ${ticketId}::uuid LIMIT 1
    `;
    if (ticketRows.length === 0) {
      return { success: false, error: "Ticket introuvable." };
    }
    const ticket = ticketRows[0] as SupportTicket;

    const trimmedMsg = message.trim();
    if (!trimmedMsg && !newStatus) {
      return { success: false, error: "Veuillez fournir un message ou un nouveau statut." };
    }

    // 2. Insérer le message dans le fil de discussion
    if (trimmedMsg) {
      await sql`
        INSERT INTO support_ticket_messages (
          ticket_id,
          sender_id,
          sender_email,
          sender_name,
          sender_role,
          message,
          action_type
        ) VALUES (
          ${ticketId}::uuid,
          ${senderId},
          ${senderEmail},
          ${senderName},
          ${role},
          ${trimmedMsg},
          'message'
        )
      `;
    }

    // 3. Mettre à jour le statut du ticket si spécifié
    const statusToApply = newStatus || (isAdmin ? "in_progress" : ticket.status);
    const isResolved = statusToApply === "resolved" || statusToApply === "closed";

    await sql`
      UPDATE support_tickets
      SET 
        status = ${statusToApply},
        updated_at = NOW(),
        resolved_at = ${isResolved ? sql`NOW()` : ticket.resolved_at ? sql`${ticket.resolved_at}` : null}
      WHERE id = ${ticketId}::uuid
    `;

    // 4. Si changement de statut seul ou avec message, ajouter un message d'action système
    if (newStatus && newStatus !== ticket.status) {
      const statusLabels: Record<string, string> = {
        open: "Ouvert",
        in_progress: "En cours de traitement",
        waiting_user: "En attente de l'utilisateur",
        resolved: "Résolu",
        closed: "Fermé",
      };

      await sql`
        INSERT INTO support_ticket_messages (
          ticket_id,
          sender_id,
          sender_email,
          sender_name,
          sender_role,
          message,
          action_type
        ) VALUES (
          ${ticketId}::uuid,
          ${senderId},
          ${senderEmail},
          ${senderName},
          'system',
          ${`Statut mis à jour : ${statusLabels[newStatus] || newStatus}`},
          'status_change'
        )
      `;
    }

    // 5. Envoi des e-mails de notification
    try {
      const emailPayload: SupportTicketEmailPayload = {
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        user_id: ticket.user_id,
        user_email: ticket.user_email,
        user_name: ticket.user_name,
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        project: ticket.project,
        priority: ticket.priority,
        status: statusToApply,
      };

      if (isAdmin) {
        // Le support a répondu -> informer l'utilisateur
        await sendSupportTicketUpdateEmail({
          ticket: emailPayload,
          recipientEmail: ticket.user_email,
          recipientName: ticket.user_name,
          message: trimmedMsg || `Le statut de votre demande est désormais : ${statusToApply}`,
          newStatus: statusToApply,
          authorRole: "admin",
          appUrl: getAppUrl(),
        });
      } else {
        // L'utilisateur a répondu -> informer l'administrateur
        await sendSupportTicketUpdateEmail({
          ticket: emailPayload,
          recipientEmail: ADMIN_EMAIL,
          recipientName: "Équipe Support (Mathias)",
          message: trimmedMsg || `L'utilisateur a actualisé le statut en : ${statusToApply}`,
          newStatus: statusToApply,
          authorRole: "user",
          appUrl: getAppUrl(),
        });
      }
    } catch (err) {
      console.error("[SUPPORT NOTIFICATION EMAIL ERROR]", err);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Erreur lors de l'ajout de la réponse:", error);
    return {
      success: false,
      error: error?.message || "Une erreur est survenue lors de l'envoi de la réponse.",
    };
  }
}

/**
 * Récupère les statistiques complètes de support pour le dashboard
 */
export async function getSupportStats(userId?: string, userEmail?: string) {
  try {
    const sql = getSql();
    const isAdmin = isAdminUser(userEmail);

    // Si admin -> stats globales. Si utilisateur -> ses stats propres (ou les siennes + aperçu global)
    const filterUser = !isAdmin && userId ? sql`WHERE user_id = ${userId}` : sql``;

    // 1. Comptages globaux
    const totalRow = await sql`SELECT COUNT(*) as count FROM support_tickets ${filterUser}`;
    const openRow = await sql`SELECT COUNT(*) as count FROM support_tickets WHERE status = 'open' ${!isAdmin && userId ? sql`AND user_id = ${userId}` : sql``}`;
    const inProgressRow = await sql`SELECT COUNT(*) as count FROM support_tickets WHERE status = 'in_progress' ${!isAdmin && userId ? sql`AND user_id = ${userId}` : sql``}`;
    const resolvedRow = await sql`SELECT COUNT(*) as count FROM support_tickets WHERE status = 'resolved' ${!isAdmin && userId ? sql`AND user_id = ${userId}` : sql``}`;
    const closedRow = await sql`SELECT COUNT(*) as count FROM support_tickets WHERE status = 'closed' ${!isAdmin && userId ? sql`AND user_id = ${userId}` : sql``}`;

    const total = parseInt(totalRow[0]?.count || "0", 10);
    const open = parseInt(openRow[0]?.count || "0", 10);
    const inProgress = parseInt(inProgressRow[0]?.count || "0", 10);
    const resolved = parseInt(resolvedRow[0]?.count || "0", 10);
    const closed = parseInt(closedRow[0]?.count || "0", 10);

    const resolutionRate = total > 0 ? Math.round(((resolved + closed) / total) * 100) : 100;

    // 2. Temps moyen de résolution (en heures)
    const avgTimeRow = await sql`
      SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) as avg_hours
      FROM support_tickets
      WHERE resolved_at IS NOT NULL ${!isAdmin && userId ? sql`AND user_id = ${userId}` : sql``}
    `;
    const avgResolutionHours = avgTimeRow[0]?.avg_hours 
      ? Math.round(parseFloat(avgTimeRow[0].avg_hours) * 10) / 10 
      : 2.4; // Valeur par défaut indicative

    // 3. Répartition par projet
    const projectRows = await sql`
      SELECT project, COUNT(*) as count
      FROM support_tickets
      ${filterUser}
      GROUP BY project
      ORDER BY count DESC
    `;
    const byProject = projectRows.map((r) => ({
      name: r.project,
      value: parseInt(r.count, 10),
    }));

    // 4. Répartition par priorité
    const priorityRows = await sql`
      SELECT priority, COUNT(*) as count
      FROM support_tickets
      ${filterUser}
      GROUP BY priority
    `;
    const priorityLabels: Record<string, string> = {
      urgent: "Critique / Urgent",
      high: "Haute",
      medium: "Normale",
      low: "Faible",
    };
    const priorityColors: Record<string, string> = {
      urgent: "#ef4444",
      high: "#f97316",
      medium: "#10b981",
      low: "#3b82f6",
    };
    const byPriority = priorityRows.map((r) => ({
      key: r.priority,
      name: priorityLabels[r.priority] || r.priority,
      value: parseInt(r.count, 10),
      color: priorityColors[r.priority] || "#8b5cf6",
    }));

    // 5. Répartition par section / catégorie
    const categoryRows = await sql`
      SELECT category, COUNT(*) as count
      FROM support_tickets
      ${filterUser}
      GROUP BY category
      ORDER BY count DESC
    `;
    const byCategory = categoryRows.map((r) => ({
      name: r.category,
      value: parseInt(r.count, 10),
    }));

    // 6. Évolution des tickets sur les 7 derniers jours
    const timelineRows = await sql`
      SELECT 
        TO_CHAR(DATE(created_at), 'DD/MM') as date_label,
        COUNT(*) as total_created,
        COUNT(CASE WHEN status IN ('resolved', 'closed') THEN 1 END) as total_resolved
      FROM support_tickets
      WHERE created_at >= NOW() - INTERVAL '14 days' ${!isAdmin && userId ? sql`AND user_id = ${userId}` : sql``}
      GROUP BY DATE(created_at), TO_CHAR(DATE(created_at), 'DD/MM')
      ORDER BY DATE(created_at) ASC
    `;

    const timeline = timelineRows.map((r) => ({
      date: r.date_label,
      crees: parseInt(r.total_created, 10),
      resolus: parseInt(r.total_resolved, 10),
    }));

    return {
      success: true,
      stats: {
        total,
        open,
        inProgress,
        resolved,
        closed,
        resolutionRate,
        avgResolutionHours,
        byProject,
        byPriority,
        byCategory,
        timeline,
      },
      isAdmin,
    };
  } catch (error: any) {
    console.error("Erreur lors de la récupération des stats support:", error);
    return {
      success: false,
      error: error?.message || "Impossible de charger les statistiques.",
    };
  }
}
