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
  Sparkles,
  Loader2,
  Cpu,
  Layers,
  ShieldAlert,
  Sliders,
  ExternalLink,
  RefreshCw,
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

  // Liste des fournisseurs uniques pour le filtre
  const providers = useMemo(() => {
    const set = new Set<string>();
    models.forEach((m) => {
      if (m.owned_by) set.add(m.owned_by);
      else if (m.id.includes("/")) set.add(m.id.split("/")[0]);
    });
    return Array.from(set);
  }, [models]);

  // Filtrage selon recherche et provider
  const filteredModels = useMemo(() => {
    return models.filter((m) => {
      const matchesSearch =
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const provider = m.owned_by || (m.id.includes("/") ? m.id.split("/")[0] : "mAI");
      const matchesProvider = selectedProvider === "all" || provider === selectedProvider;

      return matchesSearch && matchesProvider;
    });
  }, [models, searchQuery, selectedProvider]);

  const formatTokens = (tokens?: number) => {
    if (!tokens || isNaN(tokens)) return "128,000";
    return tokens.toLocaleString("fr-FR");
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
              Consultez le catalogue interactif des modèles accessibles via votre clé d&apos;API. Visualisez les contextes maximaux, longueurs de sortie et paramètres supportés.
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

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un modèle par nom, ID, mot-clé..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-900 shadow-xs placeholder-slate-400"
            />
          </div>

          {providers.length > 1 && (
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 shadow-xs cursor-pointer"
            >
              <option value="all">Tous les fournisseurs ({models.length})</option>
              {providers.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Liste des Modèles sous forme d'Accordéons (Style conforme à la maquette) */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/60 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-3" />
            <p className="text-sm font-medium text-slate-500">Chargement des modèles de l&apos;API...</p>
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="text-center py-16 bg-white/60 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs">
            <p className="text-base font-bold text-slate-700">Aucun modèle correspondant trouvé</p>
            <p className="text-xs text-slate-400 mt-1">Essayez de modifier vos critères de recherche.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredModels.map((model) => {
              const isOpen = openModelId === model.id;
              const provider = model.owned_by || (model.id.includes("/") ? model.id.split("/")[0] : "mAI");

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
                    <div className="flex items-center gap-3">
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-slate-600 shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                        {model.name || model.id}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                        {provider}
                      </span>
                    </div>
                  </button>

                  {/* Accordion Content (Conforme à la maquette utilisateur) */}
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

                          {/* Grille de Cartes d'Attributs (Style clair avec coins arrondis) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Max Context Length */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                              <p className="text-xs text-slate-500 font-medium">Max context length:</p>
                              <p className="text-base font-bold text-slate-900">
                                {formatTokens(model.maxContext)} tokens
                              </p>
                            </div>

                            {/* Max Output / Summary Length */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                              <p className="text-xs text-slate-500 font-medium">Max output length:</p>
                              <p className="text-base font-bold text-slate-900">
                                {formatTokens(model.maxOutput)} tokens
                              </p>
                            </div>

                            {/* Paramètres supportés / Modalité */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2 sm:col-span-2">
                              <p className="text-xs text-slate-500 font-medium">Paramètres supportés (Supported parameters):</p>
                              <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {model.supported_parameters && model.supported_parameters.length > 0 ? (
                                  model.supported_parameters.map((param) => (
                                    <span
                                      key={param}
                                      className="text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs"
                                    >
                                      {param}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs font-mono font-medium text-slate-500">
                                    temperature, top_p, max_tokens, stream, stop
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Identifiant API avec bouton de copie */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2 sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <p className="text-xs text-slate-500 font-medium">Identifiant du modèle (API ID):</p>
                                <p className="text-sm font-mono font-bold text-purple-700 mt-0.5 select-all">
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
