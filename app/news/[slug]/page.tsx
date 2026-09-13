import { getAllNewsArticles, getNewsArticle } from '@/lib/news';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { notFound } from 'next/navigation';
import { NewsMedia } from '@/components/ui/media';
import { ShareButtons, CommentSection } from './ArticleClient';

const formatDate = (dateStr: any) => {
  if (typeof dateStr !== 'string') return String(dateStr || '');
  if (!dateStr || dateStr.split('-').length !== 3) return dateStr;
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export async function generateStaticParams() {
  const articles = getAllNewsArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const article = getNewsArticle(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  const words = article.content.split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(words / 200));
  const category = article.category || article.label;

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/news" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-white/60 transition-all duration-300 mb-8">
        <ArrowLeft className="w-4 h-4" />
        Retour aux actualités
      </Link>

      <article className="bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-8 md:p-12 relative">
        {category && (
          <div className="mb-6">
            <span className="px-3 py-1 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm text-slate-800 text-xs font-bold uppercase tracking-wider">
              {category}
            </span>
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter leading-[0.9] md:leading-[0.85] uppercase text-slate-900 mb-5">
          {article.title}
        </h1>

        {article.description && (
          <p className="text-lg md:text-xl text-slate-600 font-light leading-relaxed mb-8">
            {article.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-slate-500 mb-10 pb-10 border-b border-black/5">
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            {article.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {formatDate(article.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {readingMinutes} min de lecture
          </span>
        </div>

        {article.image && (
          <div className="relative mb-10 h-56 sm:h-72 md:h-80 rounded-2xl overflow-hidden bg-slate-100">
            <NewsMedia
              src={article.image}
              kind={article.imageType}
              alt={article.title}
              fill
              sound
              priority
            />
          </div>
        )}

        <div className="prose max-w-none text-slate-800 leading-relaxed font-sans">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ node: _node, ...props }) => (
                <h1
                  className="text-2xl md:text-3xl font-black text-slate-900 mt-8 mb-4 border-b border-black/5 pb-2"
                  {...props}
                />
              ),
              h2: ({ node: _node, ...props }) => (
                <h2
                  className="text-xl md:text-2xl font-bold text-slate-900 mt-6 mb-3 border-b border-black/5 pb-1"
                  {...props}
                />
              ),
              h3: ({ node: _node, ...props }) => (
                <h3
                  className="text-lg font-semibold text-slate-900 mt-5 mb-2"
                  {...props}
                />
              ),
              h4: ({ node: _node, ...props }) => (
                <h4
                  className="text-base font-semibold text-slate-900 mt-4 mb-2"
                  {...props}
                />
              ),
              p: ({ node: _node, ...props }) => (
                <p className="mb-5 text-slate-700 leading-relaxed" {...props} />
              ),
              ul: ({ node: _node, ...props }) => (
                <ul
                  className="list-disc list-inside space-y-2 mb-6 text-slate-700 pl-2"
                  {...props}
                />
              ),
              ol: ({ node: _node, ...props }) => (
                <ol
                  className="list-decimal list-inside space-y-2 mb-6 text-slate-700 pl-2"
                  {...props}
                />
              ),
              li: ({ node: _node, ...props }) => (
                <li className="mb-1 text-slate-700" {...props} />
              ),
              table: ({ node: _node, ...props }) => (
                <div className="overflow-x-auto my-6 rounded-2xl border border-white/60 shadow-sm bg-white/30 backdrop-blur-md">
                  <table
                    className="w-full text-sm text-left text-slate-700 border-collapse"
                    {...props}
                  />
                </div>
              ),
              th: ({ node: _node, ...props }) => (
                <th
                  className="px-4 py-3 font-bold text-slate-900 bg-slate-900/5 border-b border-black/10"
                  {...props}
                />
              ),
              td: ({ node: _node, ...props }) => (
                <td
                  className="px-4 py-3 border-b border-black/5 text-slate-700"
                  {...props}
                />
              ),
              code: ({ node: _node, className, children, ...props }) => {
                const isInline = !className;
                return isInline ? (
                  <code
                    className="bg-purple-100/60 text-purple-800 px-1.5 py-0.5 rounded text-xs font-mono font-semibold"
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
                  className="bg-slate-950 text-slate-100 p-4 rounded-2xl overflow-x-auto my-6 font-mono text-xs border border-slate-800 shadow-md"
                  {...props}
                />
              ),
              blockquote: ({ node: _node, ...props }) => (
                <blockquote
                  className="border-l-4 border-purple-500 bg-purple-50/50 italic p-4 rounded-r-2xl my-6 text-slate-700 shadow-sm"
                  {...props}
                />
              ),
              img: ({ node: _node, src, alt }) =>
                src ? (
                  <span className="block my-6 rounded-2xl overflow-hidden border border-white/60 shadow-md bg-slate-100">
                    <NewsMedia
                      src={String(src)}
                      alt={alt || 'Illustration'}
                      className="w-full h-auto"
                    />
                  </span>
                ) : null,
              a: ({ node: _node, href, children, ...props }) => (
                <a
                  href={href}
                  className="text-purple-600 hover:text-purple-800 underline font-medium transition-colors"
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
      </article>

      <ShareButtons title={article.title} description={article.description} />

      <CommentSection articleSlug={resolvedParams.slug} />
    </div>
  );
}
