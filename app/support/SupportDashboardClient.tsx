"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Loader2,
  FileQuestion,
  MessageSquare,
  RotateCcw,
  Archive,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getTicketsList, getSupportStats } from "@/app/actions/support";
import { isAdminUser, type SupportTicket } from "@/app/actions/support-utils";

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

export default function SupportDashboardClient() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [historyTickets, setHistoryTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = isAdminUser(user?.email);

  useEffect(() => {
    async function loadData() {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [ticketsRes, historyRes, statsRes] = await Promise.all([
          getTicketsList({
            userId: String(user.id || user.email),
            userEmail: user.email,
            status: "all",
          }),
          // Historique : tous les tickets triés par updated_at (même appel mais on garde séparé pour futur filtre)
          getTicketsList({
            userId: String(user.id || user.email),
            userEmail: user.email,
            status: "all",
          }),
          getSupportStats(String(user.id || user.email), user.email),
        ]);

        if (ticketsRes.success && ticketsRes.tickets) {
          // Tickets actifs = open/in_progress/waiting_user/reopened
          const active = ticketsRes.tickets.filter((t) => ["open", "in_progress", "waiting_user", "reopened"].includes(t.status));
          setTickets(active.slice(0, 6));
          setHistoryTickets((historyRes.tickets || ticketsRes.tickets || []).slice(0, 8));
        }
        if (statsRes.success && statsRes.stats) {
          setStats(statsRes.stats);
        }
      } catch (err) {
        console.error("Erreur chargement dashboard support:", err);
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) loadData();
  }, [authLoading, isAuthenticated, user]);

  return (
    <div className="space-y-8">
      {/* Admin banner compact */}
      {isAdmin && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Mode Administrateur Support Actif</p>
              <p className="text-xs text-slate-500">
                Connecté en tant que <span className="font-semibold text-purple-700">{user?.email}</span> — vue globale.
              </p>
            </div>
          </div>
          <Link
            href="/support/tickets"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-sm shrink-0"
          >
            Gérer tous les tickets ({stats?.totalWithArchived ?? stats?.total ?? 0})
          </Link>
        </div>
      )}

      {/* Statistiques directement sous le header (spécification) */}
      {stats ? (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-2xs">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tickets actifs</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{(stats.open || 0) + (stats.inProgress || 0) + (stats.reopened || 0) + (stats.waiting || 0)}</p>
            <p className="text-[11px] text-amber-600 font-medium mt-1">En cours de prise en charge</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-2xs">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Résolus</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">{stats.resolved || 0}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Dossiers traités</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-2xs">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Taux de résolution</p>
            <p className="text-3xl font-black text-purple-600 mt-1">{stats.resolutionRate || 100}%</p>
            <p className="text-[11px] text-purple-600 font-medium mt-1">Efficacité</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-2xs">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Temps moyen</p>
            <p className="text-3xl font-black text-blue-600 mt-1">{stats.avgResolutionHours || 2.4}h</p>
            <p className="text-[11px] text-blue-600 font-medium mt-1">Délai estimé</p>
          </div>
        </section>
      ) : (
        !loading && (
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-black/5 animate-pulse h-24" />
            ))}
          </section>
        )
      )}

      {/* Grille principale : Tickets actifs (2/3) + Historique sidebar (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets actifs */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900">{isAdmin ? "Tickets actifs" : "Vos tickets actifs"}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold">{tickets.length}</span>
            </div>
            <Link href="/support/tickets" className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 hover:underline">
              Voir tous <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12 bg-white rounded-3xl border border-black/5">
              <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                <span>Chargement…</span>
              </div>
            </div>
          ) : !isAuthenticated ? (
            <div className="p-8 rounded-3xl bg-white border border-black/5 text-center space-y-3">
              <FileQuestion className="w-10 h-10 mx-auto text-slate-400" />
              <h3 className="text-base font-bold text-slate-800">Connectez-vous pour suivre vos demandes</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Le suivi nécessite une authentification pour garantir la traçabilité.
              </p>
              <Link
                href="/account/login?next=/support"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-colors shadow-sm"
              >
                Se connecter
              </Link>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-black/5 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/80" />
              <h3 className="text-base font-bold text-slate-800">Aucun ticket actif</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">Tous les dossiers sont résolus ou archivés. Créez une nouvelle demande si besoin.</p>
              <Link
                href="/support/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-sm"
              >
                <PlusCircle className="w-4 h-4" /> Créer une demande
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => {
                const statusCfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.open;
                const StatusIcon = statusCfg.icon;
                const priorityCfg = PRIORITY_BADGES[t.priority] || PRIORITY_BADGES.medium;
                return (
                  <Link
                    key={t.id}
                    href={`/support/tickets/${t.id}`}
                    className="block p-4 sm:p-5 rounded-2xl bg-white border border-black/5 hover:border-purple-200 hover:shadow-md transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold text-purple-700">#TICK-{t.ticket_number || t.id.slice(0, 6)}</span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">{t.project}</span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px]">{t.category}</span>
                          <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${priorityCfg.bg}`}>{priorityCfg.label}</span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors truncate">{t.title}</h3>
                        {isAdmin && (
                          <p className="text-xs text-slate-500 font-medium">
                            Demandeur : <span className="text-slate-800 font-semibold">{t.user_name}</span> ({t.user_email})
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${statusCfg.bg}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusCfg.label}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-purple-600 transition-all" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Barre latérale Historique */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Historique
            </h2>
            <Link href="/support/tickets" className="text-[11px] font-bold text-slate-500 hover:text-slate-700">
              Tout voir
            </Link>
          </div>

          <div className="p-4 rounded-3xl bg-white border border-black/5 shadow-sm space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              </div>
            ) : historyTickets.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <FileQuestion className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs text-slate-500">Aucun historique pour l&apos;instant.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {historyTickets.map((t) => {
                  const sc = STATUS_CONFIG[t.status] || STATUS_CONFIG.open;
                  return (
                    <Link
                      key={t.id}
                      href={`/support/tickets/${t.id}`}
                      className="block p-3 rounded-2xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-purple-200 hover:shadow-2xs transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-mono font-bold text-purple-700">#{t.ticket_number || t.id.slice(0, 4)}</span>
                            <span className={`px-1.5 py-0.5 rounded-md border text-[10px] font-bold ${sc.bg}`}>{sc.label}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-800 truncate group-hover:text-purple-700">{t.title}</p>
                          <p className="text-[11px] text-slate-400">
                            {new Date(t.updated_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} • {t.project}
                          </p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-600 shrink-0 mt-1" />
                      </div>
                    </Link>
                  );
                })}
                <Link
                  href="/support/tickets"
                  className="block text-center text-xs font-bold text-purple-600 hover:text-purple-700 py-2 hover:underline"
                >
                  Ouvrir l&apos;historique complet
                </Link>
              </div>
            )}
          </div>

          {/* Conseil rapide */}
          <div className="p-5 rounded-3xl bg-slate-50 border border-black/5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              Conseils
            </h3>
            <ul className="text-xs text-slate-600 leading-relaxed space-y-2 list-disc list-inside">
              <li>Joignez captures (.png/.webp) ou logs (.txt/.md) — 8 Mo max, 5 fichiers / personne / conversation.</li>
              <li>Les tickets inactifs sont purgés après 365 jours (fichiers Z1 inclus).</li>
              <li>Un ticket fermé ne peut qu&apos;être <strong>Réouvert</strong> (autres statuts grisés).</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
