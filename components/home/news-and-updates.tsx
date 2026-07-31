"use client";

import { motion } from "motion/react";
import { ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import type { NewsArticle } from "@/lib/news";

export function NewsAndUpdates({ news }: { news: NewsArticle[] }) {
  // Get top 3 news articles
  const latestNews = news.slice(0, 3);

  return (
    <section className="w-full py-6 md:py-10">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4"
      >
        <div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-slate-900">
            Activité <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">Récente</span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base font-light mt-1 max-w-xl">
            Découvrez les trois derniers articles et annonces publiés par l&apos;équipe mDevsLabs.
          </p>
        </div>

        <Link
          href="/news"
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-sm border border-slate-200 hover:border-emerald-300 text-slate-900 text-sm font-bold transition-all shadow-xs w-fit"
        >
          Tous les articles
          <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {latestNews.length > 0 ? (
          latestNews.map((article, index) => (
            <motion.div
              key={article.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
            >
              <Link
                href={`/news/${article.slug}`}
                className="group flex flex-col justify-between h-full bg-white/60 backdrop-blur-md border border-white/80 rounded-3xl p-5 sm:p-6 hover:border-emerald-300 transition-colors duration-200 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700">
                      {article.label || "Article"}
                    </span>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {article.date}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors mb-2 line-clamp-2 leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed font-normal mb-5">
                    {article.description}
                  </p>
                </div>

                <div className="pt-3.5 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  <span>Lire l&apos;article</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))
        ) : (
          <div className="col-span-3 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 text-center text-slate-500">
            <p className="text-sm font-medium">Aucun article publié pour le moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
