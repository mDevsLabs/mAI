'use client';

import { useState, useEffect } from 'react';
import {
  Copy, Check, Terminal, Code2, Cpu, Key, Sparkles, RefreshCcw, Layers, Settings2, Sliders, Play
} from 'lucide-react';
import { maiModelsList } from '@/maiModels';
import { AIModel, openRouterModels } from '@/lib/ai-models';
import { useAuth } from '@/components/auth-provider';
import toast from 'react-hot-toast';
import Link from 'next/link';

type TabType = 'openai' | 'python' | 'google' | 'anthropic' | 'curl';

export default function ConfigClient() {
  const { user } = useAuth();
  
  // States
  const [selectedModel, setSelectedModel] = useState<string>('mDevsLabs/mAI-1.2-Apex');
  const [hostTarget, setHostTarget] = useState<'cloud' | 'ollama' | 'local'>('cloud');
  const [userKeys, setUserKeys] = useState<any[]>([]);
  const [selectedApiKey, setSelectedApiKey] = useState<string>('mai_live_votre_cle_api_ici');
  const [activeTab, setActiveTab] = useState<TabType>('openai');
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [cloudModelsList, setCloudModelsList] = useState<AIModel[]>(openRouterModels);

  // Charger les modèles depuis l'API v1/models
  useEffect(() => {
    async function loadModels() {
      try {
        let res = await fetch('/api/v1/models', {
          headers: user?.username || user?.email ? { 'x-user-id': encodeURIComponent(user.username || user.email) } : {},
        }).catch(() => null);

        if (!res || !res.ok) {
          res = await fetch('https://mprojects.val.run/v1/models').catch(() => null);
        }

        if (res && res.ok) {
          const data = await res.json();
          if (data.data && Array.isArray(data.data)) {
            const apiModels: AIModel[] = data.data.map((m: any) => ({
              id: m.id,
              name: m.id,
              provider: m.owned_by || 'mAI',
              maxContext: m.maxContext || 128000,
              maxOutput: m.maxOutput || 4096,
            }));
            const cloudOnly = apiModels.filter(
              (m) => !maiModelsList.some((mai) => mai.ollamaTag === m.id || mai.id === m.id)
            );
            if (cloudOnly.length > 0) {
              setCloudModelsList(cloudOnly);
            }
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des modèles v1/models:', err);
      }
    }
    loadModels();
  }, [user]);

  // Charger les clés API de l'utilisateur
  useEffect(() => {
    async function loadKeys() {
      if (!user) return;
      try {
        const res = await fetch('/api/dev-keys', {
          headers: {
            'x-user-id': encodeURIComponent(user.username || user.email || 'dev_user'),
          },
        });
        const data = await res.json();
        if (data.success && data.keys && data.keys.length > 0) {
          setUserKeys(data.keys);
          const firstKey = data.keys[0];
          const firstKeyVal = firstKey.apiKey || firstKey.secretKey || `${firstKey.prefix || 'mai_live'}_...`;
          setSelectedApiKey(firstKeyVal);
        }
      } catch (err) {
        console.error('Erreur chargement des clés:', err);
      }
    }
    loadKeys();
  }, [user]);

  const allowedCloudModels = cloudModelsList;

  // Modèles combinés
  const allModels = [
    ...maiModelsList.map(m => ({ id: m.ollamaTag, name: `${m.name} (mAI Local)`, type: 'mai' })),
    ...allowedCloudModels.map(m => ({ id: m.id, name: `${m.name} (${m.id})`, type: 'cloud' }))
  ];

  const getBaseUrl = () => {
    switch (hostTarget) {
      case 'ollama':
        return 'http://localhost:11434';
      case 'local':
        return 'http://localhost:3000/api';
      case 'cloud':
      default:
        return 'https://mai.val.run';
    }
  };

  const baseUrl = getBaseUrl();

  // Génération dynamique des snippets de code
  const getCodeSnippet = (tab: TabType) => {
    switch (tab) {
      case 'openai':
        return `import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "${baseUrl}/v1",
  apiKey: "${selectedApiKey}",
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: "${selectedModel}",
    messages: [
      { role: "system", content: "Tu es un assistant IA très performant." },
      { role: "user", content: "Bonjour ! Rédige une brève présentation." }
    ],
    temperature: ${temperature},
    max_tokens: ${maxTokens},
  });

  console.log(completion.choices[0].message.content);
}

main();`;

      case 'python':
        return `from openai import OpenAI

client = OpenAI(
    base_url="${baseUrl}/v1",
    api_key="${selectedApiKey}"
)

response = client.chat.completions.create(
    model="${selectedModel}",
    messages=[
        {"role": "system", "content": "Tu es un assistant IA très performant."},
        {"role": "user", "content": "Bonjour ! Rédige une brève présentation."}
    ],
    temperature=${temperature},
    max_tokens=${maxTokens}
)

print(response.choices[0].message.content)`;

      case 'google':
        return `// Configuration via SDK Google / OpenAI Compatibility
import { GoogleGenerativeAI } from "@google/generative-ai";
// Alternative directe via endpoint de compatibilité OpenAI
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "${baseUrl}/v1",
  apiKey: "${selectedApiKey}",
});

async function runGemini() {
  const response = await client.chat.completions.create({
    model: "${selectedModel}",
    messages: [{ role: "user", content: "Explique l'IA en une phrase." }],
    temperature: ${temperature},
  });
  console.log(response.choices[0].message.content);
}

runGemini();`;

      case 'anthropic':
        return `import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  baseURL: "${baseUrl}",
  apiKey: "${selectedApiKey}",
});

async function runAnthropic() {
  const message = await anthropic.messages.create({
    model: "${selectedModel}",
    max_tokens: ${maxTokens},
    messages: [
      { role: "user", content: "Bonjour Anthropic / mAI !" }
    ],
  });

  console.log(message.content[0].text);
}

runAnthropic();`;

      case 'curl':
        return `curl ${baseUrl}/v1/chat/completions \\
  -H "Authorization: Bearer ${selectedApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${selectedModel}",
    "messages": [
      {
        "role": "user",
        "content": "Hello, world!"
      }
    ],
    "temperature": ${temperature},
    "max_tokens": ${maxTokens}
  }'`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCodeSnippet(activeTab));
    setCopied(true);
    toast.success("Snippet copié dans le presse-papier ! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyConnection = async () => {
    setIsVerifying(true);
    try {
      const url = hostTarget === 'ollama' ? 'http://localhost:11434/api/generate' : (hostTarget === 'cloud' ? 'https://mprojects.val.run/v1/chat/completions' : '/api/v1/chat/completions');
      
      const payload = hostTarget === 'ollama' ? {
        model: selectedModel,
        prompt: "Hello",
        stream: false
      } : {
        model: selectedModel,
        messages: [{ role: "user", content: "Hello" }],
        stream: false
      };

      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (hostTarget !== 'ollama') {
        if (!selectedApiKey) {
          toast.error("Veuillez configurer et sélectionner une clé API.");
          setIsVerifying(false);
          return;
        }
        headers['Authorization'] = `Bearer ${selectedApiKey}`;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errStr = "Erreur inconnue";
        try {
          const errData = await res.json();
          errStr = errData.error || errData.message || JSON.stringify(errData);
        } catch {
          errStr = await res.text();
        }
        toast.error(`Échec: ${errStr.substring(0, 100)}`);
      } else {
        toast.success(`Connexion réussie au modèle ${selectedModel} !`);
      }
    } catch (e: any) {
      toast.error(`Erreur: ${e.message}`);
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

        <Link
          href="/playground"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition-all shadow-md shadow-purple-500/20 self-start md:self-auto"
        >
          <Play className="w-4 h-4 fill-white" />
          Tester dans le Playground
        </Link>
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
                className="w-full bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-2xl px-4 py-3 appearance-none font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer shadow-2xs"
              >
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
            </div>

            {/* Sélecteur de Clé API */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-4 h-4 text-purple-600" />
                Clé API Utilisateur
              </label>
              {userKeys.length > 0 ? (
                <select
                  value={selectedApiKey}
                  onChange={(e) => setSelectedApiKey(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-2xl px-4 py-3 appearance-none font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer shadow-2xs"
                >
                  {userKeys.map((k, index) => {
                    const keyVal = k.apiKey || k.secretKey || `${k.prefix || 'mai_live'}_...`;
                    const keyLabel = (keyVal || '').substring(0, 14);
                    return (
                      <option key={k.id || index} value={keyVal}>
                        {k.name || 'Clé API'} ({keyLabel}...)
                      </option>
                    );
                  })}
                </select>
              ) : (
                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-xs text-purple-800 space-y-1">
                  <p className="font-bold">Aucune clé détectée</p>
                  <p>Une clé fictive d&apos;exemple est générée dans le snippet.</p>
                  <Link href="/account/keys" className="text-purple-600 underline font-extrabold block mt-1">
                    + Générer une clé API
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
              <code>{getCodeSnippet(activeTab)}</code>
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
