"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  ChevronRight,
  MessageSquare,
  RefreshCw,
  Loader2,
  FileQuestion,
  User,
  RotateCcw,
  Archive,
  ArchiveRestore,
  Trash2,
  Pencil,
  MoreHorizontal,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/components/auth-provider";
import { getTicketsList, updateTicketTitle, archiveTicket, deleteTicket } from "@/app/actions/support";
import { isAdminUser, type SupportTicket } from "@/app/actions/support-utils";

const STATUS_TABS = [
  { id: "all", label: "Tous (actifs)" },
  { id: "open", label: "Ouverts" },
  { id: "in_progress", label: "En cours" },
  { id: "waiting_user", label: "En attente" },
  { id: "reopened", label: "Réouverts" },
  { id: "resolved", label: "Résolus" },
  { id: "closed", label: "Fermés" },
  { id: "archived", label: "Archivés" },
];

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
  urgent: { label: "Critique", bg: "bg-red-100 text-red-700 border-red-200" },
  high: { label: "Haute", bg: "bg-orange-100 text-orange-700 border-orange-200" },
  medium: { label: "Normale", bg: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  low: { label: "Faible", bg: "bg-blue-100 text-blue-700 border-blue-200" },
};

export default function TicketsListClient() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [, startTransition] = useTransition();

  // Actions states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const isAdmin = isAdminUser(user?.email);

  const fetchTickets = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await getTicketsList({
        userId: String(user.id || user.email),
        userEmail: user.email,
        status: statusFilter,
        project: projectFilter,
        priority: priorityFilter,
        search: searchQuery.trim(),
      });
      if (res.success && res.tickets) setTickets(res.tickets);
    } catch (err) {
      console.error("Erreur chargement liste tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) fetchTickets();
    else if (!authLoading && !isAuthenticated) setLoading(false);
  }, [authLoading, isAuthenticated, user, statusFilter, projectFilter, priorityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => fetchTickets());
  };

  const handleRename = async (ticketId: string) => {
    if (!user) return;
    const trimmed = editingTitle.trim();
    if (trimmed.length < 3 || trimmed.length > 120) {
      toast.error("Le titre doit contenir entre 3 et 120 caractères.");
      return;
    }
    setActionLoading(ticketId);
    try {
      const res = await updateTicketTitle({
        ticketId,
        newTitle: trimmed,
        requesterEmail: user.email,
        requesterId: String(user.id || user.email),
      });
      if (res.success) {
        toast.success("Titre renommé !");
        setEditingId(null);
        await fetchTickets();
      } else toast.error(res.error || "Erreur renommage.");
    } catch {
      toast.error("Erreur renommage.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchiveToggle = async (ticket: SupportTicket) => {
    if (!user) return;
    const shouldArchive = ticket.status !== "archived" && !ticket.is_archived;
    if (!confirm(shouldArchive ? "Archiver ce ticket ? Il sera masqué de la liste active." : "Désarchiver ce ticket ?")) return;
    setActionLoading(ticket.id);
    try {
      const res = await archiveTicket({
        ticketId: ticket.id,
        requesterEmail: user.email,
        requesterId: String(user.id || user.email),
        archive: shouldArchive,
      });
      if (res.success) {
        toast.success(shouldArchive ? "Ticket archivé." : "Ticket désarchivé.");
        await fetchTickets();
      } else toast.error(res.error || "Erreur archivage.");
    } catch {
      toast.error("Erreur archivage.");
    } finally {
      setActionLoading(null);
      setOpenMenuId(null);
    }
  };

  const handleDelete = async (ticket: SupportTicket) => {
    if (!user) return;
    if (!confirm(`Supprimer définitivement le ticket #TICK-${ticket.ticket_number} ? Cette action est irréversible et supprimera aussi les fichiers Z1 associés.`)) return;
    // second confirm for safety
    if (!confirm("Confirmez la suppression définitive ?")) return;
    setActionLoading(ticket.id);
    try {
      const res = await deleteTicket({
        ticketId: ticket.id,
        requesterEmail: user.email,
        requesterId: String(user.id || user.email),
      });
      if (res.success) {
        toast.success("Ticket supprimé définitivement. Les fichiers Z1 seront purgés automatiquement.");
        await fetchTickets();
      } else toast.error(res.error || "Erreur suppression.");
    } catch {
      toast.error("Erreur suppression.");
    } finally {
      setActionLoading(null);
      setOpenMenuId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-32 bg-white rounded-3xl border border-black/5">
        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
          <span>Vérification de la session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-black/5 text-center max-w-xl mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
          <FileQuestion className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Connectez-vous pour voir vos tickets</h2>
        <p className="text-sm text-slate-500 leading-relaxed">Votre historique est rattaché à votre compte mAI.</p>
        <div className="pt-2">
          <Link href="/account/login?next=/support/tickets" className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-sm inline-block">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            {isAdmin ? "Gestion globale des tickets (Admin)" : "Historique de vos demandes"}
            {isAdmin && <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-xs font-bold">Admin</span>}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isAdmin ? "Tous les tickets clients • Renommer, archiver, supprimer disponibles." : "Suivez vos signalements, renommez ou archivez vos tickets."}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => fetchTickets()} disabled={loading} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-2xs" title="Rafraîchir">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-600" : ""}`} />
          </button>
          <Link href="/support/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-sm">
            <PlusCircle className="w-4 h-4" /> Nouveau ticket
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isActive ? "bg-purple-600 text-white shadow-2xs" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher par titre, #TICK ou mot-clé..." className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 outline-none" />
          </div>
          <div className="sm:col-span-3">
            <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:bg-white focus:border-purple-500 outline-none font-medium cursor-pointer">
              <option value="all">Tous les projets</option>
              <option value="mAI Web">mAI Web</option>
              <option value="mAI Pulse">mAI Pulse</option>
              <option value="mAI CLI">mAI CLI</option>
              <option value="mAI Coder">mAI Coder</option>
              <option value="mSearch">mSearch</option>
              <option value="API & Modèles IA">API & Modèles IA</option>
            </select>
          </div>
          <div className="sm:col-span-3">
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:bg-white focus:border-purple-500 outline-none font-medium cursor-pointer">
              <option value="all">Toutes priorités</option>
              <option value="urgent">Critique / Urgent</option>
              <option value="high">Haute</option>
              <option value="medium">Normale</option>
              <option value="low">Faible</option>
            </select>
          </div>
        </form>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center items-center py-24 bg-white rounded-3xl border border-black/5">
          <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            <span>Chargement des tickets...</span>
          </div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-black/5 text-center space-y-3">
          <FileQuestion className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-slate-800">Aucun ticket ne correspond</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Modifiez vos filtres ou créez une nouvelle demande.</p>
          <div className="pt-2 flex gap-2 justify-center">
            <button onClick={() => { setStatusFilter("all"); setProjectFilter("all"); setPriorityFilter("all"); setSearchQuery(""); }} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer">Réinitialiser</button>
            <Link href="/support/new" className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold">Nouveau ticket</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => {
            const statusCfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.open;
            const StatusIcon = statusCfg.icon;
            const priorityCfg = PRIORITY_BADGES[t.priority] || PRIORITY_BADGES.medium;
            const dateStr = new Date(t.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
            const isEditing = editingId === t.id;
            return (
              <div key={t.id} className="relative p-5 rounded-2xl bg-white border border-black/5 hover:border-purple-200 hover:shadow-md transition-all group">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-black text-purple-700">#TICK-{t.ticket_number || t.id.slice(0, 6)}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">{t.project}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px]">{t.category}</span>
                      <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${priorityCfg.bg}`}>{priorityCfg.label}</span>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input autoFocus value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleRename(t.id); if (e.key === "Escape") setEditingId(null); }} className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-purple-300 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-500/20" placeholder="Nouveau titre (3-120)" />
                        <button onClick={() => handleRename(t.id)} disabled={actionLoading === t.id} className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 disabled:opacity-40 cursor-pointer">{actionLoading === t.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Enregistrer"}</button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <div>
                        <Link href={`/support/tickets/${t.id}`} className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors hover:underline line-clamp-1">
                          {t.title}
                        </Link>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{t.description}</p>
                      </div>
                    )}

                    {isAdmin && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pt-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Demandeur :</span>
                        <strong className="text-slate-800">{t.user_name}</strong>
                        <span className="text-purple-600 font-mono">({t.user_email})</span>
                        {t.user_tier && <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 font-bold text-[10px]">{t.user_tier}</span>}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right space-y-1">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${statusCfg.bg}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusCfg.label}
                      </span>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium justify-end">
                        <span>{dateStr}</span>
                        {t.message_count !== undefined && <span className="flex items-center gap-1 text-slate-500 font-bold"><MessageSquare className="w-3 h-3" />{t.message_count}</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="relative flex items-center gap-1">
                      <button onClick={() => setOpenMenuId(openMenuId === t.id ? null : t.id)} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer" title="Actions">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      <Link href={`/support/tickets/${t.id}`} className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-600 cursor-pointer hidden sm:flex" title="Ouvrir">
                        <ChevronRight className="w-4 h-4" />
                      </Link>

                      {openMenuId === t.id && (
                        <div className="absolute right-0 top-10 z-20 w-52 p-2 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-1">
                          <Link href={`/support/tickets/${t.id}`} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700" onClick={() => setOpenMenuId(null)}>
                            <MessageSquare className="w-4 h-4 text-blue-600" /> Ouvrir le ticket
                          </Link>
                          <button onClick={() => { setEditingId(t.id); setEditingTitle(t.title); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer text-left">
                            <Pencil className="w-4 h-4 text-slate-500" /> Renommer
                          </button>
                          <button onClick={() => handleArchiveToggle(t)} disabled={actionLoading === t.id} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-amber-50 text-xs font-bold text-amber-700 cursor-pointer text-left disabled:opacity-40">
                            {t.is_archived || t.status === "archived" ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                            {t.is_archived || t.status === "archived" ? "Désarchiver" : "Archiver"}
                          </button>
                          <div className="h-px bg-slate-100 my-1" />
                          <button onClick={() => handleDelete(t)} disabled={actionLoading === t.id} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 text-xs font-bold text-red-600 cursor-pointer text-left disabled:opacity-40">
                            <Trash2 className="w-4 h-4" /> Supprimer définitivement
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
