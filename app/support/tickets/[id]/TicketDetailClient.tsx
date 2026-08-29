"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  Send,
  Loader2,
  ShieldCheck,
  ExternalLink,
  Laptop,
  MessageSquare,
  Sparkles,
  ChevronDown,
  RefreshCw,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  RotateCcw,
  Paperclip,
  Image as ImageIcon,
  X,
  FileText,
  Bot,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/components/auth-provider";
import { getTicketDetails, addTicketResponse, updateTicketTitle, archiveTicket, deleteTicket } from "@/app/actions/support";
import {
  isAdminUser,
  type SupportTicket,
  type SupportMessage,
  type SupportAttachment,
  SUPPORT_ATTACHMENT_LIMITS,
  isAllowedSupportMime,
  getAllowedStatusTransitions,
} from "@/app/actions/support-utils";
import { useRouter } from "next/navigation";

const STATUS_CONFIG: Record<string, { label: string; bg: string; icon: any }> = {
  open: { label: "Ouvert", bg: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock },
  in_progress: { label: "En cours", bg: "bg-amber-50 text-amber-700 border-amber-200", icon: Zap },
  waiting_user: { label: "En attente", bg: "bg-purple-50 text-purple-700 border-purple-200", icon: AlertCircle },
  resolved: { label: "Résolu", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  closed: { label: "Fermé", bg: "bg-slate-100 text-slate-700 border-slate-200", icon: CheckCircle2 },
  reopened: { label: "Réouvert", bg: "bg-orange-50 text-orange-700 border-orange-200", icon: RotateCcw },
  archived: { label: "Archivé", bg: "bg-slate-100 text-slate-600 border-slate-200", icon: Archive },
};

const PRIORITY_BADGES: Record<string, { label: string; bg: string }> = {
  urgent: { label: "Critique / Urgent", bg: "bg-red-100 text-red-700 border-red-200" },
  high: { label: "Haute", bg: "bg-orange-100 text-orange-700 border-orange-200" },
  medium: { label: "Normale", bg: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  low: { label: "Faible", bg: "bg-blue-100 text-blue-700 border-blue-200" },
};

const ALL_STATUSES: Array<{ value: string; label: string }> = [
  { value: "open", label: "Ouvert" },
  { value: "in_progress", label: "En cours" },
  { value: "waiting_user", label: "En attente de l'utilisateur" },
  { value: "resolved", label: "Résolu" },
  { value: "closed", label: "Fermé" },
  { value: "reopened", label: "Réouvert" },
  { value: "archived", label: "Archivé" },
];

export default function TicketDetailClient({ ticketId }: { ticketId: string }) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [attachments, setAttachments] = useState<SupportAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  // Rename inline
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  // File upload
  const [pendingAttachments, setPendingAttachments] = useState<SupportAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = isAdminUser(user?.email);

  const loadTicket = async () => {
    if (!user) return;
    try {
      const res: any = await getTicketDetails(ticketId, user.email, String(user.id || user.email));
      if (res.success && res.ticket) {
        setTicket(res.ticket);
        setMessages(res.messages || []);
        setAttachments(res.attachments || []);
        setSelectedStatus(res.ticket.status);
        setTitleDraft(res.ticket.title);
      } else {
        toast.error(res.error || "Ticket introuvable.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur de chargement du ticket.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) loadTicket();
    else if (!authLoading && !isAuthenticated) setLoading(false);
  }, [authLoading, isAuthenticated, user, ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Compteurs fichiers par rôle (5 max chacun)
  const myRole = isAdmin ? "admin" : "user";
  const myAttachmentsCount = attachments.filter((a) => a.uploader_role === myRole).length + pendingAttachments.length;
  const canUploadMore = myAttachmentsCount < SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET;

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user || !ticket) return;
    const remaining = SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET - myAttachmentsCount;
    if (remaining <= 0) {
      toast.error(`Limite atteinte : ${SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET} fichiers max pour ${myRole === "admin" ? "l'administrateur" : "vous"} sur cette conversation.`);
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    if (files.length > remaining) toast(`Seuls ${remaining} fichier(s) sur ${files.length} seront uploadés (limite ${SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET}/rôle).`, { icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> });

    setUploading(true);
    for (const file of toUpload) {
      if (file.size > SUPPORT_ATTACHMENT_LIMITS.MAX_FILE_SIZE) {
        toast.error(`${file.name} dépasse 8 Mo`);
        continue;
      }
      if (!isAllowedSupportMime(file.type, file.name)) {
        toast.error(`${file.name} : type non autorisé (images, .txt, .md uniquement)`);
        continue;
      }
      const form = new FormData();
      form.append("file", file);
      form.append("ticketId", ticket.id);
      form.append("uploaderId", String(user.id || user.email));
      form.append("uploaderEmail", user.email);
      form.append("uploaderName", user.username || user.email.split("@")[0]);
      try {
        const res = await fetch("/api/support/upload", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok || !data.success) {
          toast.error(data.error || `Échec upload ${file.name}`);
          continue;
        }
        const att: SupportAttachment = data.attachment
          ? {
              id: data.attachment.id,
              ticket_id: ticket.id,
              message_id: null,
              uploader_id: String(user.id || user.email),
              uploader_email: user.email,
              uploader_role: myRole as any,
              file_url: data.attachment.file_url || data.url,
              file_key: data.attachment.file_key || data.fileKey,
              file_name: data.attachment.file_name,
              file_size: data.attachment.file_size,
              mime_type: data.attachment.mime_type,
              created_at: new Date().toISOString(),
            }
          : {
              id: data.fileKey || Math.random().toString(36).slice(2),
              ticket_id: ticket.id,
              message_id: null,
              uploader_id: String(user.id || user.email),
              uploader_email: user.email,
              uploader_role: myRole as any,
              file_url: data.url,
              file_key: data.fileKey,
              file_name: file.name,
              file_size: file.size,
              mime_type: file.type,
              created_at: new Date().toISOString(),
            };
        setPendingAttachments((prev) => [...prev, att]);
        toast.success(`${file.name} uploadé en Z1 Storage`);
      } catch (e: any) {
        toast.error(`Erreur upload ${file.name}: ${e?.message}`);
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || !ticket) return;
    if (!replyText.trim() && pendingAttachments.length === 0 && selectedStatus === ticket.status) {
      toast.error("Veuillez saisir un message, joindre un fichier ou changer le statut.");
      return;
    }
    // Validation statut grisé
    if (selectedStatus !== ticket.status) {
      const allowed = getAllowedStatusTransitions(ticket.status as any);
      if (!allowed.includes(selectedStatus as any)) {
        toast.error(ticket.status === "resolved" || ticket.status === "closed" ? "Ce ticket est fermé. Seule l'option 'Réouvert' est disponible." : "Transition non autorisée.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const newStatusParam = selectedStatus !== ticket.status ? (selectedStatus as any) : undefined;
      const res = await addTicketResponse({
        ticketId: ticket.id,
        senderId: String(user.id || user.email),
        senderEmail: user.email,
        senderName: user.username || user.email.split("@")[0],
        message: replyText.trim(),
        newStatus: newStatusParam,
        isAiGenerated: isAdmin ? isAiGenerated : false,
        attachmentIds: pendingAttachments.map((a) => a.id),
      });
      if (res.success) {
        toast.success("Message envoyé !");
        setReplyText("");
        setPendingAttachments([]);
        setIsAiGenerated(false);
        await loadTicket();
      } else {
        toast.error(res.error || "Erreur envoi.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Impossible d'envoyer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatus = async (status: SupportTicket["status"]) => {
    if (!user || !ticket) return;
    setSubmitting(true);
    try {
      const res = await addTicketResponse({
        ticketId: ticket.id,
        senderId: String(user.id || user.email),
        senderEmail: user.email,
        senderName: user.username || user.email.split("@")[0],
        message: "",
        newStatus: status as any,
      });
      if (res.success) {
        toast.success("Statut mis à jour !");
        await loadTicket();
      } else toast.error(res.error || "Erreur statut.");
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
      const res = await updateTicketTitle({ ticketId: ticket.id, newTitle: trimmed, requesterEmail: user.email, requesterId: String(user.id || user.email) });
      if (res.success) {
        toast.success("Titre renommé !");
        setEditingTitle(false);
        await loadTicket();
      } else toast.error(res.error || "Erreur renommage.");
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
      const res = await archiveTicket({ ticketId: ticket.id, requesterEmail: user.email, requesterId: String(user.id || user.email), archive: shouldArchive });
      if (res.success) {
        toast.success(shouldArchive ? "Ticket archivé." : "Ticket désarchivé.");
        await loadTicket();
      } else toast.error(res.error || "Erreur.");
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
      const res = await deleteTicket({ ticketId: ticket.id, requesterEmail: user.email, requesterId: String(user.id || user.email) });
      if (res.success) {
        toast.success("Ticket supprimé.");
        router.push("/support/tickets");
      } else toast.error(res.error || "Erreur suppression.");
    } catch {
      toast.error("Erreur suppression.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center py-32 bg-white rounded-3xl border border-black/5">
        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
          <span>Chargement du dossier…</span>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-12 rounded-3xl bg-white border border-black/5 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="w-10 h-10 mx-auto text-red-500" />
        <h2 className="text-xl font-bold text-slate-900">Ticket non trouvé</h2>
        <p className="text-xs text-slate-500">Introuvable ou accès refusé.</p>
        <Link href="/support/tickets" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
  const StatusIcon = statusCfg.icon;
  const priorityCfg = PRIORITY_BADGES[ticket.priority] || PRIORITY_BADGES.medium;
  const dateCreated = new Date(ticket.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const allowedStatuses = getAllowedStatusTransitions(ticket.status as any);
  const isTerminal = ticket.status === "resolved" || ticket.status === "closed";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/support/tickets" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Retour à tous les tickets
        </Link>
        <div className="flex items-center gap-1.5">
          <button onClick={() => loadTicket()} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs">
            <RefreshCw className="w-3.5 h-3.5" /> Actualiser
          </button>
        </div>
      </div>

      {/* En-tête */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/5 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-mono font-black text-purple-700">#TICK-{ticket.ticket_number || ticket.id.slice(0, 6)}</span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-bold">{ticket.project}</span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs">{ticket.category}</span>
              <span className={`px-2.5 py-0.5 rounded-md border text-xs font-bold ${priorityCfg.bg}`}>{priorityCfg.label}</span>
              {ticket.is_archived && <span className="px-2 py-0.5 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center gap-1"><Archive className="w-3 h-3" /> Archivé</span>}
            </div>

            {editingTitle ? (
              <div className="flex items-center gap-2">
                <input autoFocus value={titleDraft} onChange={(e) => setTitleDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setEditingTitle(false); }} className="flex-1 px-3 py-2 rounded-xl border border-purple-300 bg-white text-base font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-500/20" maxLength={120} />
                <button onClick={handleRename} disabled={submitting} className="px-3 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 disabled:opacity-40 cursor-pointer">Enregistrer</button>
                <button onClick={() => { setEditingTitle(false); setTitleDraft(ticket.title); }} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex-1">{ticket.title}</h1>
                <button onClick={() => setEditingTitle(true)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 shrink-0 cursor-pointer" title="Renommer">
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            )}

            <p className="text-xs text-slate-400 font-medium">Ouvert le {dateCreated} • Dernier événement {new Date(ticket.updated_at).toLocaleDateString("fr-FR", { hour: "2-digit", minute: "2-digit" })} • {isTerminal ? <><AlertTriangle className="w-3 h-3 inline text-amber-500 align-middle mr-0.5" /> Ticket fermé — seule option : Réouvert (autres grisées)</> : ""}</p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold ${statusCfg.bg}`}>
              <StatusIcon className="w-4 h-4" /> {statusCfg.label}
            </span>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {isTerminal ? (
                <button onClick={() => handleQuickStatus("reopened" as any)} disabled={submitting} className="px-3 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200 cursor-pointer flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5" /> Rouvrir
                </button>
              ) : ticket.status !== "resolved" && ticket.status !== "closed" ? (
                <button onClick={() => handleQuickStatus("resolved")} disabled={submitting} className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 cursor-pointer">Marquer résolu</button>
              ) : null}
              <button onClick={handleArchiveToggle} disabled={submitting} className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border cursor-pointer flex items-center gap-1">
                {ticket.is_archived || ticket.status === "archived" ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                {ticket.is_archived || ticket.status === "archived" ? "Désarchiver" : "Archiver"}
              </button>
              <button onClick={handleDelete} disabled={submitting} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 cursor-pointer" title="Supprimer définitivement">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-slate-800">Demandeur :</span>
              <span className="font-medium text-slate-700">{ticket.user_name}</span>
              <span className="text-purple-700 font-mono">({ticket.user_email})</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-bold text-[10px]">{ticket.user_tier}</span>
            </div>
            <a href={`mailto:${ticket.user_email}?subject=Re: [Support mAI #TICK-${ticket.ticket_number}] ${encodeURIComponent(ticket.title)}`} className="font-bold text-purple-700 hover:underline inline-flex items-center gap-1">Écrire par e-mail <ExternalLink className="w-3 h-3" /></a>
          </div>
        )}

        {/* Attachments globaux du ticket */}
        {attachments.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2"><Paperclip className="w-4 h-4" /> Pièces jointes ({attachments.length}) — Z1 Storage (8 Mo max, images/.txt/.md, 5/role)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {attachments.map((a) => (
                <a key={a.id} href={a.file_url} target="_blank" rel="noreferrer" className="group p-2 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-2xs flex items-center gap-2 overflow-hidden">
                  {a.mime_type.startsWith("image/") ? (
                    <img src={a.file_url} alt={a.file_name} className="w-10 h-10 rounded-lg object-cover shrink-0 bg-slate-100" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><FileText className="w-5 h-5 text-slate-500" /></div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-purple-700">{a.file_name}</p>
                    <p className="text-[11px] text-slate-400">{(a.file_size / 1024).toFixed(1)} Ko • {a.uploader_role}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {ticket.metadata?.attachment_url && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate"><ExternalLink className="w-4 h-4 text-purple-600 shrink-0" /><span className="font-bold text-slate-700">Ancien lien :</span><a href={ticket.metadata.attachment_url} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline truncate font-mono">{ticket.metadata.attachment_url}</a></div>
            <a href={ticket.metadata.attachment_url} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold">Ouvrir</a>
          </div>
        )}

        {ticket.metadata?.diagnostics && (
          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <button type="button" onClick={() => setShowDiagnostics(!showDiagnostics)} className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 cursor-pointer">
              <span className="flex items-center gap-2"><Laptop className="w-3.5 h-3.5 text-slate-500" /> Diagnostics</span><ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDiagnostics ? "rotate-180" : ""}`} />
            </button>
            {showDiagnostics && (
              <div className="p-4 bg-white text-xs font-mono text-slate-600 space-y-1 border-t border-slate-100">
                <p><strong>Plateforme :</strong> {ticket.metadata.diagnostics.platform}</p>
                <p><strong>Résolution :</strong> {ticket.metadata.diagnostics.screenResolution}</p>
                <p className="break-all"><strong>User-Agent :</strong> {ticket.metadata.diagnostics.userAgent}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Fil des échanges ({messages.length})</h2>
        <div className="space-y-4">
          {messages.map((m, idx) => {
            const isSystem = m.sender_role === "system";
            const isFromAdmin = m.sender_role === "admin";
            const isOriginalPost = m.action_type === "created";
            if (isSystem) {
              return (
                <div key={m.id || idx} className="flex justify-center my-4">
                  <span className="px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-purple-600" />{m.message} • {new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              );
            }
            const isCurrentUser = user && (m.sender_email === user.email || m.sender_id === String(user.id));
            return (
              <div key={m.id || idx} className={`p-5 sm:p-6 rounded-3xl border ${isFromAdmin ? "bg-gradient-to-br from-purple-50/80 to-indigo-50/40 border-purple-200 shadow-2xs" : isOriginalPost ? "bg-white border-slate-200 shadow-2xs" : isCurrentUser ? "bg-slate-50/80 border-slate-200" : "bg-white border-slate-200"}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shadow-2xs ${isFromAdmin ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white" : "bg-slate-200 text-slate-700"}`}>{isFromAdmin ? <ShieldCheck className="w-5 h-5" /> : (m.sender_name || "U").slice(0, 2).toUpperCase()}</div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{isFromAdmin ? "mAI" : m.sender_name}</span>
                        {isFromAdmin && <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-black uppercase">mAI • Support</span>}
                        {isOriginalPost && <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">Demande initiale</span>}
                        {m.is_ai_generated && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold flex items-center gap-1"><Bot className="w-3 h-3" /> Contenu créé par IA</span>}
                      </div>
                      <p className="text-[11px] text-slate-400">{new Date(m.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed pl-12">
                  <ReactMarkdown>{m.message}</ReactMarkdown>
                </div>
                {m.is_ai_generated && (
                  <div className="mt-3 ml-12 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex gap-2">
                    <Bot className="w-4 h-4 shrink-0 mt-0.5" />
                    <span><strong>Note :</strong> Ce message a été généré avec l&apos;assistance de l&apos;IA et relu par l&apos;équipe mAI. Vérifiez les informations critiques.</span>
                  </div>
                )}
                {m.attachments && m.attachments.length > 0 && (
                  <div className="mt-3 ml-12 grid grid-cols-2 gap-2">
                    {m.attachments.map((a) => (
                      <a key={a.id} href={a.file_url} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-white border border-slate-200 hover:border-purple-200 flex items-center gap-2 text-xs">
                        {a.mime_type.startsWith("image/") ? <ImageIcon className="w-4 h-4 text-purple-600" /> : <FileText className="w-4 h-4 text-slate-500" />}
                        <span className="truncate font-medium">{a.file_name}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Zone réponse */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2"><Send className="w-4 h-4 text-purple-600" /> Répondre</h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium hidden sm:inline">Statut :</span>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:border-purple-500 outline-none cursor-pointer">
              {ALL_STATUSES.map((s) => {
                const isAllowed = getAllowedStatusTransitions(ticket.status as any).includes(s.value as any);
                const disabled = !isAllowed;
                return (
                  <option key={s.value} value={s.value} disabled={disabled} style={disabled ? { color: "#94a3b8" } : {}}>
                    {s.label} {disabled ? "— indisponible (fermé)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {isTerminal && selectedStatus !== "reopened" && selectedStatus !== ticket.status && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">Ce ticket est fermé/résolu. Seule l&apos;option <strong>Réouvert</strong> est disponible (autres options grisées).</div>
        )}

        <form onSubmit={handleSendReply} className="space-y-4">
          <textarea
            rows={4}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSendReply(); }}
            placeholder={isAdmin ? "Réponse officielle mAI… (e-mail auto)" : "Précisions ou confirmation… (Ctrl+Entrée)"}
            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 text-sm text-slate-900 placeholder:text-slate-400 outline-none leading-relaxed"
          />

          {/* Upload fichiers (deux côtés identique) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"><Paperclip className="w-3.5 h-3.5" /> Fichiers (images / .txt / .md) — 8 Mo max, {SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET} max / {myRole === "admin" ? "admin" : "vous"} • {myAttachmentsCount}/{SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET}</span>
              <span className={`text-[11px] font-bold ${canUploadMore ? "text-emerald-600" : "text-red-600"}`}>{canUploadMore ? "Upload disponible" : "Limite atteinte"}</span>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-purple-400", "bg-purple-50"); }}
              onDragLeave={(e) => { e.currentTarget.classList.remove("border-purple-400", "bg-purple-50"); }}
              onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-purple-400", "bg-purple-50"); handleFilesSelected(e.dataTransfer.files); }}
              className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-white hover:border-purple-300 transition-all flex flex-col sm:flex-row items-center gap-3 text-xs"
            >
              <input ref={fileInputRef} type="file" multiple accept="image/*,.txt,.md,text/plain,text/markdown" onChange={(e) => handleFilesSelected(e.target.files)} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={!canUploadMore || uploading} className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-purple-300 text-slate-700 font-bold text-xs flex items-center gap-2 disabled:opacity-40 cursor-pointer shrink-0">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin text-purple-600" /> : <ImageIcon className="w-4 h-4 text-purple-600" />}
                {uploading ? "Upload Z1…" : "Choisir / Glisser fichiers"}
              </button>
              <span className="text-slate-500">ou glissez-déposez ici • 8 Mo max • images, .txt, .md</span>
            </div>

            {/* Pending files preview */}
            {pendingAttachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pendingAttachments.map((a) => (
                  <div key={a.id} className="p-2 rounded-xl bg-purple-50 border border-purple-200 flex items-center gap-2 text-xs">
                    {a.mime_type.startsWith("image/") ? <img src={a.file_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-white" /> : <FileText className="w-5 h-5 text-purple-600 shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold truncate">{a.file_name}</p>
                      <p className="text-[11px] text-slate-500">{(a.file_size / 1024).toFixed(1)} Ko — prêt à envoyer</p>
                    </div>
                    <button type="button" onClick={() => setPendingAttachments((p) => p.filter((x) => x.id !== a.id))} className="p-1 rounded-lg hover:bg-white cursor-pointer"><X className="w-4 h-4 text-slate-500" /></button>
                  </div>
                ))}
              </div>
            )}
            {!canUploadMore && <p className="text-[11px] text-red-600">Vous avez atteint la limite de {SUPPORT_ATTACHMENT_LIMITS.MAX_FILES_PER_ROLE_PER_TICKET} fichiers pour cette conversation en tant que {myRole}.</p>}
          </div>

          {isAdmin && (
            <label className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer">
              <input type="checkbox" checked={isAiGenerated} onChange={(e) => setIsAiGenerated(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-amber-300 text-purple-600 focus:ring-purple-500 cursor-pointer" />
              <span className="text-xs text-amber-900 leading-relaxed">
                <strong className="flex items-center gap-1"><Bot className="w-3.5 h-3.5" /> Contenu créé par IA</strong>
                Cochez si ce message a été généré avec l&apos;assistance de l&apos;IA. Un badge sera affiché à l&apos;utilisateur indiquant que le contenu est peut-être créé par IA.
              </span>
            </label>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-slate-400"><Lightbulb className="w-3 h-3 inline text-amber-400 align-middle mr-0.5" /> <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border text-[10px]">Ctrl + Entrée</kbd> pour envoyer. Purge auto après 365j d&apos;inactivité (fichiers Z1 inclus).</p>
            <button type="submit" disabled={submitting || uploading || (!replyText.trim() && pendingAttachments.length === 0 && selectedStatus === ticket.status)} className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi…</> : <><Send className="w-4 h-4" /> Envoyer la réponse</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
