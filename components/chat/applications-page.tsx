/**
 * Composant ApplicationsPage — Grille d'applications intégrées à mAI
 * Actuellement : Studio, Humanizy, Traduction
 * 
 * @version 0.0.7
 */
"use client";

import { SparklesIcon } from "lucide-react";
import Link from "next/link";

// Icônes SVG personnalisées
const StudioIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
    <circle cx="9" cy="9" r="2"/>
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    <path d="M16 5h4"/>
    <path d="M18 3v4"/>
  </svg>
);

const HumanizyIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

const TranslationIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m5 8 6 6"/>
    <path d="m4 14 6-6 2-3"/>
    <path d="M2 5h12"/>
    <path d="m22 22-5-10-5 10"/>
    <path d="M14 18h6"/>
  </svg>
);

const CoderIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
    <line x1="14" y1="4" x2="10" y2="20"/>
  </svg>
);

const SpeakyIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 1v22"/>
    <path d="M17 5v14"/>
    <path d="M2 9v6"/>
    <path d="M22 9v6"/>
    <path d="M7 7v10"/>
  </svg>
);

// Applications disponibles
const apps = [
  {
    id: "studio",
    name: "Studio",
    description:
      "Générez des images avec l'IA. Utilisez AI Horde ou FranceStudent pour créer des visuels uniques.",
    icon: StudioIcon,
    href: "/applications/studio",
    gradient: "from-violet-500/20 to-fuchsia-500/20",
    iconColor: "text-violet-500",
    badge: "Bêta",
  },
  {
    id: "humanizy",
    name: "Humanizy",
    description:
      "Détectez si un contenu (texte, image, fichier) a été créé par une intelligence artificielle.",
    icon: HumanizyIcon,
    href: "/applications/humanizy",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500",
    badge: "Nouveau",
  },
  {
    id: "translation",
    name: "Traduction",
    description:
      "Traduisez vos textes dans plusieurs langues simultanément avec analyse lexicale.",
    icon: TranslationIcon,
    href: "/applications/translation",
    gradient: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-500",
    badge: "Nouveau",
  },
  {
    id: "coder",
    name: "Coder",
    description:
      "Environnement de développement avec IA, terminal et gestion de fichiers.",
    icon: CoderIcon,
    href: "/applications/coder",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-500",
    badge: "Nouveau",
  },
  {
    id: "speaky",
    name: "Speaky",
    description:
      "Génération d'audios par IA et synthèse vocale avancée.",
    icon: SpeakyIcon,
    href: "/applications/speaky",
    gradient: "from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-500",
    badge: "Nouveau",
  },
];

export function ApplicationsPage() {
  return (
    <div className="flex h-dvh flex-col overflow-auto bg-background">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Applications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Découvrez les applications intégrées à mAI pour enrichir votre
            expérience.
          </p>
        </div>

        {/* Grille d'applications */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <Link
              className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-float)]"
              href={app.href}
              key={app.id}
            >
              {/* Gradient background subtil */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              />

              {/* Badge */}
              {app.badge && (
                <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-2 py-0.5 text-[10px] font-medium text-white">
                  {app.badge}
                </span>
              )}

              <div className="relative">
                {/* Icône */}
                <div
                  className={`mb-4 flex size-12 items-center justify-center rounded-xl bg-muted/50 ${app.iconColor} transition-transform duration-300 group-hover:scale-110`}
                >
                  <app.icon className="size-6" />
                </div>

                {/* Nom */}
                <h3 className="mb-1 text-base font-semibold text-foreground">
                  {app.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {app.description}
                </p>

                {/* Action */}
                <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <SparklesIcon className="size-3" />
                  Ouvrir
                </div>
              </div>
            </Link>
          ))}

          {/* Placeholder — prochaines apps */}
          <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-border/40 p-6">
            <p className="text-center text-xs text-muted-foreground/50">
              D&apos;autres applications arrivent bientôt...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
