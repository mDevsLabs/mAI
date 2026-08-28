"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function StatusWidget() {
  const [status, setStatus] = useState<string>("UP");
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      setBannerOpen((e as CustomEvent<{ open: boolean }>).detail.open);
    };
    window.addEventListener("mai:cookie-banner", handler);
    return () => window.removeEventListener("mai:cookie-banner", handler);
  }, []);

  // Évite le chevauchement avec le bandeau cookies (pleine largeur, en bas)
  if (bannerOpen) return null;

  useEffect(() => {
    fetch("https://mai.instatus.com/summary.json")
      .then((res) => res.json())
      .then((data) => {
        if (data?.page?.status) {
          setStatus(data.page.status);
        }
      })
      .catch(() => {});
  }, []);

  let color = "bg-emerald-500";
  let text = "Opérationnel";

  if (status === "HASISSUES") {
    color = "bg-yellow-500";
    text = "Dégradé";
  } else if (status === "MINOROUTAGE") {
    color = "bg-orange-500";
    text = "Mineur";
  } else if (status === "MAJOROUTAGE") {
    color = "bg-red-500";
    text = "Majeur";
  } else if (status === "UNDERMAINTENANCE") {
    color = "bg-blue-500";
    text = "Maintenance";
  }

  return (
    <Link
      href="https://mai.instatus.com/"
      target="_blank"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 max-w-[calc(100vw-2rem)] bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-lg rounded-full px-3 py-1.5 hover:scale-105 transition-transform duration-200"
    >
      <span className={`shrink-0 w-2 h-2 rounded-full ${color} animate-pulse`}></span>
      <span className="text-xs font-bold text-slate-700 truncate">{text}</span>
    </Link>
  );
}
