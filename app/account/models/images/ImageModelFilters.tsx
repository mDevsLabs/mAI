"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  Building2,
  CheckSquare,
  ChevronDown,
  Filter,
  Ratio,
  Search,
  SlidersHorizontal,
  Square,
  Wrench,
  X,
} from "lucide-react";
import type { ImageModelItem } from "./image-model-types";

type SortOption = "default" | "name-asc" | "name-desc" | "provider-asc";
type ResolutionPreset = { label: string; minW: number | null; minH: number | null };
const RESOLUTION_PRESETS: ResolutionPreset[] = [
  { label: "Tous", minW: null, minH: null },
  { label: "1024x1024 (1:1 HD)", minW: 1024, minH: 1024 },
  { label: "512x512 (1:1 SD)", minW: 512, minH: 512 },
  { label: "1280x720 (16:9)", minW: 1280, minH: 720 },
  { label: "720x1280 (9:16)", minW: 720, minH: 1280 },
  { label: "1024x768 (4:3)", minW: 1024, minH: 768 },
];

export function useImageModelFilters(models: ImageModelItem[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [minWidth, setMinWidth] = useState<number | null>(null);
  const [minHeight, setMinHeight] = useState<number | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [featuresOpen, setFeaturesOpen] = useState(false);

  const providers = useMemo(() => {
    const values = new Set<string>();
    models.forEach((model) => {
      if (model.id.includes("/")) values.add(model.id.split("/")[0]);
      else if (model.provider) values.add(model.provider);
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [models]);

  const availableFeatures = useMemo(() => {
    const values = new Set([
      "Text-to-Image", "prompt", "negative_prompt", "size", "aspect_ratio",
      "response_format", "seed", "steps", "b64_json", "url", "Flux",
    ]);
    models.forEach((model) => {
      (model.features || []).forEach((feature) => values.add(feature));
      (model.supported_parameters || []).forEach((parameter) => values.add(parameter));
      if (model.id.toLowerCase().includes("flux")) values.add("Flux");
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [models]);

  const filteredModels = useMemo(() => {
    let filtered = models.filter((model) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || model.name?.toLowerCase().includes(searchLower) || model.id?.toLowerCase().includes(searchLower) || model.description?.toLowerCase().includes(searchLower);
      const provider = model.id.includes("/") ? model.id.split("/")[0] : model.provider || "";
      const matchesProvider = selectedProvider === "all" || provider === selectedProvider;
      const [width = 1024, height = 1024] = model.maxResolution?.split("x").map((value) => Number.parseInt(value, 10)) || [];
      const matchesSize = (minWidth === null || width >= minWidth) && (minHeight === null || height >= minHeight);
      const tags = [
        ...(model.features || []), ...(model.supported_parameters || []),
        "Text-to-Image", "prompt", "negative_prompt", "size", "response_format", "url", "b64_json",
        model.id.toLowerCase().includes("flux") ? "Flux" : "",
      ].map((tag) => tag.toLowerCase());
      const matchesFeatures = selectedFeatures.length === 0 || selectedFeatures.every((feature) => tags.includes(feature.toLowerCase()));
      return matchesSearch && matchesProvider && matchesSize && matchesFeatures;
    });
    if (sortBy === "name-asc") filtered = [...filtered].sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
    if (sortBy === "name-desc") filtered = [...filtered].sort((a, b) => (b.name || b.id).localeCompare(a.name || a.id));
    if (sortBy === "provider-asc") filtered = [...filtered].sort((a, b) => {
      const aProvider = a.id.includes("/") ? a.id.split("/")[0] : "";
      const bProvider = b.id.includes("/") ? b.id.split("/")[0] : "";
      return aProvider.localeCompare(bProvider);
    });
    return filtered;
  }, [minHeight, minWidth, models, searchQuery, selectedFeatures, selectedProvider, sortBy]);

  const hasActiveFilters = searchQuery !== "" || selectedProvider !== "all" || minWidth !== null || minHeight !== null || selectedFeatures.length > 0 || sortBy !== "default";
  const resetFilters = () => {
    setSearchQuery(""); setSelectedProvider("all"); setMinWidth(null); setMinHeight(null);
    setSelectedFeatures([]); setSortBy("default"); setFeaturesOpen(false);
  };
  const formatRangeLabel = () => {
    if (minWidth === null && minHeight === null) return "Tous les formats";
    if (minWidth && minHeight) return `≥ ${minWidth}×${minHeight} px`;
    if (minWidth) return `Larg. ≥ ${minWidth} px`;
    return `Haut. ≥ ${minHeight} px`;
  };

  return {
    availableFeatures, featuresOpen, filteredModels, formatRangeLabel, hasActiveFilters,
    minHeight, minWidth, models, providers, resetFilters, searchQuery, selectedFeatures,
    selectedProvider, setFeaturesOpen, setMinHeight, setMinWidth, setSearchQuery,
    setSelectedFeatures, setSelectedProvider, setSortBy, sortBy,
  };
}

export type ImageModelFilterController = ReturnType<typeof useImageModelFilters>;

export function ImageModelFilters({ controller }: { controller: ImageModelFilterController }) {
  const {
    availableFeatures, featuresOpen, filteredModels, formatRangeLabel, hasActiveFilters,
    minHeight, minWidth, models, providers, resetFilters, searchQuery, selectedFeatures,
    selectedProvider, setFeaturesOpen, setMinHeight, setMinWidth, setSearchQuery,
    setSelectedFeatures, setSelectedProvider, setSortBy, sortBy,
  } = controller;
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-5">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Rechercher un modèle par nom, ID, laboratoire, mot-clé..." className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white text-slate-900 placeholder-slate-400" />
          {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400"><X className="w-3.5 h-3.5" /></button>}
        </div>
        <div className="relative w-full lg:w-[260px] shrink-0">
          <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select value={selectedProvider} onChange={(event) => setSelectedProvider(event.target.value)} className="w-full pl-8 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 appearance-none">
            <option value="all">Tous les labos ({models.length})</option>
            {providers.map((provider) => <option key={provider} value={provider}>{provider}</option>)}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700"><Ratio className="w-4 h-4 text-purple-600" />Formats &amp; Résolutions<span className="ml-1 text-[11px] font-bold normal-case tracking-normal text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">{formatRangeLabel()}</span></div>
          {(minWidth !== null || minHeight !== null) && <button onClick={() => { setMinWidth(null); setMinHeight(null); }} className="text-[11px] font-bold text-slate-500"><X className="inline w-3 h-3" /> Effacer</button>}
        </div>
        <div className="flex flex-wrap gap-2">
          {RESOLUTION_PRESETS.map((preset) => {
            const active = preset.minW === minWidth && preset.minH === minHeight;
            return <button key={preset.label} onClick={() => { setMinWidth(preset.minW); setMinHeight(preset.minH); }} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"}`}>{preset.label}</button>;
          })}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(["Width", "Height"] as const).map((bound) => {
            const value = bound === "Width" ? minWidth : minHeight;
            const setter = bound === "Width" ? setMinWidth : setMinHeight;
            return <div key={bound} className="space-y-1"><label className="text-[11px] font-bold text-slate-500 flex items-center gap-1"><SlidersHorizontal className="w-3 h-3" />{bound === "Width" ? "Largeur" : "Hauteur"} min (px)</label><div className="relative"><input type="number" min={0} step={64} value={value ?? ""} onChange={(event) => { if (event.target.value === "") return setter(null); const parsed = Number.parseInt(event.target.value, 10); if (!Number.isNaN(parsed) && parsed >= 0) setter(parsed); }} className="w-full pl-3 pr-12 py-2 rounded-xl bg-white border border-slate-200 text-sm" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">px</span></div><p className="text-[10px] text-slate-400">{value !== null ? `≥ ${value} px` : "Aucun minimum"}</p></div>;
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="relative">
          <button type="button" onClick={() => setFeaturesOpen((open) => !open)} className="w-full flex items-center justify-between pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
            <Wrench className="w-3.5 h-3.5 absolute left-3 text-slate-400" /><span className="truncate">{selectedFeatures.length === 0 ? "Tous les paramètres" : `${selectedFeatures.length} paramètre${selectedFeatures.length > 1 ? "s" : ""} sélectionné${selectedFeatures.length > 1 ? "s" : ""}`}</span><ChevronDown className={`w-3.5 h-3.5 text-slate-400 ${featuresOpen ? "rotate-180" : ""}`} />
          </button>
          {featuresOpen && <div className="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"><div className="p-3 border-b border-slate-100 bg-slate-50/50 flex justify-between"><span className="text-xs font-black uppercase">Paramètres &amp; Styles</span><div><button onClick={() => setSelectedFeatures([...availableFeatures])} className="text-[11px] text-purple-600 px-2">Tout</button><button onClick={() => setSelectedFeatures([])} className="text-[11px] text-slate-500 px-2">Effacer</button></div></div><div className="p-2 max-h-64 overflow-y-auto">{availableFeatures.map((feature) => { const checked = selectedFeatures.includes(feature); return <button key={feature} onClick={() => setSelectedFeatures((current) => current.includes(feature) ? current.filter((item) => item !== feature) : [...current, feature])} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono"><span>{checked ? <CheckSquare className="w-3.5 h-3.5 text-purple-600" /> : <Square className="w-3.5 h-3.5 text-slate-300" />}</span>{feature}</button>; })}</div></div>}
        </div>
        <div className="relative"><ArrowUpDown className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)} className="w-full pl-8 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 appearance-none"><option value="default">Tri par défaut</option><option value="name-asc">Nom A → Z</option><option value="name-desc">Nom Z → A</option><option value="provider-asc">Laboratoire A → Z</option></select><ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" /></div>
        <button onClick={resetFilters} disabled={!hasActiveFilters} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 text-xs font-bold disabled:opacity-40"><Filter className="w-3.5 h-3.5" />Réinitialiser</button>
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-500"><span><strong className="text-slate-900">{filteredModels.length}</strong> modèle{filteredModels.length > 1 ? "s" : ""} trouvé{filteredModels.length > 1 ? "s" : ""} sur {models.length}</span></div>
    </div>
  );
}
