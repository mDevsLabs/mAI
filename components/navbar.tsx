"use client";

import { Github, Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { CommandMenu } from "@/components/command-menu";
import type { ChangelogsByProject } from "@/lib/changelog";
import type { NewsArticle } from "@/lib/news";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet } from "@/components/sheet";

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
      { name: "Tout", href: "/projects" },
      { name: "mAI", href: "/projects/mai" },
      { name: "mSearch", href: "/projects/msearch" },
      { name: "Snob", href: "/projects/snob" },
    ],
  },
  {
    name: "Modèles",
    href: "/models",
    subitems: [
      { name: "Tout", href: "/models" },
      { name: "mAI-1.2-Light", href: "/models/mai-1.2-light" },
      { name: "mAI-1.2-Apex", href: "/models/mai-1.2-apex" },
      { name: "mAI-1.2-Opal", href: "/models/mai-1.2-opal" },
      { name: "mAI-1", href: "/models/mai-1" },
      { name: "mAI-1-Light", href: "/models/mai-1-light" },
    ],
  },
  {
    name: "Plus",
    href: "#",
    subitems: [
      { name: "Télécharger", href: "/downloads" },
      { name: "API", href: "/api" },
      { name: "Documentation", href: "/docs" },
    ],
  },
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobileSubmenu, setActiveMobileSubmenu] = useState<string | null>(null);
  const [activeMobileNestedSubmenu, setActiveMobileNestedSubmenu] = useState<string | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <>
      <header
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-[95%] max-w-5xl rounded-3xl md:rounded-full border px-4 md:px-8 py-2 md:py-3 ${
          scrolled
            ? "bg-white/70 backdrop-blur-2xl border-black/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]"
            : "bg-white/30 backdrop-blur-md border-black/10 shadow-sm"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="flex items-center">
              <Image
                src="/mprojects.png"
                alt="mProjects"
                width={140}
                height={56}
                sizes="(max-width: 768px) 100px, 140px"
                className="h-10 md:h-14 w-auto object-contain drop-shadow-sm"
                priority
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
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
                      <div className="bg-white/98 backdrop-blur-xl border border-black/10 shadow-xl rounded-3xl p-1.5 min-w-[140px] flex flex-col gap-0.5">
                        {link.subitems.map((subitem) => {
                          const isSubActive = checkSubActive(subitem, pathname);
                          const hasNested = !!subitem.subitems;

                          if (hasNested) {
                            return (
                              <div key={subitem.name} className="relative group/nested flex flex-col">
                                <Link
                                  href={subitem.href}
                                  className={`px-3 py-2 rounded-full text-xs font-medium transition-colors flex items-center justify-between gap-2 ${
                                    isSubActive
                                      ? "bg-purple-50 text-purple-600 font-semibold"
                                      : "text-slate-600 hover:bg-black/5 hover:text-slate-900"
                                  }`}
                                >
                                  <span>{subitem.name}</span>
                                  <ChevronDown className="w-3 h-3 -rotate-90 text-slate-400 group-hover/nested:translate-x-0.5 transition-transform" />
                                </Link>

                                {/* Sous-menu flyout à droite */}
                                <div className="absolute left-full top-0 ml-1.5 opacity-0 translate-x-1 invisible group-hover/nested:opacity-100 group-hover/nested:translate-x-0 group-hover/nested:visible transition-all duration-200 z-50">
                                  <div className="bg-white/98 backdrop-blur-xl border border-black/10 shadow-xl rounded-3xl p-1.5 min-w-[130px] flex flex-col gap-0.5">
                                    {subitem.subitems?.map((nested) => (
                                      <Link
                                        key={nested.name}
                                        href={nested.href}
                                        className={`px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                                          pathname === nested.href
                                            ? "bg-purple-50 text-purple-600 font-semibold"
                                            : "text-slate-600 hover:bg-black/5 hover:text-slate-900"
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
                              className={`px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                                isSubActive
                                  ? "bg-purple-50 text-purple-600 font-semibold"
                                  : "text-slate-600 hover:bg-black/5 hover:text-slate-900"
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
          <div className="flex items-center gap-2 md:gap-4">
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
