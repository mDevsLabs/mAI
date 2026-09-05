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
  Loader2,
  Cpu,
  RefreshCw,
  SlidersHorizontal,
  X,
  Sparkles,
  Layers,
  ArrowUpDown,
  Download,
  Eye,
  Brain,
  Code2,
  ExternalLink,
  ShieldCheck,
  Wrench,
  CheckSquare,
  Square,
  Filter,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import toast from "react-hot-toast";
import Link from "next/link";

interface MAIModelAPIItem {
  id: string;
  name: string;
  description: string;
  tagline?: string;
  version?: string;
  parameters?: string;
  status?: "active" | "beta" | "deprecated";
  cloud?: boolean;
  context_length: number;
  max_output_tokens?: number;
  capabilities?: {
    coding?: boolean;
    reasoning?: boolean;
    vision?: boolean;
    jsonOutput?: boolean;
    functionCalling?: boolean;
  };
  recommended_hardware?: {
    minVram?: string;
    recommendedVram?: string;
    ram?: string;
  };
  ollama_tag?: string;
  huggingface_tag?: string;
  license?: string;
  usable_in_cloud_chat?: boolean;
}

type SortOption = "default" | "name-asc" | "name-desc" | "params-desc" | "context-desc";

type ParamPreset = {
  id: string;
  label: string;
  minB: number | null;
  maxB: number | null;
};

const PARAM_PRESETS: ParamPreset[] = [
  { id: "all", label: "Tous", minB: null, maxB: null },
  { id: "lte4", label: "≤ 4B (Léger)", minB: null, maxB: 4 },
  { id: "9-12", label: "9B – 12B (Standard)", minB: 9, maxB: 12 },
  { id: "27-33", label: "27B – 33B (Expert)", minB: 27, maxB: 33 },
  { id: "gte70", label: "≥ 70B (Max)", minB: 70, maxB: null },
];

export default function ApiMaiModelsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [models, setModels] = useState<MAIModelAPIItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModelId, setOpenModelId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  // Fourchettes de paramètres (en milliards de paramètres - B)
  const [paramMinB, setParamMinB] = useState<number | null>(null);
  const [paramMaxB, setParamMaxB] = useState<number | null>(null);

  // Filtre multi-capacités
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [capsOpen, setCapsOpen] = useState(false);

  const [activeTabCode, setActiveTabCode] = useState<Record<string, "ollama" | "python" | "hf">>({});

  // Redirection si non authentifié
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/account/login?next=${encodeURIComponent("/account/models/mai")}`);
    }
  }, [authLoading, isAuthenticated, router]);

  // Chargement des modèles mAI
  const loadModels = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/models/mai");
      const data = await res.json();

      if (data && Array.isArray(data.data)) {
        setModels(data.data);
        if (data.data.length > 0) {
          setOpenModelId(data.data[0].id);
        }
      } else {
        toast.error("Impossible de récupérer les modèles mAI.");
      }
    } catch (err) {
      console.error("Erreur chargement modèles mAI:", err);
      toast.error("Erreur lors de la récupération des modèles mAI.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadModels();
    }
  }, [isAuthenticated]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`${label} copié !`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const toggleAccordion = (id: string) => {
    setOpenModelId(openModelId === id ? null : id);
  };

  // Liste des séries disponibles (mAI 2, mAI 1.5, mAI 1.2, mAI 1.0)
  const availableSeries = useMemo(() => {
    const set = new Set<string>();
    models.forEach((m) => {
      if (m.id.startsWith("mai/") || m.cloud) set.add("mAI 2");
      else if (m.id.includes("1.5")) set.add("mAI 1.5");
      else if (m.id.includes("1.2")) set.add("mAI 1.2");
      else if (m.id.includes("1.0") || m.id.endsWith("-1")) set.add("mAI 1.0");
      else if (m.version) set.add(`mAI ${m.version}`);
    });
    return Array.from(set).sort().reverse();
  }, [models]);

  // Liste des capacités disponibles pour le filtre multi-select
  const availableCapabilities = [
    { id: "vision", label: "Vision Multimodale" },
    { id: "reasoning", label: "Raisonnement (Thinking)" },
    { id: "coding", label: "Développement & Code" },
    { id: "functionCalling", label: "Appels d'Outils (Tools)" },
    { id: "jsonOutput", label: "JSON Structuré" },
  ];

  const toggleCapability = (capId: string) => {
    setSelectedCapabilities((prev) =>
      prev.includes(capId) ? prev.filter((c) => c !== capId) : [...prev, capId]
    );
  };

  const isPresetActive = (preset: ParamPreset) => {
    return preset.minB === paramMinB && preset.maxB === paramMaxB;
  };

  const handlePresetClick = (preset: ParamPreset) => {
    setParamMinB(preset.minB);
    setParamMaxB(preset.maxB);
  };

  const formatRangeLabel = () => {
    if (paramMinB === null && paramMaxB === null) return "Toutes tailles";
    if (paramMinB !== null && paramMaxB !== null) return `${paramMinB}B – ${paramMaxB}B`;
    if (paramMinB !== null) return `≥ ${paramMinB}B`;
    return `≤ ${paramMaxB}B`;
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedSeries !== "all" ||
    paramMinB !== null ||
    paramMaxB !== null ||
    selectedCapabilities.length > 0 ||
    sortBy !== "default";

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedSeries("all");
    setParamMinB(null);
    setParamMaxB(null);
    setSelectedCapabilities([]);
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
        m.description?.toLowerCase().includes(searchLower) ||
        m.tagline?.toLowerCase().includes(searchLower);

      // Série / Version
      let matchesSeries = true;
      if (selectedSeries !== "all") {
        if (selectedSeries === "mAI 1.5") matchesSeries = m.id.includes("1.5");
        else if (selectedSeries === "mAI 1.2") matchesSeries = m.id.includes("1.2");
        else if (selectedSeries === "mAI 1.0") matchesSeries = m.id.includes("1.0") || m.id.endsWith("-1");
      }

      // Filtre taille de paramètres (en B)
      const paramNum = parseInt(m.parameters?.replace(/[^0-9]/g, "") || "0", 10);
      const matchesMin = paramMinB === null || paramNum >= paramMinB;
      const matchesMax = paramMaxB === null || paramNum <= paramMaxB;

      // Filtre capacités
      const matchesCaps =
        selectedCapabilities.length === 0 ||
        selectedCapabilities.every((cap) => {
          if (cap === "vision") return !!m.capabilities?.vision;
          if (cap === "reasoning") return !!m.capabilities?.reasoning;
          if (cap === "coding") return !!m.capabilities?.coding;
          if (cap === "functionCalling") return !!m.capabilities?.functionCalling;
          if (cap === "jsonOutput") return !!m.capabilities?.jsonOutput;
          return true;
        });

      return matchesSearch && matchesSeries && matchesMin && matchesMax && matchesCaps;
    });

    if (sortBy === "name-asc") {
      filtered = [...filtered].sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
    } else if (sortBy === "name-desc") {
      filtered = [...filtered].sort((a, b) => (b.name || b.id).localeCompare(a.name || a.id));
    } else if (sortBy === "params-desc") {
      filtered = [...filtered].sort((a, b) => {
        const pa = parseInt(a.parameters?.replace(/[^0-9]/g, "") || "0", 10);
        const pb = parseInt(b.parameters?.replace(/[^0-9]/g, "") || "0", 10);
        return pb - pa;
      });
    } else if (sortBy === "context-desc") {
      filtered = [...filtered].sort((a, b) => (b.context_length || 0) - (a.context_length || 0));
    }

    return filtered;
  }, [models, searchQuery, selectedSeries, paramMinB, paramMaxB, selectedCapabilities, sortBy]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center py-40 min-h-[100dvh]">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          <span>Vérification de la session...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Onglets de navigation : Modèles Texte vs Modèles Images vs Modèles Audio vs Modèles mAI */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/60 w-fit overflow-x-auto">
          <Link
            href="/account/models"
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            Modèles Texte
          </Link>
          <Link
            href="/account/models/images"
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            Modèles Images
          </Link>
          <Link
            href="/account/models/audio"
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            Modèles Audio
          </Link>
          <Link
            href="/account/models/mai"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-purple-700 shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Cpu className="w-3.5 h-3.5 text-purple-600" />
            Modèles mAI
          </Link>
        </div>

        {/* En-tête de page */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="text-left space-y-3">
            <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter leading-[0.9] uppercase text-slate-900">
              Modèles <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600">
                mAI Propriétaires
              </span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base font-light max-w-2xl">
              Consultez le catalogue interactif des modèles souverains développés par mDevsLabs. Filtrez par série, taille de paramètres et capacités locales, puis triez instantanément.
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

        {/* Bandeau d'information sur les modèles mAI */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white shadow-md space-y-3">
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black tracking-tight flex items-center gap-2">
                  Modèles 100% Locaux, Souverains &amp; Gratuits
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase border border-emerald-400/30">
                    Open Weights (GGUF / Ollama)
                  </span>
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Optimisés pour tourner en local sur vos machines ou serveurs via Ollama ou LM Studio. Ils ne consomment aucun token de quota API Cloud.
                </p>
              </div>
            </div>
            <Link
              href="/downloads"
              className="px-4 py-2 rounded-xl bg-white text-slate-950 text-xs font-black hover:bg-purple-50 transition-all shrink-0 hidden sm:inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Téléchargements
            </Link>
          </div>
        </div>

        {/* Barre de recherche, filtres et tri — Structure identique à Modèles Texte */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-5">
          {/* Ligne 1 : Recherche + Série / Version (Sans "Laboratoire" car 100% mDevsLabs) */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un modèle mAI par nom, ID, version, architecture..."
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
              <Sparkles className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={selectedSeries}
                onChange={(e) => setSelectedSeries(e.target.value)}
                className="w-full pl-8 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white focus:border-purple-200 cursor-pointer appearance-none transition-all"
                aria-label="Filtrer par série mAI"
              >
                <option value="all">Toutes les séries ({models.length})</option>
                {availableSeries.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Taille de paramètres & Hardware */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700">
                <Cpu className="w-4 h-4 text-purple-600" />
                Taille de paramètres &amp; Hardware
                <span className="ml-1 text-[11px] font-bold normal-case tracking-normal text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                  {formatRangeLabel()}
                </span>
              </div>
              {(paramMinB !== null || paramMaxB !== null) && (
                <button
                  onClick={() => {
                    setParamMinB(null);
                    setParamMaxB(null);
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
              {PARAM_PRESETS.map((preset) => {
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

            {/* Champs personnalisés Paramètres Min / Max */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3" />
                  Paramètres min (Milliards - B)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={paramMinB ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "") setParamMinB(null);
                      else {
                        const n = parseInt(v, 10);
                        if (!isNaN(n) && n >= 0) setParamMinB(n);
                      }
                    }}
                    placeholder="ex: 4"
                    className="w-full pl-3 pr-12 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-200 text-slate-900 placeholder-slate-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                    B
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {paramMinB !== null ? `≥ ${paramMinB}B paramètres` : "Aucun minimum"}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3" />
                  Paramètres max (Milliards - B)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={paramMaxB ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "") setParamMaxB(null);
                      else {
                        const n = parseInt(v, 10);
                        if (!isNaN(n) && n >= 0) setParamMaxB(n);
                      }
                    }}
                    placeholder="ex: 33"
                    className="w-full pl-3 pr-12 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-200 text-slate-900 placeholder-slate-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                    B
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {paramMaxB !== null ? `≤ ${paramMaxB}B paramètres` : "Aucun maximum"}
                </p>
              </div>
            </div>
          </div>

          {/* Ligne 3 : Capacités multi-sélection + Tri + Bouton Réinitialiser */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Filtre multi-capacités */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCapsOpen((o) => !o)}
                className="w-full flex items-center justify-between pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-white hover:border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
                aria-label="Sélectionner les capacités"
                aria-expanded={capsOpen}
              >
                <Wrench className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <span className="truncate text-left">
                  {selectedCapabilities.length === 0
                    ? "Toutes les capacités"
                    : `${selectedCapabilities.length} capacité${selectedCapabilities.length > 1 ? "s" : ""} sélectionnée${selectedCapabilities.length > 1 ? "s" : ""}`}
                </span>
                <span className="flex items-center gap-1 shrink-0">
                  {selectedCapabilities.length > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-600 text-white text-[11px] font-black">
                      {selectedCapabilities.length}
                    </span>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      capsOpen ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </button>

              {/* Dropdown multi-select */}
              {capsOpen && (
                <div className="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Capacités du Modèle
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedCapabilities(availableCapabilities.map((c) => c.id))}
                        className="text-[11px] font-bold text-purple-600 hover:text-purple-700 px-2 py-1 rounded-lg hover:bg-purple-50 cursor-pointer"
                      >
                        Tout
                      </button>
                      <button
                        onClick={() => setSelectedCapabilities([])}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                      >
                        Effacer
                      </button>
                    </div>
                  </div>

                  <div className="p-2 max-h-64 overflow-y-auto space-y-1">
                    {availableCapabilities.map((cap) => {
                      const checked = selectedCapabilities.includes(cap.id);
                      return (
                        <button
                          key={cap.id}
                          type="button"
                          onClick={() => toggleCapability(cap.id)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-slate-50 text-slate-700 transition-colors text-left cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            {checked ? (
                              <CheckSquare className="w-3.5 h-3.5 text-purple-600" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-300" />
                            )}
                            <span className={checked ? "font-bold text-purple-900" : ""}>
                              {cap.label}
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
                aria-label="Trier les modèles mAI"
              >
                <option value="default">Ordre officiel</option>
                <option value="name-asc">Nom A → Z</option>
                <option value="name-desc">Nom Z → A</option>
                <option value="params-desc">Taille (Grand → Petit)</option>
                <option value="context-desc">Contexte (Grand → Petit)</option>
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

        {/* Liste des modèles mAI */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/80">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-3" />
            <p className="text-sm font-medium text-slate-500">Chargement des modèles mAI...</p>
          </div>
        ) : filteredAndSortedModels.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 space-y-3">
            <p className="text-base font-bold text-slate-700">Aucun modèle mAI trouvé</p>
            <p className="text-xs text-slate-400">Essayez un autre mot-clé ou réinitialisez les filtres.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedModels.map((model) => {
              const isOpen = openModelId === model.id;
              const is15 = model.id.includes("1.5");
              const currentTab = activeTabCode[model.id] || "ollama";

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
                            {model.name}
                          </h2>
                          {is15 && (
                            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider">
                              v1.5 Flagship
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-mono truncate">{model.ollama_tag || model.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {model.parameters && (
                        <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                          {model.parameters}
                        </span>
                      )}
                      {model.capabilities?.vision && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hidden sm:inline-flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Vision
                        </span>
                      )}
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white uppercase">
                        {(model.context_length / 1024).toFixed(0)}K
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
                        {/* Description & Tagline */}
                        <div className="space-y-1.5">
                          {model.tagline && (
                            <p className="text-xs font-bold text-purple-700">{model.tagline}</p>
                          )}
                          <p className="text-sm text-slate-700 leading-relaxed">{model.description}</p>
                        </div>

                        {/* Capacités IA */}
                        <div className="space-y-2">
                          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Capacités Prises en Charge</h3>
                          <div className="flex flex-wrap gap-2">
                            {model.capabilities?.coding && (
                              <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5">
                                <Code2 className="w-3.5 h-3.5" /> Développement &amp; Code
                              </span>
                            )}
                            {model.capabilities?.reasoning && (
                              <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5">
                                <Brain className="w-3.5 h-3.5" /> Raisonnement (Thinking)
                              </span>
                            )}
                            {model.capabilities?.vision && (
                              <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5" /> Vision Multimodale
                              </span>
                            )}
                            {model.capabilities?.functionCalling && (
                              <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" /> Appels d&apos;Outils (Tools)
                              </span>
                            )}
                            {model.capabilities?.jsonOutput && (
                              <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold">
                                JSON Structuré
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Spécifications & Recommandations Matérielles */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                            <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-2">
                              <Layers className="w-3.5 h-3.5 text-purple-600" />
                              Fenêtre de Contexte
                            </h4>
                            <div className="flex items-baseline justify-between">
                              <span className="text-2xl font-black text-slate-900">
                                {model.context_length.toLocaleString()}
                              </span>
                              <span className="text-xs text-slate-500 font-bold">tokens max</span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Sortie maximale générée : <strong>{model.max_output_tokens?.toLocaleString() || 32768} tokens</strong>
                            </p>
                          </div>

                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                            <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-2">
                              <Cpu className="w-3.5 h-3.5 text-purple-600" />
                              Configuration Matérielle Conseillée
                            </h4>
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                              <div className="p-2 rounded-lg bg-white border border-slate-200">
                                <p className="text-[10px] text-slate-400">RAM</p>
                                <p className="font-bold text-slate-800">{model.recommended_hardware?.ram || "8GB"}</p>
                              </div>
                              <div className="p-2 rounded-lg bg-white border border-slate-200">
                                <p className="text-[10px] text-slate-400">VRAM Min</p>
                                <p className="font-bold text-slate-800">{model.recommended_hardware?.minVram || "4GB"}</p>
                              </div>
                              <div className="p-2 rounded-lg bg-white border border-slate-200">
                                <p className="text-[10px] text-slate-400">VRAM Rec.</p>
                                <p className="font-bold text-slate-800">{model.recommended_hardware?.recommendedVram || "8GB"}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Commande d'exécution locale */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setActiveTabCode((p) => ({ ...p, [model.id]: "ollama" }))}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  currentTab === "ollama"
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                Commande Ollama
                              </button>
                              <button
                                onClick={() => setActiveTabCode((p) => ({ ...p, [model.id]: "python" }))}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  currentTab === "python"
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                Python (Ollama SDK)
                              </button>
                            </div>

                            <button
                              onClick={() => {
                                const tag = model.ollama_tag || model.id;
                                handleCopy(`ollama run ${tag}`, "Commande Ollama");
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
                            >
                              {copiedText === `ollama run ${model.ollama_tag || model.id}` ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              Copier
                            </button>
                          </div>

                          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
                            {currentTab === "ollama" ? (
                              <pre>{`# Télécharger et lancer instantanément le modèle en local
ollama run ${model.ollama_tag || model.id}`}</pre>
                            ) : (
                              <pre>{`import ollama

response = ollama.chat(
    model="${model.ollama_tag || model.id}",
    messages=[
        {"role": "user", "content": "Bonjour ! Explique-moi le fonctionnement de ton architecture."}
    ]
)

print(response["message"]["content"])`}</pre>
                            )}
                          </div>
                        </div>

                        {/* Liens externes */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <span className="text-slate-400 font-medium">Licence : {model.license || "MIT"}</span>
                          {model.huggingface_tag && (
                            <a
                              href={`https://huggingface.co/${model.huggingface_tag}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-bold text-purple-600 hover:underline"
                            >
                              Hugging Face ({model.huggingface_tag})
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
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
