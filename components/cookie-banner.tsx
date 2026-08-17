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
      const timer = setTimeout(() => setShowBanner(true), 1000);
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
          className="fixed bottom-6 right-6 left-6 md:left-auto md:max-w-md z-[99999] p-5 rounded-3xl bg-white/95 backdrop-blur-2xl border border-black/10 text-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.18)]"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-purple-100 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0 shadow-xs">
                <Cookie className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  Gestion des Cookies &amp; Confidentialité
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">mAI Services</p>
              </div>
            </div>
            <button
              onClick={acceptEssentialOnly}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors cursor-pointer"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed mb-4 font-normal">
            Nous utilisons des cookies essentiels et sécurisés pour maintenir votre session de connexion, retenir vos préférences API et assurer la protection de vos clés.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={acceptAll}
              className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Tout accepter
            </button>
            <button
              onClick={acceptEssentialOnly}
              className="py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200/80 flex items-center justify-center gap-1.5 cursor-pointer"
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
