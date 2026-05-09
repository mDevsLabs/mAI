/**
 * Composant LibraryPage — Répertoire centralisé des fichiers importés
 * Permet d'importer, rechercher, filtrer, favoriser et gérer des fichiers.
 * Stockage en localStorage.
 * 
 * @version 0.0.2
 */
"use client";

import {
  CopyIcon,
  EditIcon,
  EyeIcon,
  GridIcon,
  HeartIcon,
  ListIcon,
  PinIcon,
  SearchIcon,
  TrashIcon,
  UploadIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// Type d'un fichier en bibliothèque
type LibraryFile = {
  id: string;
  name: string;
  type: "image" | "document";
  source: string;
  url: string;
  size: number;
  pinned: boolean;
  favorite: boolean;
  createdAt: string;
  previewUrl?: string;
};

// Clé de stockage localStorage
const STORAGE_KEY = "mai-library";
const MAX_FILES = 100;

// Chargement depuis localStorage
function loadFiles(): LibraryFile[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Sauvegarde dans localStorage
function saveFiles(files: LibraryFile[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

// Types de tri
type SortType = "date" | "name" | "size";
type FilterType = "all" | "image" | "document";
type ViewType = "grid" | "list";

export function LibraryPage() {
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortType>("date");
  const [filterBy, setFilterBy] = useState<FilterType>("all");
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chargement initial
  useEffect(() => {
    setFiles(loadFiles());
  }, []);

  // Import de fichier
  const handleImport = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files || []);
      if (files.length + selectedFiles.length > MAX_FILES) {
        toast.error(`Limite de ${MAX_FILES} fichiers atteinte`);
        return;
      }

      const newFiles: LibraryFile[] = selectedFiles.map((file) => {
        const isImage = file.type.startsWith("image/");
        return {
          id: crypto.randomUUID(),
          name: file.name,
          type: isImage ? "image" : "document",
          source: "upload",
          url: URL.createObjectURL(file),
          size: file.size,
          pinned: false,
          favorite: false,
          createdAt: new Date().toISOString(),
          previewUrl: isImage ? URL.createObjectURL(file) : undefined,
        };
      });

      const updated = [...files, ...newFiles];
      setFiles(updated);
      saveFiles(updated);
      toast.success(`${newFiles.length} fichier(s) importé(s)`);

      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [files]
  );

  // Supprimer un fichier
  const deleteFile = useCallback(
    (id: string) => {
      const updated = files.filter((f) => f.id !== id);
      setFiles(updated);
      saveFiles(updated);
      toast.success("Fichier supprimé");
    },
    [files]
  );

  // Toggle favori
  const toggleFavorite = useCallback(
    (id: string) => {
      const updated = files.map((f) =>
        f.id === id ? { ...f, favorite: !f.favorite } : f
      );
      setFiles(updated);
      saveFiles(updated);
    },
    [files]
  );

  // Toggle épingle
  const togglePin = useCallback(
    (id: string) => {
      const updated = files.map((f) =>
        f.id === id ? { ...f, pinned: !f.pinned } : f
      );
      setFiles(updated);
      saveFiles(updated);
    },
    [files]
  );

  // Renommer un fichier
  const renameFile = useCallback(
    (id: string) => {
      if (!renameValue.trim()) return;
      const updated = files.map((f) =>
        f.id === id ? { ...f, name: renameValue.trim() } : f
      );
      setFiles(updated);
      saveFiles(updated);
      setRenamingId(null);
      setRenameValue("");
      toast.success("Fichier renommé");
    },
    [files, renameValue]
  );

  // Dupliquer un fichier
  const duplicateFile = useCallback(
    (id: string) => {
      if (files.length >= MAX_FILES) {
        toast.error(`Limite de ${MAX_FILES} fichiers atteinte`);
        return;
      }
      const original = files.find((f) => f.id === id);
      if (!original) return;
      const copy: LibraryFile = {
        ...original,
        id: crypto.randomUUID(),
        name: `${original.name} (copie)`,
        pinned: false,
        createdAt: new Date().toISOString(),
      };
      const updated = [...files, copy];
      setFiles(updated);
      saveFiles(updated);
      toast.success("Fichier dupliqué");
    },
    [files]
  );

  // Filtrage et tri
  const filteredFiles = useMemo(() => {
    let result = [...files];

    // Recherche
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.type.includes(q) ||
          f.source.toLowerCase().includes(q)
      );
    }

    // Filtre par type
    if (filterBy !== "all") {
      result = result.filter((f) => f.type === filterBy);
    }

    // Tri
    result.sort((a, b) => {
      // Épinglés en premier
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;

      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "size":
          return b.size - a.size;
        case "date":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [files, search, filterBy, sortBy]);

  return (
    <div className="flex h-dvh flex-col overflow-auto bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
        {/* En-tête */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Bibliothèque
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Répertoire centralisé de vos photos, documents et créations Studio.
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground/60">
              Stockage MAX : {files.length}/{MAX_FILES} fichiers.
            </p>
          </div>
          <button
            className="flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition-all hover:opacity-90 active:scale-95"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <UploadIcon className="size-4" />
            Importer
          </button>
          <input
            accept="*/*"
            className="hidden"
            multiple
            onChange={handleImport}
            ref={fileInputRef}
            type="file"
          />
        </div>

        {/* Barre de recherche et filtres */}
        <div className="mb-6 rounded-2xl bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="mb-3 text-xs font-medium text-muted-foreground/60">
            Recherche instantanée
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40" />
              <input
                className="w-full rounded-xl border border-border/50 bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nom, type (image/document) ou source..."
                value={search}
              />
            </div>

            {/* Contrôles */}
            <div className="flex items-center gap-2">
              {/* Vue */}
              <button
                className={`rounded-lg p-2 text-xs transition-colors ${viewType === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setViewType("grid")}
                title="Vue grille"
                type="button"
              >
                <GridIcon className="size-4" />
              </button>
              <button
                className={`rounded-lg p-2 text-xs transition-colors ${viewType === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setViewType("list")}
                title="Vue liste"
                type="button"
              >
                <ListIcon className="size-4" />
              </button>

              {/* Tri */}
              <select
                className="rounded-lg border border-border/50 bg-background px-2 py-1.5 text-xs text-foreground"
                onChange={(e) => setSortBy(e.target.value as SortType)}
                value={sortBy}
              >
                <option value="date">Tri date</option>
                <option value="name">Tri nom</option>
                <option value="size">Tri taille</option>
              </select>

              {/* Filtre type */}
              <select
                className="rounded-lg border border-border/50 bg-background px-2 py-1.5 text-xs text-foreground"
                onChange={(e) => setFilterBy(e.target.value as FilterType)}
                value={filterBy}
              >
                <option value="all">Tous</option>
                <option value="image">Images</option>
                <option value="document">Documents</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grille / Liste de fichiers */}
        {filteredFiles.length === 0 ? (
          <div className="rounded-2xl bg-card p-12 text-center shadow-[var(--shadow-card)]">
            <p className="text-sm text-muted-foreground">
              {files.length === 0
                ? "Aucun fichier importé. Cliquez sur Importer pour ajouter des fichiers."
                : "Aucun fichier ne correspond à votre recherche."}
            </p>
          </div>
        ) : (
          <div
            className={
              viewType === "grid"
                ? "grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : "flex flex-col gap-2"
            }
          >
            {filteredFiles.map((file) => (
              <div
                className={`group relative rounded-2xl bg-card shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-float)] ${
                  viewType === "list" ? "flex items-center gap-4 p-3" : "p-3"
                }`}
                key={file.id}
              >
                {/* Épingle */}
                <button
                  className={`absolute right-2 top-2 z-10 rounded-lg p-1 transition-all ${
                    file.pinned
                      ? "text-amber-500"
                      : "text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-amber-500"
                  }`}
                  onClick={() => togglePin(file.id)}
                  title={file.pinned ? "Désépingler" : "Épingler"}
                  type="button"
                >
                  <PinIcon className="size-3.5" />
                </button>

                {/* Aperçu */}
                {viewType === "grid" && (
                  <div className="mb-3 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-muted/30">
                    {file.type === "image" && file.previewUrl ? (
                      <img
                        alt={file.name}
                        className="size-full object-cover"
                        src={file.previewUrl}
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground/50">
                        Aperçu non disponible (document)
                      </span>
                    )}
                  </div>
                )}

                {/* Infos */}
                <div className={viewType === "list" ? "flex-1 min-w-0" : ""}>
                  {renamingId === file.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        autoFocus
                        className="flex-1 rounded-lg border border-border/50 bg-background px-2 py-1 text-xs"
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") renameFile(file.id);
                          if (e.key === "Escape") setRenamingId(null);
                        }}
                        value={renameValue}
                      />
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-foreground truncate">
                      {file.name}
                    </p>
                  )}
                  <p className="mt-0.5 text-[10px] text-muted-foreground/50">
                    Ajouté le {new Date(file.createdAt).toLocaleDateString("fr-FR")}{" "}
                    {new Date(file.createdAt).toLocaleTimeString("fr-FR")}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  <button
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    onClick={() => window.open(file.url, "_blank")}
                    type="button"
                  >
                    <EyeIcon className="size-3" /> Ouvrir
                  </button>
                  <button
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] transition-colors hover:bg-muted ${
                      file.favorite ? "text-red-500" : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => toggleFavorite(file.id)}
                    type="button"
                  >
                    <HeartIcon className={`size-3 ${file.favorite ? "fill-current" : ""}`} /> Favori
                  </button>
                  <button
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    onClick={() => duplicateFile(file.id)}
                    type="button"
                  >
                    <CopyIcon className="size-3" /> Dupliquer
                  </button>
                  <button
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    onClick={() => {
                      setRenamingId(file.id);
                      setRenameValue(file.name);
                    }}
                    type="button"
                  >
                    <EditIcon className="size-3" /> Renommer
                  </button>
                  <button
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] text-destructive transition-colors hover:bg-destructive/10"
                    onClick={() => deleteFile(file.id)}
                    type="button"
                  >
                    <TrashIcon className="size-3" /> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
