"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bug,
  HelpCircle,
  PlusCircle,
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
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getTicketsList, getSupportStats } from "@/app/actions/support";
import { isAdminUser, type SupportTicket } from "@/app/actions/support-utils";

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

const PRIORITY_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  urgent: { label: "Critique", bg: "bg-red-100 text-red-700 border-red-200", text: "text-red-700" },
  high: { label: "Haute", bg: "bg-orange-100 text-orange-700 border-orange-200", text: "text-orange-700" },
  medium: { label: "Normale", bg: "bg-emerald-100 text-emerald-700 border-emerald-200", text: "text-emerald-700" },
  low: { label: "Faible", bg: "bg-blue-100 text-blue-700 border-blue-200", text: "text-blue-700" },
};

export default function SupportDashboardClient() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
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
        const [ticketsRes, statsRes] = await Promise.all([
          getTicketsList({
            userId: String(user.id || user.email),
            userEmail: user.email,
          }),
          getSupportStats(String(user.id || user.email), user.email),
        ]);

        if (ticketsRes.success && ticketsRes.tickets) {
          setTickets(ticketsRes.tickets.slice(0, 5));
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

    if (!authLoading) {
      loadData();
    }
  }, [authLoading, isAuthenticated, user]);

  return (
    <div className="space-y-10">
      {/* Alerte / Badge Admin si connecté en tant que Mathias */}
      {isAdmin && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Mode Administrateur Support Actif
              </p>
              <p className="text-xs text-slate-500">
                Vous êtes connecté avec l&apos;adresse <span className="font-semibold text-purple-700">{user?.email}</span>. Vous avez accès à l&apos;intégralité des tickets et métriques globales.
              </p>
            </div>
          </div>
          <Link
            href="/support/tickets"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-sm shrink-0"
          >
            Gérer tous les tickets ({stats?.total || 0})
          </Link>
        </div>
      )}

      {/* Cartes d'action principales */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Carte 1 : Signaler un Bug */}
        <Link
          href="/support/new?type=bug"
          className="group relative p-6 rounded-3xl border border-red-100 bg-gradient-to-b from-white to-red-50/30 hover:to-red-50/60 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bug className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 group-hover:text-red-600 transition-colors">
                Signaler un bug
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Une anomalie dans l&apos;interface, un crash de CLI ou une erreur sur une route d&apos;API ? Décrivez le problème avec vos logs.
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center text-xs font-bold text-red-600 group-hover:translate-x-1 transition-transform">
            Ouvrir un rapport d&apos;incident
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </Link>

        {/* Carte 2 : Demande d'Assistance */}
        <Link
          href="/support/new?type=question"
          className="group relative p-6 rounded-3xl border border-purple-100 bg-gradient-to-b from-white to-purple-50/30 hover:to-purple-50/60 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 group-hover:text-purple-600 transition-colors">
                Demande d&apos;assistance
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Une question sur votre abonnement, vos clés d&apos;API, vos quotas de tokens ou le paramétrage des modèles d&apos;IA.
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
            Poser une question
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </Link>

        {/* Carte 3 : Historique & Tickets */}
        <Link
          href="/support/tickets"
          className="group relative p-6 rounded-3xl border border-blue-100 bg-gradient-to-b from-white to-blue-50/30 hover:to-blue-50/60 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                Mes tickets & Échanges
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Accédez à l&apos;historique complet de vos demandes, suivez la progression en temps réel et répondez aux messages de l&apos;équipe.
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
            Consulter l&apos;historique
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </Link>
      </section>

      {/* Bandeau d'état des statistiques rapides */}
      {stats && (
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-2xs">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tickets actifs</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{(stats.open || 0) + (stats.inProgress || 0)}</p>
            <p className="text-[11px] text-amber-600 font-medium mt-1">En cours de prise en charge</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-2xs">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Résolus</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{stats.resolved || 0}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Dossiers traités avec succès</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-2xs">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Taux de résolution</p>
            <p className="text-2xl font-black text-purple-600 mt-1">{stats.resolutionRate || 100}%</p>
            <p className="text-[11px] text-purple-600 font-medium mt-1">Efficacité de l&apos;équipe</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-2xs">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Temps moyen</p>
            <p className="text-2xl font-black text-blue-600 mt-1">{stats.avgResolutionHours || 2.4}h</p>
            <p className="text-[11px] text-blue-600 font-medium mt-1">Délai estimé de clôture</p>
          </div>
        </section>
      )}

      {/* Section des tickets récents */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">
              {isAdmin ? "Derniers tickets reçus" : "Vos demandes récentes"}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold">
              {tickets.length}
            </span>
          </div>
          <Link
            href="/support/tickets"
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 hover:underline"
          >
            Voir tous les tickets
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16 bg-white rounded-3xl border border-black/5">
            <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
              <span>Chargement de vos demandes...</span>
            </div>
          </div>
        ) : !isAuthenticated ? (
          <div className="p-8 rounded-3xl bg-white border border-black/5 text-center space-y-3">
            <FileQuestion className="w-10 h-10 mx-auto text-slate-400" />
            <h3 className="text-base font-bold text-slate-800">
              Connectez-vous pour suivre vos demandes
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              La création et le suivi de tickets nécessitent d&apos;être authentifié sur la plateforme mAI afin d&apos;assurer la traçabilité de vos données.
            </p>
            <div className="pt-2">
              <Link
                href="/account/login?next=/support"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-colors shadow-sm"
              >
                Se connecter à mon compte
              </Link>
            </div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-black/5 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/80" />
            <h3 className="text-base font-bold text-slate-800">
              Aucun ticket en cours
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Vous n&apos;avez signalé aucun incident ou problème récemment. Tous les voyants sont au vert !
            </p>
            <div className="pt-2">
              <Link
                href="/support/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Créer une nouvelle demande
              </Link>
            </div>
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
                        <span className="text-xs font-mono font-bold text-purple-700">
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
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors truncate">
                        {t.title}
                      </h3>
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

      {/* Guide rapide & FAQ */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-black/5 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Engagements & Conseils pour un traitement optimal
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-4 rounded-2xl bg-white border border-black/5 space-y-1">
            <p className="font-bold text-slate-900">Notification par e-mail en direct</p>
            <p>
              Chaque ticket envoyé prévient immédiatement l&apos;équipe d&apos;ingénierie mAI. Dès qu&apos;une réponse est apportée, un courriel vous est expédié pour vous inviter à consulter la solution.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-black/5 space-y-1">
            <p className="font-bold text-slate-900">Précision de reproduction</p>
            <p>
              Pour les signalements de bugs, indiquez le comportement attendu, les messages d&apos;erreurs reçus ainsi que les commandes ou requêtes précises ayant provoqué l&apos;incident.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-black/5 space-y-1">
            <p className="font-bold text-slate-900">Niveaux de priorité</p>
            <p>
              Le niveau <strong>Critique / Urgent</strong> est réservé aux pannes majeures rendant l&apos;accès à l&apos;API ou aux modèles totalement indisponible. Les demandes classiques sont traitées en priorité Normale.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
