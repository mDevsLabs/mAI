"use client";

import { useState } from "react";
import { Terminal, Copy, Check } from "lucide-react";

export function InteractiveCodeBox() {
  const [activeTab, setActiveTab] = useState<"cli" | "ollama" | "api" | "openprovider">("cli");
  const [copied, setCopied] = useState(false);

  const snippets = {
    cli: {
      title: "Installer et lancer mAI CLI",
      language: "bash",
      code: `# npm install -g mai-cli

# Lancer l'assistant dans votre terminal
mai chat --model mAI-1.5-Apex

# Générer une revue de code automatique sur votre PR
mai review pr --git`,
    },
    ollama: {
      title: "Exécuter un modèle local via Ollama",
      language: "bash",
      code: `# Télécharger et exécuter mAI-1.5-Apex (9B Vision & Tools)
ollama run mDevsLabs/mAI-1.5-Apex

# Exécuter la version ultra-rapide mAI-1.5-Light (4B)
ollama run mDevsLabs/mAI-1.5-Light`,
    },
    api: {
      title: "Appeler l'API mAI (Compatible OpenAI)",
      language: "bash",
      code: `curl -X POST https://mprojects.mdevslabs.fr/api/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "mai-1.5-apex",
    "messages": [{"role": "user", "content": "Rédige une fonction TypeScript optimisée"}]
  }'`,
    },
    openprovider: {
      title: "Configurer OpenProvider Proxy",
      language: "bash",
      code: `# Lancer le proxy OpenProvider
openprovider start --port 8080

# Rediriger Codex & Claude Code vers n'importe quel fournisseur
export OPENAI_BASE_URL="http://localhost:8080/v1"`,
    },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="w-full py-12 md:py-16">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Background glow behind code */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 mr-3">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              Quickstart Terminal & API
            </span>
          </div>

          {/* Tabs switcher */}
          <div className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800">
            {[
              { id: "cli", label: "mAI CLI" },
              { id: "ollama", label: "Ollama" },
              { id: "api", label: "API cURL" },
              { id: "openprovider", label: "OpenProvider" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Code Box */}
        <div className="relative bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 md:p-6 font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto shadow-inner">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400">
            <span className="font-semibold text-purple-400">{snippets[activeTab].title}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-sans font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copié !
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" /> Copier
                </>
              )}
            </button>
          </div>

          <pre className="text-emerald-400 leading-relaxed font-mono whitespace-pre-wrap">
            <code>{snippets[activeTab].code}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
