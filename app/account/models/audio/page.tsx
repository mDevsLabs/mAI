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
  Volume2,
  ShieldAlert,
  RefreshCw,
  Building2,
  ArrowUpDown,
  Wrench,
  Mic,
  AudioWaveform,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getUserApiUsage } from "@/app/actions/api-keys";
import toast from "react-hot-toast";
import Link from "next/link";

interface AudioModelItem {
  id: string;
  name: string;
  description: string;
  created?: number;
  owned_by?: string;
  provider?: string;
  voices?: string[];
  supported_parameters?: string[];
}

type SortOption = "default" | "name-asc" | "name-desc" | "provider-asc";

const DEFAULT_VOICES = [
  { id: "flux-alexis-en", name: "Alexis", desc: "Voix féminine chaleureuse, naturelle et claire (FR/EN)" },
  { id: "flux-michael-en", name: "Michael", desc: "Voix masculine posée, fluide et professionnelle (FR/EN)" },
  { id: "flux-stacy-en", name: "Stacy", desc: "Voix féminine expressive, vive et dynamique (FR/EN)" },
  { id: "flux-sam-en", name: "Sam", desc: "Voix masculine profonde, idéale pour narration & podcast (FR/EN)" },
  { id: "flux-asteria-en", name: "Asteria", desc: "Voix féminine moderne, douce et mélodieuse (FR/EN)" },
  { id: "flux-orion-en", name: "Orion", desc: "Voix masculine cinématique, intense et charismatique (FR/EN)" },
];

export default function ApiAudioModelsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [models, setModels] = useState<AudioModelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [openModelId, setOpenModelId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const [activeCodeTab, setActiveCodeTab] = useState<Record<string, "curl" | "python" | "ts">>({});

  // Redirection immédiate si non authentifié
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/account/login?next=${encodeURIComponent("/account/models/audio")}`);
    }
  }, [authLoading, isAuthenticated, router]);

  // Chargement des modèles audio
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

      // 2. Appel API /api/v1/models/audio
      const headers: Record<string, string> = {
        "x-user-id": userId,
      };
      if (chosenKey) {
        headers["Authorization"] = `Bearer ${chosenKey}`;
      }

      const res = await fetch("/api/v1/models/audio", { headers });
      const data = await res.json();

      if (data && Array.isArray(data.data)) {
        setModels(data.data);
        if (data.data.length > 0) {
          setOpenModelId(data.data[0].id);
        }
      } else {
        toast.error("Impossible de récupérer la liste des modèles audio.");
      }
    } catch (err) {
      console.error("Erreur chargement modèles audio:", err);
      toast.error("Erreur lors de la récupération des modèles audio.");
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
      else if (m.owned_by) set.add(m.owned_by);
      else if (m.provider) set.add(m.provider);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [models]);

  const hasActiveFilters = searchQuery !== "" || selectedProvider !== "all" || sortBy !== "default";

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedProvider("all");
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

      const provider = m.id.includes("/") ? m.id.split("/")[0] : m.owned_by || m.provider || "";
      const matchesProvider = selectedProvider === "all" || provider === selectedProvider;

      return matchesSearch && matchesProvider;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "name-asc") return (a.name || a.id).localeCompare(b.name || b.id);
      if (sortBy === "name-desc") return (b.name || b.id).localeCompare(a.name || a.id);
      if (sortBy === "provider-asc") {
        const provA = a.id.includes("/") ? a.id.split("/")[0] : a.owned_by || "";
        const provB = b.id.includes("/") ? b.id.split("/")[0] : b.owned_by || "";
        return provA.localeCompare(provB);
      }
      return 0;
    });
  }, [models, searchQuery, selectedProvider, sortBy]);

  // Code generator
  const getCodeSnippet = (modelId: string, lang: "curl" | "python" | "ts") => {
    const keyToUse = activeKey || "VOTRE_CLE_API_MAI";

    if (lang === "curl") {
      return `curl -X POST https://mai.val.run/v1/audio/speech \\
  -H "Authorization: Bearer ${keyToUse}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${modelId}",
    "input": "Bonjour ! Bienvenue sur la plateforme mAI.",
    "voice": "flux-alexis-en",
    "response_format": "mp3",
    "speed": 1.0
  }' --output speech.mp3`;
    }

    if (lang === "python") {
      return `from openai import OpenAI

client = OpenAI(
    api_key="${keyToUse}",
    base_url="https://mai.val.run/v1"
)

response = client.audio.speech.create(
    model="${modelId}",
    voice="flux-alexis-en",
    input="Bonjour ! Bienvenue sur la plateforme mAI."
)

response.stream_to_file("speech.mp3")`;
    }

    return `import OpenAI from "openai";
import fs from "fs";
import path from "path";

const openai = new OpenAI({
  apiKey: "${keyToUse}",
  baseURL: "https://mai.val.run/v1",
});

async function main() {
  const mp3 = await openai.audio.speech.create({
    model: "${modelId}",
    voice: "flux-alexis-en",
    input: "Bonjour ! Bienvenue sur la plateforme mAI.",
  });
  
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(path.resolve("./speech.mp3"), buffer);
}

main();`;
  };

  if (authLoading || (!isAuthenticated && !user)) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
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
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-purple-700 shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Volume2 className="w-3.5 h-3.5 text-purple-600" />
            Modèles Audio (TTS)
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500">
                Synthèse Vocale &amp; Audio
              </span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base font-light max-w-2xl">
              Consultez le catalogue interactif des modèles Text-to-Speech (TTS) compatibles OpenAI SDK &amp; Google Cloud TTS accessibles avec votre clé d&apos;API mAI.
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
              className="text-amber-700 hover:text-amber-800 font-bold underline shrink-0 ml-4"
            >
              Générer une clé
            </Link>
          </div>
        )}

        {/* Voix disponibles de la plateforme */}
        <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-bold text-slate-900">Voix Naturelles Disponibles (TTS Studio)</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {DEFAULT_VOICES.map((v) => (
              <div key={v.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                    <AudioWaveform className="w-3.5 h-3.5 text-purple-600" />
                    {v.name}
                  </span>
                  <code className="text-[10px] font-mono bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md font-bold">
                    {v.id}
                  </code>
                </div>
                <p className="text-xs text-slate-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filtres & Recherche */}
        <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, ID ou description (ex: flux, deepgram)..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>

            {/* Filtre par Fournisseur */}
            <div className="w-full md:w-56">
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="all">Tous les fournisseurs</option>
                  {providers.map((p) => (
                    <option key={p} value={p}>
                      {p.toUpperCase()}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Tri */}
            <div className="w-full md:w-56">
              <div className="relative">
                <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full pl-10 pr-8 py-3 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="default">Tri par défaut</option>
                  <option value="name-asc">Nom (A → Z)</option>
                  <option value="name-desc">Nom (Z → A)</option>
                  <option value="provider-asc">Fournisseur (A → Z)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500">
                {filteredAndSortedModels.length} modèle(s) trouvé(s)
              </span>
              <button
                onClick={resetFilters}
                className="text-purple-600 hover:text-purple-700 font-bold hover:underline cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>

        {/* Liste des Modèles (Accordéon) */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            <p className="text-sm text-slate-500">Chargement du catalogue des modèles audio...</p>
          </div>
        ) : filteredAndSortedModels.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
            <Volume2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Aucun modèle audio trouvé</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Aucun modèle audio ne correspond à vos critères de recherche actuels.
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-2 px-4 py-2 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs hover:bg-purple-100 transition-colors cursor-pointer"
              >
                Effacer tous les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedModels.map((model) => {
              const isOpen = openModelId === model.id;
              const provider = model.id.includes("/") ? model.id.split("/")[0] : model.owned_by || "mAI";
              const currentTab = activeCodeTab[model.id] || "curl";

              return (
                <div
                  key={model.id}
                  className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-xs ${
                    isOpen ? "border-purple-300 ring-2 ring-purple-500/10" : "border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  {/* Header / Trigger */}
                  <div
                    onClick={() => toggleAccordion(model.id)}
                    className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-black text-slate-900 tracking-tight">
                          {model.name}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-700">
                          {provider}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <code className="font-mono bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                          {model.id}
                        </code>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(model.id);
                          }}
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                          title="Copier l'ID"
                        >
                          {copiedId === model.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 self-end sm:self-center">
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                          <Mic className="w-3.5 h-3.5 text-purple-600" />
                          <span>6 voix TTS</span>
                        </div>
                      </div>
                      <div className="p-1 rounded-full text-slate-400">
                        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Contenu Dépliable */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-6">
                          {/* Description */}
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {model.description}
                          </p>

                          {/* Paramètres supportés */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                              <Wrench className="w-3.5 h-3.5 text-purple-600" />
                              Paramètres API Supportés
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {(model.supported_parameters || ["voice", "speed", "response_format", "input"]).map((p) => (
                                <span
                                  key={p}
                                  className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/60"
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Exemples de code */}
                          <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                Intégration dans vos applications
                              </h4>
                              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                                {(["curl", "python", "ts"] as const).map((lang) => (
                                  <button
                                    key={lang}
                                    onClick={() =>
                                      setActiveCodeTab((prev) => ({ ...prev, [model.id]: lang }))
                                    }
                                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                                      currentTab === lang ? "bg-white text-purple-700 shadow-xs" : "text-slate-600"
                                    }`}
                                  >
                                    {lang.toUpperCase()}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="relative rounded-2xl bg-slate-950 text-slate-100 p-4 font-mono text-xs overflow-x-auto">
                              <button
                                onClick={() => {
                                  const snippet = getCodeSnippet(model.id, currentTab);
                                  navigator.clipboard.writeText(snippet);
                                  toast.success("Extrait de code copié !");
                                }}
                                className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                                title="Copier le code"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <pre className="pr-12">{getCodeSnippet(model.id, currentTab)}</pre>
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
