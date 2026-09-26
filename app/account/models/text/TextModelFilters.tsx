"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  Building2,
  ChevronDown,
  Filter,
  Layers,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Wrench,
  X,
} from "lucide-react";
import type { TextModelItem } from "./text-model-types";

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

export function formatModelTokens(tokens?: number): string {
  if (!tokens || Number.isNaN(tokens)) return "128,000";
  return tokens.toLocaleString("fr-FR");
}

export function useTextModelFilters(models: TextModelItem[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [contextMinK, setContextMinK] = useState<number | null>(null);
  const [contextMaxK, setContextMaxK] = useState<number | null>(null);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [toolsOpen, setToolsOpen] = useState(false);

  const providers = useMemo(() => {
    const values = new Set<string>();
    models.forEach((model) => {
      if (model.owned_by) values.add(model.owned_by);
      else if (model.id.includes("/")) values.add(model.id.split("/")[0]);
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [models]);

  const availableTools = useMemo(() => {
    const values = new Set<string>();
    models.forEach((model) => {
      (model.supported_parameters || []).forEach((parameter) => {
        if (parameter) values.add(parameter);
      });
    });
    const priority = ["tools", "reasoning", "thinking", "response_format", "vision", "image", "audio"];
    return Array.from(values).sort((a, b) => {
      const aPriority = priority.indexOf(a);
      const bPriority = priority.indexOf(b);
      if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
      if (aPriority !== -1) return -1;
      if (bPriority !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [models]);

  const filteredModels = useMemo(() => {
    let filtered = models.filter((model) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        model.name?.toLowerCase().includes(searchLower) ||
        model.id?.toLowerCase().includes(searchLower) ||
        model.description?.toLowerCase().includes(searchLower) ||
        model.owned_by?.toLowerCase().includes(searchLower);
      const provider = model.owned_by || (model.id.includes("/") ? model.id.split("/")[0] : "");
      const matchesProvider = selectedProvider === "all" || provider === selectedProvider;
      const context = model.maxContext || 0;
      const matchesContext =
        (contextMinK === null || context >= contextMinK * 1024) &&
        (contextMaxK === null || context <= contextMaxK * 1024);
      const matchesTools =
        selectedTools.length === 0 ||
        selectedTools.every((tool) => (model.supported_parameters || []).includes(tool));
      return matchesSearch && matchesProvider && matchesContext && matchesTools;
    });

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
        const aProvider = a.owned_by || a.id.split("/")[0] || "";
        const bProvider = b.owned_by || b.id.split("/")[0] || "";
        return aProvider.localeCompare(bProvider);
      });
    }
    return filtered;
  }, [contextMaxK, contextMinK, models, searchQuery, selectedProvider, selectedTools, sortBy]);

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

  return {
    availableTools,
    contextMaxK,
    contextMinK,
    filteredModels,
    hasActiveFilters,
    models,
    providers,
    resetFilters,
    searchQuery,
    selectedProvider,
    selectedTools,
    setContextMaxK,
    setContextMinK,
    setSearchQuery,
    setSelectedProvider,
    setSelectedTools,
    setSortBy,
    setToolsOpen,
    sortBy,
    toolsOpen,
  };
}

export type TextModelFilterController = ReturnType<typeof useTextModelFilters>;

function formatRangeLabel(controller: TextModelFilterController): string {
  const { contextMinK, contextMaxK } = controller;
  if (contextMinK === null && contextMaxK === null) return "Tous les contextes";
  if (contextMinK !== null && contextMaxK !== null) return `${contextMinK}K – ${contextMaxK}K`;
  if (contextMinK !== null) return `≥ ${contextMinK}K`;
  return `≤ ${contextMaxK}K`;
}

export function TextModelFilters({
  controller,
  loading,
}: {
  controller: TextModelFilterController;
  loading: boolean;
}) {
  const {
    availableTools,
    contextMaxK,
    contextMinK,
    filteredModels,
    hasActiveFilters,
    models,
    providers,
    resetFilters,
    searchQuery,
    selectedProvider,
    selectedTools,
    setContextMaxK,
    setContextMinK,
    setSearchQuery,
    setSelectedProvider,
    setSelectedTools,
    setSortBy,
    setToolsOpen,
    sortBy,
    toolsOpen,
  } = controller;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-5">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
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
            onChange={(event) => setSelectedProvider(event.target.value)}
            className="w-full pl-8 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white focus:border-purple-200 cursor-pointer appearance-none transition-all"
            aria-label="Filtrer par laboratoire IA"
          >
            <option value="all">Tous les labos ({models.length})</option>
            {providers.map((provider) => <option key={provider} value={provider}>{provider}</option>)}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700">
            <Layers className="w-4 h-4 text-blue-500" />
            Fourchettes de contexte
            <span className="ml-1 text-[11px] font-bold normal-case tracking-normal text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
              {formatRangeLabel(controller)}
            </span>
          </div>
          {(contextMinK !== null || contextMaxK !== null) && (
            <button
              onClick={() => { setContextMinK(null); setContextMaxK(null); }}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-700 inline-flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" /> Effacer
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {CONTEXT_PRESETS.map((preset) => {
            const active = preset.minK === contextMinK && preset.maxK === contextMaxK;
            return (
              <button
                key={preset.id}
                onClick={() => { setContextMinK(preset.minK); setContextMaxK(preset.maxK); }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  active ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(["min", "max"] as const).map((bound) => {
            const value = bound === "min" ? contextMinK : contextMaxK;
            const setter = bound === "min" ? setContextMinK : setContextMaxK;
            return (
              <div key={bound} className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3" /> Contexte {bound} (K)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={4}
                    value={value ?? ""}
                    onChange={(event) => {
                      if (event.target.value === "") return setter(null);
                      const parsed = Number.parseInt(event.target.value, 10);
                      if (!Number.isNaN(parsed) && parsed >= 0) setter(parsed);
                    }}
                    placeholder={bound === "min" ? "ex: 32" : "ex: 256"}
                    className="w-full pl-3 pr-12 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-200 text-slate-900 placeholder-slate-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">K</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {value !== null ? `${bound === "min" ? "≥" : "≤"} ${formatModelTokens(value * 1024)} tokens` : bound === "min" ? "Aucun minimum" : "Aucun maximum"}
                </p>
              </div>
            );
          })}
        </div>
        {contextMinK !== null && contextMaxK !== null && contextMinK > contextMaxK && (
          <p className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <ShieldAlert className="inline w-4 h-4 align-middle" /> Le minimum ({contextMinK}K) est supérieur au maximum ({contextMaxK}K) — aucun modèle ne correspondra.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setToolsOpen((open) => !open)}
            className="w-full flex items-center justify-between pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-white hover:border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
            aria-label="Sélectionner les outils"
            aria-expanded={toolsOpen}
          >
            <Wrench className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <span className="truncate text-left">
              {selectedTools.length === 0 ? "Tous les outils" : `${selectedTools.length} outil${selectedTools.length > 1 ? "s" : ""} sélectionné${selectedTools.length > 1 ? "s" : ""}`}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              {selectedTools.length > 0 && <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-600 text-white text-[11px] font-black">{selectedTools.length}</span>}
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${toolsOpen ? "rotate-180" : ""}`} />
            </span>
          </button>
          {toolsOpen && (
            <div className="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Outils supportés</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setSelectedTools([...availableTools])} className="text-[11px] font-bold text-purple-600 hover:text-purple-700 px-2 py-1 rounded-lg hover:bg-purple-50">Tout</button>
                  <button onClick={() => setSelectedTools([])} className="text-[11px] font-bold text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100">Effacer</button>
                </div>
              </div>
              <div className="p-2 max-h-64 overflow-y-auto space-y-1">
                {availableTools.length === 0 ? <p className="text-xs text-slate-400 text-center py-4">Aucun outil disponible</p> : availableTools.map((tool) => {
                  const checked = selectedTools.includes(tool);
                  const count = models.filter((model) => (model.supported_parameters || []).includes(tool)).length;
                  return (
                    <label key={tool} className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors ${checked ? "bg-purple-50 border border-purple-200" : "hover:bg-slate-50 border border-transparent"}`}>
                      <input type="checkbox" checked={checked} onChange={() => setSelectedTools((current) => current.includes(tool) ? current.filter((item) => item !== tool) : [...current, tool])} className="w-4 h-4 rounded border-slate-300 text-purple-600" />
                      <span className={`flex-1 text-xs font-mono font-bold truncate ${checked ? "text-purple-700" : "text-slate-700"}`}>{tool}</span>
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${checked ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-500"}`}>{count}</span>
                    </label>
                  );
                })}
              </div>
              <div className="p-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Logique : <strong className="text-slate-700">ET</strong></span>
                <button onClick={() => setToolsOpen(false)} className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold">Fermer</button>
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <ArrowUpDown className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
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
        <button onClick={resetFilters} disabled={!hasActiveFilters} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed">
          <Filter className="w-3.5 h-3.5" /> Réinitialiser
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
        <p className="text-xs text-slate-500 font-medium">
          <span className="font-bold text-slate-900">{loading ? "…" : filteredModels.length}</span> modèle{filteredModels.length !== 1 ? "s" : ""} trouvé{filteredModels.length !== 1 ? "s" : ""} <span className="text-slate-400">sur {models.length}</span>
          {hasActiveFilters && !loading && <span className="ml-2 text-purple-600">• filtres actifs</span>}
        </p>
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 max-w-full">
            {searchQuery && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-[11px] font-bold text-purple-700"><Search className="w-3 h-3" />&quot;{searchQuery.slice(0, 18)}{searchQuery.length > 18 ? "…" : ""}&quot;<button onClick={() => setSearchQuery("")}><X className="w-3 h-3" /></button></span>}
            {selectedProvider !== "all" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-bold text-blue-700"><Building2 className="w-3 h-3" />{selectedProvider}<button onClick={() => setSelectedProvider("all")}><X className="w-3 h-3" /></button></span>}
            {(contextMinK !== null || contextMaxK !== null) && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700"><Layers className="w-3 h-3" />{formatRangeLabel(controller)}<button onClick={() => { setContextMinK(null); setContextMaxK(null); }}><X className="w-3 h-3" /></button></span>}
            {selectedTools.length > 0 && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-700 max-w-[220px]"><Wrench className="w-3 h-3 shrink-0" /><span className="truncate">{selectedTools.slice(0, 2).join(", ")}{selectedTools.length > 2 ? ` +${selectedTools.length - 2}` : ""}</span><button onClick={() => setSelectedTools([])}><X className="w-3 h-3" /></button></span>}
            {sortBy !== "default" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-600"><ArrowUpDown className="w-3 h-3" />{sortBy === "name-asc" ? "A→Z" : sortBy === "name-desc" ? "Z→A" : sortBy === "context-desc" ? "Ctx ↓" : "Ctx ↑"}<button onClick={() => setSortBy("default")}><X className="w-3 h-3" /></button></span>}
          </div>
        )}
      </div>
    </div>
  );
}
