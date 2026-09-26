"use client";

import Link from "next/link";
import {
  BookOpen,
  ExternalLink,
  FileText,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { SearchEntry } from "@/lib/search-types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isDocEntry(value: unknown): value is SearchEntry {
  return (
    isRecord(value) &&
    value.type === "doc" &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    typeof value.href === "string" &&
    (value.meta === undefined || typeof value.meta === "string")
  );
}

function documentationHref(href: string): string {
  // L'index historique renvoie /docs/<slug>, tandis que le hub App Router
  // sélectionne le document via la query string.
  const match = href.match(/^\/docs\/([^/?#]+)/);
  return match ? `/docs?doc=${encodeURIComponent(match[1])}` : href;
}

function isAbortError(reason: unknown): boolean {
  return (
    (reason instanceof DOMException && reason.name === "AbortError") ||
    (reason instanceof Error && reason.name === "AbortError")
  );
}

export function SupportDocumentationSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedQuery, setResolvedQuery] = useState("");

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setResolvedQuery("");
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          type: "doc",
          q: trimmed,
          limit: "6",
        });
        const response = await fetch(`/api/search?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`La recherche a répondu ${response.status}.`);
        }
        const payload: unknown = await response.json();
        if (!isRecord(payload) || !Array.isArray(payload.results)) {
          throw new Error("Réponse de recherche invalide.");
        }
        const nextResults = payload.results.filter(isDocEntry);
        if (!cancelled) {
          setResults(nextResults);
          setResolvedQuery(trimmed);
        }
      } catch (reason: unknown) {
        if (isAbortError(reason)) return;
        if (!cancelled) {
          setResults([]);
          setResolvedQuery(trimmed);
          setError("La documentation ne répond pas pour le moment.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 260);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const showResults = query.trim().length >= 2;
  const isFresh = resolvedQuery === query.trim();

  return (
    <section className="space-y-4" aria-labelledby="support-docs-search-title">
      <div>
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
          <FileText className="h-4 w-4" aria-hidden="true" />
          Documentation
        </p>
        <h2 id="support-docs-search-title" className="mt-1 text-lg font-extrabold text-slate-900">
          Trouver une réponse dans les guides
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Recherchez dans la documentation publiée par mAI. La recherche attend quelques instants après la saisie.
        </p>
      </div>

      <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm sm:p-5">
        <label htmlFor="support-doc-search" className="sr-only">
          Rechercher dans la documentation
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            id="support-doc-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex. authentification, quota, image…"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            aria-controls="support-doc-results"
            aria-describedby="support-doc-search-help"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Effacer la recherche documentaire"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <p id="support-doc-search-help" className="mt-2 text-[11px] text-slate-400">
          Astuce : saisissez au moins deux caractères.
        </p>

        <div id="support-doc-results" aria-live="polite" aria-busy={loading} className="mt-4">
          {!showResults ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-5 text-center">
              <BookOpen className="mx-auto h-7 w-7 text-slate-300" aria-hidden="true" />
              <p className="mt-2 text-xs text-slate-500">Les suggestions apparaîtront ici.</p>
            </div>
          ) : loading && !isFresh ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-slate-50 px-4 py-6 text-xs text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" aria-hidden="true" />
              Recherche en cours…
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-xs text-amber-800" role="alert">
              {error}
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-5 text-center text-xs text-slate-500">
              Aucun document ne correspond à cette recherche.
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {results.length} résultat{results.length > 1 ? "s" : ""}
                </p>
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" aria-label="Actualisation de la recherche" /> : null}
              </div>
              {results.map((result) => (
                <Link
                  key={`${result.type}-${result.href}-${result.title}`}
                  href={documentationHref(result.href)}
                  className="group flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-slate-800 group-hover:text-blue-700">{result.title}</span>
                    <span className="mt-1 block line-clamp-2 text-xs leading-relaxed text-slate-500">{result.description}</span>
                    {result.meta ? <span className="mt-1.5 inline-block text-[10px] font-bold uppercase tracking-wider text-blue-600">{result.meta}</span> : null}
                  </span>
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 group-hover:text-blue-600" aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
