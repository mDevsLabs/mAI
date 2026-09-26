"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Building2, ChevronDown, Search, X } from "lucide-react";
import type { AudioModelItem } from "./audio-model-types";

type SortOption = "default" | "name-asc" | "name-desc" | "provider-asc";

export function useAudioModelFilters(models: AudioModelItem[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const providers = useMemo(() => {
    const values = new Set<string>();
    models.forEach((model) => {
      if (model.id.includes("/")) values.add(model.id.split("/")[0]);
      else if (model.owned_by) values.add(model.owned_by);
      else if (model.provider) values.add(model.provider);
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [models]);
  const filteredModels = useMemo(() => {
    const filtered = models.filter((model) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || model.name?.toLowerCase().includes(query) || model.id?.toLowerCase().includes(query) || model.description?.toLowerCase().includes(query);
      const provider = model.id.includes("/") ? model.id.split("/")[0] : model.owned_by || model.provider || "";
      return matchesSearch && (selectedProvider === "all" || provider === selectedProvider);
    });
    return filtered.sort((a, b) => {
      if (sortBy === "name-asc") return (a.name || a.id).localeCompare(b.name || b.id);
      if (sortBy === "name-desc") return (b.name || b.id).localeCompare(a.name || a.id);
      if (sortBy === "provider-asc") {
        const aProvider = a.id.includes("/") ? a.id.split("/")[0] : a.owned_by || "";
        const bProvider = b.id.includes("/") ? b.id.split("/")[0] : b.owned_by || "";
        return aProvider.localeCompare(bProvider);
      }
      return 0;
    });
  }, [models, searchQuery, selectedProvider, sortBy]);
  const hasActiveFilters = searchQuery !== "" || selectedProvider !== "all" || sortBy !== "default";
  return {
    filteredModels, hasActiveFilters, models, providers, reset: () => {
      setSearchQuery(""); setSelectedProvider("all"); setSortBy("default");
    }, searchQuery, selectedProvider, setSearchQuery, setSelectedProvider, setSortBy, sortBy,
  };
}

export type AudioModelFilterController = ReturnType<typeof useAudioModelFilters>;

export function AudioModelFilters({ controller }: { controller: AudioModelFilterController }) {
  const { filteredModels, hasActiveFilters, models, providers, reset, searchQuery, selectedProvider, setSearchQuery, setSelectedProvider, setSortBy, sortBy } = controller;
  return (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1"><Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Rechercher par nom, ID ou description..." className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm" />{searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-slate-400" /></button>}</div>
        <div className="relative w-full md:w-56"><Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" /><select value={selectedProvider} onChange={(event) => setSelectedProvider(event.target.value)} className="w-full pl-10 pr-8 py-3 rounded-2xl bg-white border border-slate-200 text-sm appearance-none"><option value="all">Tous les fournisseurs</option>{providers.map((provider) => <option key={provider} value={provider}>{provider.toUpperCase()}</option>)}</select><ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" /></div>
        <div className="relative w-full md:w-56"><ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" /><select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)} className="w-full pl-10 pr-8 py-3 rounded-2xl bg-white border border-slate-200 text-sm appearance-none"><option value="default">Tri par défaut</option><option value="name-asc">Nom (A → Z)</option><option value="name-desc">Nom (Z → A)</option><option value="provider-asc">Fournisseur (A → Z)</option></select><ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" /></div>
      </div>
      {(hasActiveFilters) && <div className="flex items-center justify-between text-xs"><span className="text-slate-500">{filteredModels.length} modèle(s) trouvé(s)</span><button onClick={reset} className="text-purple-600 font-bold">Réinitialiser les filtres</button></div>}
      <p className="text-xs text-slate-500">{filteredModels.length} modèle{filteredModels.length !== 1 ? "s" : ""} sur {models.length}</p>
    </div>
  );
}
