"use client";

import { Check, Code2, Copy } from "lucide-react";
import type { RequestCodeTab } from "./request-snippets";

const TABS: readonly RequestCodeTab[] = ["curl", "fetch", "python", "node"];

type RequestCodePanelProps = {
  activeCodeTab: RequestCodeTab;
  code: string;
  copied: boolean;
  onTabChange: (tab: RequestCodeTab) => void;
  onCopy: () => void;
};

export function RequestCodePanel({
  activeCodeTab,
  code,
  copied,
  onTabChange,
  onCopy,
}: RequestCodePanelProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-200 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-bold text-white">Code d&apos;appel dynamique</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`px-3 py-1.5 rounded-lg transition-colors capitalize ${
                  activeCodeTab === tab
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab === "fetch" ? "JS (Fetch)" : tab === "node" ? "Node.js" : tab}
              </button>
            ))}
          </div>
          <button
            onClick={onCopy}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
            title="Copier le code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <pre className="font-mono text-xs text-purple-200/90 bg-slate-950/60 p-4 rounded-xl overflow-x-auto border border-slate-800/80 leading-relaxed">
        {code}
      </pre>
    </div>
  );
}
