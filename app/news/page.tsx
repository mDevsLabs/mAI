import { getNewsArticles } from '@/lib/news';
import { NewsClient } from './NewsClient';

export const metadata = {
  title: 'Actualités',
  description: 'Les dernières actualités de mDevsLabs.',
};

export default function NewsPage() {
  // Le contenu markdown complet n'est pas nécessaire pour la liste.
  const articles = getNewsArticles().map(({ content: _content, ...article }) => article);

  return <NewsClient articles={articles} />;
}
