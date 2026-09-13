'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, Sparkles, User } from 'lucide-react';
import { PageSearch } from '@/components/ui/search-bar';
import { NewsMedia } from '@/components/ui/media';
import type { NewsArticle } from '@/lib/news';

export type NewsListItem = Omit<NewsArticle, 'content'>;

const ALL_CATEGORIES = 'Tout';

const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr.split('-').length !== 3) return dateStr;
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

function NewsCard({ article, large = false }: { article: NewsListItem; large?: boolean }) {
  return (
    <Link href={`/news/${article.slug}`} className="group block h-full">
      <article className="bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-4 md:p-6 flex flex-col relative overflow-hidden h-full hover:shadow-[0_8px_32px_0_rgba(249,115,22,0.2)] transition-all">
        {article.image && (
          <div
            className={`relative mb-4 rounded-2xl overflow-hidden bg-slate-100 ${
              large ? 'h-48 md:h-60' : 'h-40 md:h-48'
            }`}
          >
            <NewsMedia
              src={article.image}
              kind={article.imageType}
              alt={article.title}
              fill
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        {(article.category || article.label) && (
          <span className="absolute top-4 right-4 md:top-5 md:right-5 px-3 py-1 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm text-slate-800 text-xs font-bold uppercase tracking-wider">
            {article.category || article.label}
          </span>
        )}

        <h2
          className={`${
            large ? 'text-lg md:text-2xl' : 'text-lg md:text-xl'
          } font-bold text-slate-900 mb-2 group-hover:text-orange-500 transition-colors leading-tight`}
        >
          {article.title}
        </h2>

        <p className="mb-4 flex-1 text-slate-600 text-sm md:text-base leading-relaxed line-clamp-3">
          {article.description}
        </p>

        <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {article.author}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(article.date)}
          </span>
        </div>
      </article>
    </Link>
  );
}

export function NewsClient({ articles }: { articles: NewsListItem[] }) {
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    for (const article of articles) {
      if (article.category) unique.add(article.category);
    }
    return [...unique].sort((a, b) => a.localeCompare(b, 'fr'));
  }, [articles]);

  const featured = useMemo(() => {
    const marked = articles.filter((article) => article.visibility === 'featured');
    return (marked.length > 0 ? marked : articles).slice(0, 3);
  }, [articles]);

  const featuredSlugs = useMemo(() => new Set(featured.map((article) => article.slug)), [featured]);
  const rest = useMemo(
    () => articles.filter((article) => !featuredSlugs.has(article.slug)),
    [articles, featuredSlugs]
  );

  const showFeatured = activeCategory === ALL_CATEGORIES;
  const gridArticles = showFeatured
    ? rest
    : articles.filter((article) => article.category === activeCategory);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-left mb-6 md:mb-8 space-y-2">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9] md:leading-[0.85] uppercase text-slate-900">
          Actualités
        </h1>

        <p className="text-slate-500 text-base md:text-lg font-light mt-2 md:mt-4">
          Toutes les annonces et nouveautés de mDevsLabs.
        </p>

        <div className="pt-3">
          <PageSearch type="news" placeholder="Rechercher une actualité…" />
        </div>
      </div>

      {showFeatured && featured.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
              Nouveautés
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((article) => (
              <NewsCard key={article.slug} article={article} large />
            ))}
          </div>
        </section>
      )}

      <div className="mb-8 flex flex-wrap gap-2">
        {[ALL_CATEGORIES, ...categories].map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
              activeCategory === category
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white/40 backdrop-blur-md border-white/60 text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gridArticles.length === 0 ? (
          <p className="text-slate-500 col-span-full">Aucune actualité dans cette catégorie.</p>
        ) : (
          gridArticles.map((article) => <NewsCard key={article.slug} article={article} />)
        )}
      </div>
    </div>
  );
}
