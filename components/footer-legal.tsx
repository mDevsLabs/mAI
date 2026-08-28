"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export function FooterLegal() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const links = [
    { href: "/legal/privacy", label: "Confidentialité" },
    { href: "/legal/terms", label: "CGU" },
  ];

  return (
    <div ref={ref} className="relative group text-xs md:text-sm text-slate-500 font-medium">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
      >
        <span>Légal</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            open ? "rotate-180" : "group-hover:-rotate-180"
          }`}
        />
      </button>

      {/* Liste de liens s'ouvrant vers le haut (survol desktop + tap mobile) */}
      <div
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 transition-all duration-200 z-50 ${
          open
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xl border border-black/10 shadow-xl rounded-2xl p-1.5 min-w-[140px] flex flex-col gap-0.5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-medium transition-colors text-slate-600 hover:bg-black/5 hover:text-slate-900 text-center"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
