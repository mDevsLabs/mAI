/**
 * Index de recherche global du site.
 *
 * Agrège toutes les sources de contenu (fichiers Markdown/JSON, données
 * modèles, projets, téléchargements, changelogs) en une liste d'entrées
 * consultable par `GET /api/search`.
 *
 * Module serveur : il lit le système de fichiers, ne pas l'importer
 * depuis un composant client (utiliser `import type` pour les types).
 */

import { getAllDocs } from './docs';
import { getChangelogs } from './changelog';
import { getNewsArticles } from './news';
import { modelsData } from './models-data';
import { allProjects } from './projects-data';
import { OFFICIAL_APPS } from './downloads-data';
import { normalizeText } from './text-utils';

// Les types et libellés sont partagés avec le client (lib/search-types.ts).
export type { SearchType, SearchEntry } from './search-types';
export { SEARCH_TYPE_LABELS, SEARCH_TYPE_ORDER } from './search-types';

import type { SearchEntry, SearchType } from './search-types';

const STATIC_PAGES: SearchEntry[] = [
  {
    type: 'page',
    title: 'Accueil',
    description: 'L\'écosystème IA et outils développeur conçu par mDevsLabs.',
    href: '/',
  },
  {
    type: 'page',
    title: 'Actualités',
    description: 'Toutes les annonces et nouveautés de mDevsLabs.',
    href: '/news',
  },
  {
    type: 'page',
    title: 'Modèles',
    description: 'Les modèles d\'IA mAI : cloud et exécution locale via Ollama.',
    href: '/models',
  },
  {
    type: 'page',
    title: 'Projets',
    description: 'La suite d\'applications mAI : Vibe, Web, Pulse, CLI, Coder.',
    href: '/projects',
  },
  {
    type: 'page',
    title: 'Téléchargements',
    description: 'Liens et commandes d\'installation des applications et modèles mAI.',
    href: '/downloads',
  },
  {
    type: 'page',
    title: 'Documentation',
    description: 'Hub de documentation technique de la suite mAI.',
    href: '/docs',
  },
  {
    type: 'page',
    title: 'Notes de version',
    description: 'Historique des versions de mAI et mSearch.',
    href: '/changelog',
  },
  {
    type: 'page',
    title: 'Abonnements',
    description: 'Forfaits Free, Plus, Pro et Max.',
    href: '/pricing',
  },
  {
    type: 'page',
    title: 'Support',
    description: 'Centre d\'assistance, signalement de bugs et suivi des tickets.',
    href: '/support',
  },
  {
    type: 'page',
    title: 'L\'équipe',
    description: 'À propos de mDevsLabs et de ses projets.',
    href: '/about',
  },
  {
    type: 'page',
    title: 'Clés API',
    description: 'Créez et gérez vos clés d\'accès à l\'API mAI.',
    href: '/account/keys',
  },
  {
    type: 'page',
    title: 'Mon compte',
    description: 'Forfait, quotas, stockage cloud et appareils connectés.',
    href: '/account',
  },
];

let cachedIndex: SearchEntry[] | null = null;

/** Vide le cache mémoire de l'index (utile en développement). */
export function clearSearchIndex(): void {
  cachedIndex = null;
}

/** Construit (et mémoïse) l'index complet du site. */
export function getSearchIndex(): SearchEntry[] {
  if (cachedIndex) return cachedIndex;

  const entries: SearchEntry[] = [...STATIC_PAGES];

  // Actualités
  for (const article of getNewsArticles()) {
    entries.push({
      type: 'news',
      title: article.title,
      description: article.description,
      href: `/news/${article.slug}`,
      meta: article.category ?? article.label,
      content: article.content,
    });
  }

  // Documentation
  for (const doc of getAllDocs()) {
    entries.push({
      type: 'doc',
      title: doc.title,
      description: doc.description,
      href: `/docs/${doc.slug}`,
      meta: doc.category,
      content: doc.content,
    });
  }

  // Modèles
  for (const model of modelsData) {
    entries.push({
      type: 'model',
      title: model.name,
      description: model.tagline,
      href: `/models/${model.id}`,
      meta: model.badge,
    });
  }

  // Projets
  for (const project of allProjects) {
    // Les archives sans page publiée n'ont pas de lien : inutile de les indexer
    if (!project.link) continue;
    entries.push({
      type: 'project',
      title: project.name,
      description: project.tagline || project.description,
      href: project.link,
      meta: project.platforms.join(' · '),
    });
  }

  // Applications téléchargeables
  for (const app of OFFICIAL_APPS) {
    entries.push({
      type: 'download',
      title: app.name,
      description: app.tagline,
      href: '/downloads',
      meta: app.platforms?.map((platform) => platform.label).join(' · '),
    });
  }

  // Notes de version
  try {
    const changelogs = getChangelogs();
    for (const [project, versions] of Object.entries(changelogs)) {
      if (!Array.isArray(versions)) continue;
      for (const version of versions) {
        entries.push({
          type: 'changelog',
          title: `${project} ${version.version} — ${version.title}`,
          description: version.description,
          href: `/changelog/${project.toLowerCase()}`,
          meta: version.date,
        });
      }
    }
  } catch {
    // Les changelogs sont optionnels : on ne bloque jamais l'index pour eux.
  }

  cachedIndex = entries;
  return entries;
}

function scoreEntry(entry: SearchEntry, keywords: string[]): number {
  const title = normalizeText(entry.title);
  const description = normalizeText(entry.description);
  const meta = normalizeText(entry.meta || '');
  const content = normalizeText(entry.content || '');

  let score = 0;

  for (const keyword of keywords) {
    if (title.startsWith(keyword)) score += 60;
    else if (title.includes(keyword)) score += 45;

    if (description.includes(keyword)) score += 18;
    if (meta.includes(keyword)) score += 10;
    if (content.includes(keyword)) score += 4;

    // Aucun mot-clé trouvé : entrée hors sujet.
    if (!title.includes(keyword) && !description.includes(keyword) && !meta.includes(keyword) && !content.includes(keyword)) {
      return 0;
    }
  }

  return score;
}

export type SearchOptions = {
  type?: SearchType | 'all';
  limit?: number;
  /** Inclut le contenu complet dans les résultats (désactivé par défaut). */
  withContent?: boolean;
};

/**
 * Recherche dans l'index global. La requête est normalisée (accents et casse
 * ignorés) et multi-mots : tous les mots-clés doivent correspondre.
 */
export function searchSite(query: string, options: SearchOptions = {}): SearchEntry[] {
  const { type = 'all', limit = 12, withContent = false } = options;
  const entries = getSearchIndex().filter((entry) => type === 'all' || entry.type === type);

  const keywords = normalizeText(query.trim())
    .split(/\s+/)
    .filter(Boolean);

  const results = !query.trim()
    ? entries.slice(0, limit)
    : entries
        .map((entry) => ({ entry, score: scoreEntry(entry, keywords) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ entry, score }) => ({ ...entry, score }));

  return results.map((entry) => {
    if (withContent) return entry;
    const { content: _content, ...rest } = entry;
    return rest;
  });
}
