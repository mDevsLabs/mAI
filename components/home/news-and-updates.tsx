"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { NewsMedia } from "@/components/news-media";
import { FormattedText } from "@/components/formatted-text";
import type { NewsArticle } from "@/lib/news";

const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr.split("-").length !== 3) return dateStr || "";
  const [year, month, day] = dateStr.split("-");
  const months = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
  ];
  const mIndex = parseInt(month, 10) - 1;
  const monthName = months[mIndex] || month;
  return `${parseInt(day, 10)} ${monthName} ${year}`;
};

export function NewsAndUpdates({ news }: { news: NewsArticle[] }) {
  // Top 3 articles
  const latestNews = news.slice(0, 3);

  return (
    <section className="w-full py-8 md:py-14 border-t border-white/10">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4"
      >
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
            Dernières publications
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Actualités &amp; Nouveautés
          </h2>
          <p className="text-slate-400 text-sm sm:text-base font-normal mt-1 max-w-xl">
            Restez informé des annonces d'ingénierie et des lancements de produits de mDevsLabs.
          </p>
        </div>

        <Link
          href="/news"
          className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/15 hover:border-white hover:bg-white/10 bg-white/5 text-white text-xs font-semibold transition-all shadow-lg w-fit"
        >
          <span>Toutes les actualités</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {latestNews.length > 0 ? (
          latestNews.map((article, index) => (
            <motion.div
              key={article.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
            >
              <Link
                href={`/news/${article.slug}`}
                className="group flex flex-col h-full border border-white/10 hover:border-white/40 bg-white/[0.06] backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-[0_8px_30px_rgba(139,92,246,0.25)]"
              >
                {/* Media (Video ou Image) */}
                <div className="aspect-16/10 relative w-full bg-neutral-950 overflow-hidden">
                  <NewsMedia
                    src={article.media}
                    alt={article.title}
                    className="group-hover:scale-103 transition-transform duration-500"
                  />
                </div>

                <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-200 bg-white/10 border border-white/15 px-2 py-0.5 rounded">
                        {article.category || "Produits"}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(article.date)}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors mb-2 line-clamp-2 leading-snug">
                      {article.title}
                    </h3>

                    <p className="text-slate-300 text-xs sm:text-sm line-clamp-3 leading-relaxed font-normal">
                      <FormattedText text={article.description} />
                    </p>
                  </div>

                  <div className="pt-4 mt-5 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-white">
                    <span className="text-slate-400 font-normal truncate max-w-[140px]">
                      {article.author}
                    </span>
                    <span className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Lire
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        ) : (
          <div className="col-span-3 border border-white/10 rounded-2xl p-12 text-center text-slate-400 bg-white/[0.04]">
            <p className="text-sm font-normal">Aucun article publié pour le moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
