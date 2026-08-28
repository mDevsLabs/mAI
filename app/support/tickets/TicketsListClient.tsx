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
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getTicketsList } from "@/app/actions/support";
import { isAdminUser, type SupportTicket } from "@/app/actions/support-utils";

const STATUS_TABS = [
  { id: "all", label: "Tous les tickets" },
  { id: "open", label: "Ouverts" },
  { id: "in_progress", label: "En cours" },
  { id: "waiting_user", label: "En attente" },
  { id: "resolved", label: "Résolus" },
  { id: "closed", label: "Fermés" },
];

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

      if (res.success && res.tickets) {
        setTickets(res.tickets);
      }
    } catch (err) {
      console.error("Erreur chargement liste tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchTickets();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, user, statusFilter, projectFilter, priorityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      fetchTickets();
    });
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
        <h2 className="text-xl font-bold text-slate-900">
          Connectez-vous pour voir vos tickets
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Votre historique de support est strictement rattaché à votre compte mAI.
        </p>
        <div className="pt-2">
          <Link
            href="/account/login?next=/support/tickets"
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-sm inline-block"
          >
            Se connecter à mon compte
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            {isAdmin ? "Gestion globale des tickets (Admin)" : "Historique de vos demandes"}
            {isAdmin && (
              <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-xs font-bold">
                Admin
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isAdmin
              ? "Tous les tickets ouverts par les clients de la plateforme mAI."
              : "Suivez vos signalements de bugs et échangez directement avec les développeurs."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchTickets()}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-600" : ""}`} />
          </button>
          <Link
            href="/support/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Nouveau ticket
          </Link>
        </div>
      </div>

      {/* Barre de filtres & recherche */}
      <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-2xs space-y-4">
        {/* Onglets de Statut */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-purple-600 text-white shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Moteur de recherche et sélecteurs de filtre */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par titre, n° #TICK ou mot-clé..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:bg-white focus:border-purple-500 outline-none font-medium cursor-pointer"
            >
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
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:bg-white focus:border-purple-500 outline-none font-medium cursor-pointer"
            >
              <option value="all">Toutes priorités</option>
              <option value="urgent">Critique / Urgent</option>
              <option value="high">Haute</option>
              <option value="medium">Normale</option>
              <option value="low">Faible</option>
            </select>
          </div>
        </form>
      </div>

      {/* Liste des tickets */}
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
          <h3 className="text-base font-bold text-slate-800">
            Aucun ticket ne correspond à ces critères
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Modifiez vos filtres ou effectuez une autre recherche pour afficher d&apos;autres résultats.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setStatusFilter("all");
                setProjectFilter("all");
                setPriorityFilter("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => {
            const statusCfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.open;
            const StatusIcon = statusCfg.icon;
            const priorityCfg = PRIORITY_BADGES[t.priority] || PRIORITY_BADGES.medium;

            const dateStr = new Date(t.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <Link
                key={t.id}
                href={`/support/tickets/${t.id}`}
                className="block p-5 rounded-2xl bg-white border border-black/5 hover:border-purple-200 hover:shadow-md transition-all group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-black text-purple-700">
                        #TICK-{t.ticket_number || t.id.slice(0, 6)}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        {t.project}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px]">
                        {t.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${priorityCfg.bg}`}>
                        {priorityCfg.label}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                        {t.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {t.description}
                      </p>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pt-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Demandeur :</span>
                        <strong className="text-slate-800">{t.user_name}</strong>
                        <span className="text-purple-600 font-mono">({t.user_email})</span>
                        {t.user_tier && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 font-bold text-[10px]">
                            {t.user_tier}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    <div className="text-right space-y-1">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${statusCfg.bg}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusCfg.label}
                      </span>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium justify-end">
                        <span>{dateStr}</span>
                        {t.message_count !== undefined && (
                          <span className="flex items-center gap-1 text-slate-500 font-bold">
                            <MessageSquare className="w-3 h-3" />
                            {t.message_count}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-purple-600 transition-all hidden sm:block" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
