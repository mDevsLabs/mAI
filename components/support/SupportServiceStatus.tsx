"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Info,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  SUPPORT_STATUS_VALUES,
  type SupportStatus,
  type SupportStatusResponse,
  type SupportStatusService,
} from "@/components/support/support-status-types";

const STATUS_PRESENTATION: Record<
  SupportStatus,
  { label: string; description: string; dot: string; text: string; background: string; icon: typeof CheckCircle2 }
> = {
  UP: {
    label: "Opérationnels",
    description: "Aucun incident majeur signalé.",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    background: "bg-emerald-50 border-emerald-200",
    icon: CheckCircle2,
  },
  HASISSUES: {
    label: "Services dégradés",
    description: "Certains services rencontrent des difficultés.",
    dot: "bg-amber-500",
    text: "text-amber-700",
    background: "bg-amber-50 border-amber-200",
    icon: AlertTriangle,
  },
  MINOROUTAGE: {
    label: "Incident mineur",
    description: "Une perturbation mineure est signalée.",
    dot: "bg-orange-500",
    text: "text-orange-700",
    background: "bg-orange-50 border-orange-200",
    icon: AlertTriangle,
  },
  MAJOROUTAGE: {
    label: "Incident majeur",
    description: "Une interruption importante est signalée.",
    dot: "bg-red-500",
    text: "text-red-700",
    background: "bg-red-50 border-red-200",
    icon: AlertTriangle,
  },
  UNDERMAINTENANCE: {
    label: "Maintenance",
    description: "Une opération de maintenance est en cours.",
    dot: "bg-blue-500",
    text: "text-blue-700",
    background: "bg-blue-50 border-blue-200",
    icon: Info,
  },
  UNKNOWN: {
    label: "État indisponible",
    description: "Le fournisseur de statut n'a pas répondu.",
    dot: "bg-slate-400",
    text: "text-slate-600",
    background: "bg-slate-50 border-slate-200",
    icon: Info,
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSupportStatus(value: unknown): value is SupportStatus {
  return typeof value === "string" && (SUPPORT_STATUS_VALUES as readonly string[]).includes(value);
}

function isService(value: unknown): value is SupportStatusService {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    isSupportStatus(value.status) &&
    typeof value.description === "string"
  );
}

function isStatusResponse(value: unknown): value is SupportStatusResponse {
  if (!isRecord(value) || !isRecord(value.page)) return false;
  if (
    typeof value.page.name !== "string" ||
    typeof value.page.url !== "string" ||
    !isSupportStatus(value.page.status) ||
    !Array.isArray(value.services) ||
    !value.services.every(isService) ||
    !Array.isArray(value.components) ||
    !value.components.every(isService) ||
    typeof value.updatedAt !== "string" ||
    (value.source !== "instatus" && value.source !== "cache" && value.source !== "fallback") ||
    typeof value.stale !== "boolean"
  ) {
    return false;
  }
  return value.error === undefined || typeof value.error === "string";
}

function isAbortError(reason: unknown): boolean {
  return (
    (reason instanceof DOMException && reason.name === "AbortError") ||
    (reason instanceof Error && reason.name === "AbortError")
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date inconnue";
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: SupportStatus }) {
  const presentation = STATUS_PRESENTATION[status];
  const Icon = presentation.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${presentation.background} ${presentation.text}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {presentation.label}
    </span>
  );
}

export function SupportServiceStatus() {
  const [data, setData] = useState<SupportStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const loadStatus = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/status", {
        signal,
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Le service de statut a répondu ${response.status}.`);
      }
      const payload: unknown = await response.json();
      if (!isStatusResponse(payload)) {
        throw new Error("Réponse de statut invalide.");
      }
      setData(payload);
    } catch (reason: unknown) {
      if (isAbortError(reason)) return;
      setData(null);
      setError("Le statut des services est momentanément indisponible.");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadStatus(controller.signal);
    return () => controller.abort();
  }, [loadStatus, refreshToken]);

  const refresh = () => setRefreshToken((value) => value + 1);
  const presentation = data ? STATUS_PRESENTATION[data.page.status] : STATUS_PRESENTATION.UNKNOWN;
  const GlobalIcon = presentation.icon;

  return (
    <section className="space-y-4" aria-labelledby="support-status-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
            <Activity className="h-4 w-4" aria-hidden="true" />
            État des services
          </p>
          <h2 id="support-status-title" className="mt-1 text-lg font-extrabold text-slate-900">
            La plateforme fonctionne-t-elle ?
          </h2>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Actualiser
        </button>
      </div>

      <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm" aria-busy={loading}>
        {loading && !data ? (
          <div className="flex items-center gap-3 py-5 text-sm text-slate-500" role="status">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" aria-hidden="true" />
            Chargement de l&apos;état des services…
          </div>
        ) : error ? (
          <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4" role="alert">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-amber-900">Statut indisponible</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-800">{error}</p>
              <button type="button" onClick={refresh} className="mt-3 text-xs font-bold text-amber-900 underline">
                Réessayer
              </button>
            </div>
          </div>
        ) : data ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${presentation.background} ${presentation.text}`}>
                  <GlobalIcon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-slate-900">{data.page.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <StatusBadge status={data.page.status} />
                    <span className="text-[11px] text-slate-500">{presentation.description}</span>
                  </div>
                </div>
              </div>
              <div className="text-left text-[11px] text-slate-400 sm:text-right">
                <p>Mis à jour le {formatDate(data.updatedAt)}</p>
                {data.stale || data.source !== "instatus" ? (
                  <p className="mt-1 inline-flex items-center gap-1 font-semibold text-amber-600">
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                    Données de repli ou ancien instantané
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
              <span className="text-xs font-semibold text-slate-500">État global :</span>
              <StatusBadge status={data.page.status} />
              {data.stale ? (
                <span className="text-[11px] text-slate-500">Les informations peuvent être anciennes.</span>
              ) : null}
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Composants surveillés</h3>
                <span className="text-[11px] text-slate-400">{data.services.length} service(s)</span>
              </div>
              {data.services.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {data.services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-800">{service.name}</p>
                        {service.description ? <p className="mt-0.5 truncate text-[10px] text-slate-400">{service.description}</p> : null}
                      </div>
                      <span className="flex shrink-0 items-center gap-1.5 text-[10px] font-bold">
                        <span className={`h-2 w-2 rounded-full ${STATUS_PRESENTATION[service.status].dot}`} aria-hidden="true" />
                        <span className={STATUS_PRESENTATION[service.status].text}>{STATUS_PRESENTATION[service.status].label}</span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
                  Le fournisseur ne publie pas encore le détail par service. Consultez la page publique pour les annonces.
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <p className="text-[11px] text-slate-400">Source : {data.source === "instatus" ? "Instatus" : "repli local"}</p>
              <Link
                href={data.page.url || "https://mai.instatus.com/"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
              >
                Voir la page de statut <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
