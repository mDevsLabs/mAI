"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/components/auth-provider";
import {
  addTicketResponse,
  archiveTicket,
  deleteTicket,
  getTicketDetails,
  updateTicketTitle,
} from "@/app/actions/support";
import {
  getAllowedStatusTransitions,
  isAdminUser,
  type SupportAttachment,
  type SupportMessage,
  type SupportTicket,
  type SupportTicketStatus,
} from "@/app/actions/support-utils";
import { TicketDetailHeader } from "@/components/support/ticket-detail/TicketDetailHeader";
import { TicketReplyComposer } from "@/components/support/ticket-detail/TicketReplyComposer";
import { TicketTimeline } from "@/components/support/ticket-detail/TicketTimeline";
import { useTicketDetailAttachments } from "@/components/support/ticket-detail/useTicketDetailAttachments";
import type { TicketReplyStatus } from "@/components/support/ticket-detail/ticket-detail-types";

export default function TicketDetailClient({ ticketId }: { ticketId: string }) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [attachments, setAttachments] = useState<SupportAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<TicketReplyStatus>("");
  const [submitting, setSubmitting] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAdmin = isAdminUser(user?.email);

  const loadTicket = useCallback(async () => {
    if (!user) return;
    try {
      const response = await getTicketDetails(ticketId);
      if (response.success && response.ticket) {
        setTicket(response.ticket);
        setMessages(response.messages || []);
        setAttachments(response.attachments || []);
        setSelectedStatus(response.ticket.status);
        setTitleDraft(response.ticket.title);
      } else {
        toast.error(response.error || "Ticket introuvable.");
      }
    } catch (error: unknown) {
      console.error(error);
      toast.error("Erreur de chargement du ticket.");
    } finally {
      setLoading(false);
    }
  }, [ticketId, user]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) void loadTicket();
    else if (!authLoading && !isAuthenticated) setLoading(false);
  }, [authLoading, isAuthenticated, loadTicket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const {
    pendingAttachments,
    uploading,
    fileInputRef,
    handleFilesSelected,
    clearPendingAttachments,
    removePendingAttachment,
    myRole,
    myAttachmentsCount,
    canUploadMore,
  } = useTicketDetailAttachments({ user, ticket, isAdmin, existingAttachments: attachments });

  const handleSendReply = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!user || !ticket) return;
    if (!replyText.trim() && pendingAttachments.length === 0 && selectedStatus === ticket.status) {
      toast.error("Veuillez saisir un message, joindre un fichier ou changer le statut.");
      return;
    }
    if (selectedStatus && selectedStatus !== ticket.status) {
      const allowed = getAllowedStatusTransitions(ticket.status);
      if (!allowed.includes(selectedStatus)) {
        toast.error(ticket.status === "resolved" || ticket.status === "closed" ? "Ce ticket est fermé. Seule l'option 'Réouvert' est disponible." : "Transition non autorisée.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await addTicketResponse({
        ticketId: ticket.id,
        message: replyText.trim(),
        newStatus: selectedStatus && selectedStatus !== ticket.status ? selectedStatus : undefined,
        isAiGenerated: isAdmin ? isAiGenerated : false,
        attachmentIds: pendingAttachments.map((attachment) => attachment.id),
      });
      if (response.success) {
        toast.success("Message envoyé !");
        setReplyText("");
        clearPendingAttachments();
        setIsAiGenerated(false);
        await loadTicket();
      } else {
        toast.error(response.error || "Erreur envoi.");
      }
    } catch (error: unknown) {
      console.error(error);
      toast.error("Impossible d'envoyer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatus = async (status: SupportTicketStatus) => {
    if (!user || !ticket) return;
    setSubmitting(true);
    try {
      const response = await addTicketResponse({ ticketId: ticket.id, message: "", newStatus: status });
      if (response.success) {
        toast.success("Statut mis à jour !");
        await loadTicket();
      } else {
        toast.error(response.error || "Erreur statut.");
      }
    } catch {
      toast.error("Erreur.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRename = async () => {
    if (!user || !ticket) return;
    const trimmed = titleDraft.trim();
    if (trimmed.length < 3 || trimmed.length > 120) {
      toast.error("Titre 3-120 caractères.");
      return;
    }
    if (trimmed === ticket.title) {
      setEditingTitle(false);
      return;
    }
    setSubmitting(true);
    try {
      const response = await updateTicketTitle({ ticketId: ticket.id, newTitle: trimmed });
      if (response.success) {
        toast.success("Titre renommé !");
        setEditingTitle(false);
        await loadTicket();
      } else {
        toast.error(response.error || "Erreur renommage.");
      }
    } catch {
      toast.error("Erreur renommage.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchiveToggle = async () => {
    if (!user || !ticket) return;
    const shouldArchive = ticket.status !== "archived" && !ticket.is_archived;
    if (!confirm(shouldArchive ? "Archiver ce ticket ?" : "Désarchiver ce ticket ?")) return;
    setSubmitting(true);
    try {
      const response = await archiveTicket({ ticketId: ticket.id, archive: shouldArchive });
      if (response.success) {
        toast.success(shouldArchive ? "Ticket archivé." : "Ticket désarchivé.");
        await loadTicket();
      } else {
        toast.error(response.error || "Erreur.");
      }
    } catch {
      toast.error("Erreur.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !ticket) return;
    if (!confirm(`Supprimer définitivement #TICK-${ticket.ticket_number} ? Irréversible, fichiers Z1 purgés.`)) return;
    if (!confirm("Confirmation finale : supprimer ?")) return;
    setSubmitting(true);
    try {
      const response = await deleteTicket({ ticketId: ticket.id });
      if (response.success) {
        toast.success("Ticket supprimé.");
        router.push("/support/tickets");
      } else {
        toast.error(response.error || "Erreur suppression.");
      }
    } catch {
      toast.error("Erreur suppression.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return <div className="flex items-center justify-center rounded-3xl border border-black/5 bg-white py-32"><div className="flex items-center gap-3 text-sm font-medium text-slate-500"><Loader2 className="h-5 w-5 animate-spin text-purple-600" aria-hidden="true" /><span>Chargement du dossier…</span></div></div>;
  }

  if (!ticket) {
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-3xl border border-black/5 bg-white p-12 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-red-500" aria-hidden="true" />
        <h2 className="text-xl font-bold text-slate-900">Ticket non trouvé</h2>
        <p className="text-xs text-slate-500">Introuvable ou accès refusé.</p>
        <Link href="/support/tickets" className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-purple-500"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/support/tickets" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour à tous les tickets</Link>
        <button type="button" onClick={() => void loadTicket()} className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-500 shadow-2xs hover:text-slate-900" title="Actualiser"><RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Actualiser</button>
      </div>

      <TicketDetailHeader ticket={ticket} isAdmin={isAdmin} attachments={attachments} editingTitle={editingTitle} titleDraft={titleDraft} submitting={submitting} showDiagnostics={showDiagnostics} onStartTitleEdit={() => setEditingTitle(true)} onTitleDraftChange={setTitleDraft} onRename={() => void handleRename()} onCancelRename={() => { setEditingTitle(false); setTitleDraft(ticket.title); }} onQuickStatus={(status) => void handleQuickStatus(status)} onArchiveToggle={() => void handleArchiveToggle()} onDelete={() => void handleDelete()} onToggleDiagnostics={() => setShowDiagnostics((value) => !value)} />

      <TicketTimeline messages={messages} user={user} messagesEndRef={messagesEndRef} />

      <TicketReplyComposer ticket={ticket} isAdmin={isAdmin} myRole={myRole} selectedStatus={selectedStatus} replyText={replyText} isAiGenerated={isAiGenerated} submitting={submitting} uploading={uploading} canUploadMore={canUploadMore} myAttachmentsCount={myAttachmentsCount} pendingAttachments={pendingAttachments} fileInputRef={fileInputRef} onSelectedStatusChange={setSelectedStatus} onReplyTextChange={setReplyText} onAiGeneratedChange={setIsAiGenerated} onFilesSelected={handleFilesSelected} onRemoveAttachment={removePendingAttachment} onSubmit={handleSendReply} />
    </div>
  );
}
