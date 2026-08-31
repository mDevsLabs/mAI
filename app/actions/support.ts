"use server";

import { neon } from "@neondatabase/serverless";
import {
  sendSupportTicketCreatedEmail,
  sendSupportTicketUpdateEmail,
  type SupportTicketEmailPayload,
} from "@/email";
import {
  ADMIN_EMAIL,
  isAdminUser,
  type SupportTicket,
  type SupportMessage,
  type SupportAttachment,
  type SupportTicketStatus,
  isTerminalStatus,
  getAllowedStatusTransitions,
  SUPPORT_ATTACHMENT_LIMITS,
} from "@/app/actions/support-utils";

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

// Helpers mapping colonnes → objets
function mapTicketRow(r: any): SupportTicket {
  return {
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
    archived_at: r.archived_at ? new Date(r.archived_at).toISOString() : null,
    is_archived: !!r.is_archived,
    metadata: r.metadata,
    message_count: r.message_count !== undefined ? parseInt(r.message_count || "0", 10) : undefined,
  };
}

function mapMessageRow(m: any): SupportMessage {
  return {
    id: m.id,
    ticket_id: m.ticket_id,
    sender_id: m.sender_id,
    sender_email: m.sender_email,
    sender_name: m.sender_name,
    sender_role: m.sender_role,
    message: m.message,
    action_type: m.action_type,
    created_at: new Date(m.created_at).toISOString(),
    is_ai_generated: !!m.is_ai_generated,
    is_edited: !!m.is_edited,
  };
}

function mapAttachmentRow(a: any): SupportAttachment {
  return {
    id: a.id,
    ticket_id: a.ticket_id,
    message_id: a.message_id,
    uploader_id: a.uploader_id,
    uploader_email: a.uploader_email,
    uploader_role: a.uploader_role,
    file_url: a.file_url,
    file_key: a.file_key,
    file_name: a.file_name,
    file_size: parseInt(a.file_size, 10),
    mime_type: a.mime_type,
    created_at: new Date(a.created_at).toISOString(),
  };
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
  attachmentIds?: string[]; // ids de support_ticket_attachments pré-uploadés (optionnel)
}) {
  try {
    const sql = getSql();

    if (!data.title?.trim() || !data.description?.trim()) {
      return { success: false, error: "Le titre et la description sont requis." };
    }
    if (data.title.trim().length < 3 || data.title.trim().length > 120) {
      return { success: false, error: "Le titre doit contenir entre 3 et 120 caractères." };
    }

    const tier = data.userTier || "Free";

    // 1. Insertion du ticket
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
    const msgRes = await sql`
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
      RETURNING id
    `;
    const createdMsgId = msgRes[0]?.id;

    // 2b. Lier les attachments pré-uploadés (si fournis) au message créé
    if (data.attachmentIds && data.attachmentIds.length > 0 && createdMsgId) {
      for (const attId of data.attachmentIds.slice(0, SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET)) {
        try {
          await sql`
            UPDATE support_ticket_attachments
            SET message_id = ${createdMsgId}::uuid
            WHERE id = ${attId}::uuid AND ticket_id IS NULL
          `;
          // fallback si ticket_id était déjà set en attente (upload via /api/support/upload sans ticket)
          await sql`
            UPDATE support_ticket_attachments
            SET ticket_id = ${ticket.id}::uuid, message_id = ${createdMsgId}::uuid
            WHERE id = ${attId}::uuid AND (ticket_id = ${ticket.id}::uuid OR ticket_id IS NULL)
          `;
        } catch {}
      }
      // Aussi gérer cas où attachments ont été uploadés avec ticket_id déjà connu (via pending id)
      // Alternative : l'API upload crée avec ticket_id = ticket.id si fourni
    }

    // 3. Envoi du mail admin
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
      ticket: mapTicketRow(ticket),
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
 * Récupère les tickets d'un utilisateur (ou tous pour l'admin)
 * - is_archived filtré par défaut (archived masqué sauf status=archived)
 */
export async function getTicketsList({
  userId,
  userEmail,
  status,
  project,
  priority,
  search,
  includeArchived,
}: {
  userId: string;
  userEmail?: string;
  status?: string;
  project?: string;
  priority?: string;
  search?: string;
  includeArchived?: boolean;
}) {
  try {
    const sql = getSql();
    const isAdmin = isAdminUser(userEmail);

    let rows: any[] = [];

    // Normaliser status : 'all' = tout sauf archived par défaut
    const effectiveStatus = status || "all";
    const showArchived = includeArchived || effectiveStatus === "archived";

    if (isAdmin) {
      if (effectiveStatus === "archived") {
        rows = await sql`
          SELECT 
            t.*,
            (SELECT COUNT(*) FROM support_ticket_messages m WHERE m.ticket_id = t.id) as message_count
          FROM support_tickets t
          WHERE t.is_archived = TRUE
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
          ORDER BY t.updated_at DESC
        `;
      } else if (effectiveStatus === "all") {
        rows = await sql`
          SELECT 
            t.*,
            (SELECT COUNT(*) FROM support_ticket_messages m WHERE m.ticket_id = t.id) as message_count
          FROM support_tickets t
          WHERE t.is_archived = FALSE
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
          ORDER BY t.updated_at DESC
        `;
      } else {
        rows = await sql`
          SELECT 
            t.*,
            (SELECT COUNT(*) FROM support_ticket_messages m WHERE m.ticket_id = t.id) as message_count
          FROM support_tickets t
          WHERE t.status = ${effectiveStatus}
          AND t.is_archived = FALSE
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
          ORDER BY t.updated_at DESC
        `;
      }
    } else {
      // User non-admin : toujours filtré par ownership
      if (effectiveStatus === "archived") {
        rows = await sql`
          SELECT 
            t.*,
            (SELECT COUNT(*) FROM support_ticket_messages m WHERE m.ticket_id = t.id) as message_count
          FROM support_tickets t
          WHERE (t.user_id = ${userId} OR t.user_email = ${userEmail || ''})
          AND t.is_archived = TRUE
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
          ORDER BY t.updated_at DESC
        `;
      } else if (effectiveStatus === "all") {
        rows = await sql`
          SELECT 
            t.*,
            (SELECT COUNT(*) FROM support_ticket_messages m WHERE m.ticket_id = t.id) as message_count
          FROM support_tickets t
          WHERE (t.user_id = ${userId} OR t.user_email = ${userEmail || ''})
          AND t.is_archived = FALSE
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
          ORDER BY t.updated_at DESC
        `;
      } else {
        rows = await sql`
          SELECT 
            t.*,
            (SELECT COUNT(*) FROM support_ticket_messages m WHERE m.ticket_id = t.id) as message_count
          FROM support_tickets t
          WHERE (t.user_id = ${userId} OR t.user_email = ${userEmail || ''})
          AND t.status = ${effectiveStatus}
          AND t.is_archived = FALSE
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
          ORDER BY t.updated_at DESC
        `;
      }
    }

    const tickets: SupportTicket[] = rows.map((r) => mapTicketRow(r));

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
 * Récupère le détail d'un ticket, messages et pièces jointes
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

    // Vérif sécurité : seul admin ou owner
    if (!isAdmin && userId && r.user_id !== userId && userEmail && r.user_email !== userEmail) {
      return { success: false, error: "Vous n'avez pas l'autorisation d'accéder à ce ticket." };
    }

    const messagesRows = await sql`
      SELECT * FROM support_ticket_messages
      WHERE ticket_id = ${ticketId}::uuid
      ORDER BY created_at ASC
    `;

    // Attachments du ticket (table peut ne pas exister avant migration v2)
    let attachmentsRows: any[] = [];
    try {
      attachmentsRows = await sql`
        SELECT * FROM support_ticket_attachments
        WHERE ticket_id = ${ticketId}::uuid
        ORDER BY created_at ASC
      `;
    } catch {
      attachmentsRows = [];
    }

    const ticket: SupportTicket = mapTicketRow(r);

    const messages: SupportMessage[] = messagesRows.map((m) => mapMessageRow(m));

    const attachments: SupportAttachment[] = attachmentsRows.map((a) => mapAttachmentRow(a));

    // Attacher les fichiers à leurs messages pour affichage timeline
    const attachmentsByMessage = new Map<string, SupportAttachment[]>();
    for (const a of attachments) {
      const mid = a.message_id || "__ticket__";
      if (!attachmentsByMessage.has(mid)) attachmentsByMessage.set(mid, []);
      attachmentsByMessage.get(mid)!.push(a);
    }
    const messagesWithAttachments: SupportMessage[] = messages.map((m) => ({
      ...m,
      attachments: attachmentsByMessage.get(m.id) || [],
    }));

    return {
      success: true,
      ticket,
      messages: messagesWithAttachments,
      attachments,
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
 * Gère 'reopened' : seule transition autorisée depuis resolved/closed, reset resolved_at
 * Gère flag IA et liaison des attachments
 */
export async function addTicketResponse({
  ticketId,
  senderId,
  senderEmail,
  senderName,
  message,
  newStatus,
  isAiGenerated,
  attachmentIds,
}: {
  ticketId: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
  message: string;
  newStatus?: SupportTicketStatus;
  isAiGenerated?: boolean;
  attachmentIds?: string[];
}) {
  try {
    const sql = getSql();
    const isAdmin = isAdminUser(senderEmail);
    const role = isAdmin ? "admin" : "user";

    // 1. Récupérer ticket actuel
    const ticketRows = await sql`
      SELECT * FROM support_tickets WHERE id = ${ticketId}::uuid LIMIT 1
    `;
    if (ticketRows.length === 0) {
      return { success: false, error: "Ticket introuvable." };
    }
    const ticket = ticketRows[0] as SupportTicket;
    const currentStatus = ticket.status as SupportTicketStatus;

    const trimmedMsg = message.trim();
    const hasAttachments = !!(attachmentIds && attachmentIds.length > 0);
    if (!trimmedMsg && !newStatus && !hasAttachments) {
      return { success: false, error: "Veuillez fournir un message, un fichier ou un nouveau statut." };
    }

    // 2. Validation transition statut : si terminal, seul reopened autorisé
    if (newStatus && newStatus !== currentStatus) {
      const allowed = getAllowedStatusTransitions(currentStatus);
      if (!allowed.includes(newStatus as SupportTicketStatus)) {
        return {
          success: false,
          error:
            currentStatus === "resolved" || currentStatus === "closed"
              ? "Ce ticket est fermé. Seule l'option 'Réouvert' est disponible."
              : `Transition de statut non autorisée : ${currentStatus} → ${newStatus}`,
        };
      }
      // Seul admin ou owner peut rouvrir → autoriser les deux (spec: User + Admin)
      // pas de restriction supplémentaire
    }

    // 3. Vérif quota fichiers : 5 par rôle par ticket
    if (hasAttachments) {
      try {
        const countRows = await sql`
          SELECT COUNT(*) as cnt FROM support_ticket_attachments
          WHERE ticket_id = ${ticketId}::uuid AND uploader_role = ${role}
        `;
        const existingCount = parseInt(countRows[0]?.cnt || "0", 10);
        if (existingCount + (attachmentIds?.length || 0) > SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET) {
          return {
            success: false,
            error: `Limite atteinte : ${SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET} fichiers maximum par ${role === "admin" ? "administrateur" : "utilisateur"} pour cette conversation. Vous avez déjà ${existingCount} fichier(s).`,
          };
        }
      } catch {}
    }

    // 4. Insérer le message si présent (ou si attachments seuls, créer message vide avec attachments)
    let newMessageId: string | null = null;
    if (trimmedMsg || hasAttachments) {
      const isAi = !!(isAdmin && isAiGenerated);
      const msgType = trimmedMsg ? "message" : "message";
      const msgText = trimmedMsg || (hasAttachments ? "Fichiers joints" : "");
      const inserted = await sql`
        INSERT INTO support_ticket_messages (
          ticket_id,
          sender_id,
          sender_email,
          sender_name,
          sender_role,
          message,
          action_type,
          is_ai_generated
        ) VALUES (
          ${ticketId}::uuid,
          ${senderId},
          ${senderEmail},
          ${senderName},
          ${role},
          ${msgText},
          ${msgType},
          ${isAi}
        )
        RETURNING id
      `;
      newMessageId = inserted[0]?.id || null;

      // Lier attachments au nouveau message
      if (newMessageId && attachmentIds && attachmentIds.length > 0) {
        for (const attId of attachmentIds) {
          try {
            await sql`
              UPDATE support_ticket_attachments
              SET message_id = ${newMessageId}::uuid, ticket_id = ${ticketId}::uuid
              WHERE id = ${attId}::uuid
            `;
          } catch {}
        }
      }
    }

    // 5. Mettre à jour le statut si spécifié
    let statusToApply: SupportTicketStatus = (newStatus as SupportTicketStatus) || (currentStatus as SupportTicketStatus);
    // Si admin répond sans changer statut et ticket est open → passe en in_progress automatiquement (sauf si déjà terminal/archived)
    if (!newStatus && trimmedMsg && isAdmin && currentStatus === "open") {
      statusToApply = "in_progress";
    }

    if (statusToApply !== currentStatus) {
      const isResolvedNow = statusToApply === "resolved" || statusToApply === "closed";
      const isReopenedNow = statusToApply === "reopened";
      const isArchivedNow = statusToApply === "archived";

      if (isReopenedNow) {
        await sql`
          UPDATE support_tickets
          SET 
            status = ${statusToApply},
            updated_at = NOW(),
            resolved_at = NULL,
            is_archived = FALSE,
            archived_at = NULL
          WHERE id = ${ticketId}::uuid
        `;
      } else if (isArchivedNow) {
        await sql`
          UPDATE support_tickets
          SET 
            status = 'archived',
            is_archived = TRUE,
            archived_at = NOW(),
            updated_at = NOW()
          WHERE id = ${ticketId}::uuid
        `;
      } else if (isResolvedNow) {
        await sql`
          UPDATE support_tickets
          SET 
            status = ${statusToApply},
            updated_at = NOW(),
            resolved_at = NOW(),
            is_archived = FALSE
          WHERE id = ${ticketId}::uuid
        `;
      } else {
        await sql`
          UPDATE support_tickets
          SET 
            status = ${statusToApply},
            updated_at = NOW(),
            is_archived = FALSE,
            archived_at = NULL
          WHERE id = ${ticketId}::uuid
        `;
      }

      // Message système status_change
      const statusLabels: Record<string, string> = {
        open: "Ouvert",
        in_progress: "En cours de traitement",
        waiting_user: "En attente de l'utilisateur",
        resolved: "Résolu",
        closed: "Fermé",
        reopened: "Réouvert",
        archived: "Archivé",
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
          ${`Statut mis à jour : ${statusLabels[statusToApply] || statusToApply}`},
          'status_change'
        )
      `;
    } else if (trimmedMsg || hasAttachments) {
      // même si statut inchangé mais message envoyé, toucher updated_at pour anti-purge 365j
      await sql`UPDATE support_tickets SET updated_at = NOW() WHERE id = ${ticketId}::uuid`;
    }

    // 6. Emails
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
        isAiGenerated: !!(isAdmin && isAiGenerated),
      };

      if (isAdmin) {
        await sendSupportTicketUpdateEmail({
          ticket: emailPayload,
          recipientEmail: ticket.user_email,
          recipientName: ticket.user_name,
          message: trimmedMsg || (hasAttachments ? "De nouveaux fichiers ont été joints à votre ticket." : `Le statut de votre demande est désormais : ${statusToApply}`),
          newStatus: statusToApply !== currentStatus ? statusToApply : undefined,
          authorRole: "admin",
          appUrl: getAppUrl(),
          isAiGenerated: !!(isAiGenerated),
        });
      } else {
        await sendSupportTicketUpdateEmail({
          ticket: emailPayload,
          recipientEmail: ADMIN_EMAIL,
          recipientName: "mAI",
          message: trimmedMsg || (hasAttachments ? "L'utilisateur a joint de nouveaux fichiers." : `L'utilisateur a actualisé le statut en : ${statusToApply}`),
          newStatus: statusToApply !== currentStatus ? statusToApply : undefined,
          authorRole: "user",
          appUrl: getAppUrl(),
        });
      }
    } catch (err) {
      console.error("[SUPPORT NOTIFICATION EMAIL ERROR]", err);
    }

    return { success: true, messageId: newMessageId };
  } catch (error: any) {
    console.error("Erreur lors de l'ajout de la réponse:", error);
    return {
      success: false,
      error: error?.message || "Une erreur est survenue lors de l'envoi de la réponse.",
    };
  }
}

/**
 * Renomme un ticket (titre) — owner ou admin uniquement
 */
export async function updateTicketTitle({
  ticketId,
  newTitle,
  requesterEmail,
  requesterId,
}: {
  ticketId: string;
  newTitle: string;
  requesterEmail: string;
  requesterId: string;
}) {
  try {
    const sql = getSql();
    const trimmed = newTitle.trim();
    if (trimmed.length < 3 || trimmed.length > 120) {
      return { success: false, error: "Le titre doit contenir entre 3 et 120 caractères." };
    }
    const rows = await sql`SELECT * FROM support_tickets WHERE id = ${ticketId}::uuid LIMIT 1`;
    if (rows.length === 0) return { success: false, error: "Ticket introuvable." };
    const ticket = rows[0];
    const isAdmin = isAdminUser(requesterEmail);
    if (!isAdmin && ticket.user_id !== requesterId && ticket.user_email !== requesterEmail) {
      return { success: false, error: "Non autorisé à renommer ce ticket." };
    }
    if (ticket.title === trimmed) return { success: true };

    await sql`UPDATE support_tickets SET title = ${trimmed}, updated_at = NOW() WHERE id = ${ticketId}::uuid`;
    const requesterName = requesterEmail.split("@")[0];
    await sql`
      INSERT INTO support_ticket_messages (ticket_id, sender_id, sender_email, sender_name, sender_role, message, action_type)
      VALUES (${ticketId}::uuid, ${requesterId}, ${requesterEmail}, ${requesterName}, ${isAdmin ? "admin" : "user"}, ${`Titre renommé : "${trimmed}"`}, 'title_change')
    `;
    return { success: true };
  } catch (error: any) {
    console.error("Erreur rename ticket:", error);
    return { success: false, error: error?.message || "Impossible de renommer le ticket." };
  }
}

/**
 * Archive / Désarchive un ticket
 */
export async function archiveTicket({
  ticketId,
  requesterEmail,
  requesterId,
  archive,
}: {
  ticketId: string;
  requesterEmail: string;
  requesterId: string;
  archive: boolean;
}) {
  try {
    const sql = getSql();
    const rows = await sql`SELECT * FROM support_tickets WHERE id = ${ticketId}::uuid LIMIT 1`;
    if (rows.length === 0) return { success: false, error: "Ticket introuvable." };
    const ticket = rows[0];
    const isAdmin = isAdminUser(requesterEmail);
    if (!isAdmin && ticket.user_id !== requesterId && ticket.user_email !== requesterEmail) {
      return { success: false, error: "Non autorisé à archiver ce ticket." };
    }

    if (archive) {
      await sql`
        UPDATE support_tickets
        SET status='archived', is_archived=TRUE, archived_at=NOW(), updated_at=NOW()
        WHERE id = ${ticketId}::uuid
      `;
      await sql`
        INSERT INTO support_ticket_messages (ticket_id, sender_id, sender_email, sender_name, sender_role, message, action_type)
        VALUES (${ticketId}::uuid, ${requesterId}, ${requesterEmail}, ${requesterEmail.split("@")[0]}, ${isAdmin ? "admin" : "user"}, 'Ticket archivé', 'archived')
      `;
    } else {
      await sql`
        UPDATE support_tickets
        SET status='open', is_archived=FALSE, archived_at=NULL, updated_at=NOW()
        WHERE id = ${ticketId}::uuid
      `;
      await sql`
        INSERT INTO support_ticket_messages (ticket_id, sender_id, sender_email, sender_name, sender_role, message, action_type)
        VALUES (${ticketId}::uuid, ${requesterId}, ${requesterEmail}, ${requesterEmail.split("@")[0]}, ${isAdmin ? "admin" : "user"}, 'Ticket désarchivé', 'unarchived')
      `;
    }
    return { success: true };
  } catch (error: any) {
    console.error("Erreur archive ticket:", error);
    return { success: false, error: error?.message || "Impossible d'archiver le ticket." };
  }
}

/**
 * Suppression définitive (hard delete) — owner ou admin
 * Supprime le ticket, ses messages et attachments (CASCADE). Le cron purge Z1 séparément pour les tickets purgés auto.
 */
export async function deleteTicket({
  ticketId,
  requesterEmail,
  requesterId,
}: {
  ticketId: string;
  requesterEmail: string;
  requesterId: string;
}) {
  try {
    const sql = getSql();
    const rows = await sql`SELECT * FROM support_tickets WHERE id = ${ticketId}::uuid LIMIT 1`;
    if (rows.length === 0) return { success: false, error: "Ticket introuvable." };
    const ticket = rows[0];
    const isAdmin = isAdminUser(requesterEmail);
    if (!isAdmin && ticket.user_id !== requesterId && ticket.user_email !== requesterEmail) {
      return { success: false, error: "Non autorisé à supprimer ce ticket." };
    }

    // Récupérer les clés Z1 pour éventuelle suppression côté API (le cron s'en chargera sinon)
    let fileKeys: string[] = [];
    try {
      const attRows = await sql`SELECT file_key, file_url FROM support_ticket_attachments WHERE ticket_id = ${ticketId}::uuid`;
      fileKeys = attRows.map((r: any) => r.file_key || r.file_url).filter(Boolean);
    } catch {}

    await sql`DELETE FROM support_tickets WHERE id = ${ticketId}::uuid`;

    return { success: true, purgedFileKeys: fileKeys };
  } catch (error: any) {
    console.error("Erreur delete ticket:", error);
    return { success: false, error: error?.message || "Impossible de supprimer le ticket." };
  }
}

/**
 * Purge cron : supprime les tickets inactifs depuis 365 jours (365*24h)
 * Appelée par /api/cron/purge-support
 */
export async function purgeInactiveTickets(): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
  try {
    const sql = getSql();
    // Récup d'abord les file_keys pour purge Z1 avant DELETE
    let fileKeys: string[] = [];
    try {
      const toPurge = await sql`
        SELECT a.file_key FROM support_ticket_attachments a
        JOIN support_tickets t ON t.id = a.ticket_id
        WHERE t.updated_at < NOW() - INTERVAL '365 days'
      `;
      fileKeys = toPurge.map((r: any) => r.file_key).filter(Boolean);
    } catch {}
    const res = await sql`SELECT purge_inactive_support_tickets() as deleted`;
    const deletedCount = parseInt(res[0]?.deleted || "0", 10);
    return { success: true, deletedCount };
  } catch (error: any) {
    console.error("Erreur purge tickets:", error);
    return { success: false, error: error?.message };
  }
}

/**
 * Récupère les statistiques complètes de support pour le dashboard
 */
export async function getSupportStats(userId?: string, userEmail?: string) {
  try {
    const sql = getSql();
    const isAdmin = isAdminUser(userEmail);

    // Si admin -> stats globales (hors archivés pour les KPIs actifs). Si utilisateur -> ses stats propres
    const filterUser = !isAdmin && userId ? sql`WHERE user_id = ${userId} AND is_archived = FALSE` : sql`WHERE is_archived = FALSE`;
    const filterUserAll = !isAdmin && userId ? sql`WHERE user_id = ${userId}` : sql``;

    // 1. Comptages globaux (filtrés archivés exclus pour total actif, mais total inclut archivés via second query)
    const totalRow = await sql`SELECT COUNT(*) as count FROM support_tickets ${filterUser}`;
    const totalWithArchivedRow = await sql`SELECT COUNT(*) as count FROM support_tickets ${filterUserAll}`;
    const openRow = await sql`SELECT COUNT(*) as count FROM support_tickets WHERE status = 'open' ${!isAdmin && userId ? sql`AND user_id = ${userId} AND is_archived = FALSE` : sql`AND is_archived = FALSE`}`;
    const inProgressRow = await sql`SELECT COUNT(*) as count FROM support_tickets WHERE status = 'in_progress' ${!isAdmin && userId ? sql`AND user_id = ${userId} AND is_archived = FALSE` : sql`AND is_archived = FALSE`}`;
    const reopenedRow = await sql`SELECT COUNT(*) as count FROM support_tickets WHERE status = 'reopened' ${!isAdmin && userId ? sql`AND user_id = ${userId} AND is_archived = FALSE` : sql`AND is_archived = FALSE`}`;
    const waitingRow = await sql`SELECT COUNT(*) as count FROM support_tickets WHERE status = 'waiting_user' ${!isAdmin && userId ? sql`AND user_id = ${userId} AND is_archived = FALSE` : sql`AND is_archived = FALSE`}`;
    const resolvedRow = await sql`SELECT COUNT(*) as count FROM support_tickets WHERE status = 'resolved' ${!isAdmin && userId ? sql`AND user_id = ${userId} AND is_archived = FALSE` : sql`AND is_archived = FALSE`}`;
    const closedRow = await sql`SELECT COUNT(*) as count FROM support_tickets WHERE status = 'closed' ${!isAdmin && userId ? sql`AND user_id = ${userId} AND is_archived = FALSE` : sql`AND is_archived = FALSE`}`;
    const archivedRow = await sql`SELECT COUNT(*) as count FROM support_tickets WHERE is_archived = TRUE ${!isAdmin && userId ? sql`AND user_id = ${userId}` : sql``}`;

    const total = parseInt(totalRow[0]?.count || "0", 10);
    const totalWithArchived = parseInt(totalWithArchivedRow[0]?.count || "0", 10);
    const open = parseInt(openRow[0]?.count || "0", 10);
    const inProgress = parseInt(inProgressRow[0]?.count || "0", 10);
    const reopened = parseInt(reopenedRow[0]?.count || "0", 10);
    const waiting = parseInt(waitingRow[0]?.count || "0", 10);
    const resolved = parseInt(resolvedRow[0]?.count || "0", 10);
    const closed = parseInt(closedRow[0]?.count || "0", 10);
    const archived = parseInt(archivedRow[0]?.count || "0", 10);

    const resolutionRate = total > 0 ? Math.round(((resolved + closed) / total) * 100) : 100;

    // 2. Temps moyen de résolution (en heures)
    const avgTimeRow = await sql`
      SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) as avg_hours
      FROM support_tickets
      WHERE resolved_at IS NOT NULL ${!isAdmin && userId ? sql`AND user_id = ${userId}` : sql``}
    `;
    const avgResolutionHours = avgTimeRow[0]?.avg_hours 
      ? Math.round(parseFloat(avgTimeRow[0].avg_hours) * 10) / 10 
      : 2.4;

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

    // 6. Évolution des tickets sur les 14 derniers jours
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
        totalWithArchived,
        open,
        inProgress,
        reopened,
        waiting,
        resolved,
        closed,
        archived,
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

/**
 * Récupère les attachments d'un ticket (helper pour upload limit)
 */
export async function getTicketAttachments(ticketId: string) {
  try {
    const sql = getSql();
    const rows = await sql`SELECT * FROM support_ticket_attachments WHERE ticket_id = ${ticketId}::uuid ORDER BY created_at ASC`;
    return { success: true, attachments: rows.map(mapAttachmentRow) };
  } catch (e: any) {
    return { success: false, error: e?.message, attachments: [] };
  }
}
