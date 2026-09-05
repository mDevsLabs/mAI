"use client";

import { useEffect } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import {
  Search,
  Folder,
  FileText,
  LifeBuoy,
  PlusCircle,
  BarChart3,
  Download,
  Sparkles,
  Cpu,
  Layers,
  ArrowRight,
  BookOpen,
  CreditCard,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { ChangelogsByProject } from "@/lib/changelog";
import type { NewsArticle } from "@/lib/news";
import { stripMarkdown } from "@/components/formatted-text";

export function CommandMenu({
  open,
  setOpen,
  changelogs,
  news,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  changelogs?: ChangelogsByProject;
  news?: NewsArticle[];
}) {
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[15vh] bg-black/50 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white border border-neutral-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <Command
              className="flex flex-col w-full h-full"
              label="Recherche globale mAI"
            >
              <div className="flex items-center px-4 border-b border-neutral-100 bg-neutral-50/50">
                <Search className="w-4 h-4 text-neutral-400 mr-3 shrink-0" />
                <Command.Input
                  autoFocus
                  placeholder="Rechercher sur tout le site (projets, actualités, téléchargements, modèles...)"
                  className="w-full h-13 bg-transparent outline-none text-neutral-900 text-sm placeholder:text-neutral-400 font-sans"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md hover:bg-neutral-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <Command.List className="max-h-[420px] overflow-y-auto p-2 scroll-py-2 divide-y divide-neutral-100/60">
                <Command.Empty className="py-12 text-center text-sm text-neutral-400">
                  Aucun résultat trouvé pour votre recherche.
                </Command.Empty>

                {/* Pages Principales */}
                <Command.Group
                  heading="Navigation rapide"
                  className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-2 py-2"
                >
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/"))}
                    className="flex items-center justify-between px-3 py-2 text-sm text-neutral-800 rounded-lg cursor-pointer aria-selected:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-4 h-4 text-neutral-500" />
                      <span>Accueil</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/news"))}
                    className="flex items-center justify-between px-3 py-2 text-sm text-neutral-800 rounded-lg cursor-pointer aria-selected:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-neutral-500" />
                      <span>Actualités & Nouveautés</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/downloads"))}
                    className="flex items-center justify-between px-3 py-2 text-sm text-neutral-800 rounded-lg cursor-pointer aria-selected:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Download className="w-4 h-4 text-neutral-500" />
                      <span>Téléchargements (Applications & Modèles)</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/projects"))}
                    className="flex items-center justify-between px-3 py-2 text-sm text-neutral-800 rounded-lg cursor-pointer aria-selected:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Folder className="w-4 h-4 text-neutral-500" />
                      <span>Tous les Projets</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/models"))}
                    className="flex items-center justify-between px-3 py-2 text-sm text-neutral-800 rounded-lg cursor-pointer aria-selected:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-neutral-500" />
                      <span>Modèles mAI</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/pricing"))}
                    className="flex items-center justify-between px-3 py-2 text-sm text-neutral-800 rounded-lg cursor-pointer aria-selected:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-neutral-500" />
                      <span>Abonnements & Tarifs</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/docs"))}
                    className="flex items-center justify-between px-3 py-2 text-sm text-neutral-800 rounded-lg cursor-pointer aria-selected:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-neutral-500" />
                      <span>Documentation</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </Command.Item>
                </Command.Group>

                {/* Projets mAI */}
                <Command.Group
                  heading="Projets mAI"
                  className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-2 py-2"
                >
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/projects/vibe"))}
                    className="flex items-center justify-between px-3 py-2 text-sm text-neutral-800 rounded-lg cursor-pointer aria-selected:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Folder className="w-4 h-4 text-neutral-700" />
                      <div>
                        <div className="font-medium text-neutral-900">Vibe (Bêta)</div>
                        <div className="text-xs text-neutral-500">Réseau social open source avec IA intégrée (Web, Android, iOS)</div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">Bêta</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/projects/web"))}
                    className="flex items-center justify-between px-3 py-2 text-sm text-neutral-800 rounded-lg cursor-pointer aria-selected:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Folder className="w-4 h-4 text-neutral-700" />
                      <div>
                        <div className="font-medium text-neutral-900">Web</div>
                        <div className="text-xs text-neutral-500">Application d'IA en ligne web réactive et streaming direct</div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">RC</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/projects/pulse"))}
                    className="flex items-center justify-between px-3 py-2 text-sm text-neutral-800 rounded-lg cursor-pointer aria-selected:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Folder className="w-4 h-4 text-neutral-700" />
                      <div>
                        <div className="font-medium text-neutral-900">Pulse</div>
                        <div className="text-xs text-neutral-500">Extensions navigateurs et VS Code pour l'assistant mAI</div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">RC</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/projects/cli"))}
                    className="flex items-center justify-between px-3 py-2 text-sm text-neutral-800 rounded-lg cursor-pointer aria-selected:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Folder className="w-4 h-4 text-neutral-700" />
                      <div>
                        <div className="font-medium text-neutral-900">CLI</div>
                        <div className="text-xs text-neutral-500">Terminal d'inférence locale et codage assisté</div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">RC</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/projects/coder"))}
                    className="flex items-center justify-between px-3 py-2 text-sm text-neutral-800 rounded-lg cursor-pointer aria-selected:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Folder className="w-4 h-4 text-neutral-700" />
                      <div>
                        <div className="font-medium text-neutral-900">Coder</div>
                        <div className="text-xs text-neutral-500">IDE IA nouvelle génération et agents autonomes MCP</div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">RC</span>
                  </Command.Item>
                </Command.Group>

                {/* Téléchargements & Modèles */}
                <Command.Group
                  heading="Téléchargements & Modèles"
                  className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-2 py-2"
                >
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/downloads"))}
                    className="flex items-center justify-between px-3 py-2 text-sm text-neutral-800 rounded-lg cursor-pointer aria-selected:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Download className="w-4 h-4 text-neutral-700" />
                      <div>
                        <div className="font-medium text-neutral-900">Vibe Releases (Android & iOS)</div>
                        <div className="text-xs text-neutral-500">Télécharger Vibe pour mobile via GitHub Releases</div>
                      </div>
                    </div>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/models/mai-2"))}
                    className="flex items-center justify-between px-3 py-2 text-sm text-neutral-800 rounded-lg cursor-pointer aria-selected:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="font-medium text-neutral-900">mAI-2</div>
                        <div className="text-xs text-neutral-500">Notre meilleur modèle : multimodal, 1M tokens de contexte, via l'API mAI</div>
                      </div>
                    </div>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/models/mai-2-mini"))}
                    className="flex items-center justify-between px-3 py-2 text-sm text-neutral-800 rounded-lg cursor-pointer aria-selected:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-medium text-neutral-900">mAI-2-Mini</div>
                        <div className="text-xs text-neutral-500">La nouvelle génération en version efficace et accessible, via l'API mAI</div>
                      </div>
                    </div>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/models/mai-1.5-light"))}
                    className="flex items-center justify-between px-3 py-2 text-sm text-neutral-800 rounded-lg cursor-pointer aria-selected:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Cpu className="w-4 h-4 text-neutral-700" />
                      <div>
                        <div className="font-medium text-neutral-900">mAI-1.5-Light (4B)</div>
                        <div className="text-xs text-neutral-500">Modèle local ultra-rapide avec vision et exécution d'outils</div>
                      </div>
                    </div>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/models/mai-1.5-apex"))}
                    className="flex items-center justify-between px-3 py-2 text-sm text-neutral-800 rounded-lg cursor-pointer aria-selected:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Cpu className="w-4 h-4 text-neutral-700" />
                      <div>
                        <div className="font-medium text-neutral-900">mAI-1.5-Apex (9B)</div>
                        <div className="text-xs text-neutral-500">Modèle phare 100% local, raisonnement complexe et multimodal</div>
                      </div>
                    </div>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/models/mai-1.5-opal"))}
                    className="flex items-center justify-between px-3 py-2 text-sm text-neutral-800 rounded-lg cursor-pointer aria-selected:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Cpu className="w-4 h-4 text-neutral-700" />
                      <div>
                        <div className="font-medium text-neutral-900">mAI-1.5-Opal (27B)</div>
                        <div className="text-xs text-neutral-500">Haute intelligence et vélocité pour l'inférence locale</div>
                      </div>
                    </div>
                  </Command.Item>
                </Command.Group>

                {/* Actualités / Blog */}
                <Command.Group
                  heading="Articles & Actualités"
                  className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-2 py-2"
                >
                  {news?.map((article) => (
                    <Command.Item
                      key={`news-${article.slug}`}
                      onSelect={() =>
                        runCommand(() => router.push(`/news/${article.slug}`))
                      }
                      className="flex items-start justify-between px-3 py-2 text-sm text-neutral-800 rounded-lg cursor-pointer aria-selected:bg-neutral-100 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <FileText className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
                        <div>
                          <div className="font-medium text-neutral-900 line-clamp-1">{article.title}</div>
                          <div className="text-xs text-neutral-500 line-clamp-1 mt-0.5">{stripMarkdown(article.description)}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 shrink-0 ml-2">
                        {article.category || article.label || "Actualité"}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>

                {/* Support & Assistance */}
                <Command.Group
                  heading="Support & Assistance"
                  className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-2 py-2"
                >
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/support"))}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-800 rounded-lg cursor-pointer aria-selected:bg-neutral-100 transition-colors"
                  >
                    <LifeBuoy className="w-4 h-4 text-neutral-500" />
                    <span>Centre de Support & Signalement</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/support/new"))}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-800 rounded-lg cursor-pointer aria-selected:bg-neutral-100 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 text-neutral-500" />
                    <span>Signaler un bug / Créer un ticket</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/support/tickets"))}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-800 rounded-lg cursor-pointer aria-selected:bg-neutral-100 transition-colors"
                  >
                    <LifeBuoy className="w-4 h-4 text-neutral-500" />
                    <span>Mes tickets & Historique</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/support/stats"))}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-800 rounded-lg cursor-pointer aria-selected:bg-neutral-100 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4 text-neutral-500" />
                    <span>Statistiques & Analyse du Support</span>
                  </Command.Item>
                </Command.Group>
              </Command.List>

              <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50 text-[11px] text-neutral-500 flex items-center justify-between">
                <span>Appuyez sur <kbd className="font-mono bg-neutral-200/80 px-1 py-0.5 rounded text-neutral-700">↵</kbd> pour ouvrir</span>
                <span>Fermer avec <kbd className="font-mono bg-neutral-200/80 px-1 py-0.5 rounded text-neutral-700">Échap</kbd></span>
              </div>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}