"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

type Rect = { x: number; y: number; w: number; h: number };

export function Spotlight({ selector }: { selector?: string }) {
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (!selector) {
      setRect(null);
      return;
    }

    const update = () => {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ x: r.left, y: r.top, w: r.width, h: r.height });
    };

    update();
    const ro = new ResizeObserver(update);
    const el = document.querySelector(selector!);
    if (el) ro.observe(el);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    const id = window.setInterval(update, 1000);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      clearInterval(id);
    };
  }, [selector]);

  if (!selector || !rect) return null;

  const pad = 8;
  const x = Math.max(0, rect.x - pad);
  const y = Math.max(0, rect.y - pad);
  const w = rect.w + pad * 2;
  const h = rect.h + pad * 2;

  return (
    <>
      {/* dim overlay via SVG mask technique: 4 rects */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99] pointer-events-none"
        aria-hidden
      >
        {/* top */}
        <div className="absolute bg-slate-950/55 backdrop-blur-[1px]" style={{ left: 0, top: 0, right: 0, height: y }} />
        {/* bottom */}
        <div className="absolute bg-slate-950/55 backdrop-blur-[1px]" style={{ left: 0, top: y + h, right: 0, bottom: 0 }} />
        {/* left */}
        <div className="absolute bg-slate-950/55 backdrop-blur-[1px]" style={{ left: 0, top: y, width: x, height: h }} />
        {/* right */}
        <div className="absolute bg-slate-950/55 backdrop-blur-[1px]" style={{ left: x + w, top: y, right: 0, height: h }} />
      </motion.div>

      {/* highlight ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed z-[100] pointer-events-none rounded-2xl border-2 border-purple-500 shadow-[0_0_0_6px_rgba(168,85,247,0.18),0_8px_30px_rgba(0,0,0,0.2)]"
        style={{ left: x, top: y, width: w, height: h }}
      />
      {/* pulsating outer glow */}
      <motion.div
        animate={{ opacity: [0.18, 0.32, 0.18], scale: [1, 1.02, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="fixed z-[99] pointer-events-none rounded-2xl bg-purple-500/20 blur-[1px]"
        style={{ left: x - 2, top: y - 2, width: w + 4, height: h + 4 }}
      />
    </>
  );
}
