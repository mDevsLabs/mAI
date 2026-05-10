/**
 * Application Coder de mAI
 * Un environnement de développement intégré avec IA, terminal et gestion de fichiers.
 * Thème clair appliqué.
 * 
 * @version 0.0.13
 */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  FolderIcon, FileIcon, FolderPlusIcon, FilePlusIcon, 
  PlayIcon, SparklesIcon, DownloadIcon, TrashIcon, 
  TerminalIcon, DatabaseIcon, BarChartIcon,
  CodeIcon, SaveIcon, UploadIcon, ArchiveIcon, ListIcon, ClockIcon, GitBranchIcon,
  XIcon, ChevronDownIcon,
} from "lucide-react";

export default function CoderPage() {
  const [activeTab, setActiveTab] = useState("main.py");
  const [code, setCode] = useState(`import statistics\nvalues = [2, 4, 6, 8]\nprint("Mean:", statistics.mean(values))`);
  const [terminalOutput, setTerminalOutput] = useState<string[]>(["Aucune commande exécutée."]);
  const [terminalInput, setTerminalInput] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [outputTab, setOutputTab] = useState<"Output" | "Data Explorer">("Output");
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [reasoning, setReasoning] = useState(false);
  const [credits, setCredits] = useState(100);

  useEffect(() => {
    fetch("/api/credits")
      .then(res => res.json())
      .then(data => setCredits(data.credits))
      .catch(err => console.error("Failed to fetch credits:", err));
  }, []);
  
  // États pour les fonctionnalités "plus de 20"
  const [minimap, setMinimap] = useState(true);
  const [_files, _setFiles] = useState([
    { name: "main.py", type: "file", content: code },
    { name: "utils.py", type: "file", content: "# Fonctions utilitaires" },
    { name: "data", type: "folder", children: [
      { name: "users.csv", type: "file", content: "id,name\n1,Alice\n2,Bob" }
    ]}
  ]);
  const [_snippets, _setSnippets] = useState([
    { name: "Fibonacci", code: "def fib(n):\n  return n if n < 2 else fib(n-1) + fib(n-2)" }
  ]);
  const [_history, _setHistory] = useState([
    { time: "10:30", command: "python main.py", status: "success" }
  ]);

  const runCode = () => {
    if (credits < 5) {
      toast.error("Crédits insuffisants !");
      return;
    }
    
    // Déduire en BDD
    fetch("/api/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 5 }),
    })
    .then(res => res.json())
    .then(data => setCredits(data.credits))
    .catch(err => console.error("Failed to fetch credits:", err));
    
    toast.success("Code exécuté ! (-5 crédits)");
    setTerminalOutput(prev => [
      ...prev,
      `$ python ${activeTab}`,
      "Mean: 5.0"
    ]);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) { return; }
    
    setTerminalOutput(prev => [
      ...prev,
      `$ ${terminalInput}`,
      terminalInput === "clear" ? "Terminal réinitialisé." : `Commande '${terminalInput}' exécutée.`
    ]);
    if (terminalInput === "clear") { setTerminalOutput(["Terminal réinitialisé."]); }
    setTerminalInput("");
  };

  const askAI = async () => {
    if (!aiPrompt.trim()) { return; }
    if (credits < 10) {
      toast.error("Crédits insuffisants !");
      return;
    }
    
    // Déduire en BDD
    fetch("/api/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 10 }),
    })
    .then(res => res.json())
    .then(data => setCredits(data.credits))
    .catch(err => console.error("Failed to deduct credits:", err));
    
    toast.info("L'IA réfléchit... (-10 crédits)");
    setAiResponse("");
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          message: aiPrompt,
          messages: [{ id: crypto.randomUUID(), role: "user", parts: [{ type: "text", text: aiPrompt }], createdAt: new Date() }],
          selectedChatModel: selectedModel,
          selectedVisibilityType: "private",
          ghost: true,
        }),
      });
      
      if (!response.ok) { throw new Error("Failed to fetch"); }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) { return; }
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) { break; }
        const chunk = decoder.decode(value);
        
        // Nettoyage sommaire du protocole stream de AI SDK (ex: 0:"texte")
        const cleanChunk = chunk.replace(/^\d+:"/g, "").replace(/"$/g, "").replace(/\\n/g, "\n");
        
        setAiResponse(prev => prev + cleanChunk);
      }
      
      toast.success("Réponse générée !");
    } catch (error) {
      console.error("Failed to ask AI:", error);
      toast.error("Erreur lors de la génération.");
    }
  };

  return (
    <div className="flex flex-col h-dvh bg-gray-50 text-gray-800 font-sans">
      {/* Barre d'outils supérieure */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-100 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-white border-gray-300 text-xs h-8 text-gray-700 hover:bg-gray-50">
            <SparklesIcon className="size-3 mr-1 text-purple-600" /> Générer du code <span className="text-gray-400 ml-1">Ctrl+K</span>
          </Button>
          <div className="text-xs text-gray-500">Projet: <span className="text-gray-800 font-medium">mAI-Project</span></div>
          <div className="text-xs text-amber-600 font-semibold ml-2">💎 {credits} Crédits</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="size-8 text-gray-500 hover:text-gray-700" onClick={() => setMinimap(!minimap)}>
            <ListIcon className="size-4" />
          </Button>
          <div className="text-xs text-gray-500">Mini-map {minimap ? "ON" : "OFF"}</div>
        </div>
      </div>

      {/* Zone principale divisée */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panneau Gauche : Éditeur et Fichiers */}
        <div className="w-7/12 flex flex-col border-r border-gray-200">
          {/* Onglets */}
          <div className="flex bg-gray-100 border-b border-gray-200 overflow-x-auto">
            {["main.py", "utils.py", "+ Nouveau"].map((tab) => (
              <button 
                type="button"
                key={tab}
                className={`px-4 py-2 text-xs cursor-pointer border-r border-gray-200 flex items-center gap-2 ${
                  activeTab === tab ? "bg-white text-gray-900 font-medium" : "text-gray-500 hover:bg-gray-200"
                }`}
                onClick={() => tab !== "+ Nouveau" && setActiveTab(tab)}
              >
                {tab !== "+ Nouveau" && <FileIcon className="size-3 text-blue-500" />}
                {tab}
                {tab !== "+ Nouveau" && <XIcon className="size-3 text-gray-400 hover:text-red-500" />}
              </button>
            ))}
          </div>

          {/* Zone d'édition */}
          <div className="flex-1 flex overflow-hidden">
            {/* Numéros de ligne */}
            <div className="bg-gray-50 text-gray-400 text-right px-3 py-4 text-xs font-mono select-none border-r border-gray-100">
              {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                <div key={n} className="h-5">{n}</div>
              ))}
            </div>
            
            {/* Éditeur */}
            <textarea
              className="flex-1 bg-white text-gray-900 font-mono text-sm p-4 outline-none resize-none leading-5"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
            />
            
            {/* Minimap */}
            {minimap && (
              <div className="w-16 bg-gray-50 opacity-50 text-[4px] font-mono p-1 overflow-hidden select-none border-l border-gray-200 text-gray-400">
                {code.repeat(5)}
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="bg-gray-100 border-t border-gray-200 px-4 py-1 flex justify-between text-xs text-gray-500">
            <div>Runtime: Python 3.10</div>
            <div className="flex gap-4">
              <span>Ligne 1, Col 1</span>
              <span>Total lignes: {code.split("\n").length}</span>
              <span>UTF-8</span>
              <span>{code.length} octets</span>
            </div>
          </div>

          {/* Arborescence & Actions (Bas) */}
          <div className="bg-gray-100 p-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs font-semibold uppercase text-gray-500 flex items-center gap-1">
                <FolderIcon className="size-3" /> Arborescence fichiers
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="size-6 text-gray-500 hover:text-gray-700" title="Nouveau dossier"><FolderPlusIcon className="size-3" /></Button>
                <Button variant="ghost" size="icon" className="size-6 text-gray-500 hover:text-gray-700" title="Nouveau fichier"><FilePlusIcon className="size-3" /></Button>
                <Button variant="ghost" size="icon" className="size-6 text-gray-500 hover:text-gray-700" title="Exporter ZIP"><ArchiveIcon className="size-3" /></Button>
              </div>
            </div>
            
            <div className="text-xs text-gray-600 mb-4 bg-white p-2 rounded border border-gray-200">
              <div className="flex items-center gap-1 mb-1">
                <ChevronDownIcon className="size-3" /> <FolderIcon className="size-3 text-yellow-500" /> src
              </div>
              <div className="ml-4 flex items-center gap-1 mb-1">
                <FileIcon className="size-3 text-blue-500" /> main.py
              </div>
              <div className="ml-4 flex items-center gap-1">
                <FileIcon className="size-3 text-blue-500" /> utils.py
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="bg-white border border-gray-300 text-xs h-8 hover:bg-gray-50 text-gray-700" onClick={() => toast.info("Snippet créé")}>
                <SaveIcon className="size-3 mr-1" /> Sauver snippet
              </Button>
              <Button size="sm" className="bg-white border border-gray-300 text-xs h-8 hover:bg-gray-50 text-gray-700" onClick={() => toast.info("Fichier importé")}>
                <UploadIcon className="size-3 mr-1" /> Importer
              </Button>
              <Button size="sm" className="bg-red-50 text-red-600 border border-red-200 text-xs h-8 hover:bg-red-100" onClick={() => toast.info("Sortie réinitialisée")}>
                <TrashIcon className="size-3 mr-1" /> Réinitialiser
              </Button>
            </div>
          </div>
        </div>

        {/* Panneau Droit : Sortie, Terminal, IA */}
        <div className="w-5/12 flex flex-col">
          {/* Header Panneau Droit */}
          <div className="flex justify-between items-center bg-gray-100 border-b border-gray-200 px-4">
            <div className="flex">
              {(["Output", "Data Explorer"] as const).map((tab) => (
                <button 
                  type="button"
                  key={tab}
                  className={`px-4 py-2 text-xs cursor-pointer ${
                    outputTab === tab ? "border-b-2 border-purple-600 text-gray-900 font-medium" : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setOutputTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs h-7 rounded hover:opacity-90" onClick={runCode}>
                <PlayIcon className="size-3 mr-1" /> Run
              </Button>
            </div>
          </div>

          {/* Contenu Panneau Droit */}
          <div className="flex-1 overflow-auto p-4 flex flex-col gap-4 bg-white">
            {outputTab === "Output" ? (
              <>
                {/* Analyse et Outils rapides */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Button variant="outline" className="bg-white border-gray-200 justify-start text-gray-600 h-8 hover:text-gray-900 hover:bg-gray-50"><DatabaseIcon className="size-3 mr-2" /> Analyse DataFrame</Button>
                  <Button variant="outline" className="bg-white border-gray-200 justify-start text-gray-600 h-8 hover:text-gray-900 hover:bg-gray-50"><UploadIcon className="size-3 mr-2" /> Import CSV / Excel</Button>
                  <Button variant="outline" className="bg-white border-gray-200 justify-start text-gray-600 h-8 hover:text-gray-900 hover:bg-gray-50"><BarChartIcon className="size-3 mr-2" /> Génération graphiques</Button>
                  <Button variant="outline" className="bg-white border-gray-200 justify-start text-gray-600 h-8 hover:text-gray-900 hover:bg-gray-50"><CodeIcon className="size-3 mr-2" /> Snippets</Button>
                </div>

                {/* Assistant IA Intégré */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs font-semibold text-purple-600 flex items-center gap-1">
                      <SparklesIcon className="size-3" /> Assistant IA Code + Historique
                    </div>
                    <div className="flex gap-2 text-xs">
                      <select 
                        value={selectedModel} 
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="bg-white border border-gray-200 rounded px-1 py-0.5 text-gray-600 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                        <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                        <option value="france-student">FranceStudent</option>
                      </select>
                      <label className="flex items-center gap-1 text-gray-500">
                        <input type="checkbox" checked={reasoning} onChange={(e) => setReasoning(e.target.checked)} className="accent-purple-600" />
                        Réflexion
                      </label>
                    </div>
                  </div>
                  <Textarea 
                    placeholder="Ex: Crée un script Python qui lit un CSV et exporte le top 5 en JSON."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="bg-white border-gray-200 text-xs min-h-[60px] text-gray-800 resize-none mb-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <div className="flex justify-between items-center">
                    <Button size="sm" className="bg-white border border-gray-300 text-xs h-7 hover:bg-gray-50 text-gray-700" onClick={askAI}>
                      Demander à l'IA
                    </Button>
                    <Button size="sm" variant="ghost" className="text-gray-500 text-xs h-7 hover:text-gray-700" onClick={() => toast.info("Code téléchargé")}>
                      <DownloadIcon className="size-3 mr-1" /> Télécharger le code
                    </Button>
                  </div>
                  {aiResponse && (
                    <div className="mt-3 bg-gray-50 p-2 rounded text-xs font-mono text-green-700 border border-gray-200 max-h-[100px] overflow-auto">
                      {aiResponse}
                    </div>
                  )}
                </div>

                {/* Historique et Versions (Simulé Git) */}
                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm text-xs">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-semibold text-gray-500 flex items-center gap-1"><ClockIcon className="size-3" /> Historique runs</div>
                    <div className="font-semibold text-gray-500 flex items-center gap-1"><GitBranchIcon className="size-3" /> Versions (mini-git)</div>
                  </div>
                  <div className="text-gray-600">Initial commit - 10:25</div>
                  <div className="text-green-600 font-medium">Run main.py - Success - 10:30</div>
                </div>

                {/* Terminal */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex-1 flex flex-col min-h-[150px]">
                  <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                    <TerminalIcon className="size-3" /> Terminal
                  </div>
                  <div className="flex-1 font-mono text-xs text-green-700 overflow-auto mb-2 space-y-1">
                    {terminalOutput.map((line, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: terminal lines can be duplicate
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                  <form onSubmit={handleTerminalSubmit} className="flex gap-2 border-t border-gray-100 pt-2">
                    <span className="text-green-600 text-xs font-mono">$</span>
                    <input 
                      type="text"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-gray-800 placeholder-gray-400"
                      placeholder="Entrez une commande (ex: clear)..."
                    />
                    <Button type="submit" size="sm" className="bg-white border border-gray-300 text-xs h-6 px-2 hover:bg-gray-50 text-gray-700">Run</Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500 text-center py-8">
                L'explorateur de données sera disponible après l'importation d'un dataset (CSV, JSON...).
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
