'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X, Loader2, CornerDownLeft } from 'lucide-react';
import { SEARCH_TYPE_LABELS, type SearchEntry, type SearchType } from '@/lib/search-types';

/** Interroge l'index global avec un debounce court. */
export function useSiteSearch(query: string, type?: SearchType | 'all', limit = 8) {
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [resolvedQuery, setResolvedQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setResolvedQuery('');
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ q: trimmed, limit: String(limit) });
        if (type && type !== 'all') params.set('type', type);
        const res = await fetch(`/api/search?${params.toString()}`, { signal: controller.signal });
        if (!res.ok) throw new Error('search failed');
        const json = await res.json();
        setResults(Array.isArray(json.results) ? json.results : []);
        setResolvedQuery(trimmed);
      } catch {
        // Requête annulée ou réseau indisponible : on garde les résultats précédents.
      } finally {
        setLoading(false);
      }
    }, 160);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, type, limit]);

  return { results, resolvedQuery, loading };
}

/**
 * Barre de recherche d'une page : filtre l'index global sur un type de contenu
 * et affiche les résultats dans un panneau déroulant.
 */
export function PageSearch({
  type = 'all',
  placeholder = 'Rechercher',
  label,
  className = 'w-full max-w-md',
  limit = 8,
  variant = 'default',
}: {
  type?: SearchType | 'all';
  placeholder?: string;
  label?: string;
  className?: string;
  limit?: number;
  /** `navbar` : champ compact fondu dans la barre de navigation. */
  variant?: 'default' | 'navbar';
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { results, resolvedQuery, loading } = useSiteSearch(query, type, limit);

  // N'afficher / ouvrir que des résultats correspondant à la requête courante
  const freshResults = resolvedQuery === query.trim() ? results : [];

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const showPanel = open && query.trim().length >= 2;
  const isNavbar = variant === 'navbar';

  const openFirstResult = () => {
    if (freshResults.length === 0) return;
    setOpen(false);
    router.push(freshResults[0].href);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Search
        className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
          isNavbar ? 'text-slate-400' : 'text-neutral-400'
        }`}
      />
      <input
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
          if (event.key === 'Enter') {
            event.preventDefault();
            openFirstResult();
          }
        }}
        placeholder={placeholder}
        aria-label={label || placeholder}
        className={
          isNavbar
            ? 'h-9 w-full rounded-full border border-black/10 bg-black/5 pl-9 pr-9 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-purple-300 focus:bg-white/80'
            : 'h-10 w-full rounded-lg border border-neutral-300 bg-white pl-9 pr-10 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-900'
        }
      />

      {(loading || query.length > 0) && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
          ) : (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setOpen(false);
              }}
              aria-label="Effacer la recherche"
              className="rounded p-0.5 text-neutral-400 transition-colors hover:text-neutral-900"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </span>
      )}

      {showPanel && (
        <div
          className={`absolute top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_16px_40px_rgba(0,0,0,0.14)] backdrop-blur-xl max-w-[calc(100vw-2rem)] ${
            isNavbar ? 'right-0 w-80 sm:w-96' : 'left-0 w-full min-w-80'
          }`}
        >
          {loading && freshResults.length === 0 ? (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Recherche…
            </div>
          ) : freshResults.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">
              Aucun résultat pour «&nbsp;{query.trim()}&nbsp;»
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {freshResults.length} résultat{freshResults.length > 1 ? 's' : ''}
                </span>
                <span className="hidden items-center gap-1 text-[10px] font-medium text-slate-400 sm:flex">
                  <CornerDownLeft className="h-3 w-3" />
                  Entrée pour ouvrir
                </span>
              </div>
              <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                {freshResults.map((result) => (
                  <li key={`${result.type}-${result.href}-${result.title}`}>
                    <Link
                      href={result.href}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 transition-colors hover:bg-slate-50"
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-sm font-medium text-slate-900">
                          {result.title}
                        </span>
                        <span className="shrink-0 rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {SEARCH_TYPE_LABELS[result.type]}
                        </span>
                      </span>
                      {result.description && (
                        <span className="mt-0.5 block line-clamp-2 text-xs leading-relaxed text-slate-500">
                          {result.description}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
