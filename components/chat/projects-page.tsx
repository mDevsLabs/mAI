/**
 * Composant ProjectsPage — Interface de gestion des projets
 * Permet de créer des dossiers pour organiser les conversations,
 * les personnaliser (nom, icône emoji) et les gérer.
 * Stockage en localStorage.
 * 
 * @version 0.0.2
 */
"use client";

import {
  EditIcon,
  FolderIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// Type d'un projet
type Project = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  chatIds: string[];
  createdAt: string;
};

// Clé de stockage localStorage
const STORAGE_KEY = "mai-projects";

// Emojis rapides pour la sélection
const quickEmojis = ["📁", "🚀", "💡", "🎨", "📊", "🔬", "📝", "🎯", "🌟", "🔥", "💼", "🏠"];

// Chargement depuis localStorage
function loadProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Sauvegarde dans localStorage
function saveProjects(projects: Project[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newEmoji, setNewEmoji] = useState("📁");

  // Chargement initial
  useEffect(() => {
    setProjects(loadProjects());
  }, []);

  // Création d'un projet
  const createProject = useCallback(() => {
    if (!newName.trim()) {
      toast.error("Le nom du projet est requis");
      return;
    }
    const project: Project = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      description: newDesc.trim(),
      emoji: newEmoji,
      chatIds: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [...projects, project];
    setProjects(updated);
    saveProjects(updated);
    setShowCreateModal(false);
    setNewName("");
    setNewDesc("");
    setNewEmoji("📁");
    toast.success("Projet créé avec succès !");
  }, [newName, newDesc, newEmoji, projects]);

  // Suppression d'un projet
  const deleteProject = useCallback(
    (id: string) => {
      const updated = projects.filter((p) => p.id !== id);
      setProjects(updated);
      saveProjects(updated);
      toast.success("Projet supprimé");
    },
    [projects]
  );

  // Mise à jour d'un projet
  const updateProject = useCallback(() => {
    if (!editingProject) return;
    const updated = projects.map((p) =>
      p.id === editingProject.id
        ? {
            ...p,
            name: newName.trim() || p.name,
            description: newDesc.trim(),
            emoji: newEmoji,
          }
        : p
    );
    setProjects(updated);
    saveProjects(updated);
    setEditingProject(null);
    toast.success("Projet mis à jour");
  }, [editingProject, newName, newDesc, newEmoji, projects]);

  // Ouvrir le modal d'édition
  const startEditing = (project: Project) => {
    setEditingProject(project);
    setNewName(project.name);
    setNewDesc(project.description);
    setNewEmoji(project.emoji);
  };

  return (
    <div className="flex h-dvh flex-col overflow-auto bg-background">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
        {/* En-tête */}
        <div className="mb-8 flex items-start justify-between rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Projets
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Isolez conversations, sources, mémoire et tâches par contexte.
            </p>
          </div>
          <button
            className="rounded-xl bg-gradient-to-r from-cyan-400/80 to-cyan-300/80 px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:from-cyan-400 hover:to-cyan-300 hover:shadow-md active:scale-95"
            onClick={() => setShowCreateModal(true)}
            type="button"
          >
            Nouveau projet
          </button>
        </div>

        {/* Liste des projets */}
        {projects.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 text-center shadow-[var(--shadow-card)]">
            <p className="text-sm text-muted-foreground">
              Aucun projet pour le moment. Créez votre premier projet pour
              structurer vos données.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                className="group relative rounded-2xl bg-card p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-float)]"
                key={project.id}
              >
                {/* Emoji & Nom */}
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-2xl">{project.emoji}</span>
                  <h3 className="text-base font-semibold text-foreground truncate">
                    {project.name}
                  </h3>
                </div>

                {/* Description */}
                {project.description && (
                  <p className="mb-3 text-xs text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                  <FolderIcon className="size-3" />
                  <span>{project.chatIds.length} conversation(s)</span>
                </div>

                {/* Actions */}
                <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    className="rounded-lg p-1.5 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
                    onClick={() => startEditing(project)}
                    title="Modifier"
                    type="button"
                  >
                    <EditIcon className="size-3.5" />
                  </button>
                  <button
                    className="rounded-lg p-1.5 text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => deleteProject(project.id)}
                    title="Supprimer"
                    type="button"
                  >
                    <TrashIcon className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Création / Édition */}
      {(showCreateModal || editingProject) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-[var(--shadow-float)] fade-up">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {editingProject ? "Modifier le projet" : "Nouveau projet"}
              </h2>
              <button
                className="rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingProject(null);
                  setNewName("");
                  setNewDesc("");
                  setNewEmoji("📁");
                }}
                type="button"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            {/* Sélection emoji */}
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Icône
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickEmojis.map((emoji) => (
                  <button
                    className={`rounded-lg p-2 text-lg transition-all ${
                      newEmoji === emoji
                        ? "bg-primary/10 ring-2 ring-primary/40 scale-110"
                        : "hover:bg-muted"
                    }`}
                    key={emoji}
                    onClick={() => setNewEmoji(emoji)}
                    type="button"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Nom */}
            <div className="mb-3">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Nom du projet
              </label>
              <input
                className="w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Mon projet..."
                value={newName}
              />
            </div>

            {/* Description */}
            <div className="mb-5">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Description (optionnel)
              </label>
              <textarea
                className="w-full resize-none rounded-xl border border-border/50 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Description du projet..."
                rows={2}
                value={newDesc}
              />
            </div>

            {/* Boutons */}
            <div className="flex justify-end gap-2">
              <button
                className="rounded-xl px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingProject(null);
                }}
                type="button"
              >
                Annuler
              </button>
              <button
                className="rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition-all hover:opacity-90 active:scale-95"
                onClick={editingProject ? updateProject : createProject}
                type="button"
              >
                {editingProject ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
