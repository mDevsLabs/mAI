"use client";

import Link from "next/link";
import {
  BookOpen,
  ChevronDown,
  ExternalLink,
  HelpCircle,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  SUPPORT_CONTENT_CATEGORIES,
  SUPPORT_CONTENT_CATEGORY_BY_ID,
  SUPPORT_FAQS,
  SUPPORT_GUIDES,
  type SupportContentCategoryId,
} from "@/lib/support-content";

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr-FR");
}

function containsQuery(values: readonly string[], query: string): boolean {
  return values.some((value) => normalize(value).includes(query));
}

export function SupportKnowledgeBase() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SupportContentCategoryId | "all">("all");

  const normalizedQuery = normalize(query.trim());
  const filteredFaqs = useMemo(
    () =>
      SUPPORT_FAQS.filter((faq) => {
        const matchesCategory = category === "all" || faq.category === category;
        if (!matchesCategory) return false;
        if (!normalizedQuery) return true;
        return containsQuery(
          [
            faq.question,
            faq.answer,
            SUPPORT_CONTENT_CATEGORY_BY_ID[faq.category].label,
            ...faq.keywords,
          ],
          normalizedQuery,
        );
      }),
    [category, normalizedQuery],
  );
  const filteredGuides = useMemo(
    () =>
      SUPPORT_GUIDES.filter((guide) => {
        const matchesCategory = category === "all" || guide.category === category;
        if (!matchesCategory) return false;
        if (!normalizedQuery) return true;
        return containsQuery(
          [
            guide.title,
            guide.description,
            SUPPORT_CONTENT_CATEGORY_BY_ID[guide.category].label,
            ...guide.keywords,
          ],
          normalizedQuery,
        );
      }),
    [category, normalizedQuery],
  );

  const hasResults = filteredFaqs.length > 0 || filteredGuides.length > 0;

  const resetFilters = () => {
    setQuery("");
    setCategory("all");
  };

  return (
    <section className="space-y-5" aria-labelledby="support-knowledge-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Centre de connaissances
          </p>
          <h2 id="support-knowledge-title" className="mt-1 text-xl font-extrabold text-slate-900">
            Réponses et guides pour avancer
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
            Une réponse rapide, ou un guide pour préparer une demande précise.
          </p>
        </div>
        <Link
          href="/support/new"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 text-xs font-bold text-purple-700 transition-colors hover:bg-purple-100"
        >
          Ouvrir un ticket
        </Link>
      </div>

      <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div>
            <label htmlFor="support-knowledge-search" className="sr-only">
              Rechercher dans les questions et guides
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="support-knowledge-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher une question, un guide, une erreur…"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Effacer la recherche"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </div>
          <p className="text-[11px] text-slate-400" aria-live="polite">
            {filteredFaqs.length} question{filteredFaqs.length > 1 ? "s" : ""} · {filteredGuides.length} guide
            {filteredGuides.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Filtrer par catégorie">
          <span className="mr-1 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            Catégories
          </span>
          <button
            type="button"
            onClick={() => setCategory("all")}
            aria-pressed={category === "all"}
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
              category === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tout
          </button>
          {SUPPORT_CONTENT_CATEGORIES.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setCategory(item.id)}
              aria-pressed={category === item.id}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                category === item.id
                  ? "bg-purple-100 text-purple-700 ring-1 ring-purple-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              title={item.description}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {!hasResults ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
          <HelpCircle className="mx-auto h-9 w-9 text-slate-300" aria-hidden="true" />
          <h3 className="mt-3 text-sm font-bold text-slate-800">Aucun contenu trouvé</h3>
          <p className="mt-1 text-xs text-slate-500">Essayez un autre mot-clé ou affichez toutes les catégories.</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <HelpCircle className="h-4 w-4 text-purple-600" aria-hidden="true" />
              <h3 className="text-sm font-extrabold text-slate-900">Questions fréquentes</h3>
            </div>
            {filteredFaqs.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {filteredFaqs.map((faq) => (
                  <details key={faq.id} className="group py-3 first:pt-0 last:pb-0">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-sm font-bold text-slate-800 marker:hidden hover:text-purple-700">
                      <span>{faq.question}</span>
                      <ChevronDown
                        className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </summary>
                    <div className="pt-2 text-xs leading-relaxed text-slate-600">
                      <p>{faq.answer}</p>
                      {faq.link ? (
                        "external" in faq.link && faq.link.external ? (
                          <a
                            href={faq.link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 font-bold text-purple-700 hover:underline"
                          >
                            {faq.link.label} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </a>
                        ) : (
                          <Link
                            href={faq.link.href}
                            className="mt-2 inline-flex items-center gap-1 font-bold text-purple-700 hover:underline"
                          >
                            {faq.link.label}
                          </Link>
                        )
                      ) : null}
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <p className="py-4 text-xs text-slate-500">Aucune question dans cette sélection.</p>
            )}
          </div>

          <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookOpen className="h-4 w-4 text-blue-600" aria-hidden="true" />
              <h3 className="text-sm font-extrabold text-slate-900">Guides pratiques</h3>
            </div>
            {filteredGuides.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredGuides.map((guide) => (
                  <Link
                    key={guide.id}
                    href={guide.href}
                    className="group flex min-h-[132px] flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-purple-200 hover:bg-purple-50/50"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                        {SUPPORT_CONTENT_CATEGORY_BY_ID[guide.category].label}
                      </span>
                      <h4 className="mt-1 text-sm font-bold text-slate-800 group-hover:text-purple-700">{guide.title}</h4>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500">{guide.description}</p>
                    </div>
                    <span className="mt-3 text-[10px] font-semibold text-slate-400">Lire · {guide.readTime}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-4 text-xs text-slate-500">Aucun guide dans cette sélection.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
