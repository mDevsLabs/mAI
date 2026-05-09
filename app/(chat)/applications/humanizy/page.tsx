/**
 * Page Humanizy — Détection de contenu généré par IA
 * 
 * @version 0.0.5
 */
"use client";

import { useState, useRef } from "react";
import { ShieldCheckIcon, UploadIcon, FileTextIcon, SearchIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

export default function HumanizyPage() {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ score: number; label: string; details: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!text && !selectedFile) {
      toast.error("Veuillez saisir du texte ou importer un fichier.");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      // Appel à l'API Humanizy
      const response = await fetch("/api/humanizy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, filename: selectedFile?.name }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        toast.success("Analyse terminée !");
      } else {
        toast.error("Erreur lors de l'analyse.");
      }
    } catch (error) {
      console.error("Error analyzing:", error);
      toast.error("Impossible de contacter le service.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-dvh flex-col overflow-auto bg-background">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <ShieldCheckIcon className="size-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Humanizy
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Détectez si un contenu a été créé par une intelligence artificielle. Importez des fichiers ou collez du texte.
          </p>
        </div>

        {/* Zone de saisie et d'import */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Texte */}
          <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-[var(--shadow-card)]">
            <label className="text-xs font-semibold text-muted-foreground/60 mb-2 block">TEXTE À ANALYSER</label>
            <textarea
              className="w-full h-48 bg-transparent border-0 focus:ring-0 text-sm resize-none placeholder:text-muted-foreground/30 focus:outline-none"
              placeholder="Collez votre texte ici pour l'analyser..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {/* Fichiers */}
          <div 
            className="rounded-2xl border-2 border-dashed border-border/40 bg-card/50 p-6 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon className="size-10 text-muted-foreground/20 mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">
              Glissez-déposez un fichier
            </p>
            <p className="text-xs text-muted-foreground/60 text-center">
              PDF, TXT, DOCX ou Images (JPG, PNG)<br />jusqu'à 5 Mo
            </p>
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setSelectedFile(file);
              }}
            />
            {selectedFile && (
              <div className="mt-4 flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-lg text-xs">
                <FileTextIcon className="size-3" />
                <span className="truncate max-w-[150px]">{selectedFile.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bouton Action */}
        <div className="flex justify-center mb-8">
          <button
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isAnalyzing 
                ? "bg-muted text-muted-foreground cursor-not-allowed" 
                : "bg-emerald-500 text-white hover:opacity-90 shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
            }`}
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <SearchIcon className="size-4" />
                Lancer l'analyse
              </>
            )}
          </button>
        </div>

        {/* Résultats */}
        {result && (
          <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-[var(--shadow-float)] animate-in fade-in-50">
            <h2 className="text-lg font-semibold text-foreground mb-4">Résultat de l'analyse</h2>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Score Jauge */}
              <div className="relative size-24 shrink-0">
                <svg className="size-full" viewBox="0 0 100 100">
                  <circle
                    className="text-muted/30 stroke-current"
                    strokeWidth="8"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                  />
                  <circle
                    className={`${result.score > 50 ? "text-red-500" : "text-emerald-500"} stroke-current`}
                    strokeWidth="8"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * result.score) / 100}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">{result.score}%</span>
                  <span className="text-[10px] text-muted-foreground">IA Probabilité</span>
                </div>
              </div>

              {/* Détails */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-semibold ${result.score > 50 ? "text-red-500" : "text-emerald-500"}`}>
                    {result.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {result.details}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
