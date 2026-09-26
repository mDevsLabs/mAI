"use client";

import {
  Cloud,
  Gauge,
  Image as ImageIcon,
  KeyRound,
  Monitor,
  RefreshCw,
  Sparkles,
  User,
  Volume2,
  type LucideIcon,
} from "lucide-react";

export const ACCOUNT_SECTION_IDS = [
  "profil",
  "usage-api",
  "usage-images",
  "usage-audio",
  "usage-mai",
  "usage-cloud",
  "appareils",
  "resets",
  "upgrade-code",
] as const;

export type AccountSectionId = (typeof ACCOUNT_SECTION_IDS)[number];

const ITEMS: Array<{ id: AccountSectionId; label: string; icon: LucideIcon }> = [
  { id: "profil", label: "Profil & Paramètres", icon: User },
  { id: "usage-api", label: "Usage API", icon: KeyRound },
  { id: "usage-images", label: "Usage Images", icon: ImageIcon },
  { id: "usage-audio", label: "Usage Audio", icon: Volume2 },
  { id: "usage-mai", label: "Usage mAI", icon: Gauge },
  { id: "usage-cloud", label: "Stockage Cloud", icon: Cloud },
  { id: "appareils", label: "Appareils Connectés", icon: Monitor },
  { id: "resets", label: "Réinitialisations", icon: RefreshCw },
  { id: "upgrade-code", label: "Activer un Code", icon: Sparkles },
];

export function AccountNavigation({
  activeSection,
  onNavigate,
}: {
  activeSection: string;
  onNavigate: (id: AccountSectionId) => void;
}) {
  return (
    <aside className="w-full md:w-64 shrink-0">
      <nav className="sticky top-24 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                active
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-white/40 text-slate-600 hover:bg-white border border-slate-200/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
