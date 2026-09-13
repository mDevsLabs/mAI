import { getAllNewsArticles, getNewsArticle } from '@/lib/news';
import PrintArticleClient from './PrintArticleClient';

export async function generateStaticParams() {
  const articles = getAllNewsArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function PrintArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const article = getNewsArticle(resolvedParams.slug);

  if (!article) {
    return <div>Article non trouvé</div>;
  }

  return <PrintArticleClient article={article} />;
}
