"use client";

import { motion } from "motion/react";
import { Github, Instagram, Youtube, ArrowRight } from "lucide-react";
import { SiOllama, SiHuggingface } from "react-icons/si";
import Link from "next/link";
import Image from "next/image";

export function CommunitySection() {
  const socials = [
    {
      name: "GitHub",
      href: "https://github.com/mDevsLabs",
      icon: <Github className="w-5 h-5" />,
      bg: "bg-slate-900 text-white hover:bg-slate-800",
    },
    {
      name: "Discord",
      href: "https://discord.gg/invite/fV7zwdGPpY",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
        </svg>
      ),
      bg: "bg-[#5865F2] text-white hover:bg-[#4752C4]",
    },
    {
      name: "X (Twitter)",
      href: "https://x.com/mDevsLabs",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.007 4.076H5.036z" />
        </svg>
      ),
      bg: "bg-black text-white hover:bg-slate-900",
    },
    {
      name: "Instagram",
      href: "https://instagram.com/mDevsLabs",
      icon: <Instagram className="w-5 h-5" />,
      bg: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 text-white hover:opacity-90",
    },
    {
      name: "YouTube",
      href: "https://youtube.com/@mDevsLabs",
      icon: <Youtube className="w-5 h-5" />,
      bg: "bg-[#FF0000] text-white hover:bg-[#CC0000]",
    },
    {
      name: "Ollama",
      href: "https://ollama.com/mDevsLabs",
      icon: <SiOllama className="w-5 h-5" />,
      bg: "bg-slate-900 text-white hover:bg-slate-800",
    },
    {
      name: "Hugging Face",
      href: "https://huggingface.co/mDevsLabs",
      icon: <SiHuggingface className="w-5 h-5" />,
      bg: "bg-[#FFD21E] text-slate-900 hover:bg-yellow-400",
    },
  ];

  return (
    <section className="w-full py-6 md:py-10">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-center max-w-2xl mx-auto mb-8"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white">
          Rejoignez la <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Communauté</span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base font-light mt-1">
          Posez vos questions, échangez avec les développeurs et suivez le développement en direct.
        </p>
      </motion.div>

      {/* Réseaux Sociaux Minimalistes et Arrondis (Rond / Pill clean) */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10">
        {socials.map((social, index) => (
          <motion.a
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ delay: index * 0.05, duration: 0.25 }}
            className={`group flex items-center gap-2.5 px-4 py-3 rounded-full shadow-lg transition-all border border-white/15 ${social.bg}`}
            title={social.name}
          >
            <div className="shrink-0">{social.icon}</div>
            <span className="text-xs font-bold tracking-tight pr-1">
              {social.name}
            </span>
          </motion.a>
        ))}
      </div>

      {/* Banner Call to Action Grand Format */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 sm:p-10 text-white shadow-xl text-center flex flex-col items-center"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
        <Image
          src="/mai-2/mai-planets.png"
          alt=""
          width={220}
          height={220}
          aria-hidden="true"
          className="absolute -right-6 -top-6 w-40 h-40 sm:w-52 sm:h-52 object-cover rounded-full opacity-25 sm:opacity-40 pointer-events-none select-none"
        />

        <h3 className="text-2xl sm:text-3xl md:text-4xl font-black italic tracking-tighter uppercase mb-3 max-w-xl leading-tight">
          Prêt à propulser votre workflow avec <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">mAI</span> ?
        </h3>

        <p className="text-slate-300 text-xs sm:text-sm max-w-lg mb-6 font-light">
          Obtenez votre clé API, explorez nos modèles multimodaux ou installez mAI CLI en quelques secondes.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link href="/account" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-md hover:shadow-purple-500/25 transition-all"
            >
              Gérer mes Clés API
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>

          <Link href="/docs" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 transition-all"
            >
              Consulter la Documentation
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
