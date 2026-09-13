"use client";

import Link from "next/link";
import { FooterLegal } from "@/components/footer-legal";

const footerColumns: { title: string; links: { name: string; href: string }[] }[] = [
  {
    title: "Produits",
    links: [
      { name: "Vibe", href: "/projects/vibe" },
      { name: "Web", href: "/projects/web" },
      { name: "Pulse", href: "/projects/pulse" },
      { name: "CLI", href: "/projects/cli" },
      { name: "Coder", href: "/projects/coder" },
      { name: "mSearch", href: "/projects/msearch" },
    ],
  },
  {
    title: "Modèles",
    links: [
      { name: "mAI-2", href: "/models/mai-2" },
      { name: "mAI-2-Mini", href: "/models/mai-2-mini" },
      { name: "mAI-1.5", href: "/models#mai-1.5" },
      { name: "mAI-1.2", href: "/models#mai-1.2" },
      { name: "Tous les modèles", href: "/models" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { name: "Documentation", href: "/docs" },
      { name: "Actualités", href: "/news" },
      { name: "Notes de version", href: "/changelog" },
      { name: "API", href: "/account/keys" },
      { name: "Téléchargements", href: "/downloads" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { name: "L'équipe", href: "/about" },
      { name: "Abonnements", href: "/pricing" },
      { name: "Support", href: "/support" },
      { name: "Mon compte", href: "/account" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-neutral-200 bg-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 md:px-8 py-14">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          <div className="max-w-xs">
            <Link href="/" className="inline-flex items-center gap-2">
              <img
                src="/logo.png"
                alt="mAI"
                width={140}
                height={40}
                style={{ height: "32px", width: "auto", objectFit: "contain" }}
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-neutral-500">
              L&apos;écosystème IA et outils développeur conçu par mDevsLabs. Modèles, applications
              et API unifiée.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:gap-x-14">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-xs font-medium text-neutral-900 mb-4">{column.title}</h3>
                <ul className="flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.name}`}>
                      <Link
                        href={link.href}
                        className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-neutral-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-neutral-500">
            {year} © All rights reserved | mAI | Official Website
          </p>
          <FooterLegal />
        </div>
      </div>
    </footer>
  );
}

export function Footer() {
  return <SiteFooter />;
}
