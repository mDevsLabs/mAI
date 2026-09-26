'use client';

import { useState } from 'react';
import {
  Copy, Check, Terminal, Code2, Cpu, Key, Sparkles, RefreshCcw, Layers, Settings2, Sliders
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { buildConfigSnippet, getConfigBaseUrl, type ConfigTab } from './config-data';
import { useConfigCatalog } from './useConfigCatalog';

type TabType = ConfigTab;

export default function ConfigClient() {
  const {
    allModels,
    cloudModels,
    hostTarget,
    isAuthenticated,
    keysError,
    keysLoading,
    modelsError,
    modelsLoading,
    selectedKeyRef,
    selectedModel,
    setHostTarget,
    setModelsRetry,
    setSelectedKeyRef,
    setSelectedModel,
    token,
    userKeys,
  } = useConfigCatalog();

  const [activeTab, setActiveTab] = useState<TabType>("openai");
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const baseUrl = getConfigBaseUrl(hostTarget);

  const codeSnippet = buildConfigSnippet({
    activeTab,
    baseUrl,
    maxTokens,
    selectedModel,
    temperature,
  });
  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    toast.success("Snippet copié dans le presse-papier !");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyConnection = async () => {
    if (!token) {
      toast.error('Connectez-vous pour utiliser une clé API.');
      return;
    }
    if (!selectedModel) {
      toast.error('Aucun modèle disponible : rechargez le catalogue v1/models.');
      return;
    }
    if (hostTarget !== 'ollama' && !selectedKeyRef) {
      toast.error('Sélectionnez une clé API active ou créez-en une.');
      return;
    }

    setIsVerifying(true);
    try {

      const payload = {
        model: selectedModel,
        messages: [{ role: 'user', content: 'Hello' }],
        temperature,
        max_tokens: maxTokens,
        stream: false,
      };

      const res = await fetch('/api/account/api-executor', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          target: hostTarget === 'ollama' ? 'ollama' : 'mai',
          method: 'POST',
          path: 'v1/chat/completions',
          keyRef: hostTarget === 'ollama' ? undefined : selectedKeyRef,
          body: payload,
        }),
      });

      if (!res.ok) {
        let message = 'Erreur inconnue';
        try {
          const errorData = await res.json();
          const upstreamError = errorData.error;
          message = typeof upstreamError === 'string'
            ? upstreamError
            : upstreamError?.message || errorData.message || JSON.stringify(errorData);
        } catch {
          message = await res.text();
        }
        toast.error(`Échec : ${message.substring(0, 120)}`);
      } else {
        toast.success(`Connexion réussie au modèle ${selectedModel} !`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? `Erreur : ${error.message}` : 'Erreur de vérification.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* En-tête de la page */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="text-left space-y-3">
          <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter leading-[0.9] uppercase text-slate-900">
            Configuration <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
              de l&apos;API
            </span>
          </h1>
          <p className="text-slate-500 text-sm md:text-base font-light max-w-xl">
            Générez dynamiquement du code prêt à l&apos;emploi pour intégrer les modèles <code className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-mono font-bold">v1/models</code> dans vos projets Node.js, Python ou cURL.
          </p>
        </div>
      </div>

      {/* ─── PANNEAU DE CONFIGURATION DYNAMIQUE ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Colonne Contrôles (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] space-y-6">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-600" />
              Paramètres d&apos;Intégration
            </h3>

            {/* Cible du Serveur (Local vs Cloud) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Settings2 className="w-4 h-4 text-purple-600" />
                Cible d&apos;Exécution
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setHostTarget('cloud')}
                  className={`py-2 px-2 rounded-xl text-[11px] font-extrabold transition-all ${
                    hostTarget === 'cloud'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cloud Proxy
                </button>
                <button
                  type="button"
                  onClick={() => setHostTarget('ollama')}
                  className={`py-2 px-2 rounded-xl text-[11px] font-extrabold transition-all ${
                    hostTarget === 'ollama'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Local Ollama
                </button>
                <button
                  type="button"
                  onClick={() => setHostTarget('local')}
                  className={`py-2 px-2 rounded-xl text-[11px] font-extrabold transition-all ${
                    hostTarget === 'local'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Local App
                </button>
              </div>
            </div>

            {/* Sélecteur de Modèle */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-purple-600" />
                Modèle v1 / mAI
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={modelsLoading || (hostTarget === 'cloud' && cloudModels.length === 0)}
                className="w-full bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-2xl px-4 py-3 appearance-none font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer shadow-2xs disabled:opacity-60"
              >
                {!selectedModel && (
                  <option value="">
                    {modelsLoading ? 'Chargement du catalogue…' : 'Aucun modèle disponible'}
                  </option>
                )}
                <optgroup label="Modèles mAI Locaux (Gratuits)">
                  {allModels.filter(m => m.type === 'mai').map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Modèles API v1 / Cloud">
                  {allModels.filter(m => m.type === 'cloud').map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </optgroup>
              </select>
              {modelsLoading && (
                <p className="text-[11px] font-semibold text-slate-500">Chargement du catalogue…</p>
              )}
              {!modelsLoading && hostTarget === 'cloud' && cloudModels.length === 0 && (
                <p className="text-[11px] font-semibold text-amber-700">
                  Le catalogue v1/models ne renvoie aucun modèle Cloud. Le groupe local reste
                  disponible via les cibles « Local Ollama » et « Local App ».
                </p>
              )}
              {modelsError && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-800 space-y-1.5">
                  <p>{modelsError} Aucun modèle Cloud ne peut être sélectionné tant que le catalogue est indisponible.</p>
                  <button
                    type="button"
                    onClick={() => setModelsRetry((value) => value + 1)}
                    className="font-extrabold underline hover:text-amber-950"
                  >
                    Réessayer
                  </button>
                </div>
              )}
            </div>

            {/* Sélecteur de Clé API */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-4 h-4 text-purple-600" />
                Clé API Utilisateur
              </label>
              {keysLoading ? (
                <p className="text-xs font-semibold text-slate-500">Chargement des clés…</p>
              ) : userKeys.length > 0 ? (
                <select
                  value={selectedKeyRef}
                  onChange={(e) => setSelectedKeyRef(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-2xl px-4 py-3 appearance-none font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer shadow-2xs"
                >
                  {userKeys.map((key) => (
                    <option key={key.keyRef} value={key.keyRef}>
                      {key.name} ({key.keyRef})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-xs text-purple-800 space-y-1">
                  <p className="font-bold">
                    {isAuthenticated ? 'Aucune clé active détectée' : 'Mode catalogue public'}
                  </p>
                  <p>Les snippets utilisent le placeholder VOTRE_CLE_API, jamais une clé stockée.</p>
                  {keysError && <p className="text-amber-700">{keysError}</p>}
                  <Link href={isAuthenticated ? '/account/keys' : '/account/login'} className="text-purple-600 underline font-extrabold block mt-1">
                    {isAuthenticated ? '+ Générer une clé API' : 'Se connecter pour sélectionner une clé'}
                  </Link>
                </div>
              )}
            </div>

            {/* Température */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Température</span>
                <span className="text-purple-600 font-extrabold">{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            {/* Max Tokens */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Max Tokens</span>
                <span className="text-purple-600 font-extrabold">{maxTokens}</span>
              </div>
              <input
                type="range"
                min="256"
                max="8192"
                step="256"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Colonne Code (8/12) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Onglets de Langages */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/50 backdrop-blur-md rounded-2xl border border-slate-200/80">
            {[
              { id: 'openai', name: 'OpenAI JS', icon: Code2 },
              { id: 'python', name: 'Python', icon: Terminal },
              { id: 'google', name: 'Google SDK', icon: Sparkles },
              { id: 'anthropic', name: 'Anthropic SDK', icon: Layers },
              { id: 'curl', name: 'cURL', icon: Code2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-purple-600 shadow-md shadow-purple-500/10'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Bloc de Code avec bouton Copier */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-3.5 bg-slate-950/80 border-b border-slate-800 text-xs font-bold text-slate-400">
              <span className="font-mono flex items-center gap-2 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
                {activeTab.toUpperCase()} Integration
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleVerifyConnection}
                  disabled={isVerifying}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCcw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                  <span>Vérifier</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <pre className="p-6 text-xs sm:text-sm font-mono text-purple-200/90 overflow-x-auto leading-relaxed max-h-[500px]">
              <code>{codeSnippet}</code>
            </pre>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs text-purple-900 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Remarque importante :</p>
              <p className="text-purple-800 mt-0.5">
                Notre couche de compatibilité OpenAI gère automatiquement la redirection vers nos modèles locaux <code className="font-bold font-mono">mAI</code> ainsi que tous les modèles du catalogue <code className="font-bold font-mono">v1/models</code>. Aucune modification de votre logique métier n&apos;est nécessaire.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
