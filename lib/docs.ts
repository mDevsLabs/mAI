import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { normalizeText, type DocMetadata } from '@/lib/text-utils';

export type { DocMetadata };

// Cache mémoire pour éviter la relecture synchrone systématique du disque sur chaque appel
let cachedDocs: DocMetadata[] | null = null;

/**
 * Vider le cache mémoire de la documentation (utile si les fichiers changent ou pour les tests).
 */
export function clearDocsCache(): void {
  cachedDocs = null;
}

/**
 * Récupère la liste de tous les documents triés par catégorie, puis par ordre/titre.
 * Utilise un cache mémoire pour la performance.
 */
export function getAllDocs(): DocMetadata[] {
  if (cachedDocs) {
    return cachedDocs;
  }

  const docsDirectory = path.join(process.cwd(), 'docs/documentation');

  if (!fs.existsSync(docsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(docsDirectory);
  const docs: DocMetadata[] = [];

  for (const fileName of fileNames) {
    if (!fileName.endsWith('.md')) continue;

    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(docsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    const { data, content } = matter(fileContents);

    docs.push({
      slug,
      title: data.title || slug,
      description: data.description || '',
      category: data.category || 'Général',
      order: typeof data.order === 'number' ? data.order : 999,
      content,
    });
  }

  // Ordre canonique des catégories
  const categoryOrderMap: Record<string, number> = {
    'Applications': 1,
    "Modèles d'IA": 2,
    'Guides': 3,
    'Architecture': 4,
    'API': 5,
  };

  docs.sort((a, b) => {
    const catOrderA = categoryOrderMap[a.category] ?? 99;
    const catOrderB = categoryOrderMap[b.category] ?? 99;

    if (catOrderA !== catOrderB) {
      return catOrderA - catOrderB;
    }

    if (a.order !== b.order) {
      return a.order - b.order;
    }

    return a.title.localeCompare(b.title, 'fr');
  });

  cachedDocs = docs;
  return cachedDocs;
}

/**
 * Récupère un document spécifique par son slug.
 */
export function getDocBySlug(slug: string): DocMetadata | null {
  const docs = getAllDocs();
  const cachedMatch = docs.find((doc) => doc.slug === slug);
  if (cachedMatch) {
    return cachedMatch;
  }

  const docsDirectory = path.join(process.cwd(), 'docs/documentation');
  const fullPath = path.join(docsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title || slug,
    description: data.description || '',
    category: data.category || 'Général',
    order: typeof data.order === 'number' ? data.order : 999,
    content,
  };
}

/**
 * Filtre les documents par recherche insensible à la casse et aux accents sur le titre,
 * la description, la catégorie et le contenu markdown.
 * Supporte la recherche multi-mots (tous les mots-clés doivent correspondre).
 */
export function searchDocs(query: string): DocMetadata[] {
  const docs = getAllDocs();
  if (!query || !query.trim()) {
    return docs;
  }

  const keywords = normalizeText(query.trim())
    .split(/\s+/)
    .filter(Boolean);

  if (keywords.length === 0) {
    return docs;
  }

  return docs.filter((doc) => {
    const normalizedTitle = normalizeText(doc.title);
    const normalizedDesc = normalizeText(doc.description);
    const normalizedCat = normalizeText(doc.category);
    const normalizedContent = normalizeText(doc.content);

    return keywords.every(
      (kw) =>
        normalizedTitle.includes(kw) ||
        normalizedDesc.includes(kw) ||
        normalizedCat.includes(kw) ||
        normalizedContent.includes(kw)
    );
  });
}

function walkDocs(dir: string, baseDir: string): DocMetadata[] {
  let docs: DocMetadata[] = [];
  if (!fs.existsSync(dir)) return docs;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      docs = docs.concat(walkDocs(path.join(dir, entry.name), baseDir));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const fullPath = path.join(dir, entry.name);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      const relativePath = path.relative(baseDir, fullPath);
      let category = data.category;
      if (!category) {
        const dirname = path.dirname(relativePath);
        if (dirname === '.') {
          category = 'Général';
        } else {
          category = dirname.replace(/\\/g, '/').split('/').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' - ');
        }
      }

      docs.push({
        slug: relativePath.replace(/\\/g, '/').replace(/\.md$/, ''),
        title: data.title || entry.name.replace(/\.md$/, ''),
        description: data.description || '',
        category,
        order: typeof data.order === 'number' ? data.order : 999,
        content,
      });
    }
  }
  return docs;
}

