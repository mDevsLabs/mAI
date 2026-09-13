import fs from 'fs';
import path from 'path';

const DEFAULT_IMAGE = 'https://upload.fs.fr/6iSzjnfokS.png';

export type NewsVisibility = 'featured' | 'standard' | 'hidden';

export type NewsArticle = {
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string;
  label?: string;
  /** Catégorie de l'article (repli sur `label` si absente). */
  category?: string;
  visibility?: NewsVisibility;
  image?: string;
  /** Force le type de média de couverture (sinon détection par extension). */
  imageType?: 'image' | 'video';
  content: string;
};

const newsDirectory = path.join(process.cwd(), 'docs/news');

function isSafeSlug(slug: string): boolean {
  if (!slug) return false;
  if (slug.includes('/') || slug.includes('\\') || slug.includes('..') || slug.includes('\0')) return false;
  const resolved = path.resolve(path.join(newsDirectory, slug));
  return resolved.startsWith(path.resolve(newsDirectory) + path.sep);
}

function readArticle(slug: string): NewsArticle | null {
  if (!isSafeSlug(slug)) return null;
  const articlePath = path.join(newsDirectory, slug);

  if (!fs.existsSync(articlePath) || !fs.statSync(articlePath).isDirectory()) {
    return null;
  }

  const jsonPath = path.join(articlePath, 'index.json');
  const mdPath = path.join(articlePath, 'index.md');

  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath)) {
    return null;
  }

  try {
    const metadata = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    return {
      slug,
      title: metadata.title || 'Sans titre',
      description: metadata.description || '',
      author: metadata.author || 'Inconnu',
      date: metadata.date || 'Date inconnue',
      label: metadata.label,
      category: metadata.category || metadata.label,
      visibility: metadata.visibility,
      image: metadata.image || DEFAULT_IMAGE,
      imageType: metadata.imageType === 'video' ? 'video' : undefined,
      content: fs.readFileSync(mdPath, 'utf8'),
    };
  } catch (e) {
    console.error(`Failed to parse index.json for article ${slug}`, e);
    return null;
  }
}

/** Tous les articles, y compris les articles masqués (visibility: hidden). */
export function getAllNewsArticles(): NewsArticle[] {
  if (!fs.existsSync(newsDirectory)) {
    return [];
  }

  const articles: NewsArticle[] = [];
  for (const slug of fs.readdirSync(newsDirectory)) {
    const article = readArticle(slug);
    if (article) articles.push(article);
  }

  // Tri par date décroissante (format ISO ou comparaison de chaînes simple).
  return articles.sort((a, b) => b.date.localeCompare(a.date));
}

/** Articles visibles dans les listes (les articles `hidden` sont exclus). */
export function getNewsArticles(): NewsArticle[] {
  return getAllNewsArticles().filter((article) => article.visibility !== 'hidden');
}

export function getNewsArticle(slug: string): NewsArticle | null {
  if (!fs.existsSync(newsDirectory)) {
    return null;
  }
  return readArticle(slug);
}

/** Catégories uniques des articles visibles, triées alphabétiquement. */
export function getNewsCategories(): string[] {
  const categories = new Set<string>();
  for (const article of getNewsArticles()) {
    if (article.category) categories.add(article.category);
  }
  return [...categories].sort((a, b) => a.localeCompare(b, 'fr'));
}
