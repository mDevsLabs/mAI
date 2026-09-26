"use client";

import { KeyRound, ShieldAlert } from "lucide-react";
import Link from "next/link";
import type { UserApiKeyUsage } from "@/app/actions/api-keys";

type KeyCatalogBannerProps = {
  activeKeyRef: string | null;
  availableKeys: UserApiKeyUsage[];
  onSelect: (keyRef: string) => void;
};

export function KeyCatalogBanner({
  activeKeyRef,
  availableKeys,
  onSelect,
}: KeyCatalogBannerProps) {
  if (availableKeys.length > 0) {
    return (
      <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-purple-900 font-medium">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-purple-600 shrink-0" />
          <span className="font-bold">Clé pour le catalogue :</span>
          <select
            value={activeKeyRef || ""}
            onChange={(event) => onSelect(event.target.value)}
            className="rounded-xl border border-purple-200 bg-white px-2.5 py-1.5 font-mono text-[11px] font-bold text-purple-800"
          >
            <option value="">Consultation publique (Free)</option>
            {availableKeys.map((key) => (
              <option key={key.keyRef} value={key.keyRef}>
                {key.name} ({key.keyRef})
              </option>
            ))}
          </select>
        </div>
        <Link href="/account/keys" className="text-purple-600 hover:text-purple-700 font-bold hover:underline">
          Gérer les clés →
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span>Aucune clé API trouvée. Les modèles sont affichés en mode consultation publique.</span>
      </div>
      <Link href="/account/keys" className="font-bold text-amber-800 underline hover:text-amber-900">
        Créer une clé API
      </Link>
    </div>
  );
}
