"use client";

import { useState, useEffect } from "react";
import {
  Play,
  Share2,
  FolderKanban,
  FileJson,
  RotateCcw,
  Check,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import type { ApiKeyMetadata } from "@/lib/api-key-types";

import {
  API_ROUTE_DEFINITIONS,
  type ApiRouteMethod,
  type RouteDefinition,
} from "@/lib/api-key-routes";
import { RequestCodePanel } from "./RequestCodePanel";
import { RequestKeySelector } from "./RequestKeySelector";
import { RequestResponsePanel } from "./RequestResponsePanel";
import {
  buildRequestCode,
  computeRequestTargetUrl,
  type RequestCodeTab,
} from "./request-snippets";

const ROUTE_DEFINITIONS = API_ROUTE_DEFINITIONS;
export default function RequestsClient() {
  const { token } = useAuth();

  // Seules les métadonnées publiques sont conservées côté client.
  const [createdKeys, setCreatedKeys] = useState<ApiKeyMetadata[]>([]);
  const [selectedKeyRef, setSelectedKeyRef] = useState<string>("");

  // Route sélectionnée
  const [selectedRoute, setSelectedRoute] = useState<RouteDefinition>(ROUTE_DEFINITIONS[0]);
  
  // Éditeur d'état
  const [customPath, setCustomPath] = useState<string>(ROUTE_DEFINITIONS[0].path);
  const [customMethod, setCustomMethod] = useState<ApiRouteMethod>(ROUTE_DEFINITIONS[0].method);
  const [bodyText, setBodyText] = useState<string>("");

  // Onglet Code
  const [activeCodeTab, setActiveCodeTab] = useState<RequestCodeTab>("curl");

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
      if (!token) return;
      try {
        const res = await fetch('/api/dev-keys', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.keys)) {
            const activeKeys = (data.keys as ApiKeyMetadata[]).filter((key) => key.isActive);
            setCreatedKeys(activeKeys);
            setSelectedKeyRef((current) => {
              if (current && activeKeys.some((key) => key.keyRef === current)) return current;
              return activeKeys[0]?.keyRef || "";
            });
          }
        }
      } catch {
        // ignore
      }
    }
    loadCreatedKeys();
  }, [token]);

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

  const targetValTownUrl = computeRequestTargetUrl(customPath);
  const generatedCode = buildRequestCode({
    activeCodeTab,
    bodyText,
    customMethod,
    targetUrl: targetValTownUrl,
  });
  // Exécution via l'exécuteur serveur : aucune URL ni clé secrète client.
  const handleExecuteRequest = async () => {
    if (!token) {
      setResponseStatus(401);
      setResponseData(JSON.stringify({ error: { message: "Session expirée." } }, null, 2));
      return;
    }
    if (selectedRoute.requiresAuth && !selectedKeyRef) {
      setResponseStatus(400);
      setResponseData(JSON.stringify({
        error: { message: "Sélectionnez une clé API active avant d'exécuter cette route." }
      }, null, 2));
      return;
    }

    setIsExecuting(true);
    setResponseStatus(null);
    setResponseLatency(null);
    setResponseData("");

    const startTime = performance.now();
    try {
      let parsedBody: unknown;
      if (["POST", "PUT"].includes(customMethod) && bodyText.trim()) {
        try {
          parsedBody = JSON.parse(bodyText);
        } catch {
          throw new Error("Le corps JSON de la requête est invalide.");
        }
      }

      const res = await fetch('/api/account/api-executor', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          target: 'mai',
          method: customMethod,
          path: customPath,
          keyRef: selectedKeyRef || undefined,
          body: parsedBody,
        }),
      });

      const endTime = performance.now();
      setResponseStatus(res.status);
      setResponseLatency(Math.round(endTime - startTime));

      const text = await res.text();
      try {
        setResponseData(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        setResponseData(text || "(Réponse vide)");
      }
    } catch (error) {
      const endTime = performance.now();
      setResponseStatus(400);
      setResponseLatency(Math.round(endTime - startTime));
      setResponseData(JSON.stringify({
        error: {
          code: "execution_error",
          message: error instanceof Error ? error.message : "Erreur lors de l'exécution de la requête."
        }
      }, null, 2));
    } finally {
      setIsExecuting(false);
    }
  };

  // Copie de code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
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

        <RequestKeySelector
          keys={createdKeys}
          selectedKeyRef={selectedKeyRef}
          onSelect={setSelectedKeyRef}
        />

        {/* Liste groupée des routes */}
        <div className="space-y-5 max-h-[550px] overflow-y-auto pr-1">
          {["Projets", "LLM & Modèles", "Images & Web Search", "Audio & Speech", "SDK Google & Anthropic", "Clés & Quotas", "Système"].map((cat) => {
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
                onChange={(event) => setCustomMethod(event.target.value as ApiRouteMethod)}
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

        <RequestCodePanel
          activeCodeTab={activeCodeTab}
          code={generatedCode}
          copied={copiedCode}
          onTabChange={setActiveCodeTab}
          onCopy={handleCopyCode}
        />

        <RequestResponsePanel
          copied={copiedResponse}
          latencyMs={responseLatency}
          onCopy={handleCopyResponse}
          onExport={handleExport}
          responseData={responseData}
          status={responseStatus}
        />

      </div>
    </div>
  );
}
