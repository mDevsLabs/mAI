"use client";

import { useEffect } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { Search, Folder, FileText, LifeBuoy, PlusCircle, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { ChangelogsByProject } from "@/lib/changelog";
import type { NewsArticle } from "@/lib/news";

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
        setOpen((open) => !open);
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
          className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[20vh] bg-slate-900/20 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white/60 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/60 overflow-hidden"
          >
            <Command
              className="flex flex-col w-full h-full"
              label="Menu de commandes"
            >
              <div className="flex items-center px-4 border-b border-black/5 bg-white/40">
                <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
                <Command.Input
                  autoFocus
                  placeholder="Rechercher des projets, notes de versions..."
                  className="w-full h-14 bg-transparent outline-none text-slate-900 placeholder:text-slate-500"
                />
              </div>
              <Command.List className="max-h-[400px] overflow-y-auto p-2 scroll-py-2">
                <Command.Empty className="py-6 text-center text-sm text-slate-500">
                  Aucun résultat trouvé.
                </Command.Empty>

                <Command.Group
                  heading="Projets mAI"
                  className="text-xs font-semibold text-slate-500 px-2 py-2"
                >
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/projects/web"))}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 rounded-lg cursor-pointer aria-selected:bg-black/5 aria-selected:text-slate-900 transition-colors"
                  >
                    <Folder className="w-4 h-4 text-amber-500" />
                    <span>Web (Release Candidate) - Application d'IA en ligne</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/projects/vibe"))}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 rounded-lg cursor-pointer aria-selected:bg-black/5 aria-selected:text-slate-900 transition-colors"
                  >
                    <Folder className="w-4 h-4 text-rose-500" />
                    <span>Vibe (Bêta) - Réseau social avec IA intégrée</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/projects/pulse"))}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 rounded-lg cursor-pointer aria-selected:bg-black/5 aria-selected:text-slate-900 transition-colors"
                  >
                    <Folder className="w-4 h-4 text-indigo-500" />
                    <span>Pulse (Release Candidate) - Extensions mAI</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/projects/cli"))}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 rounded-lg cursor-pointer aria-selected:bg-black/5 aria-selected:text-slate-900 transition-colors"
                  >
                    <Folder className="w-4 h-4 text-emerald-500" />
                    <span>CLI (Release Candidate) - Discussions & Code Terminal</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/projects/coder"))}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 rounded-lg cursor-pointer aria-selected:bg-black/5 aria-selected:text-slate-900 transition-colors"
                  >
                    <Folder className="w-4 h-4 text-purple-500" />
                    <span>Coder (Release Candidate) - IDE IA & Agents MCP</span>
                  </Command.Item>
                </Command.Group>

                <Command.Group
                  heading="Support & Assistance"
                  className="text-xs font-semibold text-slate-500 px-2 pt-4 pb-2"
                >
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/support"))}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 rounded-lg cursor-pointer aria-selected:bg-black/5 aria-selected:text-slate-900 transition-colors"
                  >
                    <LifeBuoy className="w-4 h-4 text-purple-600" />
                    <span>Centre de Support & Assistance</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/support/new"))}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 rounded-lg cursor-pointer aria-selected:bg-black/5 aria-selected:text-slate-900 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-600" />
                    <span>Signaler un bug / Créer un ticket</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/support/tickets"))}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 rounded-lg cursor-pointer aria-selected:bg-black/5 aria-selected:text-slate-900 transition-colors"
                  >
                    <LifeBuoy className="w-4 h-4 text-blue-600" />
                    <span>Mes tickets & Historique</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push("/support/stats"))}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 rounded-lg cursor-pointer aria-selected:bg-black/5 aria-selected:text-slate-900 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4 text-amber-600" />
                    <span>Statistiques & Analyse du Support</span>
                  </Command.Item>
                </Command.Group>

                <Command.Group
                  heading="Changelog mAI"
                  className="text-xs font-semibold text-slate-500 px-2 pt-4 pb-2"
                >
                  {changelogs?.mAI?.map((change) => (
                    <Command.Item
                      key={`mai-${change.version}`}
                      onSelect={() =>
                        runCommand(() => router.push("/changelog/mai"))
                      }
                      className="flex flex-col px-3 py-2 text-sm text-slate-700 rounded-lg cursor-pointer aria-selected:bg-black/5 aria-selected:text-slate-900 transition-colors mb-1"
                    >
                      <div className="flex items-center gap-2 font-medium">
                        <FileText className="w-4 h-4 text-purple-500" />
                        <span>
                          {change.version} - {change.title}
                        </span>
                      </div>
                      <div className="pl-6 text-xs text-slate-500 line-clamp-1 mt-1">
                        {change.description.replace(/\n/g, " ")}
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group
                  heading="Changelog mSearch"
                  className="text-xs font-semibold text-slate-500 px-2 pt-4 pb-2"
                >
                  {changelogs?.mSearch?.map((change) => (
                    <Command.Item
                      key={`msearch-${change.version}`}
                      onSelect={() =>
                        runCommand(() => router.push("/changelog/msearch"))
                      }
                      className="flex flex-col px-3 py-2 text-sm text-slate-700 rounded-lg cursor-pointer aria-selected:bg-black/5 aria-selected:text-slate-900 transition-colors mb-1"
                    >
                      <div className="flex items-center gap-2 font-medium">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span>
                          {change.version} - {change.title}
                        </span>
                      </div>
                      <div className="pl-6 text-xs text-slate-500 line-clamp-1 mt-1">
                        {change.description.replace(/\n/g, " ")}
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group
                  heading="Actualités"
                  className="text-xs font-semibold text-slate-500 px-2 pt-4 pb-2"
                >
                  {news?.map((article) => (
                    <Command.Item
                      key={`news-${article.slug}`}
                      onSelect={() =>
                        runCommand(() => router.push(`/news/${article.slug}`))
                      }
                      className="flex flex-col px-3 py-2 text-sm text-slate-700 rounded-lg cursor-pointer aria-selected:bg-black/5 aria-selected:text-slate-900 transition-colors mb-1"
                    >
                      <div className="flex items-center gap-2 font-medium">
                        <FileText className="w-4 h-4 text-orange-500" />
                        <span>{article.title}</span>
                      </div>
                      <div className="pl-6 text-xs text-slate-500 line-clamp-1 mt-1">
                        {article.description}
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}