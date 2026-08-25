"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Search,
  KeyRound,
  Loader2,
  Image as ImageIcon,
  ShieldAlert,
  RefreshCw,
  SlidersHorizontal,
  Building2,
  X,
  ArrowUpDown,
  Ratio,
  Filter,
  Wrench,
  CheckSquare,
  Square,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getUserApiUsage } from "@/app/actions/api-keys";
import toast from "react-hot-toast";
import Link from "next/link";

interface ImageModelItem {
  id: string;
  name: string;
  description: string;
  created?: number;
  provider?: string;
  model_type?: string;
  features?: string[];
  maxResolution?: string;
  supported_parameters?: string[];
}

type SortOption = "default" | "name-asc" | "name-desc" | "provider-asc";

type ResolutionPreset = {
  id: string;
  label: string;
  minW: number | null;
  minH: number | null;
};

const RESOLUTION_PRESETS: ResolutionPreset[] = [
  { id: "all", label: "Tous", minW: null, minH: null },
  { id: "square-hd", label: "1024x1024 (1:1 HD)", minW: 1024, minH: 1024 },
  { id: "square-sd", label: "512x512 (1:1 SD)", minW: 512, minH: 512 },
  { id: "landscape", label: "1280x720 (16:9)", minW: 1280, minH: 720 },
  { id: "portrait", label: "720x1280 (9:16)", minW: 720, minH: 1280 },
  { id: "standard-43", label: "1024x768 (4:3)", minW: 1024, minH: 768 },
];

export default function ApiImageModelsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [models, setModels] = useState<ImageModelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [openModelId, setOpenModelId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  // Fourchettes de résolution
  const [minWidth, setMinWidth] = useState<number | null>(null);
  const [minHeight, setMinHeight] = useState<number | null>(null);

  // Filtre multi-paramètres / fonctionnalités d'images
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [featuresOpen, setFeaturesOpen] = useState(false);

  const [activeCodeTab, setActiveCodeTab] = useState<Record<string, "curl" | "python" | "ts">>({});

  // Redirection immédiate si non authentifié
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/account/login?next=${encodeURIComponent("/account/models/images")}`);
    }
  }, [authLoading, isAuthenticated, router]);

  // Chargement des modèles d'images
  const loadModels = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const userId = user.username || user.email || String(user.id || "dev_user");

      // 1. Clés API
      const keysRes = await getUserApiUsage(userId);
      let chosenKey: string | null = null;

      if (keysRes.success && keysRes.keys && keysRes.keys.length > 0) {
        const randomIndex = Math.floor(Math.random() * keysRes.keys.length);
        chosenKey = keysRes.keys[randomIndex].key;
        setActiveKey(chosenKey);
      } else {
        setActiveKey(null);
      }

      // 2. Appel API /api/v1/models/images
      const headers: Record<string, string> = {
        "x-user-id": userId,
      };
      if (chosenKey) {
        headers["Authorization"] = `Bearer ${chosenKey}`;
      }

      const res = await fetch("/api/v1/models/images", { headers });
      const data = await res.json();

      if (data && Array.isArray(data.data)) {
        setModels(data.data);
        if (data.data.length > 0) {
          setOpenModelId(data.data[0].id);
        }
      } else {
        toast.error("Impossible de récupérer la liste des modèles d'images.");
      }
    } catch (err) {
      console.error("Erreur chargement modèles images:", err);
      toast.error("Erreur lors de la récupération des modèles d'images.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      loadModels();
    }
  }, [isAuthenticated, user]);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success(`ID du modèle copié : ${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleAccordion = (id: string) => {
    setOpenModelId(openModelId === id ? null : id);
  };

  // Fournisseurs uniques
  const providers = useMemo(() => {
    const set = new Set<string>();
    models.forEach((m) => {
      if (m.id.includes("/")) set.add(m.id.split("/")[0]);
      else if (m.provider) set.add(m.provider);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [models]);

  // Liste des fonctionnalités et paramètres disponibles
  const availableFeatures = useMemo(() => {
    const set = new Set<string>();
    const defaultFeatures = [
      "Text-to-Image",
      "prompt",
      "negative_prompt",
      "size",
      "aspect_ratio",
      "response_format",
      "seed",
      "steps",
      "b64_json",
      "url",
      "Flux",
    ];
    defaultFeatures.forEach((f) => set.add(f));

    models.forEach((m) => {
      (m.features || []).forEach((f) => set.add(f));
      (m.supported_parameters || []).forEach((p) => set.add(p));
      if (m.id.toLowerCase().includes("flux")) set.add("Flux");
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [models]);

  const toggleFeature = (feat: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  const isPresetActive = (preset: ResolutionPreset) => {
    return preset.minW === minWidth && preset.minH === minHeight;
  };

  const handlePresetClick = (preset: ResolutionPreset) => {
    setMinWidth(preset.minW);
    setMinHeight(preset.minH);
  };

  const formatRangeLabel = () => {
    if (minWidth === null && minHeight === null) return "Tous les formats";
    if (minWidth && minHeight) return `≥ ${minWidth}×${minHeight} px`;
    if (minWidth) return `Larg. ≥ ${minWidth} px`;
    return `Haut. ≥ ${minHeight} px`;
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedProvider !== "all" ||
    minWidth !== null ||
    minHeight !== null ||
    selectedFeatures.length > 0 ||
    sortBy !== "default";

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedProvider("all");
    setMinWidth(null);
    setMinHeight(null);
    setSelectedFeatures([]);
    setSortBy("default");
  };

  // Filtrage et tri
  const filteredAndSortedModels = useMemo(() => {
    let filtered = models.filter((m) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        m.name?.toLowerCase().includes(searchLower) ||
        m.id?.toLowerCase().includes(searchLower) ||
        m.description?.toLowerCase().includes(searchLower);

      const provider = m.id.includes("/") ? m.id.split("/")[0] : m.provider || "";
      const matchesProvider = selectedProvider === "all" || provider === selectedProvider;

      // Filtre résolution (si le modèle a maxResolution ou défaut 1024)
      let modelMaxW = 1024;
      let modelMaxH = 1024;
      if (m.maxResolution && m.maxResolution.includes("x")) {
        const parts = m.maxResolution.split("x");
        modelMaxW = parseInt(parts[0], 10) || 1024;
        modelMaxH = parseInt(parts[1], 10) || 1024;
      }
      const matchesW = minWidth === null || modelMaxW >= minWidth;
      const matchesH = minHeight === null || modelMaxH >= minHeight;

      // Filtre fonctionnalités / paramètres
      const modelAllTags = [
        ...(m.features || []),
        ...(m.supported_parameters || []),
        "Text-to-Image",
        "prompt",
        "negative_prompt",
        "size",
        "response_format",
        "url",
        "b64_json",
        m.id.toLowerCase().includes("flux") ? "Flux" : "",
      ].map((t) => t.toLowerCase());

      const matchesFeatures =
        selectedFeatures.length === 0 ||
        selectedFeatures.every((f) => modelAllTags.includes(f.toLowerCase()));

      return matchesSearch && matchesProvider && matchesW && matchesH && matchesFeatures;
    });

    if (sortBy === "name-asc") {
      filtered = [...filtered].sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
    } else if (sortBy === "name-desc") {
      filtered = [...filtered].sort((a, b) => (b.name || b.id).localeCompare(a.name || a.id));
    } else if (sortBy === "provider-asc") {
      filtered = [...filtered].sort((a, b) => {
        const pa = a.id.includes("/") ? a.id.split("/")[0] : "";
        const pb = b.id.includes("/") ? b.id.split("/")[0] : "";
        return pa.localeCompare(pb);
      });
    }

    return filtered;
  }, [models, searchQuery, selectedProvider, minWidth, minHeight, selectedFeatures, sortBy]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center py-40 min-h-screen">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          <span>Vérification de la session...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Onglets de navigation : Modèles Texte vs Modèles Images vs Modèles mAI */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/60 w-fit overflow-x-auto">
          <Link
            href="/account/models"
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            Modèles Texte
          </Link>
          <Link
            href="/account/models/images"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-purple-700 shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
            Modèles Images
          </Link>
          <Link
            href="/account/models/mai"
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            Modèles mAI
          </Link>
        </div>

        {/* En-tête de page */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="text-left space-y-3">
            <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter leading-[0.9] uppercase text-slate-900">
              Modèles de <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600">
                Génération d&apos;Images
              </span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base font-light max-w-2xl">
              Consultez le catalogue interactif des modèles accessibles via votre clé d&apos;API. Filtrez par laboratoire, formats de résolution et paramètres, puis triez instantanément.
            </p>
          </div>

          <button
            onClick={loadModels}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-xs disabled:opacity-50 cursor-pointer self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        </div>

        {/* Clé API active utilisée */}
        {activeKey ? (
          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between text-xs text-purple-900 font-medium">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                Données chargées avec votre clé :{" "}
                <code className="font-mono font-bold bg-white/80 px-2 py-0.5 rounded-md border border-purple-200">
                  {activeKey.slice(0, 8)}...{activeKey.slice(-4)}
                </code>
              </span>
            </div>
            <Link
              href="/account/keys"
              className="text-purple-600 hover:text-purple-700 font-bold hover:underline"
            >
              Gérer les clés →
            </Link>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Aucune clé API trouvée. Les modèles sont affichés en mode consultation publique.
              </span>
            </div>
            <Link
              href="/account/keys"
              className="font-bold text-amber-800 underline hover:text-amber-900"
            >
              Créer une clé API
            </Link>
          </div>
        )}

        {/* Barre de recherche, filtres et tri — Structure identique à Modèles Texte */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-5">
          {/* Ligne 1 : Recherche + Laboratoire */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un modèle par nom, ID, laboratoire, mot-clé..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white focus:border-purple-200 text-slate-900 placeholder-slate-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  aria-label="Effacer la recherche"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="relative w-full lg:w-[260px] shrink-0">
              <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full pl-8 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white focus:border-purple-200 cursor-pointer appearance-none transition-all"
                aria-label="Filtrer par laboratoire IA"
              >
                <option value="all">Tous les labos ({models.length})</option>
                {providers.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Formats & Résolutions */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700">
                <Ratio className="w-4 h-4 text-purple-600" />
                Formats &amp; Résolutions
                <span className="ml-1 text-[11px] font-bold normal-case tracking-normal text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                  {formatRangeLabel()}
                </span>
              </div>
              {(minWidth !== null || minHeight !== null) && (
                <button
                  onClick={() => {
                    setMinWidth(null);
                    setMinHeight(null);
                  }}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  Effacer
                </button>
              )}
            </div>

            {/* Presets rapides */}
            <div className="flex flex-wrap gap-2">
              {RESOLUTION_PRESETS.map((preset) => {
                const active = isPresetActive(preset);
                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetClick(preset)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                      active
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Champs personnalisés Largeur / Hauteur Min */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3" />
                  Largeur min (px)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={64}
                    value={minWidth ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "") setMinWidth(null);
                      else {
                        const n = parseInt(v, 10);
                        if (!isNaN(n) && n >= 0) setMinWidth(n);
                      }
                    }}
                    placeholder="ex: 1024"
                    className="w-full pl-3 pr-12 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-200 text-slate-900 placeholder-slate-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                    px
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {minWidth !== null ? `≥ ${minWidth} px` : "Aucun minimum"}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3" />
                  Hauteur min (px)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={64}
                    value={minHeight ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "") setMinHeight(null);
                      else {
                        const n = parseInt(v, 10);
                        if (!isNaN(n) && n >= 0) setMinHeight(n);
                      }
                    }}
                    placeholder="ex: 1024"
                    className="w-full pl-3 pr-12 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-200 text-slate-900 placeholder-slate-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                    px
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {minHeight !== null ? `≥ ${minHeight} px` : "Aucun minimum"}
                </p>
              </div>
            </div>
          </div>

          {/* Ligne 3 : Outils/Paramètres multi-sélection + Tri + Bouton Réinitialiser */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Filtre multi-paramètres */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setFeaturesOpen((o) => !o)}
                className="w-full flex items-center justify-between pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-white hover:border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
                aria-label="Sélectionner les paramètres"
                aria-expanded={featuresOpen}
              >
                <Wrench className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <span className="truncate text-left">
                  {selectedFeatures.length === 0
                    ? "Tous les paramètres"
                    : `${selectedFeatures.length} paramètre${selectedFeatures.length > 1 ? "s" : ""} sélectionné${selectedFeatures.length > 1 ? "s" : ""}`}
                </span>
                <span className="flex items-center gap-1 shrink-0">
                  {selectedFeatures.length > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-600 text-white text-[11px] font-black">
                      {selectedFeatures.length}
                    </span>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      featuresOpen ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </button>

              {/* Dropdown multi-select */}
              {featuresOpen && (
                <div className="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Paramètres &amp; Styles
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedFeatures([...availableFeatures])}
                        className="text-[11px] font-bold text-purple-600 hover:text-purple-700 px-2 py-1 rounded-lg hover:bg-purple-50 cursor-pointer"
                      >
                        Tout
                      </button>
                      <button
                        onClick={() => setSelectedFeatures([])}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                      >
                        Effacer
                      </button>
                    </div>
                  </div>

                  <div className="p-2 max-h-64 overflow-y-auto space-y-1">
                    {availableFeatures.map((feat) => {
                      const checked = selectedFeatures.includes(feat);
                      return (
                        <button
                          key={feat}
                          type="button"
                          onClick={() => toggleFeature(feat)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-slate-50 text-slate-700 transition-colors text-left cursor-pointer"
                        >
                          <span className="flex items-center gap-2 font-mono">
                            {checked ? (
                              <CheckSquare className="w-3.5 h-3.5 text-purple-600" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-300" />
                            )}
                            <span className={checked ? "font-bold text-purple-900" : ""}>
                              {feat}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Tri */}
            <div className="relative">
              <ArrowUpDown className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full pl-8 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white focus:border-purple-200 cursor-pointer appearance-none transition-all"
                aria-label="Trier les modèles"
              >
                <option value="default">Tri par défaut</option>
                <option value="name-asc">Nom A → Z</option>
                <option value="name-desc">Nom Z → A</option>
                <option value="provider-asc">Laboratoire A → Z</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Bouton Réinitialiser */}
            <div>
              <button
                type="button"
                onClick={resetFilters}
                disabled={!hasActiveFilters}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Réinitialiser tous les filtres"
              >
                <Filter className="w-3.5 h-3.5" />
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Compteur de résultats */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-500">
            <span>
              <strong className="text-slate-900">{filteredAndSortedModels.length}</strong> modèle{filteredAndSortedModels.length > 1 ? "s" : ""} trouvé{filteredAndSortedModels.length > 1 ? "s" : ""} sur {models.length}
            </span>
          </div>
        </div>

        {/* Liste des modèles d'images */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/80">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-3" />
            <p className="text-sm font-medium text-slate-500">Chargement des modèles d&apos;images...</p>
          </div>
        ) : filteredAndSortedModels.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 space-y-3">
            <p className="text-base font-bold text-slate-700">Aucun modèle d&apos;image trouvé</p>
            <p className="text-xs text-slate-400">Essayez un autre mot-clé ou réinitialisez les filtres.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedModels.map((model) => {
              const isOpen = openModelId === model.id;
              const provider = model.id.includes("/") ? model.id.split("/")[0] : model.provider || "Comet API";
              const isFlux = model.id.toLowerCase().includes("flux");
              const currentTab = activeCodeTab[model.id] || "curl";

              return (
                <div
                  key={model.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                    isOpen ? "border-purple-300 shadow-md ring-1 ring-purple-100" : "border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(model.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-purple-600 shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                            {model.name || model.id}
                          </h2>
                          {isFlux && (
                            <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-black uppercase tracking-wider">
                              Flux
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-mono truncate">{model.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        Text-to-Image
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white uppercase">
                        {provider}
                      </span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-6"
                      >
                        {/* Description */}
                        <div>
                          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Description</h3>
                          <p className="text-sm text-slate-700 leading-relaxed">{model.description}</p>
                        </div>

                        {/* Paramètres supportés pour la génération d'images */}
                        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                          <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-2">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
                            Spécifications &amp; Paramètres de Requête
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                              <p className="text-slate-400 font-mono text-[10px]">prompt</p>
                              <p className="font-bold text-slate-800">Texte descriptif</p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                              <p className="text-slate-400 font-mono text-[10px]">size</p>
                              <p className="font-bold text-slate-800">1024x1024 / 512x512</p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                              <p className="text-slate-400 font-mono text-[10px]">response_format</p>
                              <p className="font-bold text-slate-800">url ou b64_json</p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                              <p className="text-slate-400 font-mono text-[10px]">negative_prompt</p>
                              <p className="font-bold text-slate-800">Optionnel</p>
                            </div>
                          </div>
                        </div>

                        {/* Exemples de code multi-langages (cURL, Python, TypeScript) */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setActiveCodeTab((p) => ({ ...p, [model.id]: "curl" }))}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  currentTab === "curl"
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                cURL
                              </button>
                              <button
                                onClick={() => setActiveCodeTab((p) => ({ ...p, [model.id]: "python" }))}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  currentTab === "python"
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                Python
                              </button>
                              <button
                                onClick={() => setActiveCodeTab((p) => ({ ...p, [model.id]: "ts" }))}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  currentTab === "ts"
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                TypeScript
                              </button>
                            </div>

                            <button
                              onClick={() => handleCopy(model.id)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
                            >
                              {copiedId === model.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              Copier l&apos;ID
                            </button>
                          </div>

                          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
                            {currentTab === "curl" ? (
                              <pre>{`curl -X POST https://mai.val.run/v1/images/generations \\
  -H "Authorization: Bearer VOTRE_CLE_API" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${model.id}",
    "prompt": "Un paysage futuriste cyberpunk avec des néons sous la pluie, 8k",
    "size": "1024x1024",
    "response_format": "url"
  }'`}</pre>
                            ) : currentTab === "python" ? (
                              <pre>{`import requests

url = "https://mai.val.run/v1/images/generations"
headers = {
    "Authorization": "Bearer VOTRE_CLE_API",
    "Content-Type": "application/json"
}
payload = {
    "model": "${model.id}",
    "prompt": "Un paysage futuriste cyberpunk avec des néons sous la pluie, 8k",
    "size": "1024x1024",
    "response_format": "url"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`}</pre>
                            ) : (
                              <pre>{`const response = await fetch("https://mai.val.run/v1/images/generations", {
  method: "POST",
  headers: {
    "Authorization": "Bearer VOTRE_CLE_API",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "${model.id}",
    prompt: "Un paysage futuriste cyberpunk avec des néons sous la pluie, 8k",
    size: "1024x1024",
    response_format: "url",
  }),
});

const data = await response.json();
console.log(data);`}</pre>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
