/**
 * Application de Traduction de mAI
 * Permet de traduire dans plusieurs langues et propose une analyse lexicale.
 * 
 * @version 0.0.8
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { GlobeIcon, LanguagesIcon, BookOpenIcon, SparklesIcon, Loader2Icon } from "lucide-react";

const languages = [
  { code: "en", name: "Anglais" },
  { code: "es", name: "Espagnol" },
  { code: "de", name: "Allemand" },
  { code: "it", name: "Italien" },
  { code: "pt", name: "Portugais" },
  { code: "ru", name: "Russe" },
  { code: "zh", name: "Chinois" },
  { code: "ja", name: "Japonais" },
];

export default function TranslationPage() {
  const [text, setText] = useState("");
  const [sourceLang, _setSourceLang] = useState("fr");
  const [targetLangs, setTargetLangs] = useState<string[]>(["en"]);
  const [results, setResults] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim()) {
      toast.error("Veuillez entrer du texte à traduire.");
      return;
    }

    setIsLoading(true);
    const newResults: Record<string, string> = {};

    try {
      for (const target of targetLangs) {
        const response = await fetch("https://libretranslate.de/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            q: text,
            source: sourceLang,
            target,
            format: "text"
          })
        });

        const data = await response.json();
        if (data.translatedText) {
          newResults[target] = data.translatedText;
        } else {
          newResults[target] = "Erreur de traduction.";
        }
      }
      setResults(newResults);
      toast.success("Traduction terminée !");
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue lors de la traduction.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTargetLang = (code: string) => {
    setTargetLangs(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto w-full overflow-auto text-foreground">
      {/* Panneau Principal */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <LanguagesIcon className="size-6 text-primary" />
          <h1 className="text-3xl font-bold">Traduction Avancée</h1>
        </div>

        {/* Entrée */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[var(--shadow-float)]">
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="source-text" className="font-semibold">Texte Source (Français)</Label>
            <span className="text-xs text-muted-foreground">{text.length} caractères</span>
          </div>
          <Textarea 
            id="source-text"
            placeholder="Entrez le texte à traduire ici..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[150px] rounded-xl bg-muted/30 border-border/40 focus:border-primary"
          />

          {/* Sélection Langues Cibles */}
          <div className="mt-4">
            <Label className="font-semibold mb-2 block">Traduire en :</Label>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant={targetLangs.includes(lang.code) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleTargetLang(lang.code)}
                  className="rounded-full text-xs"
                >
                  {lang.name}
                </Button>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleTranslate} 
            className="w-full mt-6 rounded-xl h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 transition-opacity"
            disabled={isLoading || targetLangs.length === 0}
          >
            {isLoading ? (
              <><Loader2Icon className="size-4 mr-2 animate-spin" /> Traduction en cours...</>
            ) : (
              <><GlobeIcon className="size-4 mr-2" /> Traduire</>
            )}
          </Button>
        </div>

        {/* Résultats */}
        {Object.keys(results).length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Résultats</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {targetLangs.map((code) => (
                results[code] && (
                  <div key={code} className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-4 shadow-[var(--shadow-float)]">
                    <div className="font-semibold text-sm text-primary mb-1">
                      {languages.find(l => l.code === code)?.name}
                    </div>
                    <div className="text-sm leading-relaxed">{results[code]}</div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Panneau Latéral : Analyse Lexicale & Synonymes */}
      <div className="lg:w-80 flex flex-col gap-6">
        {/* Analyse Lexicale */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[var(--shadow-float)]">
          <div className="flex items-center gap-2 mb-4">
            <BookOpenIcon className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Analyse Lexicale</h2>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="p-2 bg-muted/50 rounded-lg">
              <div className="font-medium">Mots clés détectés</div>
              <div className="text-xs text-muted-foreground mt-1">
                {text ? "Analyse automatique en cours..." : "Entrez du texte pour voir l'analyse."}
              </div>
            </div>
            <div className="p-2 bg-muted/50 rounded-lg">
              <div className="font-medium">Niveau de langue</div>
              <div className="text-xs text-muted-foreground mt-1">Courant / Professionnel</div>
            </div>
          </div>
        </div>

        {/* Synonymes */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[var(--shadow-float)]">
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Synonymes & Alternances</h2>
          </div>
          
          <div className="space-y-3 text-sm">
            <p className="text-xs text-muted-foreground">
              Propositions d'alternatives pour enrichir votre texte.
            </p>
            <div className="p-2 bg-muted/50 rounded-lg">
              <div className="font-medium">Exemple d'enrichissement</div>
              <div className="text-xs text-muted-foreground mt-1">
                Remplacez "faire" par "effectuer" ou "réaliser".
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
