"use client";

import { type FormEvent } from "react";
import { KeyRound, Loader2, Sparkles } from "lucide-react";

export function UpgradeCodeSection({
  code,
  error,
  upgrading,
  onCodeChange,
  onSubmit,
}: {
  code: string;
  error: string;
  upgrading: boolean;
  onCodeChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void | Promise<void>;
}) {
  return (
    <section
      id="upgrade-code"
      className="scroll-mt-28 bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-4"
    >
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <KeyRound className="w-5 h-5 text-purple-600" /> Activer un Code d&apos;Upgrade
      </h2>
      <p className="text-sm text-slate-600">
        Saisissez un code d&apos;accès Plus, Pro ou Max pour augmenter votre forfait mAI.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={code}
          onChange={(event) => onCodeChange(event.target.value.toUpperCase())}
          placeholder="CODE-XXXX"
          autoComplete="off"
          className="flex-1 px-4 py-2.5 rounded-xl bg-white/60 border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-900 placeholder-slate-400 uppercase tracking-wider"
        />
        <button
          type="submit"
          disabled={upgrading}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          {upgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Activer
        </button>
      </form>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
    </section>
  );
}
