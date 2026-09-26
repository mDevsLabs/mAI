"use client";

import { Monitor } from "lucide-react";

import { DevicesList } from "./devices-list";

export function DevicesSection() {
  return (
    <section
      id="appareils"
      className="scroll-mt-28 bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-4"
    >
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <Monitor className="w-5 h-5 text-purple-600" /> Appareils Connectés
      </h2>
      <p className="text-sm text-slate-600">
        Consultez et gérez les appareils actuellement connectés à votre compte.
      </p>
      <DevicesList />
    </section>
  );
}
