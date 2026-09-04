import { getNewsArticles } from "@/lib/news";
import { NewsClient } from "./NewsClient";

export const metadata = {
  title: "Actualités",
  description: "Toutes les annonces, nouveautés et articles de recherche de mDevsLabs.",
};

export default function NewsPage() {
  const articles = getNewsArticles();

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* En-tête éditorial Style OpenAI */}
      <div className="space-y-4 pt-4 border-b border-neutral-200/80 pb-8">
        <div className="text-xs font-mono uppercase tracking-widest text-neutral-400">
          mDevsLabs / Newsroom
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-neutral-950">
          Actualités
        </h1>
        <p className="text-neutral-500 text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
          Découvrez nos dernières annonces logicielles, percées en intelligence artificielle locale et évolutions de l'écosystème.
        </p>
      </div>

      {/* Liste dynamique avec onglets catégories, Nouveautés en haut & grille */}
      <NewsClient articles={articles} />
    </div>
  );
}