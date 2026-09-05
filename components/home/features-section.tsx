"use client";

import { motion } from "motion/react";
import { Globe, Cpu, Terminal, Code2 } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Globe,
      title: "Application Web Directe",
      description: "Discutez et interagissez avec mAI instantanément depuis votre navigateur avec une interface moderne, fluide et du streaming haute vitesse.",
      color: "text-purple-300",
      bg: "bg-purple-500/10 border-purple-400/25",
      accent: "from-purple-400 to-indigo-400",
    },
    {
      icon: Cpu,
      title: "Intégration Quotidienne Pulse",
      description: "Retrouvez la puissance de mAI au cœur de vos outils du quotidien grâce à nos extensions dédiées pour navigateurs et votre environnement VS Code.",
      color: "text-emerald-300",
      bg: "bg-emerald-500/10 border-emerald-400/25",
      accent: "from-emerald-400 to-teal-400",
    },
    {
      icon: Terminal,
      title: "Assistant Terminal CLI",
      description: "Pilotez vos séances de codage, automatisez vos relectures de code et vos scripts de développement directement en ligne de commande.",
      color: "text-blue-300",
      bg: "bg-blue-500/10 border-blue-400/25",
      accent: "from-blue-400 to-cyan-400",
    },
    {
      icon: Code2,
      title: "IDE IA & Agents Coder",
      description: "Développez avec un environnement complet alimenté par des agents autonomes et le protocole standardisé MCP.",
      color: "text-purple-300",
      bg: "bg-purple-500/10 border-purple-400/25",
      accent: "from-purple-400 to-indigo-400",
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
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white">
          Pourquoi choisir <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-300">mDevsLabs</span> ?
        </h2>
        <p className="text-slate-400 text-sm sm:text-base font-light mt-2">
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
            className="group bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-6 hover:border-purple-300/40 transition-colors duration-200 shadow-[0_4px_30px_rgba(0,0,0,0.35)] flex flex-col justify-between"
          >
            <div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${feat.bg} mb-4 group-hover:scale-105 transition-transform duration-200 shadow-xs`}>
                <feat.icon className={`w-6 h-6 ${feat.color}`} />
              </div>

              <h3 className="text-lg font-black text-white mb-2 group-hover:text-purple-300 transition-colors">
                {feat.title}
              </h3>

              <p className="text-slate-300 text-xs leading-relaxed font-normal">
                {feat.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10">
              <div className={`h-1 w-8 rounded-full bg-gradient-to-r ${feat.accent} group-hover:w-full transition-all duration-300`} />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
