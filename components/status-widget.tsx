"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function StatusWidget() {
  const [status, setStatus] = useState<string>("UP");

  useEffect(() => {
    fetch("https://mprojects.instatus.com/summary.json")
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
      href="https://mprojects.instatus.com"
      target="_blank"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-lg rounded-full px-3 py-1.5 hover:scale-105 transition-transform duration-200"
    >
      <span className={`w-2 h-2 rounded-full ${color} animate-pulse`}></span>
      <span className="text-xs font-bold text-slate-700">{text}</span>
    </Link>
  );
}
