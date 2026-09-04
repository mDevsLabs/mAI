"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Calendar, User } from "lucide-react";
import { NewsMedia } from "@/components/news-media";
import { FormattedText } from "@/components/formatted-text";
import type { NewsArticle } from "@/lib/news";

const CATEGORIES = [
  "Toutes",
  "Produits",
  "Recherche & Modèles",
  "Infrastructure & API",
  "Entreprise",
];

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

export function NewsClient({ articles }: { articles: NewsArticle[] }) {
  const [selectedCategory, setSelectedCategory] = useState("Toutes");

  const filteredArticles =
    selectedCategory === "Toutes"
      ? articles
      : articles.filter(
          (a) =>
            a.category?.toLowerCase() === selectedCategory.toLowerCase()
        );

  const featuredArticle = filteredArticles[0];
  const gridArticles = filteredArticles.slice(1);

  return (
    <div className="space-y-12">
      {/* Barre d'onglets de catégories - Style OpenAI */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-neutral-200/80">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          const count =
            cat === "Toutes"
              ? articles.length
              : articles.filter(
                  (a) => a.category?.toLowerCase() === cat.toLowerCase()
                ).length;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium tracking-tight transition-all duration-150 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                isActive
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive
                    ? "bg-neutral-800 text-neutral-300"
                    : "bg-neutral-200/60 text-neutral-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filteredArticles.length === 0 ? (
        <div className="py-20 text-center text-neutral-400 font-light">
          Aucun article dans cette catégorie pour le moment.
        </div>
      ) : (
        <>
          {/* Article en vedette / Nouveautés (Haut de page) - Format Large OpenAI */}
          {featuredArticle && (
            <section className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-neutral-400 pb-1">
                <span>Nouveauté à la une</span>
                <span>Dernière publication</span>
              </div>

              <Link
                href={`/news/${featuredArticle.slug}`}
                className="group block border border-neutral-200/90 hover:border-neutral-400 bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  {/* Média large */}
                  <div className="lg:col-span-7 aspect-video lg:aspect-auto relative min-h-[260px] lg:min-h-[380px] bg-neutral-950 overflow-hidden">
                    <NewsMedia
                      src={featuredArticle.media}
                      alt={featuredArticle.title}
                      className="group-hover:scale-102 transition-transform duration-500"
                    />
                  </div>

                  {/* Contenu éditorial */}
                  <div className="lg:col-span-5 p-6 sm:p-8 md:p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2.5 mb-3">
                        <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded-md">
                          {featuredArticle.category || "Produits"}
                        </span>
                        <span className="text-xs text-neutral-400 font-medium">
                          {formatDate(featuredArticle.date)}
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 group-hover:text-neutral-600 transition-colors leading-tight mb-4">
                        {featuredArticle.title}
                      </h2>

                      <p className="text-neutral-600 text-sm sm:text-base leading-relaxed line-clamp-4 font-normal">
                        <FormattedText text={featuredArticle.description} />
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-neutral-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                        <User className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{featuredArticle.author}</span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 group-hover:translate-x-0.5 transition-transform">
                        Lire l'article
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </section>
          )}

          {/* Grille des autres articles - Style éditorial OpenAI */}
          {gridArticles.length > 0 && (
            <section className="space-y-6 pt-4">
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-2">
                Articles récents ({gridArticles.length})
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {gridArticles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/news/${article.slug}`}
                    className="group flex flex-col border border-neutral-200/80 hover:border-neutral-400 bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md"
                  >
                    {/* Média carte (Vidéo loop ou Image) */}
                    <div className="aspect-16/10 relative w-full bg-neutral-950 overflow-hidden">
                      <NewsMedia
                        src={article.media}
                        alt={article.title}
                        className="group-hover:scale-103 transition-transform duration-500"
                      />
                    </div>

                    {/* Infos carte */}
                    <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                            {article.category || "Produits"}
                          </span>
                          <span className="text-xs text-neutral-400">
                            {formatDate(article.date)}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold tracking-tight text-neutral-950 group-hover:text-neutral-600 transition-colors leading-snug mb-2 line-clamp-2">
                          {article.title}
                        </h3>

                        <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed line-clamp-3 font-normal">
                          <FormattedText text={article.description} />
                        </p>
                      </div>

                      <div className="pt-4 mt-5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                        <span className="font-medium truncate max-w-[140px]">
                          {article.author}
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-neutral-900 group-hover:translate-x-0.5 transition-transform">
                          Lire
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
