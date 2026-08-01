'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, ShieldCheck, X, Check, Lock } from 'lucide-react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Vérifier si le consentement a déjà été donné
    const consent = localStorage.getItem('mai_cookie_consent');
    if (!consent) {
      // Petit délai pour une entrée fluide
      const timer = setTimeout(() => setShowBanner(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('mai_cookie_consent', 'accepted');
    document.cookie = "mai_cookie_consent=accepted; path=/; max-age=31536000; SameSite=Lax";
    setShowBanner(false);
  };

  const acceptEssentialOnly = () => {
    localStorage.setItem('mai_cookie_consent', 'essential');
    document.cookie = "mai_cookie_consent=essential; path=/; max-age=31536000; SameSite=Lax";
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-5 right-5 left-5 md:left-auto md:max-w-md z-50 p-5 rounded-3xl bg-slate-900/95 backdrop-blur-2xl border border-white/10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-purple-600/30 border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0">
                <Cookie className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  Gestion des Cookies &amp; Confidentialité
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">mProjects AI Services</p>
              </div>
            </div>
            <button
              onClick={acceptEssentialOnly}
              className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Nous utilisons des cookies essentiels et sécurisés pour maintenir votre session de connexion, retenir vos préférences API et assurer la protection de vos clés.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={acceptAll}
              className="flex-1 py-2.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Tout accepter
            </button>
            <button
              onClick={acceptEssentialOnly}
              className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold transition-all border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              Essentiels uniquement
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
