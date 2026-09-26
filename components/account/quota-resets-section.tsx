"use client";

import { Loader2, RefreshCw } from "lucide-react";

import type { AvailableResetItem } from "@/app/actions/resets";

const BADGES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  all: { label: "Tous les Quotas", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  api: { label: "Quotas API", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  mai: { label: "Tokens mAI", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  images: { label: "Images Quotidiennes", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  audio: { label: "Synthèse Audio", bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
};

export function QuotaResetsSection({
  resets,
  loading,
  claimingId,
  onRefresh,
  onClaim,
}: {
  resets: AvailableResetItem[];
  loading: boolean;
  claimingId: number | null;
  onRefresh: () => void | Promise<void>;
  onClaim: (id: number) => void | Promise<void>;
}) {
  return (
    <section
      id="resets"
      className="scroll-mt-28 bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <RefreshCw className="w-5 h-5 text-purple-600" /> Réinitialisations de Quotas
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Consultez et activez les réinitialisations de limites qui vous ont été accordées.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white/60 hover:bg-white text-slate-700 border border-slate-200/80 shadow-sm transition-all flex items-center gap-2 text-xs font-bold cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Actualiser
        </button>
      </div>

      {resets.length === 0 ? (
        <div className="text-center py-10 px-4 bg-white/30 rounded-2xl border border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
            <RefreshCw className="w-6 h-6 opacity-60" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">Aucune réinitialisation en attente</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Toutes vos réinitialisations disponibles ont été utilisées ou aucune ne vous a été attribuée.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/70 shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Quota concerné</th>
                <th className="px-5 py-3.5">Attribué le</th>
                <th className="px-5 py-3.5">Expiration</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 font-medium">
              {resets.map((reset) => {
                const badge = BADGES[reset.resetType] || {
                  label: reset.resetType,
                  bg: "bg-slate-50",
                  text: "text-slate-700",
                  border: "border-slate-200",
                };
                const claiming = claimingId === reset.id;
                return (
                  <tr key={reset.id} className="hover:bg-white/90 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(reset.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold whitespace-nowrap">
                      {reset.expiresAt ? (
                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {new Date(reset.expiresAt).toLocaleString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">Illimitée</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onClaim(reset.id)}
                        disabled={claiming}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                      >
                        {claiming ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Réinitialisation…
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" /> Réinitialiser
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
