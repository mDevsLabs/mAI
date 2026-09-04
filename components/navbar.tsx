"use client";

import { Github, Menu, X, ChevronDown, UserRound, LogOut, Gauge, Activity, Cloud, Image as ImageIcon, Volume2, Search } from "lucide-react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

const CommandMenu = dynamic(
  () => import("@/components/command-menu").then((mod) => mod.CommandMenu),
  { ssr: false }
);
import type { ChangelogsByProject } from "@/lib/changelog";
import type { NewsArticle } from "@/lib/news";
import { formatStorageBytes, CLOUD_STORAGE_LIMITS } from "@/lib/mai-api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet } from "@/components/sheet";
import { useAuth } from "@/components/auth-provider";

interface NavSubItem {
  name: string;
  href: string;
  subitems?: { name: string; href: string }[];
}

interface NavItem {
  name: string;
  href: string;
  subitems?: NavSubItem[];
}

const navLinks: NavItem[] = [
  { name: "Accueil", href: "/" },
  { name: "L'équipe", href: "/about" },
  { name: "Actualités", href: "/news" },
  {
    name: "Projets",
    href: "/projects",
    subitems: [
      { name: "Tous les projets", href: "/projects" },
      { name: "Web", href: "/projects/web" },
      { name: "Vibe", href: "/projects/vibe" },
      { name: "Pulse", href: "/projects/pulse" },
      { name: "CLI", href: "/projects/cli" },
      { name: "Coder", href: "/projects/coder" },
    ]},
  {
    name: "Modèles",
    href: "/models",
    subitems: [
      { name: "Tous les modèles", href: "/models" },
      {
        name: "mAI-1.5",
        href: "/models#mai-1.5",
        subitems: [
          { name: "mAI-1.5-Light", href: "/models/mai-1.5-light" },
          { name: "mAI-1.5-Apex", href: "/models/mai-1.5-apex" },
          { name: "mAI-1.5-Opal", href: "/models/mai-1.5-opal" },
        ]},
      {
        name: "mAI-1.2",
        href: "/models#mai-1.2",
        subitems: [
          { name: "mAI-1.2-Light", href: "/models/mai-1.2-light" },
          { name: "mAI-1.2-Apex", href: "/models/mai-1.2-apex" },
          { name: "mAI-1.2-Opal", href: "/models/mai-1.2-opal" },
        ]},
      {
        name: "mAI-1",
        href: "/models#mai-1",
        subitems: [
          { name: "mAI-1", href: "/models/mai-1" },
          { name: "mAI-1-Light", href: "/models/mai-1-light" },
        ]},
    ]},
  {
    name: "API",
    href: "/account/keys",
    subitems: [
      {
        name: "Modèles",
        href: "/account/models",
        subitems: [
          { name: "Modèles Texte", href: "/account/models" },
          { name: "Modèles Images", href: "/account/models/images" },
          { name: "Modèles Audio", href: "/account/models/audio" },
          { name: "Modèles mAI", href: "/account/models/mai" },
        ],
      },
      { name: "Clés API", href: "/account/keys" },
      { name: "Requêtes", href: "/account/requests" },
      { name: "Usage", href: "/account/usage" },
      { name: "Configuration", href: "/account/config" },
    ]},
  { name: "Abonnements", href: "/pricing" },
  {
    name: "Plus",
    href: "#",
    subitems: [
      { name: "Support", href: "/support" },
      { name: "Télécharger", href: "/downloads" },
      { 
        name: "Documentation", 
        href: "/docs"},
    ]},
];

function checkSubActive(sub: NavSubItem, pathname: string): boolean {
  if (pathname === sub.href) return true;
  if (sub.subitems && sub.subitems.some((nested) => pathname === nested.href)) return true;
  return false;
}

function checkLinkActive(link: NavItem, pathname: string): boolean {
  if (link.href !== "#" && pathname === link.href) return true;
  if (link.subitems && link.subitems.some((sub) => checkSubActive(sub, pathname))) return true;
  return false;
}

export function Navbar({ changelogs, news }: { changelogs?: ChangelogsByProject; news?: NewsArticle[] }) {
  const pathname = usePathname();
  const { user, isAuthenticated, loading: authLoading, logout, cloudStorage } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobileSubmenu, setActiveMobileSubmenu] = useState<string | null>(null);
  const [activeMobileNestedSubmenu, setActiveMobileNestedSubmenu] = useState<string | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const storageLimit = CLOUD_STORAGE_LIMITS[user?.tier || "Free"] || CLOUD_STORAGE_LIMITS["Free"];
  const storageUsed = cloudStorage?.bytes_used ?? 0;
  const storagePercent = cloudStorage?.percent_used ?? (storageLimit > 0 ? Math.min(100, Math.round((storageUsed / storageLimit) * 100)) : 0);

  const accountHref = isAuthenticated ? "/account" : "/account/login";
  const accountLabel = isAuthenticated
    ? user?.username || "Compte"
    : "Compte";
  const accountInitials = isAuthenticated
    ? (user?.username || user?.email || "U").slice(0, 2).toUpperCase()
    : null;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileSubmenu = (name: string) => {
    setActiveMobileSubmenu(activeMobileSubmenu === name ? null : name);
  };

  const toggleMobileNestedSubmenu = (name: string) => {
    setActiveMobileNestedSubmenu(activeMobileNestedSubmenu === name ? null : name);
  };

  const handleAnchorClick = (id: string) => {
    if (pathname === "/account") {
      const element = document.getElementById(id);
      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  };

  return (
    <>
      <header
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-[96%] max-w-6xl xl:max-w-7xl rounded-3xl md:rounded-full border px-4 md:px-8 py-2 md:py-3 ${
          scrolled
            ? "bg-white/70 backdrop-blur-2xl border-black/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]"
            : "bg-white/30 backdrop-blur-md border-black/10 shadow-sm"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="mAI"
                width={160}
                height={48}
                style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium text-slate-500">
            {navLinks.map((link) => {
              const isActive = checkLinkActive(link, pathname);

              if (link.subitems) {
                return (
                  <div key={link.name} className="relative group py-2">
                    <Link
                      href={link.href}
                      className={`relative transition-colors flex items-center gap-1 ${
                        isActive
                          ? "text-slate-900 border-b-2 border-purple-500 pb-1"
                          : "hover:text-slate-900"
                      }`}
                    >
                      <span className="relative z-10">{link.name}</span>
                      <ChevronDown className="w-4 h-4 opacity-60 group-hover:rotate-180 transition-transform duration-200" />
                    </Link>

                    {/* Premier niveau de Dropdown */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-200 z-50">
                      <div className="glass-dropdown min-w-[170px] flex flex-col gap-1">
                        {link.subitems.map((subitem) => {
                          const isSubActive = checkSubActive(subitem, pathname);
                          const hasNested = !!subitem.subitems;

                          if (hasNested) {
                            return (
                              <div key={subitem.name} className="relative group/nested flex flex-col">
                                <Link
                                  href={subitem.href}
                                  className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all flex items-center justify-between gap-2 ${
                                    isSubActive
                                      ? "bg-purple-50 text-purple-600 font-extrabold shadow-2xs"
                                      : "text-slate-700 hover:bg-purple-50/70 hover:text-purple-700"
                                  }`}
                                >
                                  <span>{subitem.name}</span>
                                  <ChevronDown className="w-3 h-3 -rotate-90 text-slate-400 group-hover/nested:translate-x-0.5 transition-transform" />
                                </Link>

                                {/* Sous-menu flyout à droite */}
                                <div className="absolute left-full top-0 ml-2 opacity-0 translate-x-1 invisible group-hover/nested:opacity-100 group-hover/nested:translate-x-0 group-hover/nested:visible transition-all duration-200 z-50">
                                  <div className="glass-dropdown min-w-[150px] flex flex-col gap-1">
                                    {subitem.subitems?.map((nested) => (
                                      <Link
                                        key={nested.name}
                                        href={nested.href}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                                          pathname === nested.href
                                            ? "bg-purple-50 text-purple-600 font-extrabold shadow-2xs"
                                            : "text-slate-700 hover:bg-purple-50/70 hover:text-purple-700"
                                        }`}
                                      >
                                        {nested.name}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <Link
                              key={subitem.name}
                              href={subitem.href}
                              className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                                isSubActive
                                  ? "bg-purple-50 text-purple-600 font-extrabold shadow-2xs"
                                  : "text-slate-700 hover:bg-purple-50/70 hover:text-purple-700"
                              }`}
                            >
                              {subitem.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative transition-colors ${
                    isActive
                      ? "text-slate-900 border-b-2 border-purple-500 pb-1"
                      : "hover:text-slate-900"
                  }`}
                >
                  <span className="relative z-10">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Recherche globale (desktop) */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200 bg-neutral-100/70 hover:bg-neutral-200/70 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900 transition-all text-xs font-medium cursor-pointer"
              title="Recherche sur tout le site (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-neutral-500" />
              <span className="hidden xl:inline text-neutral-600">Recherche</span>
              <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono rounded bg-white border border-neutral-200 text-neutral-500 shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* Compte (desktop) avec Dropdown interactif au survol / clic */}
            <div className="hidden md:block relative group/account py-2">
              <Link
                href={accountHref}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 ${
                  pathname.startsWith("/account")
                    ? "border-purple-300 bg-purple-50 text-purple-700 shadow-2xs"
                    : "border-black/10 bg-black/5 text-slate-700 hover:bg-black/10 hover:scale-105"
                }`}
                title={isAuthenticated ? `Compte (${user?.tier || "Free"})` : "Se connecter"}
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-6 h-6 rounded-full object-cover bg-white ring-1 ring-black/10 shadow-2xs" />
                ) : accountInitials ? (
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white text-[10px] font-bold flex items-center justify-center shadow-2xs">
                    {accountInitials}
                  </span>
                ) : (
                  <UserRound className="w-4 h-4" />
                )}
                <span className="max-w-[100px] truncate">
                  {authLoading ? "…" : accountLabel}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover/account:rotate-180 transition-transform duration-200" />
              </Link>

              {/* Menu déroulant Compte */}
              <div className="absolute right-0 top-full pt-2 opacity-0 translate-y-2 invisible group-hover/account:opacity-100 group-hover/account:translate-y-0 group-hover/account:visible transition-all duration-200 z-50">
                <div className="glass-dropdown w-64 space-y-1">
                  {isAuthenticated ? (
                    <>
                      <Link href="/account" className="block p-3 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-1 hover:bg-purple-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <p className="font-extrabold text-slate-900 text-sm truncate">{user?.username || "Utilisateur"}</p>
                          <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-black uppercase">
                            {user?.tier || "Free"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </Link>

                      <div className="pt-1 space-y-0.5">
                        <Link
                          href="/account#usage-mai"
                          onClick={() => handleAnchorClick("usage-mai")}
                          className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2.5"
                        >
                          <Gauge className="w-4 h-4 text-purple-600" />
                          Usage mAI
                        </Link>
                        <Link
                          href="/account#usage-api"
                          onClick={() => handleAnchorClick("usage-api")}
                          className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2.5"
                        >
                          <Activity className="w-4 h-4 text-purple-600" />
                          Usage API
                        </Link>
                        <Link
                          href="/account#usage-images"
                          onClick={() => handleAnchorClick("usage-images")}
                          className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2.5"
                        >
                          <ImageIcon className="w-4 h-4 text-purple-600" />
                          Usage Images
                        </Link>
                        <Link
                          href="/account#usage-audio"
                          onClick={() => handleAnchorClick("usage-audio")}
                          className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2.5"
                        >
                          <Volume2 className="w-4 h-4 text-purple-600" />
                          Usage Audio
                        </Link>
                        <Link
                          href="/account#usage-cloud"
                          onClick={() => handleAnchorClick("usage-cloud")}
                          className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex flex-col gap-1.5 group/storage"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <Cloud className="w-4 h-4 text-purple-600 shrink-0" />
                              <span>Stockage Cloud</span>
                            </div>
                            <span className="text-[10px] font-extrabold text-slate-500 group-hover/storage:text-purple-700">
                              {storagePercent}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                storagePercent >= 90
                                  ? "bg-red-500"
                                  : storagePercent >= 70
                                    ? "bg-amber-500"
                                    : "bg-gradient-to-r from-purple-500 to-blue-500"
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, storagePercent))}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                            <span>{formatStorageBytes(storageUsed)}</span>
                            <span>{formatStorageBytes(storageLimit)}</span>
                          </div>
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 pt-1 mt-1">
                        <button
                          onClick={() => {
                            logout();
                            toast.success("Déconnecté avec succès");
                          }}
                          className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2.5 cursor-pointer text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Se déconnecter
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-2 space-y-1">
                      <Link
                        href="/account/login"
                        className="w-full px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-2xs"
                      >
                        Se connecter
                      </Link>
                      <Link
                        href="/account/register"
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-2"
                      >
                        Créer un compte
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Socials */}
            <div className="hidden md:flex gap-2">
              <a
                href="https://github.com/mDevsLabs"
                target="_blank"
                rel="noreferrer"
                className="group relative p-2 rounded-full border border-black/10 bg-black/5 hover:bg-black/10 hover:scale-110 hover:shadow-lg transition-all duration-200 text-slate-700"
              >
                <Github className="w-5 h-5" />
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none px-2 py-1 bg-slate-900 text-white text-[10px] font-medium rounded shadow-lg whitespace-nowrap z-50">
                  GitHub
                </div>
              </a>
              <a
                href="https://discord.gg/invite/fV7zwdGPpY"
                target="_blank"
                rel="noreferrer"
                className="group relative p-2 rounded-full border border-indigo-500 bg-indigo-600 hover:bg-indigo-500 hover:scale-110 hover:shadow-lg transition-all duration-200 text-white"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none px-2 py-1 bg-slate-900 text-white text-[10px] font-medium rounded shadow-lg whitespace-nowrap z-50">
                  Discord
                </div>
              </a>
            </div>

            {/* Recherche (mobile) */}
            <button
              className="md:hidden p-2 rounded-full text-slate-600 hover:bg-black/5 transition-colors"
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
              href={accountHref}
              className={`md:hidden p-2 rounded-full border transition-colors ${
                pathname.startsWith("/account")
                  ? "border-purple-300 bg-purple-50 text-purple-700"
                  : "border-black/10 bg-black/5 text-slate-600 hover:bg-black/10"
              }`}
              aria-label={accountLabel}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {accountInitials ? (
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {accountInitials}
                </span>
              ) : (
                <UserRound className="w-5 h-5" />
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-full text-slate-600 hover:bg-black/5 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Sheet */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <nav className="flex flex-col gap-2 p-4">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsCommandOpen(true);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-700 bg-black/[0.03] hover:bg-black/5 transition-colors"
            >
              <Search className="w-4 h-4 text-purple-600" />
              Rechercher…
            </button>

            {navLinks.map((link) => {
              const hasSubitems = !!link.subitems;
              const isActive = checkLinkActive(link, pathname);
              const isSubmenuOpen = activeMobileSubmenu === link.name;

              return (
                <div key={link.name} className="flex flex-col rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between w-full">
                    <Link
                      href={link.href === "#" ? (link.subitems?.[0]?.href || "#") : link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors flex items-center gap-2 rounded-2xl ${
                        isActive
                          ? "bg-purple-50 text-purple-600"
                          : "text-slate-700 hover:bg-black/5 hover:text-slate-900"
                      }`}
                    >
                      {link.name}
                    </Link>
                    {hasSubitems && (
                      <button
                        onClick={() => toggleMobileSubmenu(link.name)}
                        className={`p-3 mr-2 rounded-xl hover:bg-black/5 text-slate-500 transition-transform ${
                          isSubmenuOpen ? "rotate-180" : ""
                        }`}
                        aria-label="Toggle submenu"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {hasSubitems && isSubmenuOpen && (
                    <div className="pl-6 pr-4 pb-2 flex flex-col gap-1 bg-black/[0.02] border-t border-black/5">
                      {link.subitems?.map((subitem) => {
                        const hasNested = !!subitem.subitems;
                        const isNestedOpen = activeMobileNestedSubmenu === subitem.name;
                        const isSubActive = checkSubActive(subitem, pathname);

                        return (
                          <div key={subitem.name} className="flex flex-col">
                            <div className="flex items-center justify-between">
                              <Link
                                href={subitem.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex-1 px-4 py-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                                  isSubActive
                                    ? "bg-purple-50 text-purple-600"
                                    : "text-slate-600 hover:bg-black/5 hover:text-slate-900"
                                }`}
                              >
                                <span>{subitem.name}</span>
                                {pathname === subitem.href && (
                                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                )}
                              </Link>
                              {hasNested && (
                                <button
                                  onClick={() => toggleMobileNestedSubmenu(subitem.name)}
                                  className={`p-2 rounded-lg hover:bg-black/5 text-slate-500 transition-transform ${
                                    isNestedOpen ? "rotate-180" : ""
                                  }`}
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                              )}
                            </div>

                            {hasNested && isNestedOpen && (
                              <div className="pl-4 pr-2 py-1 flex flex-col gap-1 border-l-2 border-purple-200 ml-3 my-1">
                                {subitem.subitems?.map((nested) => (
                                  <Link
                                    key={nested.name}
                                    href={nested.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                                      pathname === nested.href
                                        ? "bg-purple-100/60 text-purple-700 font-semibold"
                                        : "text-slate-600 hover:bg-black/5"
                                    }`}
                                  >
                                    <span>{nested.name}</span>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            <Link
              href={accountHref}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`mt-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors flex items-center gap-3 ${
                pathname.startsWith("/account")
                  ? "bg-purple-50 text-purple-600"
                  : "text-slate-700 hover:bg-black/5"
              }`}
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover bg-white ring-1 ring-black/10 shadow-sm" />
              ) : accountInitials ? (
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                  {accountInitials}
                </span>
              ) : (
                <UserRound className="w-5 h-5" />
              )}
              <span className="flex flex-col">
                <span>{authLoading ? "Compte…" : isAuthenticated ? accountLabel : "Se connecter"}</span>
                {isAuthenticated && user?.tier && (
                  <span className="text-[11px] font-medium text-slate-500">Forfait {user.tier}</span>
                )}
              </span>
            </Link>

            {isAuthenticated && (
              <div className="flex flex-col gap-1.5 mt-1">
                <Link
                  href="/account#usage-mai"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleAnchorClick("usage-mai");
                  }}
                  className="px-4 py-2.5 mx-1 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2.5 bg-black/[0.02]"
                >
                  <Gauge className="w-4 h-4 text-purple-600" />
                  <span>Usage mAI</span>
                </Link>
                <Link
                  href="/account#usage-api"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleAnchorClick("usage-api");
                  }}
                  className="px-4 py-2.5 mx-1 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2.5 bg-black/[0.02]"
                >
                  <Activity className="w-4 h-4 text-purple-600" />
                  <span>Usage API</span>
                </Link>
                <Link
                  href="/account#usage-images"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleAnchorClick("usage-images");
                  }}
                  className="px-4 py-2.5 mx-1 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2.5 bg-black/[0.02]"
                >
                  <ImageIcon className="w-4 h-4 text-purple-600" />
                  <span>Usage Images</span>
                </Link>
                <Link
                  href="/account#usage-cloud"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleAnchorClick("usage-cloud");
                  }}
                  className="px-4 py-2.5 mx-1 rounded-2xl bg-purple-50/50 border border-purple-100/60 space-y-1.5 hover:bg-purple-50 transition-colors block"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-3.5 h-3.5 text-purple-600" />
                      <span>Stockage Cloud</span>
                    </div>
                    <span className="text-[11px] font-extrabold text-purple-700">{storagePercent}%</span>
                  </div>
                  <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        storagePercent >= 90
                          ? "bg-red-500"
                          : storagePercent >= 70
                            ? "bg-amber-500"
                            : "bg-gradient-to-r from-purple-500 to-blue-500"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, storagePercent))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span>{formatStorageBytes(storageUsed)}</span>
                    <span>{formatStorageBytes(storageLimit)}</span>
                  </div>
                </Link>
              </div>
            )}

            <div className="flex gap-2 mt-3 pt-3 border-t border-black/5 justify-center">
              <a
                href="https://github.com/mDevsLabs"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-full border border-black/10 bg-black/5 hover:bg-black/10 transition-all text-slate-700 flex justify-center w-full"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://discord.gg/invite/fV7zwdGPpY"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-full border border-indigo-500 bg-indigo-600 hover:bg-indigo-500 transition-all text-white flex justify-center w-full"
                aria-label="Discord"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
              </a>
            </div>
          </nav>
        </Sheet>
      </header>
      <CommandMenu
        open={isCommandOpen}
        setOpen={setIsCommandOpen}
        changelogs={changelogs}
        news={news}
      />
    </>
  );
}
