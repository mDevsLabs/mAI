"use client";

import { motion } from "motion/react";
import { Zap, Terminal, ShieldCheck, Code2 } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: "Inférence Locale & Ultra-Rapide",
      description: "Exécutez nos modèles mAI-1.5 directement sur vos machines via Ollama sans latence réseau et avec zéro dépendance nuage obligatoire.",
      color: "text-purple-600",
      bg: "bg-purple-500/10 border-purple-500/20",
      accent: "from-purple-500 to-indigo-500",
    },
    {
      icon: Terminal,
      title: "Workflows Natifs Terminal",
      description: "Conçu pour les développeurs exigeants. Automatisez vos relectures de code, vos tickets GitHub et vos communications en ligne de commande.",
      color: "text-blue-600",
      bg: "bg-blue-500/10 border-blue-500/20",
      accent: "from-blue-500 to-cyan-500",
    },
    {
      icon: ShieldCheck,
      title: "Respect de la Vie Privée",
      description: "Utilisez nos modèles et outils en toute sérénité. Vos données restent confidentielles avec un respect strict de la vie privée et aucun suivi de données.",
      color: "text-emerald-600",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      accent: "from-emerald-500 to-teal-500",
    },
    {
      icon: Code2,
      title: "API Unifiée & Compatibilité",
      description: "Bénéficiez d'une couche d'interopérabilité universelle compatible OpenAI, Claude Desktop et Grok grâce à notre outil OpenProvider.",
      color: "text-amber-600",
      bg: "bg-amber-500/10 border-amber-500/20",
      accent: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <section className="w-full py-6 md:py-10">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-center max-w-3xl mx-auto mb-8"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-slate-900">
          Pourquoi choisir <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500">mDevsLabs</span> ?
        </h2>
        <p className="text-slate-500 text-sm sm:text-base font-light mt-2">
          Une architecture pensée pour la vitesse, la liberté d&apos;utilisation et l&apos;intégration fluide dans vos outils quotidiens.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {features.map((feat, index) => (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
            className="group bg-white/60 backdrop-blur-md border border-white/80 rounded-3xl p-5 sm:p-6 hover:border-purple-300 transition-colors duration-200 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${feat.bg} mb-4 group-hover:scale-105 transition-transform duration-200 shadow-xs`}>
                <feat.icon className={`w-6 h-6 ${feat.color}`} />
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
                {feat.title}
              </h3>

              <p className="text-slate-600 text-xs leading-relaxed font-normal">
                {feat.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200/50">
              <div className={`h-1 w-8 rounded-full bg-gradient-to-r ${feat.accent} group-hover:w-full transition-all duration-300`} />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
