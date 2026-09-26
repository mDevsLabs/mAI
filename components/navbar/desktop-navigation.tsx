"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { checkLinkActive, checkSubActive, navLinks } from "@/components/navbar/navigation-config";
import { NavPill } from "@/components/navbar/nav-pill";

export function DesktopNavigation({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Navigation principale"
      className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium text-slate-500"
    >
      {navLinks.map((link) => {
        const isActive = checkLinkActive(link, pathname);

        if (link.subitems) {
          return (
            <div key={link.name} className="relative group py-2">
              <Link
                href={link.href}
                className={`relative flex items-center gap-1 transition-opacity ${
                  isActive
                    ? "text-slate-900"
                    : "hover:text-slate-900 active:opacity-70"
                }`}
              >
                {isActive && <NavPill />}
                <span className="relative z-10">{link.name}</span>
                <ChevronDown className="relative z-10 w-4 h-4 opacity-60 group-hover:rotate-180 transition-transform duration-200" />
              </Link>

              {/* Premier niveau de Dropdown */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 origin-top opacity-0 translate-y-2 scale-[0.98] invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:visible transition-[opacity,transform] duration-200 z-50">
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
                          <div className="absolute left-full top-0 ml-2 origin-left opacity-0 translate-x-1 scale-[0.98] invisible group-hover/nested:opacity-100 group-hover/nested:translate-x-0 group-hover/nested:scale-100 group-hover/nested:visible group-focus-within/nested:opacity-100 group-focus-within/nested:translate-x-0 group-focus-within/nested:scale-100 group-focus-within/nested:visible transition-[opacity,transform] duration-200 z-50">
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
            className={`relative transition-opacity ${
              isActive
                ? "text-slate-900"
                : "hover:text-slate-900 active:opacity-70"
            }`}
          >
            {isActive && <NavPill />}
            <span className="relative z-10">{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
