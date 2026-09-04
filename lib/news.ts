import fs from 'fs';
import path from 'path';

const DEFAULT_IMAGE = 'https://upload.fs.fr/6iSzjnfokS.png';

export type NewsArticle = {
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string;
  label?: string;
  category?: string;
  media?: string;
  image?: string;
  isVideo?: boolean;
  content: string;
};

export function isVideoMedia(url?: string): boolean {
  if (!url) return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return (
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.ogg') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.endsWith('.m4v')
  );
}

const newsDirectory = path.join(process.cwd(), 'docs/news');

export function getNewsArticles(): NewsArticle[] {
  if (!fs.existsSync(newsDirectory)) {
    return [];
  }

  const slugs = fs.readdirSync(newsDirectory);
  const articles: NewsArticle[] = [];

  for (const slug of slugs) {
    const articlePath = path.join(newsDirectory, slug);
    if (!fs.statSync(articlePath).isDirectory()) continue;

    const jsonPath = path.join(articlePath, 'index.json');
    const mdPath = path.join(articlePath, 'index.md');

    if (fs.existsSync(jsonPath) && fs.existsSync(mdPath)) {
      const jsonContent = fs.readFileSync(jsonPath, 'utf8');
      const mdContent = fs.readFileSync(mdPath, 'utf8');
      
      try {
        const metadata = JSON.parse(jsonContent);
        const mediaSource = metadata.media || metadata.image || DEFAULT_IMAGE;
        articles.push({
          slug,
          title: metadata.title || 'Sans titre',
          description: metadata.description || '',
          author: metadata.author || 'Inconnu',
          date: metadata.date || 'Date inconnue',
          label: metadata.label,
          category: metadata.category || metadata.label || 'Produits',
          media: mediaSource,
          image: mediaSource,
          isVideo: isVideoMedia(mediaSource),
          content: mdContent
        });
      } catch (e) {
        console.error(`Failed to parse index.json for article ${slug}`, e);
      }
    }
  }

  // Sort by date (descending) assuming ISO format or simple string comparison
  return articles.sort((a, b) => b.date.localeCompare(a.date));
}

export function getNewsArticle(slug: string): NewsArticle | null {
  const articlePath = path.join(newsDirectory, slug);
  const jsonPath = path.join(articlePath, 'index.json');
  const mdPath = path.join(articlePath, 'index.md');

  if (fs.existsSync(jsonPath) && fs.existsSync(mdPath)) {
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    const mdContent = fs.readFileSync(mdPath, 'utf8');
    
    try {
      const metadata = JSON.parse(jsonContent);
      const mediaSource = metadata.media || metadata.image || DEFAULT_IMAGE;
      return {
        slug,
        title: metadata.title || 'Sans titre',
        description: metadata.description || '',
        author: metadata.author || 'Inconnu',
        date: metadata.date || 'Date inconnue',
        label: metadata.label,
        category: metadata.category || metadata.label || 'Produits',
        media: mediaSource,
        image: mediaSource,
        isVideo: isVideoMedia(mediaSource),
        content: mdContent
      };
    } catch (e) {
      console.error(`Failed to parse index.json for article ${slug}`, e);
      return null;
    }
  }

  return null;
}
