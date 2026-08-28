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
} from "lucide-react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/components/auth-provider";
import { getTicketDetails, addTicketResponse } from "@/app/actions/support";
import {
  isAdminUser,
  type SupportTicket,
  type SupportMessage,
} from "@/app/actions/support-utils";

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: any }
> = {
  open: { label: "Ouvert", bg: "bg-blue-50 text-blue-700 border-blue-200", text: "text-blue-700", icon: Clock },
  in_progress: { label: "En cours", bg: "bg-amber-50 text-amber-700 border-amber-200", text: "text-amber-700", icon: Zap },
  waiting_user: { label: "En attente d'infos", bg: "bg-purple-50 text-purple-700 border-purple-200", text: "text-purple-700", icon: AlertCircle },
  resolved: { label: "Résolu", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "text-emerald-700", icon: CheckCircle2 },
  closed: { label: "Fermé", bg: "bg-slate-100 text-slate-700 border-slate-200", text: "text-slate-700", icon: CheckCircle2 },
};

const PRIORITY_BADGES: Record<string, { label: string; bg: string }> = {
  urgent: { label: "Critique / Urgent", bg: "bg-red-100 text-red-700 border-red-200" },
  high: { label: "Haute", bg: "bg-orange-100 text-orange-700 border-orange-200" },
  medium: { label: "Normale", bg: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  low: { label: "Faible", bg: "bg-blue-100 text-blue-700 border-blue-200" },
};

export default function TicketDetailClient({ ticketId }: { ticketId: string }) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = isAdminUser(user?.email);

  const loadTicket = async () => {
    if (!user) return;
    try {
      const res = await getTicketDetails(
        ticketId,
        user.email,
        String(user.id || user.email)
      );

      if (res.success && res.ticket) {
        setTicket(res.ticket);
        setMessages(res.messages || []);
        setSelectedStatus(res.ticket.status);
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
    if (!authLoading && isAuthenticated) {
      loadTicket();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, user, ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || !ticket) return;

    if (!replyText.trim() && selectedStatus === ticket.status) {
      toast.error("Veuillez saisir un message ou changer le statut.");
      return;
    }

    setSubmitting(true);
    try {
      const newStatusParam =
        selectedStatus !== ticket.status
          ? (selectedStatus as any)
          : undefined;

      const res = await addTicketResponse({
        ticketId: ticket.id,
        senderId: String(user.id || user.email),
        senderEmail: user.email,
        senderName: user.username || user.email.split("@")[0],
        message: replyText.trim(),
        newStatus: newStatusParam,
      });

      if (res.success) {
        toast.success("Message envoyé !");
        setReplyText("");
        await loadTicket();
      } else {
        toast.error(res.error || "Erreur lors de l'envoi de la réponse.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Impossible d'envoyer le message.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatus = async (status: "resolved" | "closed" | "open") => {
    if (!user || !ticket) return;
    setSubmitting(true);
    try {
      const res = await addTicketResponse({
        ticketId: ticket.id,
        senderId: String(user.id || user.email),
        senderEmail: user.email,
        senderName: user.username || user.email.split("@")[0],
        message: "",
        newStatus: status,
      });

      if (res.success) {
        toast.success("Statut mis à jour !");
        await loadTicket();
      } else {
        toast.error(res.error || "Erreur mise à jour statut.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center py-32 bg-white rounded-3xl border border-black/5">
        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
          <span>Chargement du dossier de support...</span>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-12 rounded-3xl bg-white border border-black/5 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="w-10 h-10 mx-auto text-red-500" />
        <h2 className="text-xl font-bold text-slate-900">Ticket non trouvé</h2>
        <p className="text-xs text-slate-500">
          Ce ticket n&apos;existe pas ou vous ne disposez pas des permissions nécessaires pour y accéder.
        </p>
        <Link
          href="/support/tickets"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste des tickets
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
  const StatusIcon = statusCfg.icon;
  const priorityCfg = PRIORITY_BADGES[ticket.priority] || PRIORITY_BADGES.medium;

  const dateCreated = new Date(ticket.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation fil d'Ariane & Action retour */}
      <div className="flex items-center justify-between">
        <Link
          href="/support/tickets"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à tous les tickets
        </Link>

        <button
          onClick={() => loadTicket()}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
          title="Actualiser la conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Carte d'en-tête du Ticket */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/5 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-mono font-black text-purple-700">
                #TICK-{ticket.ticket_number || ticket.id.slice(0, 6)}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-bold">
                {ticket.project}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                {ticket.category}
              </span>
              <span className={`px-2.5 py-0.5 rounded-md border text-xs font-bold ${priorityCfg.bg}`}>
                {priorityCfg.label}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {ticket.title}
            </h1>

            <p className="text-xs text-slate-400 font-medium">
              Ouvert le {dateCreated} • Dernier événement {new Date(ticket.updated_at).toLocaleDateString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold ${statusCfg.bg}`}>
              <StatusIcon className="w-4 h-4" />
              {statusCfg.label}
            </span>

            {/* Actions rapides de résolution */}
            <div className="flex items-center gap-1.5 pt-1">
              {ticket.status !== "resolved" && ticket.status !== "closed" ? (
                <button
                  onClick={() => handleQuickStatus("resolved")}
                  disabled={submitting}
                  className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all border border-emerald-200 cursor-pointer"
                >
                  Marquer comme résolu
                </button>
              ) : (
                <button
                  onClick={() => handleQuickStatus("open")}
                  disabled={submitting}
                  className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all border border-blue-200 cursor-pointer"
                >
                  Rouvrir le ticket
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Détails du demandeur (si Admin) */}
        {isAdmin && (
          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-slate-800">Demandeur :</span>
              <span className="font-medium text-slate-700">{ticket.user_name}</span>
              <span className="text-purple-700 font-mono">({ticket.user_email})</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-bold text-[10px]">
                {ticket.user_tier}
              </span>
            </div>

            <a
              href={`mailto:${ticket.user_email}?subject=Re: [Support mAI #TICK-${ticket.ticket_number}] ${encodeURIComponent(ticket.title)}`}
              className="font-bold text-purple-700 hover:underline inline-flex items-center gap-1"
            >
              Écrire directement par e-mail
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Pièce jointe / Lien externe */}
        {ticket.metadata?.attachment_url && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <ExternalLink className="w-4 h-4 text-purple-600 shrink-0" />
              <span className="font-bold text-slate-700">Pièce jointe / Capture :</span>
              <a
                href={ticket.metadata.attachment_url}
                target="_blank"
                rel="noreferrer"
                className="text-purple-600 hover:underline truncate font-mono"
              >
                {ticket.metadata.attachment_url}
              </a>
            </div>
            <a
              href={ticket.metadata.attachment_url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 shrink-0"
            >
              Ouvrir
            </a>
          </div>
        )}

        {/* Diagnostics pliables */}
        {ticket.metadata?.diagnostics && (
          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between text-xs font-bold text-slate-700 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Laptop className="w-3.5 h-3.5 text-slate-500" />
                Informations environnementales et diagnostic technique
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDiagnostics ? "rotate-180" : ""}`} />
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

      {/* Fil de discussion & Timeline chronologique */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Fil des échanges ({messages.length})
        </h2>

        <div className="space-y-4">
          {messages.map((m, idx) => {
            const isSystem = m.sender_role === "system";
            const isFromAdmin = m.sender_role === "admin";
            const isOriginalPost = m.action_type === "created";

            if (isSystem) {
              return (
                <div key={m.id || idx} className="flex justify-center my-4">
                  <span className="px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    {m.message} • {new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            }

            const isCurrentUser = user && (m.sender_email === user.email || m.sender_id === String(user.id));

            return (
              <div
                key={m.id || idx}
                className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                  isFromAdmin
                    ? "bg-gradient-to-br from-purple-50/80 to-indigo-50/40 border-purple-200 shadow-2xs"
                    : isOriginalPost
                    ? "bg-white border-slate-200 shadow-2xs"
                    : isCurrentUser
                    ? "bg-slate-50/80 border-slate-200"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shadow-2xs ${
                        isFromAdmin
                          ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {isFromAdmin ? (
                        <ShieldCheck className="w-5 h-5" />
                      ) : (
                        (m.sender_name || "U").slice(0, 2).toUpperCase()
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {isFromAdmin ? "Équipe Support mAI (Mathias)" : m.sender_name}
                        </span>
                        {isFromAdmin && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-black uppercase">
                            Support Officiel
                          </span>
                        )}
                        {isOriginalPost && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                            Demande initiale
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {new Date(m.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed pl-12">
                  <ReactMarkdown>{m.message}</ReactMarkdown>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Zone de saisie d'une nouvelle réponse */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Send className="w-4 h-4 text-purple-600" />
            Répondre sur ce ticket
          </h3>

          {/* Sélecteur de statut accompagnateur */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium hidden sm:inline">Statut :</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:border-purple-500 outline-none cursor-pointer"
            >
              <option value="open">Ouvert</option>
              <option value="in_progress">En cours</option>
              <option value="waiting_user">En attente de l&apos;utilisateur</option>
              <option value="resolved">Résolu</option>
              <option value="closed">Fermé</option>
            </select>
          </div>
        </div>

        <form onSubmit={handleSendReply} className="space-y-4">
          <textarea
            rows={4}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                handleSendReply();
              }
            }}
            placeholder={
              isAdmin
                ? "Rédigez votre réponse officielle au demandeur... (Un e-mail lui sera automatiquement expédié)"
                : "Ajoutez un message, des précisions ou confirmez la résolution du problème... (Raccourci: Ctrl+Entrée)"
            }
            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all text-sm text-slate-900 placeholder:text-slate-400 outline-none leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-slate-400">
              💡 <strong>Raccourci :</strong> <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border text-[10px]">Ctrl + Entrée</kbd> pour expédier instantanément.
            </p>

            <button
              type="submit"
              disabled={submitting || (!replyText.trim() && selectedStatus === ticket.status)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Envoyer la réponse
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
