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
  Layers,
  ShieldAlert,
  RefreshCw,
  Wrench,
  ArrowUpDown,
  Filter,
  X,
  Building2,
  SlidersHorizontal,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getUserApiUsage } from "@/app/actions/api-keys";
import toast from "react-hot-toast";
import Link from "next/link";

interface ModelItem {
  id: string;
  name: string;
  description: string;
  maxContext: number;
  maxOutput: number;
  supported_parameters?: string[];
  owned_by?: string;
  created?: number;
  object?: string;
}

type SortOption = "default" | "name-asc" | "name-desc" | "context-asc" | "context-desc" | "provider-asc";

type ContextPreset = {
  id: string;
  label: string;
  minK: number | null;
  maxK: number | null;
};

const CONTEXT_PRESETS: ContextPreset[] = [
  { id: "all", label: "Tous", minK: null, maxK: null },
  { id: "lte32", label: "≤ 32K", minK: null, maxK: 32 },
  { id: "32-128", label: "32K – 128K", minK: 32, maxK: 128 },
  { id: "128-256", label: "128K – 256K", minK: 128, maxK: 256 },
  { id: "256-1024", label: "256K – 1M", minK: 256, maxK: 1024 },
  { id: "gte1024", label: "≥ 1M", minK: 1024, maxK: null },
];

export default function ApiModelsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [models, setModels] = useState<ModelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [openModelId, setOpenModelId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  // Fourchettes de contexte (en K tokens) - création libre
  const [contextMinK, setContextMinK] = useState<number | null>(null);
  const [contextMaxK, setContextMaxK] = useState<number | null>(null);

  // Sélection multi-outils
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [toolsOpen, setToolsOpen] = useState(false);

  // Redirection immédiate si non authentifié
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/account/login?next=${encodeURIComponent("/account/models")}`);
    }
  }, [authLoading, isAuthenticated, router]);

  // Chargement des données des modèles via une clé API au hasard
  const loadModels = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const userId = user.username || user.email || String(user.id || "dev_user");

      // 1. Récupération des clés API de l'utilisateur depuis mprojects_api_keys
      const keysRes = await getUserApiUsage(userId);
      let chosenKey: string | null = null;

      if (keysRes.success && keysRes.keys && keysRes.keys.length > 0) {
        // Tirage aléatoire parmi les clés API de l'utilisateur
        const randomIndex = Math.floor(Math.random() * keysRes.keys.length);
        chosenKey = keysRes.keys[randomIndex].key;
        setActiveKey(chosenKey);
      } else {
        setActiveKey(null);
      }

      // 2. Appel API /api/v1/models avec la clé tirée au sort
      const headers: Record<string, string> = {
        "x-user-id": userId,
      };
      if (chosenKey) {
        headers["Authorization"] = `Bearer ${chosenKey}`;
      }

      const res = await fetch("/api/v1/models", { headers });
      const data = await res.json();

      if (data && Array.isArray(data.data)) {
        setModels(data.data);
        if (data.data.length > 0) {
          setOpenModelId(data.data[0].id); // Ouvrir le premier modèle par défaut
        }
      } else {
        toast.error("Impossible de récupérer la liste des modèles.");
      }
    } catch (err) {
      console.error("Erreur chargement modèles:", err);
      toast.error("Erreur lors de la récupération des modèles.");
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

  // Liste des fournisseurs uniques pour le filtre (laboratoires IA)
  const providers = useMemo(() => {
    const set = new Set<string>();
    models.forEach((m) => {
      if (m.owned_by) set.add(m.owned_by);
      else if (m.id.includes("/")) set.add(m.id.split("/")[0]);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [models]);

  // Liste des outils disponibles (tous les supported_parameters distincts)
  const availableTools = useMemo(() => {
    const set = new Set<string>();
    models.forEach((m) => {
      (m.supported_parameters || []).forEach((p) => {
        if (p) set.add(p);
      });
    });
    // Tri : tools et paramètres courants d'abord, puis alphabétique
    const priority = ["tools", "reasoning", "thinking", "response_format", "vision", "image", "audio"];
    const arr = Array.from(set);
    return arr.sort((a, b) => {
      const ia = priority.indexOf(a);
      const ib = priority.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [models]);

  const toggleTool = (tool: string) => {
    setSelectedTools((prev) => (prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]));
  };

  const isPresetActive = (preset: ContextPreset) => {
    return preset.minK === contextMinK && preset.maxK === contextMaxK;
  };

  const handlePresetClick = (preset: ContextPreset) => {
    setContextMinK(preset.minK);
    setContextMaxK(preset.maxK);
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedProvider !== "all" ||
    contextMinK !== null ||
    contextMaxK !== null ||
    selectedTools.length > 0 ||
    sortBy !== "default";

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedProvider("all");
    setContextMinK(null);
    setContextMaxK(null);
    setSelectedTools([]);
    setSortBy("default");
    setToolsOpen(false);
  };

  // Filtrage + tri selon recherche, labo, contexte, outils et tri
  const filteredAndSortedModels = useMemo(() => {
    let filtered = models.filter((m) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        m.name?.toLowerCase().includes(searchLower) ||
        m.id?.toLowerCase().includes(searchLower) ||
        m.description?.toLowerCase().includes(searchLower) ||
        m.owned_by?.toLowerCase().includes(searchLower);

      const provider = m.owned_by || (m.id.includes("/") ? m.id.split("/")[0] : "");
      const matchesProvider = selectedProvider === "all" || provider === selectedProvider;

      // Filtre par fourchette de contexte (min/max en K)
      const ctx = m.maxContext || 0;
      let matchesContext = true;
      if (contextMinK !== null) {
        const minTokens = contextMinK * 1024;
        if (ctx < minTokens) matchesContext = false;
      }
      if (contextMaxK !== null) {
        const maxTokens = contextMaxK * 1024;
        if (ctx > maxTokens) matchesContext = false;
      }

      // Filtre par outils sélectionnés (ET logique : doit contenir TOUS les outils cochés)
      let matchesTools = true;
      if (selectedTools.length > 0) {
        const params = m.supported_parameters || [];
        matchesTools = selectedTools.every((t) => params.includes(t));
      }

      return matchesSearch && matchesProvider && matchesContext && matchesTools;
    });

    // Tri
    if (sortBy === "name-asc") {
      filtered = [...filtered].sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
    } else if (sortBy === "name-desc") {
      filtered = [...filtered].sort((a, b) => (b.name || b.id).localeCompare(a.name || a.id));
    } else if (sortBy === "context-asc") {
      filtered = [...filtered].sort((a, b) => (a.maxContext || 0) - (b.maxContext || 0));
    } else if (sortBy === "context-desc") {
      filtered = [...filtered].sort((a, b) => (b.maxContext || 0) - (a.maxContext || 0));
    } else if (sortBy === "provider-asc") {
      filtered = [...filtered].sort((a, b) => {
        const pa = a.owned_by || a.id.split("/")[0] || "";
        const pb = b.owned_by || b.id.split("/")[0] || "";
        return pa.localeCompare(pb);
      });
    }

    return filtered;
  }, [models, searchQuery, selectedProvider, contextMinK, contextMaxK, selectedTools, sortBy]);

  const formatTokens = (tokens?: number) => {
    if (!tokens || isNaN(tokens)) return "128,000";
    return tokens.toLocaleString("fr-FR");
  };

  const formatContextShort = (tokens?: number) => {
    if (!tokens) return "—";
    if (tokens >= 1_048_576) return `${Math.round(tokens / 1_048_576)}M`;
    if (tokens >= 1024) return `${Math.round(tokens / 1024)}K`;
    return String(tokens);
  };

  const formatRangeLabel = () => {
    if (contextMinK === null && contextMaxK === null) return "Tous les contextes";
    if (contextMinK !== null && contextMaxK !== null) return `${contextMinK}K – ${contextMaxK}K`;
    if (contextMinK !== null) return `≥ ${contextMinK}K`;
    return `≤ ${contextMaxK}K`;
  };

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
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-purple-700 shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
                l&apos;API
              </span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base font-light max-w-2xl">
              Consultez le catalogue interactif des modèles accessibles via votre clé d&apos;API. Filtrez par laboratoire, fourchettes de contexte et outils, puis triez instantanément.
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

        {/* Barre de recherche, filtres et tri */}
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

          {/* Fourchettes de contexte */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700">
                <Layers className="w-4 h-4 text-blue-500" />
                Fourchettes de contexte
                <span className="ml-1 text-[11px] font-bold normal-case tracking-normal text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                  {formatRangeLabel()}
                </span>
              </div>
              {(contextMinK !== null || contextMaxK !== null) && (
                <button
                  onClick={() => {
                    setContextMinK(null);
                    setContextMaxK(null);
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
              {CONTEXT_PRESETS.map((preset) => {
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

            {/* Champs personnalisés Min / Max */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3" />
                  Contexte min (K)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={4}
                    value={contextMinK ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "") setContextMinK(null);
                      else {
                        const n = parseInt(v, 10);
                        if (!isNaN(n) && n >= 0) setContextMinK(n);
                      }
                    }}
                    placeholder="ex: 32"
                    className="w-full pl-3 pr-12 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-200 text-slate-900 placeholder-slate-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                    K
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {contextMinK !== null ? `≥ ${formatTokens(contextMinK * 1024)} tokens` : "Aucun minimum"}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3" />
                  Contexte max (K)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={4}
                    value={contextMaxK ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "") setContextMaxK(null);
                      else {
                        const n = parseInt(v, 10);
                        if (!isNaN(n) && n >= 0) setContextMaxK(n);
                      }
                    }}
                    placeholder="ex: 256"
                    className="w-full pl-3 pr-12 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-200 text-slate-900 placeholder-slate-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                    K
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {contextMaxK !== null ? `≤ ${formatTokens(contextMaxK * 1024)} tokens` : "Aucun maximum"}
                </p>
              </div>
            </div>

            {contextMinK !== null && contextMaxK !== null && contextMinK > contextMaxK && (
              <p className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                ⚠️ Le minimum ({contextMinK}K) est supérieur au maximum ({contextMaxK}K) — aucun modèle ne correspondra.
              </p>
            )}
          </div>

          {/* Ligne : Outils multi-sélection + Tri */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Filtre outils multi-sélection */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setToolsOpen((o) => !o)}
                className="w-full flex items-center justify-between pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-white hover:border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
                aria-label="Sélectionner les outils"
                aria-expanded={toolsOpen}
              >
                <Wrench className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <span className="truncate text-left">
                  {selectedTools.length === 0
                    ? "Tous les outils"
                    : `${selectedTools.length} outil${selectedTools.length > 1 ? "s" : ""} sélectionné${selectedTools.length > 1 ? "s" : ""}`}
                </span>
                <span className="flex items-center gap-1 shrink-0">
                  {selectedTools.length > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-600 text-white text-[11px] font-black">
                      {selectedTools.length}
                    </span>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${toolsOpen ? "rotate-180" : ""}`} />
                </span>
              </button>

              {/* Dropdown multi-select */}
              {toolsOpen && (
                <div className="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Outils supportés
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedTools([...availableTools])}
                        className="text-[11px] font-bold text-purple-600 hover:text-purple-700 px-2 py-1 rounded-lg hover:bg-purple-50 cursor-pointer"
                      >
                        Tout
                      </button>
                      <button
                        onClick={() => setSelectedTools([])}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                      >
                        Effacer
                      </button>
                    </div>
                  </div>

                  <div className="p-2 max-h-64 overflow-y-auto space-y-1">
                    {availableTools.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">Aucun outil disponible</p>
                    ) : (
                      availableTools.map((tool) => {
                        const checked = selectedTools.includes(tool);
                        const count = models.filter((m) => (m.supported_parameters || []).includes(tool)).length;
                        return (
                          <label
                            key={tool}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                              checked ? "bg-purple-50 border border-purple-200" : "hover:bg-slate-50 border border-transparent"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleTool(tool)}
                              className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500/20 cursor-pointer"
                            />
                            <span className={`flex-1 text-xs font-mono font-bold truncate ${checked ? "text-purple-700" : "text-slate-700"}`}>
                              {tool}
                            </span>
                            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${checked ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                              {count}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>

                  <div className="p-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Logique : <strong className="text-slate-700">ET</strong> (doit contenir tous)
                    </span>
                    <button
                      onClick={() => setToolsOpen(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                    >
                      Fermer
                    </button>
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
                <option value="default">Tri : Défaut</option>
                <option value="name-asc">Nom A → Z</option>
                <option value="name-desc">Nom Z → A</option>
                <option value="context-desc">Contexte ↓ (grand → petit)</option>
                <option value="context-asc">Contexte ↑ (petit → grand)</option>
                <option value="provider-asc">Laboratoire A → Z</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Bouton réinitialiser */}
            <button
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
            >
              <Filter className="w-3.5 h-3.5" />
              Réinitialiser
            </button>
          </div>

          {/* Compteur + badges filtres actifs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">
              <span className="font-bold text-slate-900">{loading ? "…" : filteredAndSortedModels.length}</span> modèle{filteredAndSortedModels.length !== 1 ? "s" : ""} trouvé{filteredAndSortedModels.length !== 1 ? "s" : ""}{" "}
              <span className="text-slate-400">sur {models.length}</span>
              {hasActiveFilters && !loading && (
                <span className="ml-2 inline-flex items-center gap-1 text-purple-600">
                  • filtres actifs
                </span>
              )}
            </p>

            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-1.5 max-w-full">
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-[11px] font-bold text-purple-700">
                    <Search className="w-3 h-3" />
                    &quot;{searchQuery.slice(0, 18)}{searchQuery.length > 18 ? "…" : ""}&quot;
                    <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-purple-900 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedProvider !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-bold text-blue-700">
                    <Building2 className="w-3 h-3" />
                    {selectedProvider}
                    <button onClick={() => setSelectedProvider("all")} className="ml-1 hover:text-blue-900 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(contextMinK !== null || contextMaxK !== null) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
                    <Layers className="w-3 h-3" />
                    {formatRangeLabel()}
                    <button
                      onClick={() => {
                        setContextMinK(null);
                        setContextMaxK(null);
                      }}
                      className="ml-1 hover:text-emerald-900 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedTools.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-700 max-w-[220px]">
                    <Wrench className="w-3 h-3 shrink-0" />
                    <span className="truncate">
                      {selectedTools.slice(0, 2).join(", ")}
                      {selectedTools.length > 2 ? ` +${selectedTools.length - 2}` : ""}
                    </span>
                    <button onClick={() => setSelectedTools([])} className="ml-1 hover:text-amber-900 cursor-pointer shrink-0">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {sortBy !== "default" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-600">
                    <ArrowUpDown className="w-3 h-3" />
                    {sortBy === "name-asc" ? "A→Z" : sortBy === "name-desc" ? "Z→A" : sortBy === "context-desc" ? "Ctx ↓" : sortBy === "context-asc" ? "Ctx ↑" : "Labo A→Z"}
                    <button onClick={() => setSortBy("default")} className="ml-1 hover:text-slate-900 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Liste des Modèles sous forme d'Accordéons */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/60 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-3" />
            <p className="text-sm font-medium text-slate-500">Chargement des modèles de l&apos;API...</p>
          </div>
        ) : filteredAndSortedModels.length === 0 ? (
          <div className="text-center py-16 bg-white/60 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <p className="text-base font-bold text-slate-700">Aucun modèle correspondant trouvé</p>
            <p className="text-xs text-slate-400">Essayez de modifier vos critères de recherche ou réinitialisez les filtres.</p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedModels.map((model) => {
              const isOpen = openModelId === model.id;
              const provider = model.owned_by || (model.id.includes("/") ? model.id.split("/")[0] : "");
              const hasTools = (model.supported_parameters || []).includes("tools");
              const contextShort = formatContextShort(model.maxContext);

              return (
                <div
                  key={model.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                    isOpen
                      ? "border-slate-300 shadow-sm ring-1 ring-slate-200"
                      : "border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleAccordion(model.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-slate-600 shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                        {model.name || model.id}
                      </h2>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap justify-end">
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        <Layers className="w-3 h-3" />
                        {contextShort}
                      </span>
                      {hasTools ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Wrench className="w-3 h-3" />
                          <span className="hidden sm:inline">Tools</span>
                        </span>
                      ) : (
                        <span className="hidden sm:inline-flex text-[11px] font-medium px-2 py-1 rounded-full bg-slate-50 text-slate-400 border border-slate-200">
                          Sans tools
                        </span>
                      )}
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white border border-slate-800 uppercase tracking-wider">
                        {provider || "—"}
                      </span>
                    </div>
                  </button>

                  {/* Accordion Content */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="border-t border-slate-100"
                      >
                        <div className="p-6 space-y-6">
                          {/* Description textuelle */}
                          <p className="text-slate-600 text-sm leading-relaxed">
                            {model.description ||
                              "Modèle de langage et d'intelligence artificielle haute performance accessible via l'API unifiée mAI."}
                          </p>

                          {/* Grille de Cartes d'Attributs */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Max Context Length */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-blue-500" />
                                Max context length:
                              </p>
                              <p className="text-base font-bold text-slate-900">
                                {formatTokens(model.maxContext)} tokens
                              </p>
                              <p className="text-[11px] text-slate-400 font-medium">≈ {contextShort} contexte</p>
                            </div>

                            {/* Max Output / Summary Length */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                              <p className="text-xs text-slate-500 font-medium">Max output length:</p>
                              <p className="text-base font-bold text-slate-900">
                                {formatTokens(model.maxOutput)} tokens
                              </p>
                              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                {hasTools ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                                    <Wrench className="w-3 h-3" />
                                    Tools supportés
                                  </span>
                                ) : (
                                  <span className="text-slate-400">Sans function calling</span>
                                )}
                              </p>
                            </div>

                            {/* Paramètres supportés / Modalité */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2 sm:col-span-2">
                              <p className="text-xs text-slate-500 font-medium">Paramètres supportés (Supported parameters):</p>
                              <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {model.supported_parameters && model.supported_parameters.length > 0 ? (
                                  model.supported_parameters.map((param) => {
                                    const isSelected = selectedTools.includes(param);
                                    return (
                                      <span
                                        key={param}
                                        className={`text-xs font-mono font-medium px-2.5 py-1 rounded-lg border shadow-2xs transition-colors ${
                                          param === "tools"
                                            ? hasTools
                                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                              : "bg-white border-slate-200 text-slate-700"
                                            : isSelected
                                            ? "bg-purple-50 border-purple-200 text-purple-700"
                                            : "bg-white border-slate-200 text-slate-700"
                                        }`}
                                      >
                                        {param}
                                      </span>
                                    );
                                  })
                                ) : (
                                  <span className="text-xs font-mono font-medium text-slate-500">
                                    temperature, top_p, max_tokens, stream, stop
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Identifiant API avec bouton de copie */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2 sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-slate-500 font-medium">Identifiant du modèle (API ID):</p>
                                <p className="text-sm font-mono font-bold text-purple-700 mt-0.5 select-all break-all">
                                  {model.id}
                                </p>
                              </div>
                              <button
                                onClick={() => handleCopy(model.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-purple-50 hover:border-purple-200 text-slate-700 hover:text-purple-700 text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
                              >
                                {copiedId === model.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Copié !</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copier l&apos;ID</span>
                                  </>
                                )}
                              </button>
                            </div>
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
