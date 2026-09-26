"use client";

import { Cpu, Image as ImageIcon, Volume2 } from "lucide-react";
import Link from "next/link";

export type ModelCatalogSection = "text" | "images" | "audio" | "mai";

const ITEMS = [
  { id: "text", href: "/account/models", label: "Modèles Texte" },
  { id: "images", href: "/account/models/images", label: "Modèles Images", icon: ImageIcon },
  { id: "audio", href: "/account/models/audio", label: "Modèles Audio", icon: Volume2 },
  { id: "mai", href: "/account/models/mai", label: "Modèles mAI", icon: Cpu },
] as const;

export function ModelNavigation({ active }: { active: ModelCatalogSection }) {
  return (
    <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/60 w-fit overflow-x-auto">
      {ITEMS.map((item) => {
        const isActive = item.id === active;
        const Icon = "icon" in item ? item.icon : null;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              isActive
                ? "bg-white text-purple-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5 text-purple-600" />}
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
