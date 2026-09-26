"use client";

import { useState } from "react";
import {
  Activity,
  ChevronDown,
  Cloud,
  Download,
  Gauge,
  Image as ImageIcon,
  UserRound,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { Sheet } from "@/components/sheet";
import { PageSearch } from "@/components/ui/search-bar";
import { handleAccountAnchorClick } from "@/components/navbar/account-anchor";
import { checkLinkActive, checkSubActive, navLinks } from "@/components/navbar/navigation-config";
import { SocialLinks } from "@/components/navbar/social-links";
import { StorageMeter } from "@/components/navbar/storage-meter";
import type { NavbarAccount } from "@/components/navbar/use-navbar-account";

interface MobileNavigationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathname: string;
  account: NavbarAccount;
}

export function MobileNavigation({
  open,
  onOpenChange,
  pathname,
  account,
}: MobileNavigationProps) {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [activeNestedSubmenu, setActiveNestedSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (name: string) => {
    setActiveSubmenu((current) => (current === name ? null : name));
  };

  const toggleNestedSubmenu = (name: string) => {
    setActiveNestedSubmenu((current) => (current === name ? null : name));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} label="Navigation">
      <nav aria-label="Navigation mobile" className="flex flex-col gap-2 p-4">
        <div className="px-1 pb-1">
          <PageSearch type="all" placeholder="Rechercher dans tout le site…" />
        </div>

        {navLinks.map((link) => {
          const hasSubitems = !!link.subitems;
          const isActive = checkLinkActive(link, pathname);
          const isSubmenuOpen = activeSubmenu === link.name;

          return (
            <div key={link.name} className="flex flex-col rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between w-full">
                <Link
                  href={link.href}
                  onClick={() => onOpenChange(false)}
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
                    type="button"
                    onClick={() => toggleSubmenu(link.name)}
                    className={`p-3 mr-2 rounded-xl hover:bg-black/5 text-slate-500 transition-transform ${
                      isSubmenuOpen ? "rotate-180" : ""
                    }`}
                    aria-label={`${isSubmenuOpen ? "Fermer" : "Ouvrir"} le sous-menu ${link.name}`}
                    aria-expanded={isSubmenuOpen}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}
              </div>

              {hasSubitems && isSubmenuOpen && (
                <div className="pl-6 pr-4 pb-2 flex flex-col gap-1 bg-black/[0.02] border-t border-black/5">
                  {link.subitems?.map((subitem) => {
                    const hasNested = !!subitem.subitems;
                    const isNestedOpen = activeNestedSubmenu === subitem.name;
                    const isSubActive = checkSubActive(subitem, pathname);

                    return (
                      <div key={subitem.name} className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <Link
                            href={subitem.href}
                            onClick={() => onOpenChange(false)}
                            className={`flex-1 px-4 py-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                              isSubActive
                                ? "bg-purple-50 text-purple-600"
                                : "text-slate-600 hover:bg-black/5 hover:text-slate-900"
                            }`}
                          >
                            <span>{subitem.name}</span>
                            {pathname === subitem.href && (
                              <span className="w-2 h-2 rounded-full bg-purple-500" />
                            )}
                          </Link>
                          {hasNested && (
                            <button
                              type="button"
                              onClick={() => toggleNestedSubmenu(subitem.name)}
                              className={`p-2 rounded-lg hover:bg-black/5 text-slate-500 transition-transform ${
                                isNestedOpen ? "rotate-180" : ""
                              }`}
                              aria-label={`${isNestedOpen ? "Fermer" : "Ouvrir"} le sous-menu ${subitem.name}`}
                              aria-expanded={isNestedOpen}
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
                                onClick={() => onOpenChange(false)}
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

        {/* CTA Télécharger (mobile) */}
        <Link
          href="/downloads"
          onClick={() => onOpenChange(false)}
          className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          Télécharger
        </Link>

        <Link
          href={account.accountHref}
          onClick={() => onOpenChange(false)}
          className={`mt-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors flex items-center gap-3 ${
            pathname.startsWith("/account")
              ? "bg-purple-50 text-purple-600"
              : "text-slate-700 hover:bg-black/5"
          }`}
        >
          {account.user?.avatarUrl ? (
            <img
              src={account.user.avatarUrl}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover bg-white ring-1 ring-black/10 shadow-sm"
            />
          ) : account.accountInitials ? (
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs font-bold flex items-center justify-center shadow-sm">
              {account.accountInitials}
            </span>
          ) : (
            <UserRound className="w-5 h-5" />
          )}
          <span className="flex flex-col">
            <span>
              {account.loading
                ? "Compte…"
                : account.isAuthenticated
                  ? account.accountLabel
                  : "Se connecter"}
            </span>
            {account.isAuthenticated && account.user?.tier && (
              <span className="text-[11px] font-medium text-slate-500">
                Forfait {account.user.tier}
              </span>
            )}
          </span>
        </Link>

        {account.isAuthenticated && (
          <div className="flex flex-col gap-1.5 mt-1">
            <Link
              href="/account#usage-mai"
              onClick={() => {
                onOpenChange(false);
                handleAccountAnchorClick(pathname, "usage-mai");
              }}
              className="px-4 py-2.5 mx-1 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2.5 bg-black/[0.02]"
            >
              <Gauge className="w-4 h-4 text-purple-600" />
              <span>Usage mAI</span>
            </Link>
            <Link
              href="/account#usage-api"
              onClick={() => {
                onOpenChange(false);
                handleAccountAnchorClick(pathname, "usage-api");
              }}
              className="px-4 py-2.5 mx-1 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2.5 bg-black/[0.02]"
            >
              <Activity className="w-4 h-4 text-purple-600" />
              <span>Usage API</span>
            </Link>
            <Link
              href="/account#usage-images"
              onClick={() => {
                onOpenChange(false);
                handleAccountAnchorClick(pathname, "usage-images");
              }}
              className="px-4 py-2.5 mx-1 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2.5 bg-black/[0.02]"
            >
              <ImageIcon className="w-4 h-4 text-purple-600" />
              <span>Usage Images</span>
            </Link>
            <Link
              href="/account#usage-audio"
              onClick={() => {
                onOpenChange(false);
                handleAccountAnchorClick(pathname, "usage-audio");
              }}
              className="px-4 py-2.5 mx-1 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2.5 bg-black/[0.02]"
            >
              <Volume2 className="w-4 h-4 text-purple-600" />
              <span>Usage Audio</span>
            </Link>
            <Link
              href="/account#usage-cloud"
              onClick={() => {
                onOpenChange(false);
                handleAccountAnchorClick(pathname, "usage-cloud");
              }}
              className="px-4 py-2.5 mx-1 rounded-2xl bg-purple-50/50 border border-purple-100/60 space-y-1.5 hover:bg-purple-50 transition-colors block"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <Cloud className="w-3.5 h-3.5 text-purple-600" />
                  <span>Stockage Cloud</span>
                </div>
                <span className="text-[11px] font-extrabold text-purple-700">
                  {account.storagePercent}%
                </span>
              </div>
              <StorageMeter
                used={account.storageUsed}
                limit={account.storageLimit}
                percent={account.storagePercent}
                variant="mobile"
              />
            </Link>
          </div>
        )}

        <SocialLinks variant="mobile" />
      </nav>
    </Sheet>
  );
}
