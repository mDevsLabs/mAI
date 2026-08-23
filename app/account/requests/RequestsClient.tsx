"use client";

import { useState, useEffect } from "react";
import { 
  Play, 
  Copy, 
  Check, 
  Share2, 
  Download, 
  Code2, 
  Sparkles, 
  Terminal, 
  FolderKanban, 
  Key, 
  Clock, 
  FileJson,
  RotateCcw
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export interface RouteDefinition {
  id: string;
  name: string;
  category: "Projets" | "LLM & Modèles" | "SDK Google & Anthropic" | "Clés & Quotas" | "Système";
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  requiresAuth: boolean;
  defaultHeaders: Record<string, string>;
  defaultBody?: any;
}

const ROUTE_DEFINITIONS: RouteDefinition[] = [
  // 📁 PROJETS
  {
    id: "projects-list",
    name: "Lister les projets",
    category: "Projets",
    method: "GET",
    path: "v1/projects",
    description: "Récupère la liste globale de tous les projets de la plateforme mAI (Web, Pulse, CLI, Coder).",
    requiresAuth: true,
    defaultHeaders: {
      "Content-Type": "application/json"
    }
  },
  {
    id: "projects-web",
    name: "Projet Web",
    category: "Projets",
    method: "GET",
    path: "v1/projects/web",
    description: "Obtient les détails et l'état de l'application mAI Web.",
    requiresAuth: true,
    defaultHeaders: {
      "Content-Type": "application/json"
    }
  },
  {
    id: "projects-pulse",
    name: "Projet Pulse",
    category: "Projets",
    method: "GET",
    path: "v1/projects/pulse",
    description: "Obtient les détails de la suite d'extensions mAI Pulse.",
    requiresAuth: true,
    defaultHeaders: {
      "Content-Type": "application/json"
    }
  },
  {
    id: "projects-cli",
    name: "Projet CLI",
    category: "Projets",
    method: "GET",
    path: "v1/projects/cli",
    description: "Obtient les détails de l'assistant de terminal mAI CLI.",
    requiresAuth: true,
    defaultHeaders: {
      "Content-Type": "application/json"
    }
  },
  {
    id: "projects-coder",
    name: "Projet Coder",
    category: "Projets",
    method: "GET",
    path: "v1/projects/coder",
    description: "Obtient les détails de l'IDE IA mAI Coder avec agents et outils MCP.",
    requiresAuth: true,
    defaultHeaders: {
      "Content-Type": "application/json"
    }
  },

  // 🤖 LLM & MODÈLES
  {
    id: "chat-completions",
    name: "Chat Completions mAI",
    category: "LLM & Modèles",
    method: "POST",
    path: "v1/chat/completions",
    description: "Génère une réponse LLM mAI / OpenRouter compatible OpenAI.",
    requiresAuth: true,
    defaultHeaders: {
      "Content-Type": "application/json"
    },
    defaultBody: {
      model: "poolside/laguna-xs-2.1:free",
      messages: [
        { role: "system", content: "Tu es un assistant IA serviable et précis." },
        { role: "user", content: "Explique l'écosystème mAI en une phrase !" }
      ],
      temperature: 0.7
    }
  },
  {
    id: "models-list-public",
    name: "Catalogue des modèles",
    category: "LLM & Modèles",
    method: "GET",
    path: "v1/models",
    description: "Liste les modèles d'IA disponibles via l'API publique.",
    requiresAuth: false,
    defaultHeaders: {
      "Content-Type": "application/json"
    }
  },

  // 🔮 SDK GOOGLE & ANTHROPIC
  {
    id: "anthropic-messages",
    name: "Anthropic Messages SDK",
    category: "SDK Google & Anthropic",
    method: "POST",
    path: "v1/messages",
    description: "Endpoint compatible avec le SDK officiel Anthropic (@anthropic-ai/sdk).",
    requiresAuth: true,
    defaultHeaders: {
      "Content-Type": "application/json"
    },
    defaultBody: {
      model: "poolside/laguna-xs-2.1:free",
      max_tokens: 1024,
      messages: [
        { role: "user", content: "Bonjour Claude, résume les capacités de mAI !" }
      ]
    }
  },
  {
    id: "google-generative-ai",
    name: "Google Generative AI SDK",
    category: "SDK Google & Anthropic",
    method: "POST",
    path: "v1beta/models/poolside/laguna-xs-2.1:free:generateContent",
    description: "Endpoint compatible avec le SDK officiel Google Generative AI (@google/generative-ai).",
    requiresAuth: true,
    defaultHeaders: {
      "Content-Type": "application/json"
    },
    defaultBody: {
      contents: [
        {
          role: "user",
          parts: [{ text: "Bonjour Gemini, présente-toi brièvement." }]
        }
      ]
    }
  },

  // 🔑 CLÉS & QUOTAS
  {
    id: "dev-keys-list",
    name: "Mes Clés API",
    category: "Clés & Quotas",
    method: "GET",
    path: "api/dev-keys",
    description: "Récupère la liste de vos clés API générées.",
    requiresAuth: true,
    defaultHeaders: {
      "Content-Type": "application/json"
    }
  },

  // 🟢 SYSTÈME
  {
    id: "system-status",
    name: "Statut des services",
    category: "Système",
    method: "GET",
    path: "v1/status",
    description: "Vérifie l'état et la santé globale de l'infrastucture mAI.",
    requiresAuth: false,
    defaultHeaders: {
      "Content-Type": "application/json"
    }
  }
];

export default function RequestsClient() {
  const { user } = useAuth();
  
  // Clés API de l'utilisateur
  const [createdKeys, setCreatedKeys] = useState<{ id: string; name: string; prefix: string }[]>([]);
  const [selectedKeyPrefix, setSelectedKeyPrefix] = useState<string>("");
  const [customKeyInput, setCustomKeyInput] = useState<string>("");

  // Route sélectionnée
  const [selectedRoute, setSelectedRoute] = useState<RouteDefinition>(ROUTE_DEFINITIONS[0]);
  
  // Éditeur d'état
  const [customPath, setCustomPath] = useState<string>(ROUTE_DEFINITIONS[0].path);
  const [customMethod, setCustomMethod] = useState<"GET" | "POST" | "PUT" | "DELETE">(ROUTE_DEFINITIONS[0].method);
  const [bodyText, setBodyText] = useState<string>("");

  // Onglet Code
  const [activeCodeTab, setActiveCodeTab] = useState<"curl" | "fetch" | "python" | "node">("curl");

  // État de l'exécution
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseLatency, setResponseLatency] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<string>("");

  // Feedbacks de copie
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Charger les clés API de l'utilisateur
  useEffect(() => {
    async function loadCreatedKeys() {
      try {
        const userId = encodeURIComponent(user?.username || user?.email || 'dev_user');
        const res = await fetch('/api/dev-keys', {
          headers: { 'x-user-id': userId }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.keys)) {
            setCreatedKeys(data.keys);
            if (data.keys.length > 0) {
              setSelectedKeyPrefix(data.keys[0].prefix || data.keys[0].id);
            }
          }
        }
      } catch {
        // ignore
      }
    }
    loadCreatedKeys();
  }, [user]);

  // Réinitialiser les champs d'édition lors du changement de route
  useEffect(() => {
    setCustomPath(selectedRoute.path);
    setCustomMethod(selectedRoute.method);

    if (selectedRoute.defaultBody) {
      setBodyText(JSON.stringify(selectedRoute.defaultBody, null, 2));
    } else {
      setBodyText("");
    }
  }, [selectedRoute]);

  // Obtenir la clé active (qui commence par mp-)
  const getActiveApiKey = () => {
    if (customKeyInput.trim()) return customKeyInput.trim();
    if (selectedKeyPrefix) return selectedKeyPrefix.replace(/_•+$/, "");
    return "mp-live_sample123456";
  };

  // URL cible sur Val Town
  const getComputedValTownUrl = () => {
    let clean = customPath.trim();
    if (clean.startsWith("/")) clean = clean.substring(1);
    if (clean.startsWith("api/")) clean = clean.substring(4);
    
    // Si c'est /api/dev-keys local
    if (clean.includes("dev-keys")) {
      return `/api/${clean}`;
    }

    return `https://mai.val.run/${clean}`;
  };

  const targetValTownUrl = getComputedValTownUrl();

  // Obtenir les en-têtes HTTP construits de manière automatique
  const getBuiltHeaders = () => {
    const activeKey = getActiveApiKey();
    const headersObj: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${activeKey}`
    };

    if (user?.username || user?.email) {
      headersObj["x-user-id"] = encodeURIComponent(user?.username || user?.email);
    }

    return headersObj;
  };

  // Génération des extraits de code
  const getGeneratedCode = () => {
    const parsedHeaders = getBuiltHeaders();
    const targetUrl = targetValTownUrl.startsWith("http") 
      ? targetValTownUrl 
      : `${typeof window !== "undefined" ? window.location.origin : ""}${targetValTownUrl}`;

    if (activeCodeTab === "curl") {
      let cmd = `curl -X ${customMethod} "${targetUrl}"`;
      Object.entries(parsedHeaders).forEach(([k, v]) => {
        cmd += ` \\\n  -H "${k}: ${v}"`;
      });
      if (["POST", "PUT"].includes(customMethod) && bodyText.trim()) {
        cmd += ` \\\n  -d '${bodyText.trim()}'`;
      }
      return cmd;
    }

    if (activeCodeTab === "fetch") {
      return `fetch("${targetUrl}", {
  method: "${customMethod}",
  headers: ${JSON.stringify(parsedHeaders, null, 4)},
  ${["POST", "PUT"].includes(customMethod) && bodyText.trim() ? `body: JSON.stringify(${bodyText.trim()})` : ""}
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`;
    }

    if (activeCodeTab === "python") {
      return `import requests

url = "${targetUrl}"
headers = ${JSON.stringify(parsedHeaders, null, 4)}
${["POST", "PUT"].includes(customMethod) && bodyText.trim() ? `payload = ${bodyText.trim()}` : ""}

response = requests.${customMethod.toLowerCase()}(url, headers=headers${["POST", "PUT"].includes(customMethod) && bodyText.trim() ? ", json=payload" : ""})
print(response.status_code)
print(response.json())`;
    }

    if (activeCodeTab === "node") {
      return `const axios = require('axios');

const config = {
  method: '${customMethod.toLowerCase()}',
  url: '${targetUrl}',
  headers: ${JSON.stringify(parsedHeaders, null, 4)}${["POST", "PUT"].includes(customMethod) && bodyText.trim() ? `,\n  data: ${bodyText.trim()}` : ""}
};

axios(config)
  .then(response => console.log(response.data))
  .catch(error => console.error(error));`;
    }

    return "";
  };

  // Exécution de la requête
  const handleExecuteRequest = async () => {
    setIsExecuting(true);
    setResponseStatus(null);
    setResponseLatency(null);
    setResponseData("");

    const startTime = performance.now();

    try {
      const headersObj = getBuiltHeaders();
      const options: RequestInit = {
        method: customMethod,
        headers: headersObj,
      };

      if (["POST", "PUT"].includes(customMethod) && bodyText.trim()) {
        options.body = bodyText;
      }

      let res: Response;
      try {
        res = await fetch(targetValTownUrl, options);
      } catch {
        // Fallback automatique via le serveur local Next.js si le navigateur bloque le CORS direct vers Val Town
        let proxyPath = customPath.trim();
        if (!proxyPath.startsWith("/")) proxyPath = "/" + proxyPath;
        if (!proxyPath.startsWith("/api/")) proxyPath = "/api/" + proxyPath.replace(/^\/+/, "");
        
        res = await fetch(proxyPath, options);
      }

      const endTime = performance.now();
      
      setResponseStatus(res.status);
      setResponseLatency(Math.round(endTime - startTime));

      const text = await res.text();
      try {
        const json = JSON.parse(text);
        setResponseData(JSON.stringify(json, null, 2));
      } catch {
        setResponseData(text);
      }
    } catch (err: any) {
      const endTime = performance.now();
      setResponseStatus(500);
      setResponseLatency(Math.round(endTime - startTime));
      setResponseData(JSON.stringify({ 
        error: {
          code: "execution_error",
          message: err?.message || "Erreur lors de l'exécution de la requête vers le serveur."
        } 
      }, null, 2));
    } finally {
      setIsExecuting(false);
    }
  };

  // Copie de code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(getGeneratedCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Copie de réponse
  const handleCopyResponse = () => {
    if (!responseData) return;
    navigator.clipboard.writeText(responseData);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  // Partager la requête
  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("route", selectedRoute.id);
    url.searchParams.set("method", customMethod);
    url.searchParams.set("path", customPath);
    navigator.clipboard.writeText(url.toString());
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // Exporter la réponse
  const handleExport = () => {
    if (!responseData) return;
    const blob = new Blob([responseData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mai-api-response-${selectedRoute.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* ─────────────────────────────────────────────
          COLONNE GAUCHE : SÉLECTEUR DE ROUTES (4 cols)
      ───────────────────────────────────────────── */}
      <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-purple-600" />
            Catalogue des Routes API
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sélectionnez une route pour l&apos;exécuter directement sur le serveur Val Town.
          </p>
        </div>

        {/* Intégration Rapide des Clés API créées (commençant par mp-) */}
        <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-xl space-y-2">
          <label className="text-xs font-bold text-purple-950 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-purple-600" />
              Clé API d&apos;exécution :
            </span>
            <a href="/account/keys" className="text-[10px] text-purple-700 font-bold hover:underline">
              Mes Clés
            </a>
          </label>

          {createdKeys.length > 0 ? (
            <select
              value={selectedKeyPrefix}
              onChange={(e) => {
                setSelectedKeyPrefix(e.target.value);
                setCustomKeyInput("");
              }}
              className="w-full text-xs font-mono bg-white border border-purple-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
            >
              {createdKeys.map((k) => (
                <option key={k.id} value={k.prefix}>
                  🔑 {k.name} ({k.prefix})
                </option>
              ))}
            </select>
          ) : (
            <p className="text-[11px] text-purple-700 italic">
              Aucune clé enregistrée. Générez-en une sur la page <a href="/account/keys" className="underline font-bold">Clés API</a>.
            </p>
          )}

          {/* Saisie de clé personnalisée (commençant par mp-) */}
          <input
            type="text"
            placeholder="Ou saisissez une clé (mp-...)"
            value={customKeyInput}
            onChange={(e) => setCustomKeyInput(e.target.value)}
            className="w-full text-xs font-mono bg-white border border-purple-200 rounded-lg px-2.5 py-1.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Liste groupée des routes */}
        <div className="space-y-5 max-h-[550px] overflow-y-auto pr-1">
          {["Projets", "LLM & Modèles", "SDK Google & Anthropic", "Clés & Quotas", "Système"].map((cat) => {
            const routesInCat = ROUTE_DEFINITIONS.filter((r) => r.category === cat);
            if (routesInCat.length === 0) return null;

            return (
              <div key={cat} className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                  <span>{cat}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-1.5 py-0.5 rounded-full">
                    {routesInCat.length}
                  </span>
                </div>

                <div className="space-y-1">
                  {routesInCat.map((route) => {
                    const isSelected = selectedRoute.id === route.id;
                    const methodColors = {
                      GET: "bg-emerald-100 text-emerald-700 border-emerald-200",
                      POST: "bg-blue-100 text-blue-700 border-blue-200",
                      PUT: "bg-amber-100 text-amber-700 border-amber-200",
                      DELETE: "bg-rose-100 text-rose-700 border-rose-200"
                    };

                    return (
                      <button
                        key={route.id}
                        onClick={() => setSelectedRoute(route)}
                        className={`w-full text-left p-3 rounded-xl transition-all border flex items-start gap-3 ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10 scale-[1.01]"
                            : "bg-slate-50/50 hover:bg-slate-100/80 text-slate-700 border-slate-200/60"
                        }`}
                      >
                        <span className={`text-[10px] font-black tracking-wider px-2 py-0.5 rounded border uppercase mt-0.5 ${
                          isSelected ? "bg-white/20 text-white border-white/20" : methodColors[route.method]
                        }`}>
                          {route.method}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-slate-900"}`}>
                            {route.name}
                          </div>
                          <div className={`text-[11px] font-mono truncate mt-0.5 ${isSelected ? "text-purple-300" : "text-slate-500"}`}>
                            {route.path}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          COLONNE DROITE : ÉDITEUR, CODE & RÉPONSE (8 cols)
      ───────────────────────────────────────────── */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* CARTE 1 : PARAMÈTRES DE LA REQUÊTE ET ÉDITEUR */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-1 rounded bg-purple-100 text-purple-800 border border-purple-200">
                  {customMethod}
                </span>
                <h3 className="text-xl font-bold text-slate-900">{selectedRoute.name}</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">{selectedRoute.description}</p>
            </div>

            {/* Actions : Partager & Reset */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="Partager le lien de cette requête"
              >
                {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedShare ? "Lien copié !" : "Partager"}</span>
              </button>
              <button
                onClick={() => {
                  setCustomPath(selectedRoute.path);
                  setCustomMethod(selectedRoute.method);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Réinitialiser le chemin"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Endpoint URL Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Cible de l&apos;appel HTTP (Val Town) :</span>
              <span className="text-[11px] font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                {targetValTownUrl}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <select
                value={customMethod}
                onChange={(e) => setCustomMethod(e.target.value as any)}
                className="text-xs font-bold bg-slate-100 border border-slate-300 text-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
              <input
                type="text"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                className="flex-1 font-mono text-xs bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Body JSON (si POST/PUT) */}
          {["POST", "PUT"].includes(customMethod) && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <FileJson className="w-3.5 h-3.5 text-blue-500" />
                Corps de la requête (Request Body JSON) :
              </label>
              <textarea
                rows={5}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className="w-full font-mono text-xs bg-slate-900 text-purple-300 border border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder='{ "key": "value" }'
              />
            </div>
          )}

          {/* Bouton d'Exécution */}
          <div className="pt-2">
            <button
              onClick={handleExecuteRequest}
              disabled={isExecuting}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {isExecuting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Exécution de l&apos;appel...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Exécuter la requête sur Val Town</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* CARTE 2 : GÉNÉRATEUR DE CODE MULTI-LANGAGES */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">Code d&apos;appel dynamique</h3>
            </div>

            <div className="flex items-center gap-2">
              {/* Onglets de langages */}
              <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
                {(["curl", "fetch", "python", "node"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCodeTab(tab)}
                    className={`px-3 py-1.5 rounded-lg transition-colors capitalize ${
                      activeCodeTab === tab ? "bg-purple-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {tab === "fetch" ? "JS (Fetch)" : tab === "node" ? "Node.js" : tab}
                  </button>
                ))}
              </div>

              {/* Copier le code */}
              <button
                onClick={handleCopyCode}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
                title="Copier le code"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <pre className="font-mono text-xs text-purple-200/90 bg-slate-950/60 p-4 rounded-xl overflow-x-auto border border-slate-800/80 leading-relaxed">
            {getGeneratedCode()}
          </pre>
        </div>

        {/* CARTE 3 : RÉSULTAT ET INSPECTEUR DE RÉPONSE */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Résultat de la réponse</h3>
            </div>

            {/* Status & Latence */}
            {responseStatus !== null && (
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className={`px-2.5 py-1 rounded-full font-bold ${
                  responseStatus >= 200 && responseStatus < 300 
                    ? "bg-emerald-100 text-emerald-800" 
                    : "bg-rose-100 text-rose-800"
                }`}>
                  {responseStatus} {responseStatus >= 200 && responseStatus < 300 ? "OK" : "Error"}
                </span>

                {responseLatency !== null && (
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    {responseLatency} ms
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Visualiseur JSON / Texte */}
          {responseData ? (
            <div className="space-y-3">
              <pre className="font-mono text-xs bg-slate-950 text-emerald-400 p-4 rounded-xl overflow-x-auto max-h-96 border border-slate-900 leading-relaxed shadow-inner">
                {responseData}
              </pre>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={handleCopyResponse}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  {copiedResponse ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedResponse ? "Réponse copiée !" : "Copier le JSON"}</span>
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exporter (.json)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2 border-2 border-dashed border-slate-200 rounded-xl">
              <Sparkles className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">Cliquez sur &quot;Exécuter la requête sur Val Town&quot; pour afficher les données de réponse en temps réel.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
