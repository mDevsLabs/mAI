import { getNewsArticle, getNewsArticles } from "@/lib/news";
import Markdown from "react-markdown";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { notFound } from "next/navigation";
import { ShareButtons, CommentSection } from "./ArticleClient";
import { NewsMedia } from "@/components/news-media";

const formatDate = (dateStr: any) => {
  if (typeof dateStr !== "string") return String(dateStr || "");
  if (!dateStr || dateStr.split("-").length !== 3) return dateStr;
  const [year, month, day] = dateStr.split("-");
  const months = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
  ];
  const mIndex = parseInt(month, 10) - 1;
  const monthName = months[mIndex] || month;
  return `${parseInt(day, 10)} ${monthName} ${year}`;
};

export async function generateStaticParams() {
  const articles = getNewsArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const article = getNewsArticle(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  const categoryName = article.category || article.label || "Produits";

  return (
    <article className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Retour aux actualités */}
      <div>
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Toutes les actualités</span>
        </Link>
      </div>

      {/* En-tête de l'article - Style OpenAI */}
      <header className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-neutral-900 bg-neutral-100 px-3 py-1 rounded-md">
            {categoryName}
          </span>
          <span className="text-neutral-300">•</span>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span>{formatDate(article.date)}</span>
          </div>
          <span className="text-neutral-300">•</span>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
            <User className="w-3.5 h-3.5 text-neutral-400" />
            <span>{article.author}</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-neutral-950 leading-[1.1]">
          {article.title}
        </h1>

        {article.description && (
          <p className="text-lg sm:text-xl text-neutral-600 font-normal leading-relaxed border-l-2 border-neutral-300 pl-4 py-1">
            {article.description}
          </p>
        )}
      </header>

      {/* Média Héro (Lecteur Vidéo interactif ou Image) */}
      {article.media && (
        <div className="relative overflow-hidden rounded-2xl border border-neutral-200 shadow-sm bg-neutral-950">
          <NewsMedia
            src={article.media}
            alt={article.title}
            isArticlePage={true}
          />
        </div>
      )}

      {/* Corps de l'article éditorial */}
      <div className="border-t border-neutral-200/80 pt-8">
        <div className="prose prose-neutral max-w-none text-neutral-800 leading-relaxed font-sans prose-headings:font-bold prose-headings:tracking-tight prose-a:text-neutral-900 prose-a:underline hover:prose-a:text-neutral-600">
          <Markdown
            components={{
              h1: ({ node: _node, ...props }) => (
                <h1
                  className="text-2xl sm:text-3xl font-bold text-neutral-950 mt-10 mb-4 border-b border-neutral-100 pb-2"
                  {...props}
                />
              ),
              h2: ({ node: _node, ...props }) => (
                <h2
                  className="text-xl sm:text-2xl font-bold text-neutral-950 mt-8 mb-3 border-b border-neutral-100 pb-1"
                  {...props}
                />
              ),
              h3: ({ node: _node, ...props }) => (
                <h3
                  className="text-lg font-bold text-neutral-900 mt-6 mb-2"
                  {...props}
                />
              ),
              p: ({ node: _node, ...props }) => (
                <p className="mb-4 text-neutral-700 leading-relaxed text-base" {...props} />
              ),
              ul: ({ node: _node, ...props }) => (
                <ul
                  className="list-disc list-inside space-y-2 mb-6 text-neutral-700 pl-2"
                  {...props}
                />
              ),
              ol: ({ node: _node, ...props }) => (
                <ol
                  className="list-decimal list-inside space-y-2 mb-6 text-neutral-700 pl-2"
                  {...props}
                />
              ),
              li: ({ node: _node, ...props }) => (
                <li className="mb-1 text-neutral-700" {...props} />
              ),
              code: ({ node: _node, className, children, ...props }) => {
                const isInline = !className;
                return isInline ? (
                  <code
                    className="bg-neutral-100 text-neutral-900 px-1.5 py-0.5 rounded text-xs font-mono font-medium border border-neutral-200"
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <code className={`${className} font-mono text-xs`} {...props}>
                    {children}
                  </code>
                );
              },
              pre: ({ node: _node, ...props }) => (
                <pre
                  className="bg-neutral-950 text-neutral-100 p-5 rounded-xl overflow-x-auto my-6 font-mono text-xs border border-neutral-800 shadow-md"
                  {...props}
                />
              ),
              blockquote: ({ node: _node, ...props }) => (
                <blockquote
                  className="border-l-2 border-neutral-900 bg-neutral-50 italic p-4 rounded-r-xl my-6 text-neutral-700"
                  {...props}
                />
              ),
              a: ({ node: _node, href, children, ...props }) => (
                <a
                  href={href}
                  className="text-neutral-900 hover:text-neutral-600 underline font-semibold transition-colors"
                  target={href?.startsWith("http") ? "_blank" : "_self"}
                  rel={href?.startsWith("http") ? "noreferrer" : undefined}
                  {...props}
                >
                  {children}
                </a>
              ),
            }}
          >
            {article.content}
          </Markdown>
        </div>
      </div>

      {/* Partage & Commentaires */}
      <div className="space-y-8 pt-6">
        <ShareButtons title={article.title} description={article.description} />
        <CommentSection articleSlug={resolvedParams.slug} />
      </div>
    </article>
  );
}