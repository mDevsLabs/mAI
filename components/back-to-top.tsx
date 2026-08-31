"use client";

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const handler = (e: Event) => {
      setBannerOpen((e as CustomEvent<{ open: boolean }>).detail.open);
    };

    window.addEventListener("scroll", toggleVisibility);
    window.addEventListener("mai:cookie-banner", handler);
    toggleVisibility();
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      window.removeEventListener("mai:cookie-banner", handler);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Masqué pendant le bandeau cookies ; décalé à gauche pour éviter le widget Botpress (bas-droite)
  return (
    <AnimatePresence>
      {isVisible && !bannerOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          className="fixed bottom-24 left-4 z-40 w-12 h-12 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] flex items-center justify-center text-slate-700 hover:text-slate-900 transition-all duration-300"
          aria-label="Remonter en haut"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}