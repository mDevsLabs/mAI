"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  CheckSquare,
  ChevronDown,
  Cpu,
  Filter,
  Search,
  SlidersHorizontal,
  Sparkles,
  Square,
  Wrench,
  X,
} from "lucide-react";
import type {
  MaiModelItem,
  MaiModelSort,
  MaiParamPreset,
} from "./mai-model-types";

const PARAM_PRESETS: MaiParamPreset[] = [
  { id: "all", label: "Tous", minB: null, maxB: null },
  { id: "lte4", label: "≤ 4B (Léger)", minB: null, maxB: 4 },
  { id: "9-12", label: "9B – 12B (Standard)", minB: 9, maxB: 12 },
  { id: "27-33", label: "27B – 33B (Expert)", minB: 27, maxB: 33 },
  { id: "gte70", label: "≥ 70B (Max)", minB: 70, maxB: null },
];

const CAPABILITIES = [
  { id: "vision", label: "Vision Multimodale" },
  { id: "reasoning", label: "Raisonnement (Thinking)" },
  { id: "coding", label: "Développement & Code" },
  { id: "functionCalling", label: "Appels d'Outils (Tools)" },
  { id: "jsonOutput", label: "JSON Structuré" },
] as const;

function parameterCount(model: MaiModelItem): number {
  return Number.parseInt(model.parameters?.replace(/[^0-9]/g, "") || "0", 10);
}

export function useMaiModelFilters(models: MaiModelItem[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeries, setSelectedSeries] = useState("all");
  const [sortBy, setSortBy] = useState<MaiModelSort>("default");
  const [paramMinB, setParamMinB] = useState<number | null>(null);
  const [paramMaxB, setParamMaxB] = useState<number | null>(null);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [capsOpen, setCapsOpen] = useState(false);

  const availableSeries = useMemo(() => {
    const values = new Set<string>();
    models.forEach((model) => {
      if (model.id.includes("1.5")) values.add("mAI 1.5");
      else if (model.id.includes("1.2")) values.add("mAI 1.2");
      else if (model.id.includes("1.0") || model.id.endsWith("-1")) values.add("mAI 1.0");
      else if (model.version) values.add(`mAI ${model.version}`);
    });
    return Array.from(values).sort().reverse();
  }, [models]);

  const filteredModels = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();
    const filtered = models.filter((model) => {
      const matchesSearch =
        !search ||
        [model.name, model.id, model.description, model.tagline]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(search));
      const matchesSeries =
        selectedSeries === "all" ||
        (selectedSeries === "mAI 1.5" && model.id.includes("1.5")) ||
        (selectedSeries === "mAI 1.2" && model.id.includes("1.2")) ||
        (selectedSeries === "mAI 1.0" &&
          (model.id.includes("1.0") || model.id.endsWith("-1")));
      const parameters = parameterCount(model);
      const matchesSize =
        (paramMinB === null || parameters >= paramMinB) &&
        (paramMaxB === null || parameters <= paramMaxB);
      const matchesCapabilities =
        selectedCapabilities.length === 0 ||
        selectedCapabilities.every((capability) => {
          if (capability === "vision") return Boolean(model.capabilities?.vision);
          if (capability === "reasoning") return Boolean(model.capabilities?.reasoning);
          if (capability === "coding") return Boolean(model.capabilities?.coding);
          if (capability === "functionCalling") return Boolean(model.capabilities?.functionCalling);
          if (capability === "jsonOutput") return Boolean(model.capabilities?.jsonOutput);
          return true;
        });
      return matchesSearch && matchesSeries && matchesSize && matchesCapabilities;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "name-asc") return (a.name || a.id).localeCompare(b.name || b.id);
      if (sortBy === "name-desc") return (b.name || b.id).localeCompare(a.name || a.id);
      if (sortBy === "params-desc") return parameterCount(b) - parameterCount(a);
      if (sortBy === "context-desc") return b.context_length - a.context_length;
      return 0;
    });
  }, [models, paramMaxB, paramMinB, searchQuery, selectedCapabilities, selectedSeries, sortBy]);

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
    setCapsOpen(false);
  };

  const toggleCapability = (id: string) => {
    setSelectedCapabilities((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const rangeLabel =
    paramMinB === null && paramMaxB === null
      ? "Toutes tailles"
      : paramMinB !== null && paramMaxB !== null
        ? `${paramMinB}B – ${paramMaxB}B`
        : paramMinB !== null
          ? `≥ ${paramMinB}B`
          : `≤ ${paramMaxB}B`;

  return {
    availableSeries,
    capsOpen,
    filteredModels,
    hasActiveFilters,
    paramMaxB,
    paramMinB,
    rangeLabel,
    resetFilters,
    searchQuery,
    selectedCapabilities,
    selectedSeries,
    setCapsOpen,
    setParamMaxB,
    setParamMinB,
    setSearchQuery,
    setSelectedCapabilities,
    setSelectedSeries,
    setSortBy,
    sortBy,
    toggleCapability,
  };
}

export type MaiModelFilterController = ReturnType<typeof useMaiModelFilters>;

export function MaiModelFilters({
  controller,
  models,
}: {
  controller: MaiModelFilterController;
  models: MaiModelItem[];
}) {
  const {
    availableSeries,
    capsOpen,
    filteredModels,
    hasActiveFilters,
    paramMaxB,
    paramMinB,
    rangeLabel,
    resetFilters,
    searchQuery,
    selectedCapabilities,
    selectedSeries,
    setCapsOpen,
    setParamMaxB,
    setParamMinB,
    setSearchQuery,
    setSelectedCapabilities,
    setSelectedSeries,
    setSortBy,
    sortBy,
    toggleCapability,
  } = controller;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-5">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Rechercher un modèle mAI par nom, ID, version..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-900"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400"
              aria-label="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="relative lg:w-[260px]">
          <Sparkles className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={selectedSeries}
            onChange={(event) => setSelectedSeries(event.target.value)}
            className="w-full pl-8 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-purple-500/20"
            aria-label="Filtrer par série mAI"
          >
            <option value="all">Toutes les séries ({models.length})</option>
            {availableSeries.map((series) => <option key={series}>{series}</option>)}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700">
            <Cpu className="w-4 h-4 text-purple-600" /> Taille de paramètres
            <span className="text-[11px] font-bold normal-case tracking-normal text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
              {rangeLabel}
            </span>
          </div>
          {(paramMinB !== null || paramMaxB !== null) && (
            <button type="button" onClick={() => { setParamMinB(null); setParamMaxB(null); }} className="text-[11px] font-bold text-slate-500">
              <X className="w-3 h-3 inline" /> Effacer
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {PARAM_PRESETS.map((preset) => {
            const active = preset.minB === paramMinB && preset.maxB === paramMaxB;
            return (
              <button
                type="button"
                key={preset.id}
                onClick={() => { setParamMinB(preset.minB); setParamMaxB(preset.maxB); }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border ${active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"}`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Paramètres min", value: paramMinB, setter: setParamMinB, placeholder: "ex: 4" },
            { label: "Paramètres max", value: paramMaxB, setter: setParamMaxB, placeholder: "ex: 33" },
          ].map((field) => (
            <label key={field.label} className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" /> {field.label} (B)
              </span>
              <input
                type="number"
                min={0}
                value={field.value ?? ""}
                onChange={(event) => {
                  const raw = event.target.value;
                  field.setter(raw === "" ? null : Math.max(0, Number.parseInt(raw, 10) || 0));
                }}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500/20"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setCapsOpen((current) => !current)}
            className="w-full flex items-center justify-between pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
            aria-expanded={capsOpen}
          >
            <Wrench className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
            <span className="truncate text-left">
              {selectedCapabilities.length === 0 ? "Toutes les capacités" : `${selectedCapabilities.length} capacité(s)`}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${capsOpen ? "rotate-180" : ""}`} />
          </button>
          {capsOpen && (
            <div className="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl p-2 space-y-1">
              <div className="flex justify-between border-b border-slate-100 p-2 text-[11px] font-bold">
                <button type="button" onClick={() => setSelectedCapabilities(CAPABILITIES.map((item) => item.id))} className="text-purple-600">Tout</button>
                <button type="button" onClick={() => setSelectedCapabilities([])} className="text-slate-500">Effacer</button>
              </div>
              {CAPABILITIES.map((capability) => {
                const selected = selectedCapabilities.includes(capability.id);
                return (
                  <button type="button" key={capability.id} onClick={() => toggleCapability(capability.id)} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-slate-50 text-left">
                    {selected ? <CheckSquare className="w-3.5 h-3.5 text-purple-600" /> : <Square className="w-3.5 h-3.5 text-slate-300" />}
                    {capability.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="relative">
          <ArrowUpDown className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as MaiModelSort)}
            className="w-full pl-8 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
            aria-label="Trier les modèles mAI"
          >
            <option value="default">Ordre officiel</option>
            <option value="name-asc">Nom A → Z</option>
            <option value="name-desc">Nom Z → A</option>
            <option value="params-desc">Taille (Grand → Petit)</option>
            <option value="context-desc">Contexte (Grand → Petit)</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        <button type="button" onClick={resetFilters} disabled={!hasActiveFilters} className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 text-xs font-bold disabled:opacity-40">
          <Filter className="w-3.5 h-3.5 inline mr-1" /> Réinitialiser
        </button>
      </div>

      <div className="pt-1 border-t border-slate-100 text-xs text-slate-500">
        <strong className="text-slate-900">{filteredModels.length}</strong> modèle{filteredModels.length > 1 ? "s" : ""} trouvé{filteredModels.length > 1 ? "s" : ""} sur {models.length}
      </div>
    </div>
  );
}
