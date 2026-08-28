"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { X } from 'lucide-react';

export function MaiModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('mai-modal-dismissed');
    if (!dismissed) {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  const handleClose = () => {
    localStorage.setItem('mai-modal-dismissed', 'true');
    setIsOpen(false);
  };

  const handleKnowMore = () => {
    localStorage.setItem('mai-modal-dismissed', 'true');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 md:p-8 max-w-md w-full z-10"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6">
              <img 
                src="/mai-1/mai-1.png" 
                alt="Introducing mAI-1"
                className="w-full h-48 md:h-56 object-cover rounded-2xl mb-4"
              />
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                Introducing mAI-1
              </h2>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                We are introducing our first family of AI models, named mAI-1. 
                Designed for complex tasks requiring reasoning, you can finally boost your productivity locally!
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-white/50 transition-colors font-medium"
              >
                Ne plus afficher
              </button>
              <Link
                href="/models"
                onClick={handleKnowMore}
                className="flex-1 px-4 py-2 rounded-xl bg-orange-500 text-white text-center hover:bg-orange-600 transition-colors font-medium"
              >
                En savoir plus
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}