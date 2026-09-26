"use client";

import { Key } from "lucide-react";
import type { ApiKeyMetadata } from "@/lib/api-key-types";

type RequestKeySelectorProps = {
  keys: ApiKeyMetadata[];
  selectedKeyRef: string;
  onSelect: (keyRef: string) => void;
};

export function RequestKeySelector({
  keys,
  selectedKeyRef,
  onSelect,
}: RequestKeySelectorProps) {
  return (
    <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-xl space-y-2">
      <label className="text-xs font-bold text-purple-950 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Key className="w-3.5 h-3.5 text-purple-600" />
          Clé API d&apos;exécution :
        </span>
        <a href="/account/keys" className="text-[10px] text-purple-700 font-bold hover:underline">
          Mes Clés
        </a>
      </label>

      {keys.length > 0 ? (
        <select
          value={selectedKeyRef}
          onChange={(event) => onSelect(event.target.value)}
          className="w-full text-xs font-mono bg-white border border-purple-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
        >
          {keys.map((key) => (
            <option key={key.keyRef} value={key.keyRef}>
              {key.name} ({key.keyRef})
            </option>
          ))}
        </select>
      ) : (
        <p className="text-[11px] text-purple-700 italic">
          Aucune clé active. Les routes publiques restent disponibles ; les autres nécessitent une clé.{" "}
          <a href="/account/keys" className="underline font-bold">Gérer les clés</a>.
        </p>
      )}
      <p className="text-[10px] text-purple-700">
        L&apos;exécution injecte la clé résolue côté serveur. Les extraits utilisent VOTRE_CLE_API.
      </p>
    </div>
  );
}
