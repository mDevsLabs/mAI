"use client";

import { useEffect } from "react";
import { motion, AnimatePresence, useDragControls } from "motion/react";
import { X } from "lucide-react";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  label?: string;
}

export function Sheet({ open, onOpenChange, children, className = "", label = "Panneau" }: SheetProps) {
  const dragControls = useDragControls();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center md:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.55 }}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onOpenChange(false);
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35, mass: 0.9 }}
            className={`relative flex w-full max-h-[85dvh] flex-col overflow-hidden rounded-t-sheet glass-strong ${className}`}
          >
            {/* Poignée iOS : seule zone qui démarre le drag-to-dismiss */}
            <div
              onPointerDown={(event) => dragControls.start(event)}
              className="flex shrink-0 cursor-grab touch-none select-none justify-center pb-1 pt-3 active:cursor-grabbing"
            >
              <div className="h-1.5 w-10 rounded-full bg-slate-900/15" />
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-900/5"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1 overflow-y-auto overscroll-contain pb-safe-sheet">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
