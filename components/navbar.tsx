"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Download, Menu, Search, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PageSearch } from "@/components/ui/search-bar";
import { AccountMenu } from "@/components/navbar/account-menu";
import { DesktopNavigation } from "@/components/navbar/desktop-navigation";
import { MobileNavigation } from "@/components/navbar/mobile-navigation";
import { SocialLinks } from "@/components/navbar/social-links";
import { useNavbarAccount } from "@/components/navbar/use-navbar-account";
import { useScrolled } from "@/components/navbar/use-scrolled";
import type { ChangelogsByProject } from "@/lib/changelog";
import type { NewsArticle } from "@/lib/news";

const CommandMenu = dynamic(
  () => import("@/components/command-menu").then((mod) => mod.CommandMenu),
  { ssr: false }
);

interface NavbarProps {
  changelogs?: ChangelogsByProject;
  news?: NewsArticle[];
}

export function Navbar({ changelogs, news }: NavbarProps) {
  const pathname = usePathname();
  const account = useNavbarAccount();
  const scrolled = useScrolled();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  return (
    <>
      <header
        className={`fixed safe-top-4 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-6xl xl:max-w-7xl rounded-3xl md:rounded-full px-4 md:px-8 py-2 md:py-3 glass transition-[background-color,box-shadow] duration-300 ease-ios ${
          scrolled ? "glass-elev" : ""
        }`}
      >
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="mAI"
                width={160}
                height={48}
                style={{ height: "40px", width: "auto", objectFit: "contain" }}
              />
            </div>
          </Link>

          <DesktopNavigation pathname={pathname} />

          <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
            {/* Recherche globale du site (desktop) */}
            <div className="hidden lg:block">
              <PageSearch
                type="all"
                variant="navbar"
                placeholder="Rechercher…"
                className="w-44 xl:w-60"
              />
            </div>

            <AccountMenu pathname={pathname} account={account} />
            <SocialLinks variant="desktop" />

            {/* CTA Télécharger (desktop) */}
            <Link
              href="/downloads"
              className="hidden lg:inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-[background-color,transform] duration-200 hover:bg-slate-800 active:scale-[0.97]"
            >
              <Download className="w-4 h-4" />
              Télécharger
            </Link>

            {/* Recherche (mobile & tablette) */}
            <button
              type="button"
              className="lg:hidden flex h-11 w-11 items-center justify-center rounded-full text-slate-600 transition-[background-color,transform] duration-150 hover:bg-black/5 active:scale-95"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsCommandOpen(true);
              }}
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Compte (mobile icon) */}
            <Link
              href={account.accountHref}
              className={`md:hidden flex h-11 w-11 items-center justify-center rounded-full border transition-[background-color,transform] duration-150 active:scale-95 ${
                pathname.startsWith("/account")
                  ? "border-purple-300 bg-purple-50 text-purple-700"
                  : "border-black/10 bg-black/5 text-slate-600 hover:bg-black/10"
              }`}
              aria-label={account.accountLabel}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {account.accountInitials ? (
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {account.accountInitials}
                </span>
              ) : (
                <UserRound className="w-5 h-5" />
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="md:hidden flex h-11 w-11 items-center justify-center rounded-full text-slate-600 transition-[background-color,transform] duration-150 hover:bg-black/5 active:scale-95"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={
                isMobileMenuOpen ? "Fermer la navigation" : "Ouvrir la navigation"
              }
              aria-expanded={isMobileMenuOpen}
              aria-haspopup="dialog"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      <MobileNavigation
        open={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
        pathname={pathname}
        account={account}
      />
      <CommandMenu
        open={isCommandOpen}
        setOpen={setIsCommandOpen}
        changelogs={changelogs}
        news={news}
      />
    </>
  );
}
