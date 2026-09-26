"use client";

import { Layers } from "lucide-react";

interface UsageKey {
  keyRef?: string;
  prefix?: string;
  name?: string;
  plan?: string;
  requestCount?: number;
  maxLimit?: number | null;
  lastUsedAt?: string | null;
}

export function ApiKeysUsageTable({ keys }: { keys: UsageKey[] }) {
  return (
    <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] mt-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Consommation par Clé API</h3>
          <p className="text-sm text-slate-500">Détail de l'utilisation par clé individuelle</p>
        </div>
        <div className="p-2 bg-slate-100 rounded-xl">
          <Layers className="w-5 h-5 text-slate-600" />
        </div>
      </div>

      {keys.length === 0 ? (
        <p className="text-center py-8 text-slate-500 italic">Aucune clé API trouvée.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Clé API</th>
                <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Requêtes Consommées</th>
                <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Limite Max</th>
                <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Dernière Utilisation</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key, index) => {
                const requestCount = Number(key.requestCount || 0);
                const maxLimit = key.maxLimit ?? null;
                const percentUsed = maxLimit ? Math.round((requestCount / maxLimit) * 100) : 0;
                const publicRef = key.keyRef || key.prefix || "clé-api";
                return (
                  <tr
                    key={key.keyRef || index}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-mono">
                          {publicRef}
                        </code>
                        <span className="text-[10px] uppercase font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          {key.name || key.plan || "Clé API"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 font-bold text-slate-900">{requestCount.toLocaleString("fr-FR")}</td>
                    <td className="py-4">
                      {maxLimit ? (
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-slate-700">{maxLimit.toLocaleString("fr-FR")}</span>
                          <div className="flex-1 max-w-[100px] h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                percentUsed > 90
                                  ? "bg-red-500"
                                  : percentUsed > 75
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.min(percentUsed, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">{percentUsed}%</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500 italic">Illimité (Quota global)</span>
                      )}
                    </td>
                    <td className="py-4 text-sm text-slate-500">
                      {key.lastUsedAt
                        ? new Date(key.lastUsedAt).toLocaleString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Jamais"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
