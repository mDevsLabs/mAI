"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { normalizeText, type DocMetadata } from "@/lib/text-utils";
import ReactMarkdown from "react-markdown";
import {
  Search,
  FileText,
  Clock,
  Layers,
  Copy,
  Check,
  Share2,
  X,
  FileQuestion,
  ChevronRight,
  Menu,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface DocsClientProps {
  initialDocs: DocMetadata[];
  titleSpan?: React.ReactNode;
}

export function DocsClient({ initialDocs, titleSpan }: DocsClientProps) {
  const searchParams = useSearchParams();
  const docParam = searchParams.get("doc");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string>(
    docParam || (initialDocs.length > 0 ? initialDocs[0].slug : "")
  );

  useEffect(() => {
    if (docParam) {
      setSelectedSlug(docParam);
    }
  }, [docParam]);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filter docs in real-time based on searchQuery (accent & case-insensitive)
  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) {
      return initialDocs;
    }
    const keywords = normalizeText(searchQuery.trim())
      .split(/\s+/)
      .filter(Boolean);

    if (keywords.length === 0) {
      return initialDocs;
    }

    return initialDocs.filter((doc) => {
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
  }, [initialDocs, searchQuery]);

  // Group filtered docs by category
  const categoriesMap = useMemo(() => {
    const map: Record<string, DocMetadata[]> = {};
    const defaultCategories = [
      "Applications",
      "Modèles d'IA",
      "Guides",
      "Architecture",
      "API",
    ];

    // Initialize default categories to preserve order
    defaultCategories.forEach((cat) => {
      map[cat] = [];
    });

    filteredDocs.forEach((doc) => {
      if (!map[doc.category]) {
        map[doc.category] = [];
      }
      map[doc.category].push(doc);
    });

    // Remove empty categories if searching
    if (searchQuery.trim()) {
      Object.keys(map).forEach((cat) => {
        if (map[cat].length === 0) {
          delete map[cat];
        }
      });
    }

    return map;
  }, [filteredDocs, searchQuery]);

  // Active document
  const activeDoc = useMemo(() => {
    const found = filteredDocs.find((doc) => doc.slug === selectedSlug);
    if (found) return found;
    return filteredDocs.length > 0 ? filteredDocs[0] : null;
  }, [filteredDocs, selectedSlug]);

  const handleCopyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey("content");
    toast.success("Contenu du document copié dans le presse-papier !");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleShareDoc = (doc: DocMetadata) => {
    if (navigator.share) {
      navigator.share({
        title: doc.title,
        text: doc.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien du document copié !");
    }
  };

  const calculateReadingTime = (content: string) => {
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${Math.max(1, minutes)} min`;
  };

  return (
    <div className="flex flex-col gap-10 md:gap-16 w-full">
      {/* Hero Section */}
      <div className="text-left space-y-2 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9] md:leading-[0.85] uppercase text-slate-900">
            Documentation <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500">
              {titleSpan || "mAI"}
            </span>
          </h1>
          <p className="text-slate-500 text-base md:text-lg font-light mt-2 md:mt-4 max-w-2xl">
            Guides techniques, spécifications d&apos;API et références de la suite mDevsLabs.
          </p>
        </div>

        {/* Bouton Mobile Toggle Sidebar */}
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="lg:hidden flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-md text-sm whitespace-nowrap self-start md:self-auto"
        >
          <Menu className="w-4 h-4" />
          {isMobileSidebarOpen ? "Fermer le menu" : "Parcourir la documentation"}
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar Latérale (Column 5 of 12) */}
        <aside
          className={`lg:col-span-5 flex flex-col gap-4 bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-5 transition-all lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] ${
            isMobileSidebarOpen ? "block" : "hidden lg:flex"
          }`}
        >
          {/* Champ de recherche en temps réel */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher un document, guide, API..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-3 rounded-2xl border border-white/60 bg-white/40 backdrop-blur-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-black/5 transition-colors"
                title="Effacer la recherche"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Compteur de documents */}
          <div className="flex items-center justify-between px-2 text-xs font-semibold text-slate-500 border-b border-black/5 pb-2">
            <span>{filteredDocs.length} document(s) trouvé(s)</span>
            {searchQuery && (
              <span className="text-blue-600 font-medium">Recherche active</span>
            )}
          </div>

          {/* Liste des catégories & documents */}
          <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
            {Object.keys(categoriesMap).length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                <FileQuestion className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
                Aucune catégorie ne correspond à votre recherche.
              </div>
            ) : (
              Object.entries(categoriesMap).map(([category, docs]) => {
                if (docs.length === 0) return null;
                return (
                  <div key={category} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-600" />
                        {category}
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-900/5 text-[10px] text-slate-600">
                        {docs.length}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 pl-1">
                      {docs.map((doc) => {
                        const isSelected = activeDoc?.slug === doc.slug;
                        return (
                          <button
                            key={doc.slug}
                            onClick={() => {
                              setSelectedSlug(doc.slug);
                              setIsMobileSidebarOpen(false);
                            }}
                            className={`w-full text-left px-3 py-3 rounded-2xl text-xs font-medium transition-all flex items-center justify-between group ${
                              isSelected
                                ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20"
                                : "text-slate-700 hover:bg-white/60 hover:text-slate-900"
                            }`}
                          >
                            <span className="truncate pr-2">{doc.title}</span>
                            <ChevronRight
                              className={`w-4 h-4 shrink-0 transition-transform ${
                                isSelected
                                  ? "text-white translate-x-0.5"
                                  : "text-slate-400 group-hover:translate-x-0.5"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Volet Principal de Lecture (Column 7 of 12) */}
        <main className="lg:col-span-7 bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-6 md:p-10 min-h-[600px] flex flex-col justify-between">
          {activeDoc ? (
            <div className="flex flex-col gap-6">
              {/* En-tête du document */}
              <div className="border-b border-black/10 pb-6 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-700 text-xs font-bold uppercase tracking-wider">
                      {activeDoc.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-500 text-xs font-medium">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {calculateReadingTime(activeDoc.content)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-500 text-xs font-medium">
                      <FileText className="w-4 h-4 text-slate-400" />
                      Ordre : {activeDoc.order}
                    </span>
                  </div>

                  {/* Actions (Copier & Partager) */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyContent(activeDoc.content)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/60 border border-white/80 hover:bg-white text-slate-700 text-xs font-semibold transition-all shadow-sm"
                      title="Copier le contenu Markdown"
                    >
                      {copiedKey === "content" ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          Copié
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copier MD
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleShareDoc(activeDoc)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-all shadow-sm"
                      title="Partager ce document"
                    >
                      <Share2 className="w-4 h-4" />
                      Partager
                    </button>
                  </div>
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                  {activeDoc.title}
                </h2>
                <p className="text-slate-600 text-base font-light italic">
                  {activeDoc.description}
                </p>
              </div>

              {/* Corps Markdown Rendu */}
              <div className="prose max-w-none text-slate-800 leading-relaxed font-sans">
                <ReactMarkdown
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
                      <p className="mb-4 text-slate-700 leading-relaxed" {...props} />
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
                          className="bg-blue-100/60 text-blue-800 px-1.5 py-0.5 rounded text-xs font-mono font-semibold"
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
                        className="border-l-4 border-blue-500 bg-blue-50/50 italic p-4 rounded-r-2xl my-6 text-slate-700 shadow-sm"
                        {...props}
                      />
                    ),
                    a: ({ node: _node, href, children, ...props }) => (
                      <a
                        href={href}
                        className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
                        target={href?.startsWith("http") ? "_blank" : "_self"}
                        rel={href?.startsWith("http") ? "noreferrer" : undefined}
                        {...props}
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {activeDoc.content}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            /* Cas où la recherche ne retourne aucun résultat */
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 my-auto">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center mb-4">
                <FileQuestion className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Aucun document trouvé
              </h3>
              <p className="text-slate-500 text-sm max-w-md mb-6">
                Aucun document ne correspond à la recherche &quot;{searchQuery}&quot;. Essayez d&apos;autres mots-clés comme &quot;mAI&quot;, &quot;API&quot;, &quot;Docker&quot; ou &quot;Ollama&quot;.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="px-6 py-3 rounded-full bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
              >
                Réinitialiser la recherche
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
