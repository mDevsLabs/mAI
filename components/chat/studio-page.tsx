/**
 * Composant StudioPage — Interface de génération d'images via IA
 * Supporte AI Horde et FranceStudent comme providers.
 * Navigation latérale, filtres, galerie, prompt avec options.
 * Stockage des images générées en localStorage.
 * 
 * @version 0.0.3
 */
"use client";

import {
  ArrowLeftIcon,
  DownloadIcon,
  HeartIcon,
  HelpCircleIcon,
  ImageIcon,
  LayoutGridIcon,
  PaletteIcon,
  PlusIcon,
  SearchIcon,
  SendIcon,
  SettingsIcon,
  SparklesIcon,
  TrashIcon,
  XIcon,
  UploadIcon,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  allImageModels,
  DEFAULT_IMAGE_MODEL,
  franceStudentImageModels,
  aiHordeImageModels,
  type ImageModel,
} from "@/lib/ai/models-images";

// Type d'une image générée
type StudioImage = {
  id: string;
  prompt: string;
  model: string;
  provider: string;
  url: string;
  ratio: string;
  favorite: boolean;
  createdAt: string;
  style?: string;
  loras?: any;
  denoisingStrength?: string;
  sourceImageUrl?: string;
};

// Clé de stockage localStorage
const STORAGE_KEY = "mai-studio";
const MAX_IMAGES = 75;

// Ratios disponibles
const ratios = ["1:1", "16:9", "4:5"];
// Variantes
const variants = [1, 2, 3, 4];

// Styles disponibles pour le Studio
const availableStyles = [
  { id: "none", name: "Aucun", prompt: "" },
  { id: "cinematic", name: "Cinématique", prompt: "cinematic style, dramatic lighting, highly detailed, 8k" },
  { id: "anime", name: "Anime", prompt: "anime style, vibrant colors, clean lines, detailed" },
  { id: "photorealistic", name: "Photoréaliste", prompt: "photorealistic, hyperrealistic, masterpiece, raw photo" },
  { id: "3d", name: "Rendu 3D", prompt: "3d render, octane render, unreal engine, highly detailed" },
  { id: "cyberpunk", name: "Cyberpunk", prompt: "cyberpunk aesthetic, neon lights, futuristic, dark city" },
  { id: "watercolor", name: "Aquarelle", prompt: "watercolor painting, soft edges, canvas texture" },
];

// Chargement depuis localStorage
function loadImages(): StudioImage[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Sauvegarde dans localStorage
function saveImages(images: StudioImage[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
}

// Navigation latérale
type NavSection = "explorer" | "images" | "likes";
type LibSection = "media" | "favorites" | "downloads" | "trash";

export function StudioPage() {
  const [images, setImages] = useState<StudioImage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState(DEFAULT_IMAGE_MODEL);
  const [selectedRatio, setSelectedRatio] = useState("1:1");
  const [selectedVariants, setSelectedVariants] = useState(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeNav, setActiveNav] = useState<NavSection>("images");
  const [activeLib, setActiveLib] = useState<LibSection>("media");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProvider, setFilterProvider] = useState<string>("all");
  const [filterTime, setFilterTime] = useState<string>("all");
  const [showModelSelect, setShowModelSelect] = useState(false);
  
  // Nouveaux états pour les fonctionnalités avancées
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [denoisingStrength, setDenoisingStrength] = useState(0.5);
  const [selectedStyle, setSelectedStyle] = useState("none");
  const [loras, setLoras] = useState<{ name: string; model: number }[]>([]);
  const [showStyleSelect, setShowStyleSelect] = useState(false);
  const [showLoraSelect, setShowLoraSelect] = useState(false);
  const [newLoraName, setNewLoraName] = useState("");
  
  const promptRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chargement initial depuis la BDD
  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/studio`);
        if (res.ok) {
          const data = await res.json();
          setImages(data.images);
        }
      } catch (error) {
        console.error("Failed to fetch images:", error);
        toast.error("Impossible de charger les images");
      }
    }
    fetchImages();
  }, []);

  // Trouver le modèle sélectionné
  const currentModel = useMemo(
    () => allImageModels.find((m) => m.id === selectedModel) ?? allImageModels[0],
    [selectedModel]
  );

  // Génération d'image
  const generateImage = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error("Veuillez entrer une description");
      return;
    }
    if (images.length >= MAX_IMAGES) {
      toast.error(`Limite de ${MAX_IMAGES} images atteinte`);
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/studio/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: selectedStyle !== "none" 
              ? `${prompt.trim()}, ${availableStyles.find(s => s.id === selectedStyle)?.prompt}`
              : prompt.trim(),
            model: selectedModel,
            ratio: selectedRatio,
            variants: selectedVariants,
            sourceImage,
            denoisingStrength,
            loras,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors de la génération");
      }

      const data = await response.json();
      const newImages: StudioImage[] = (data.images ?? []).map(
        (img: { url: string }) => ({
          id: crypto.randomUUID(),
          prompt: prompt.trim(),
          model: selectedModel,
          provider: currentModel.provider,
          url: img.url,
          ratio: selectedRatio,
          favorite: false,
          createdAt: new Date().toISOString(),
        })
      );

      const updated = [...newImages, ...images];
      setImages(updated);
      toast.success(`${newImages.length} image(s) générée(s) !`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, selectedModel, selectedRatio, selectedVariants, images, currentModel, sourceImage, denoisingStrength, selectedStyle, loras]);

  // Toggle favori
  const toggleFavorite = useCallback(
    async (id: string) => {
      const img = images.find((i) => i.id === id);
      if (!img) return;
      
      const newFavorite = !img.favorite;
      
      const updated = images.map((i) =>
        i.id === id ? { ...i, favorite: newFavorite } : i
      );
      setImages(updated);
      
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/studio/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ favorite: newFavorite }),
        });
        if (!res.ok) throw new Error();
      } catch {
        setImages(images);
        toast.error("Impossible de mettre à jour le favori");
      }
    },
    [images]
  );

  // Supprimer une image
  const deleteImage = useCallback(
    async (id: string) => {
      const updated = images.filter((img) => img.id !== id);
      setImages(updated);
      
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/studio/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error();
        toast.success("Image supprimée");
      } catch {
        setImages(images);
        toast.error("Impossible de supprimer l'image");
      }
    },
    [images]
  );

  // Recharger l'état d'une image pour la recréer ou la modifier
  const reloadImageState = useCallback(
    (img: StudioImage) => {
      setPrompt(img.prompt);
      setSelectedModel(img.model);
      setSelectedRatio(img.ratio);
      if (img.style) setSelectedStyle(img.style);
      if (img.loras) setLoras(img.loras as any);
      if (img.denoisingStrength) setDenoisingStrength(parseFloat(img.denoisingStrength));
      if (img.sourceImageUrl) setSourceImage(img.sourceImageUrl);
      
      toast.success("Paramètres de l'image rechargés !");
    },
    []
  );

  // Filtrage des images
  const filteredImages = useMemo(() => {
    let result = [...images];

    // Navigation
    if (activeNav === "likes") {
      result = result.filter((img) => img.favorite);
    }

    // Recherche
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (img) =>
          img.prompt.toLowerCase().includes(q) ||
          img.model.toLowerCase().includes(q)
      );
    }

    // Filtre provider
    if (filterProvider !== "all") {
      result = result.filter((img) => img.provider === filterProvider);
    }

    // Filtre temporel
    if (filterTime !== "all") {
      const now = new Date();
      const cutoff = new Date();
      switch (filterTime) {
        case "today":
          cutoff.setHours(0, 0, 0, 0);
          break;
        case "week":
          cutoff.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoff.setMonth(now.getMonth() - 1);
          break;
      }
      result = result.filter((img) => new Date(img.createdAt) >= cutoff);
    }

    return result;
  }, [images, activeNav, searchQuery, filterProvider, filterTime]);

  return (
    <div className="flex h-dvh bg-background">
      {/* Sidebar gauche — Navigation */}
      <div className="flex w-52 shrink-0 flex-col border-r border-border/40 bg-card/50 p-3">
        {/* Retour */}
        <Link
          className="mb-4 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          href="/applications"
        >
          <ArrowLeftIcon className="size-3.5" />
          Applications
        </Link>

        {/* Navigation */}
        <div className="mb-4">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            Navigation
          </p>
          {[
            { id: "explorer" as NavSection, label: "Explorer", icon: LayoutGridIcon },
            { id: "images" as NavSection, label: "Images", icon: ImageIcon },
            { id: "likes" as NavSection, label: "J'aime", icon: HeartIcon },
          ].map((item) => (
            <button
              className={`mb-0.5 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors ${
                activeNav === item.id
                  ? "bg-primary/10 text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              type="button"
            >
              <item.icon className="size-3.5" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Bibliothèque */}
        <div className="mb-4">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            Bibliothèque
          </p>
          {[
            { id: "media" as LibSection, label: "Mes médias" },
            { id: "favorites" as LibSection, label: "Favoris" },
            { id: "downloads" as LibSection, label: "Téléchargements" },
            { id: "trash" as LibSection, label: "Déchets" },
          ].map((item) => (
            <button
              className={`mb-0.5 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors ${
                activeLib === item.id
                  ? "bg-primary/10 text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              key={item.id}
              onClick={() => setActiveLib(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Compteur */}
        <div className="mt-auto px-2 text-[10px] text-muted-foreground/50">
          Studio: {images.length} / {MAX_IMAGES} images
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Barre de filtres */}
        <div className="flex items-center gap-3 border-b border-border/40 p-3">
          {/* Filtre provider */}
          <div>
            <p className="mb-1 text-[10px] font-medium text-muted-foreground/60">
              IA utilisée
            </p>
            <select
              className="rounded-lg border border-border/50 bg-background px-2 py-1 text-xs"
              onChange={(e) => setFilterProvider(e.target.value)}
              value={filterProvider}
            >
              <option value="all">Toutes</option>
              <option value="francestudent">FranceStudent</option>
              <option value="ai-horde">AI Horde</option>
            </select>
          </div>

          {/* Tri */}
          <div>
            <p className="mb-1 text-[10px] font-medium text-muted-foreground/60">
              Tri
            </p>
            <select className="rounded-lg border border-border/50 bg-background px-2 py-1 text-xs">
              <option>Date</option>
              <option>Nom</option>
            </select>
          </div>

          {/* Recherche */}
          <div className="relative ml-auto flex-1 max-w-md">
            <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/40" />
            <input
              className="w-full rounded-lg border border-border/50 bg-background py-1.5 pl-8 pr-3 text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par prompt, style, modèle..."
              value={searchQuery}
            />
          </div>

          {/* Filtres temporels */}
          <div className="flex gap-1">
            {[
              { value: "today", label: "Aujourd'hui" },
              { value: "week", label: "Cette semaine" },
              { value: "month", label: "Ce mois" },
              { value: "all", label: "Tout" },
            ].map((f) => (
              <button
                className={`rounded-lg px-2 py-1 text-[10px] transition-colors ${
                  filterTime === f.value
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
                key={f.value}
                onClick={() => setFilterTime(f.value)}
                type="button"
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Galerie */}
        <div className="flex-1 overflow-auto p-4">
          {filteredImages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <ImageIcon className="mx-auto mb-3 size-12 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground/60">
                  {images.length === 0
                    ? "Aucune image générée. Utilisez le prompt ci-dessous pour commencer."
                    : "Aucune image ne correspond aux filtres sélectionnés."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredImages.map((img) => (
                <div
                  className="group relative overflow-hidden rounded-xl bg-card shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-float)]"
                  key={img.id}
                >
                  <div 
                    className="aspect-square overflow-hidden cursor-pointer"
                    onClick={() => reloadImageState(img)}
                  >
                    <img
                      alt={img.prompt}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      src={img.url}
                    />
                  </div>

                  {/* Overlay actions */}
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex w-full items-center justify-between p-2">
                      <p className="flex-1 truncate text-[10px] text-white/80">
                        {img.prompt}
                      </p>
                      <div className="flex gap-1">
                        <button
                          className={`rounded-lg p-1 transition-colors ${
                            img.favorite ? "text-red-400" : "text-white/60 hover:text-white"
                          }`}
                          onClick={() => toggleFavorite(img.id)}
                          type="button"
                        >
                          <HeartIcon className={`size-3.5 ${img.favorite ? "fill-current" : ""}`} />
                        </button>
                        <button
                          className="rounded-lg p-1 text-white/60 transition-colors hover:text-white"
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = img.url;
                            a.download = `studio-${img.id}.png`;
                            a.click();
                          }}
                          type="button"
                        >
                          <DownloadIcon className="size-3.5" />
                        </button>
                        <button
                          className="rounded-lg p-1 text-white/60 transition-colors hover:text-red-400"
                          onClick={() => deleteImage(img.id)}
                          type="button"
                        >
                          <TrashIcon className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Barre de prompt */}
        <div className="border-t border-border/40 bg-card/50 p-3">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-2 rounded-2xl border border-border/30 bg-card px-3 py-2 shadow-[var(--shadow-composer)] focus-within:shadow-[var(--shadow-composer-focus)]">
              {/* Bouton ajouter fichier (img2img) */}
              <button
                className={`rounded-lg p-1.5 transition-colors ${sourceImage ? "text-cyan-500 bg-cyan-500/10" : "text-muted-foreground/50 hover:text-foreground"}`}
                title="Ajouter une image de référence (img2img)"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <ImageIcon className="size-4" />
              </button>
              <input
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setSourceImage(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                ref={fileInputRef}
                type="file"
              />

              {/* Aperçu de l'image source */}
              {sourceImage && (
                <div className="relative size-8 shrink-0 overflow-hidden rounded-lg border border-border/50">
                  <img src={sourceImage} alt="Ref" className="size-full object-cover" />
                  <button
                    className="absolute right-0 top-0 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                    onClick={() => setSourceImage(null)}
                    type="button"
                  >
                    <XIcon className="size-3" />
                  </button>
                </div>
              )}

              {/* Prompt */}
              <input
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    generateImage();
                  }
                }}
                placeholder="Décrivez votre image..."
                ref={promptRef}
                value={prompt}
              />

              {/* Bouton générer */}
              <button
                className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-medium transition-all ${
                  isGenerating
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-foreground text-background hover:opacity-90 active:scale-95"
                }`}
                disabled={isGenerating}
                onClick={generateImage}
                type="button"
              >
                {isGenerating ? (
                  <>
                    <SparklesIcon className="size-3 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="size-3" />
                    Générer
                  </>
                )}
              </button>
            </div>

            {/* Options sous le prompt */}
            <div className="mt-2 flex items-center gap-2">
              {/* Ratios */}
              {ratios.map((ratio) => (
                <button
                  className={`rounded-lg px-2.5 py-1 text-[10px] transition-colors ${
                    selectedRatio === ratio
                      ? "bg-muted text-foreground font-medium ring-1 ring-border"
                      : "text-muted-foreground hover:bg-muted/50"
                  }`}
                  key={ratio}
                  onClick={() => setSelectedRatio(ratio)}
                  type="button"
                >
                  {ratio}
                </button>
              ))}

              {/* Variantes */}
              <div className="relative">
                <button
                  className="rounded-lg bg-muted px-2.5 py-1 text-[10px] font-medium text-foreground ring-1 ring-border"
                  onClick={() => {
                    const next = variants[(variants.indexOf(selectedVariants) + 1) % variants.length];
                    setSelectedVariants(next);
                  }}
                  type="button"
                >
                  {selectedVariants}v
                </button>
              </div>

              {/* Sélecteur de modèle */}
              <div className="relative ml-2">
                <button
                  className="rounded-lg px-2.5 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                  onClick={() => setShowModelSelect(!showModelSelect)}
                  type="button"
                >
                  🎨 {currentModel.name}
                </button>

                {showModelSelect && (
                  <div className="absolute bottom-full left-0 z-50 mb-1 max-h-64 w-64 overflow-auto rounded-xl border border-border/50 bg-card p-2 shadow-[var(--shadow-float)]">
                    <p className="mb-1 px-2 text-[10px] font-semibold text-muted-foreground/60">
                      FranceStudent
                    </p>
                    {franceStudentImageModels.map((m) => (
                      <button
                        className={`mb-0.5 flex w-full rounded-lg px-2 py-1 text-left text-[11px] transition-colors ${
                          selectedModel === m.id
                            ? "bg-primary/10 text-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                        key={m.id}
                        onClick={() => {
                          setSelectedModel(m.id);
                          setShowModelSelect(false);
                        }}
                        type="button"
                      >
                        {m.name}
                      </button>
                    ))}
                    <p className="mb-1 mt-2 px-2 text-[10px] font-semibold text-muted-foreground/60">
                      AI Horde ({aiHordeImageModels.length} modèles)
                    </p>
                    {aiHordeImageModels.slice(0, 30).map((m) => (
                      <button
                        className={`mb-0.5 flex w-full rounded-lg px-2 py-1 text-left text-[11px] transition-colors ${
                          selectedModel === m.id
                            ? "bg-primary/10 text-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                        key={m.id}
                        onClick={() => {
                          setSelectedModel(m.id);
                          setShowModelSelect(false);
                        }}
                        type="button"
                      >
                        {m.name}
                      </button>
                    ))}
                    {aiHordeImageModels.length > 30 && (
                      <p className="px-2 py-1 text-[10px] text-muted-foreground/50">
                        +{aiHordeImageModels.length - 30} autres modèles...
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Boutons outils */}
              <div className="relative ml-auto">
                <button
                  className={`rounded-lg px-2.5 py-1 text-[10px] transition-colors ${selectedStyle !== "none" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted/50"}`}
                  onClick={() => setShowStyleSelect(!showStyleSelect)}
                  type="button"
                >
                  <PaletteIcon className="inline size-3 mr-1" />
                  Styles
                </button>
                
                {showStyleSelect && (
                  <div className="absolute bottom-full right-0 z-50 mb-1 w-48 overflow-auto rounded-xl border border-border/50 bg-card p-2 shadow-[var(--shadow-float)]">
                    {availableStyles.map((s) => (
                      <button
                        className={`mb-0.5 flex w-full rounded-lg px-2 py-1 text-left text-[11px] transition-colors ${
                          selectedStyle === s.id
                            ? "bg-primary/10 text-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                        key={s.id}
                        onClick={() => {
                          setSelectedStyle(s.id);
                          setShowStyleSelect(false);
                        }}
                        type="button"
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bouton LoRA */}
              <div className="relative">
                <button
                  className={`rounded-lg px-2.5 py-1 text-[10px] transition-colors ${loras.length > 0 ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted/50"}`}
                  onClick={() => setShowLoraSelect(!showLoraSelect)}
                  type="button"
                >
                  <SparklesIcon className="inline size-3 mr-1" />
                  LoRAs
                </button>
                
                {showLoraSelect && (
                  <div className="absolute bottom-full right-0 z-50 mb-1 w-64 overflow-auto rounded-xl border border-border/50 bg-card p-3 shadow-[var(--shadow-float)]">
                    <p className="mb-2 text-[10px] font-semibold text-muted-foreground/60">Ajouter un LoRA (AI Horde)</p>
                    <div className="flex gap-1 mb-2">
                      <input
                        className="flex-1 rounded-lg border border-border/50 bg-background px-2 py-1 text-xs"
                        placeholder="Nom du LoRA..."
                        value={newLoraName}
                        onChange={(e) => setNewLoraName(e.target.value)}
                      />
                      <button
                        className="rounded-lg bg-foreground px-2 py-1 text-xs text-background hover:opacity-90"
                        onClick={() => {
                          if (newLoraName.trim()) {
                            setLoras([...loras, { name: newLoraName.trim(), model: 1.0 }]);
                            setNewLoraName("");
                          }
                        }}
                        type="button"
                      >
                        Add
                      </button>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-auto">
                      {loras.map((lora, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px] bg-muted/50 p-1.5 rounded-lg">
                          <span className="truncate flex-1">{lora.name}</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              className="w-10 bg-transparent text-right"
                              value={lora.model}
                              step={0.1}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setLoras(loras.map((l, i) => i === idx ? { ...l, model: val } : l));
                              }}
                            />
                            <button
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => setLoras(loras.filter((_, i) => i !== idx))}
                              type="button"
                            >
                              <XIcon className="size-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Force Strength slider if sourceImage is present */}
              {sourceImage && (
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>Force:</span>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.1"
                    value={denoisingStrength}
                    onChange={(e) => setDenoisingStrength(parseFloat(e.target.value))}
                    className="w-16 h-1 bg-muted rounded-full appearance-none [&::-webkit-slider-thumb]:size-2.5 [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:rounded-full"
                  />
                  <span>{denoisingStrength}</span>
                </div>
              )}

              <button
                className="rounded-lg px-2.5 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-muted/50"
                type="button"
              >
                <HelpCircleIcon className="inline size-3 mr-1" />
                Aide
              </button>
              <button
                className="rounded-lg px-2.5 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-muted/50"
                type="button"
              >
                <SettingsIcon className="inline size-3 mr-1" />
                Mode édition
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
