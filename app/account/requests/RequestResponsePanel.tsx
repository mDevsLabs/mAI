"use client";

import { Check, Clock, Copy, Download, Sparkles, Terminal } from "lucide-react";

type RequestResponsePanelProps = {
  copied: boolean;
  latencyMs: number | null;
  onCopy: () => void;
  onExport: () => void;
  responseData: string;
  status: number | null;
};

export function RequestResponsePanel({
  copied,
  latencyMs,
  onCopy,
  onExport,
  responseData,
  status,
}: RequestResponsePanelProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">Résultat de la réponse</h3>
        </div>
        {status !== null && (
          <div className="flex items-center gap-3 text-xs font-mono">
            <span
              className={`px-2.5 py-1 rounded-full font-bold ${
                status >= 200 && status < 300
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {status} {status >= 200 && status < 300 ? "OK" : "Error"}
            </span>
            {latencyMs !== null && (
              <span className="flex items-center gap-1 text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                {latencyMs} ms
              </span>
            )}
          </div>
        )}
      </div>

      {responseData ? (
        <div className="space-y-3">
          <pre className="font-mono text-xs bg-slate-950 text-emerald-400 p-4 rounded-xl overflow-x-auto max-h-96 border border-slate-900 leading-relaxed shadow-inner">
            {responseData}
          </pre>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={onCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Réponse copiée !" : "Copier le JSON"}</span>
            </button>
            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter (.json)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-slate-400 space-y-2 border-2 border-dashed border-slate-200 rounded-xl">
          <Sparkles className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-xs font-medium">
            Cliquez sur &quot;Exécuter la requête sur Val Town&quot; pour afficher les données de réponse en temps réel.
          </p>
        </div>
      )}
    </div>
  );
}
