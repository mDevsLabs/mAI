"use client";

import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  FileQuestion,
  Loader2,
  MessageSquare,
  PlusCircle,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getSupportStats, getTicketsList } from "@/app/actions/support";
import { isAdminUser, type SupportTicket } from "@/app/actions/support-utils";
import { PRIORITY_BADGES, STATUS_CONFIG } from "@/components/support/support-config";
import { SupportDocumentationSearch } from "@/components/support/SupportDocumentationSearch";
import { SupportKnowledgeBase } from "@/components/support/SupportKnowledgeBase";
import { SupportServiceStatus } from "@/components/support/SupportServiceStatus";

const ACTIVE_TICKET_STATUSES = new Set<SupportTicket["status"]>([
  "open",
  "in_progress",
  "waiting_user",
  "reopened",
]);

type DashboardStats = {
  total?: number;
  totalWithArchived?: number;
  open?: number;
  inProgress?: number;
  reopened?: number;
  waiting?: number;
  resolved?: number;
  closed?: number;
  resolutionRate?: number | null;
  avgResolutionHours?: number | null;
};

function formatCount(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "—";
}

function formatHours(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return `${Number.isInteger(value) ? value : value.toFixed(1)}h`;
}

export default function SupportDashboardClient() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [historyTickets, setHistoryTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const isAdmin = isAdminUser(user?.email);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (!isAuthenticated || !user) {
        if (!cancelled) {
          setTickets([]);
          setActiveCount(0);
          setHistoryTickets([]);
          setStats(null);
          setDashboardError(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setDashboardError(null);
      try {
        // Un seul appel fournit la source commune aux vues actives et historique.
        const [ticketsRes, statsRes] = await Promise.all([
          getTicketsList({ status: "all" }),
          getSupportStats(),
        ]);
        if (cancelled) return;

        const allTickets = ticketsRes.success && Array.isArray(ticketsRes.tickets) ? ticketsRes.tickets : [];
        const activeTickets = allTickets.filter((ticket) => ACTIVE_TICKET_STATUSES.has(ticket.status));
        const completedTickets = allTickets.filter((ticket) => !ACTIVE_TICKET_STATUSES.has(ticket.status));

        setActiveCount(activeTickets.length);
        setTickets(activeTickets.slice(0, 6));
        setHistoryTickets(completedTickets.slice(0, 8));
        setStats(statsRes.success && statsRes.stats ? (statsRes.stats as DashboardStats) : null);

        if (!ticketsRes.success) {
          setDashboardError(ticketsRes.error || "Impossible de charger les tickets.");
        } else if (!statsRes.success) {
          setDashboardError(statsRes.error || "Les statistiques sont indisponibles.");
        }
      } catch (error: unknown) {
        if (cancelled) return;
        console.error("Erreur chargement dashboard support:", error);
        setDashboardError("Impossible de charger le centre de support pour le moment.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (!authLoading) void loadData();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, user]);

  const activeStat =
    stats &&
    [stats.open, stats.inProgress, stats.reopened, stats.waiting].reduce<number>(
      (sum, value) => sum + (typeof value === "number" ? value : 0),
      0,
    );
  // Une base sans dossier n'a pas de taux ni de durée réels à afficher.
  const resolutionRateValue = stats?.resolutionRate ?? null;
  const resolutionRate =
    stats && (stats.total ?? 0) > 0 && typeof resolutionRateValue === "number" && Number.isFinite(resolutionRateValue)
      ? resolutionRateValue
      : null;
  const resolvedCount = (stats?.resolved ?? 0) + (stats?.closed ?? 0);
  const avgResolutionHoursValue = stats?.avgResolutionHours ?? null;
  const avgResolutionHours =
    stats && resolvedCount > 0 && typeof avgResolutionHoursValue === "number" && Number.isFinite(avgResolutionHoursValue)
      ? avgResolutionHoursValue
      : null;

  return (
    <div className="space-y-8">
      {isAdmin ? (
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-600 p-2 text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
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
            className="shrink-0 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-purple-500"
          >
            Gérer tous les tickets ({formatCount(stats?.totalWithArchived ?? stats?.total)})
          </Link>
        </div>
      ) : null}

      {dashboardError && isAuthenticated ? (
        <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800" role="status">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{dashboardError}</span>
        </div>
      ) : null}

      {stats ? (
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Statistiques du support">
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-2xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tickets actifs</p>
            <p className="mt-1 text-3xl font-black text-slate-900">{formatCount(activeStat)}</p>
            <p className="mt-1 text-[11px] font-medium text-amber-600">En cours de prise en charge</p>
          </div>
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-2xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Résolus</p>
            <p className="mt-1 text-3xl font-black text-emerald-600">{formatCount(stats.resolved)}</p>
            <p className="mt-1 text-[11px] font-medium text-emerald-600">Dossiers traités</p>
          </div>
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-2xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Taux de résolution</p>
            <p className="mt-1 text-3xl font-black text-purple-600">{resolutionRate === null ? "—" : `${resolutionRate}%`}</p>
            <p className="mt-1 text-[11px] font-medium text-purple-600">
              {resolutionRate === null ? "Donnée non calculée" : "Efficacité"}
            </p>
          </div>
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-2xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Temps moyen</p>
            <p className="mt-1 text-3xl font-black text-blue-600">{formatHours(avgResolutionHours)}</p>
            <p className="mt-1 text-[11px] font-medium text-blue-600">
              {avgResolutionHours === null ? "Donnée non calculée" : "Délai observé"}
            </p>
          </div>
        </section>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2" aria-labelledby="active-tickets-title">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 id="active-tickets-title" className="text-lg font-extrabold text-slate-900">
                {isAdmin ? "Tickets actifs" : "Vos tickets actifs"}
              </h2>
              <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700">{activeCount}</span>
            </div>
            <Link href="/support/tickets" className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline">
              Voir tous <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 rounded-3xl border border-black/5 bg-white py-12 text-sm font-medium text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-purple-600" aria-hidden="true" />
              <span>Chargement…</span>
            </div>
          ) : !isAuthenticated ? (
            <div className="space-y-3 rounded-3xl border border-black/5 bg-white p-8 text-center">
              <FileQuestion className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
              <h3 className="text-base font-bold text-slate-800">Connectez-vous pour suivre vos demandes</h3>
              <p className="mx-auto max-w-md text-xs text-slate-500">
                Le suivi nécessite une authentification pour garantir la traçabilité.
              </p>
              <Link
                href="/account/login?next=/support"
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-purple-500"
              >
                Se connecter
              </Link>
            </div>
          ) : tickets.length === 0 ? (
            <div className="space-y-3 rounded-3xl border border-black/5 bg-white p-8 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500/80" aria-hidden="true" />
              <h3 className="text-base font-bold text-slate-800">Aucun ticket actif</h3>
              <p className="mx-auto max-w-md text-xs text-slate-500">
                Tous les dossiers sont résolus ou archivés. Créez une nouvelle demande si besoin.
              </p>
              <Link
                href="/support/new"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-slate-800"
              >
                <PlusCircle className="h-4 w-4" aria-hidden="true" /> Créer une demande
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => {
                const statusConfig = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
                const StatusIcon = statusConfig.icon;
                const priorityConfig = PRIORITY_BADGES[ticket.priority] ?? PRIORITY_BADGES.medium;
                return (
                  <Link
                    key={ticket.id}
                    href={`/support/tickets/${ticket.id}`}
                    className="group block rounded-2xl border border-black/5 bg-white p-4 transition-all hover:border-purple-200 hover:shadow-md sm:p-5"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-purple-700">
                            #TICK-{ticket.ticket_number || ticket.id.slice(0, 6)}
                          </span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">{ticket.project}</span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{ticket.category}</span>
                          <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${priorityConfig.bg}`}>{priorityConfig.label}</span>
                        </div>
                        <h3 className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-purple-600 sm:text-base">{ticket.title}</h3>
                        {isAdmin ? (
                          <p className="text-xs font-medium text-slate-500">
                            Demandeur : <span className="font-semibold text-slate-800">{ticket.user_name}</span> ({ticket.user_email})
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusConfig.bg}`}>
                          <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                          {statusConfig.label}
                        </span>
                        <ChevronRight className="h-4 w-4 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-purple-600" aria-hidden="true" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-4 lg:col-span-1" aria-labelledby="ticket-history-title">
          <div className="flex items-center justify-between gap-3">
            <h2 id="ticket-history-title" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
              Historique
            </h2>
            <Link href="/support/tickets" className="text-[11px] font-bold text-slate-500 hover:text-slate-700">
              Tout voir
            </Link>
          </div>

          <div className="space-y-3 rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-4 w-4 animate-spin text-purple-600" aria-label="Chargement de l'historique" />
              </div>
            ) : historyTickets.length === 0 ? (
              <div className="space-y-2 py-8 text-center">
                <FileQuestion className="mx-auto h-8 w-8 text-slate-300" aria-hidden="true" />
                <p className="text-xs text-slate-500">Aucun historique pour l&apos;instant.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {historyTickets.map((ticket) => {
                  const statusConfig = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
                  return (
                    <Link
                      key={ticket.id}
                      href={`/support/tickets/${ticket.id}`}
                      className="group block rounded-2xl border border-slate-100 bg-slate-50 p-3 transition-all hover:border-purple-200 hover:bg-white hover:shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] font-bold text-purple-700">#{ticket.ticket_number || ticket.id.slice(0, 4)}</span>
                            <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${statusConfig.bg}`}>{statusConfig.label}</span>
                          </div>
                          <p className="truncate text-xs font-bold text-slate-800 group-hover:text-purple-700">{ticket.title}</p>
                          <p className="text-[11px] text-slate-400">
                            {new Date(ticket.updated_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} • {ticket.project}
                          </p>
                        </div>
                        <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-purple-600" aria-hidden="true" />
                      </div>
                    </Link>
                  );
                })}
                <Link href="/support/tickets" className="block py-2 text-center text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline">
                  Ouvrir l&apos;historique complet
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-3 rounded-3xl border border-black/5 bg-slate-50 p-5">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <TrendingUp className="h-4 w-4 text-purple-600" aria-hidden="true" />
              Conseils
            </h3>
            <ul className="list-inside list-disc space-y-2 text-xs leading-relaxed text-slate-600">
              <li>Joignez captures (.png/.webp) ou logs (.txt/.md) — 8 Mo max, 5 fichiers / personne / conversation.</li>
              <li>Les tickets inactifs sont purgés après 365 jours (fichiers Z1 inclus).</li>
              <li>Un ticket fermé ne peut qu&apos;être <strong>Réouvert</strong> (autres statuts grisés).</li>
            </ul>
          </div>
        </aside>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <SupportServiceStatus />
        <SupportDocumentationSearch />
      </div>

      <SupportKnowledgeBase />
    </div>
  );
}
