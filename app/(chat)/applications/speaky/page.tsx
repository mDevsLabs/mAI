/**
 * Application Speaky de mAI
 * Génération d'audios par IA et synthèse vocale.
 * 
 * @version 0.0.11
 */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  PlayIcon, PauseIcon, SquareIcon, UploadIcon, 
  DownloadIcon, 
  MicIcon, SearchIcon, GridIcon, ListIcon, SlidersIcon, ClockIcon, TrashIcon,
  AudioWaveformIcon, 
} from "lucide-react";

export default function SpeakyPage() {
  const [text, setText] = useState("");
  const [lang, setLang] = useState("français");
  const [voice, setVoice] = useState("Lea");
  const [style, setStyle] = useState("Narratif");
  const [variant, setVariant] = useState("Femme");
  const [format, setFormat] = useState("MP3");
  
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [pause, setPause] = useState(0.0);
  
  const [emphasis, setEmphasis] = useState("important, urgent, now");
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [credits, setCredits] = useState(100);

  useEffect(() => {
    fetch("/api/credits")
      .then(res => res.json())
      .then(data => setCredits(data.credits))
      .catch(err => console.error("Failed to fetch credits:", err));
  }, []);

  const handleSpeak = () => {
    if (!text.trim()) {
      toast.error("Veuillez entrer du texte à transformer en audio.");
      return;
    }
    
    if (credits < 15) {
      toast.error("Crédits insuffisants !");
      return;
    }
    
    // Déduire en BDD
    fetch("/api/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 15 }),
    })
    .then(res => res.json())
    .then(data => setCredits(data.credits))
    .catch(err => console.error("Failed to deduct credits:", err));
    
    toast.info("Génération audio en cours... (-15 crédits)");
    
    // Utilisation de Web Speech API pour la synthèse vocale
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "français" ? "fr-FR" : "en-US";
    utterance.rate = speed;
    utterance.pitch = pitch + 1; // Mappe de -1/1 à 0/2
    utterance.volume = volume;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      toast.success("Génération et lecture terminées !");
      setHistory(prev => [
        { id: Date.now(), text: `${text.slice(0, 30)}...`, date: new Date().toLocaleString(), lang, voice },
        ...prev
      ]);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeak = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto w-full overflow-auto text-foreground bg-background">
      {/* Panneau Gauche : Éditeur et Paramètres */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MicIcon className="size-6 text-primary" />
            <h1 className="text-3xl font-bold">Speaky</h1>
          </div>
          <div className="text-sm text-amber-500 font-semibold">💎 {credits} Crédits</div>
        </div>

        {/* Zone de texte */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[var(--shadow-float)]">
          <Textarea 
            placeholder="Collez ou importez un texte long à transformer en audio..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[200px] rounded-xl bg-muted/30 border-border/40 focus:border-primary mb-4"
          />
          
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-4">
            <Button variant="outline" size="sm" className="rounded-lg h-8">
              <UploadIcon className="size-3 mr-1" /> Importer un fichier texte
            </Button>
            <div>Compteur cloud 500 caractères: {text.length}/500 · Texte brut: 0 · Marqueurs: 0 · Segments: 0</div>
          </div>

          {/* Paramètres Rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <label htmlFor="lang-select" className="font-semibold block mb-1">Langue</label>
              <select id="lang-select" value={lang} onChange={(e) => setLang(e.target.value)} className="w-full bg-muted/50 border border-border/40 rounded-lg h-9 px-2">
                <option value="français">Français</option>
                <option value="anglais">Anglais</option>
              </select>
            </div>
            <div>
              <label htmlFor="voice-select" className="font-semibold block mb-1">Voix par défaut</label>
              <select id="voice-select" value={voice} onChange={(e) => setVoice(e.target.value)} className="w-full bg-muted/50 border border-border/40 rounded-lg h-9 px-2">
                <option value="Lea">Lea</option>
                <option value="Marc">Marc</option>
              </select>
            </div>
            <div>
              <label htmlFor="style-select" className="font-semibold block mb-1">Style</label>
              <select id="style-select" value={style} onChange={(e) => setStyle(e.target.value)} className="w-full bg-muted/50 border border-border/40 rounded-lg h-9 px-2">
                <option value="Narratif">Narratif</option>
                <option value="Publicitaire">Publicitaire</option>
              </select>
            </div>
            <div>
              <label htmlFor="variant-select" className="font-semibold block mb-1">Variante</label>
              <select id="variant-select" value={variant} onChange={(e) => setVariant(e.target.value)} className="w-full bg-muted/50 border border-border/40 rounded-lg h-9 px-2">
                <option value="Femme">Femme</option>
                <option value="Homme">Homme</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
            <div>
              <label htmlFor="format-select" className="font-semibold block mb-1">Format final</label>
              <select id="format-select" value={format} onChange={(e) => setFormat(e.target.value)} className="w-full bg-muted/50 border border-border/40 rounded-lg h-9 px-2">
                <option value="MP3">MP3</option>
                <option value="WAV">WAV</option>
              </select>
            </div>
            <div>
              <label htmlFor="speed-range" className="font-semibold block mb-1">Vitesse ({speed}x)</label>
              <input id="speed-range" type="range" min="0.5" max="2" step="0.1" value={speed} onChange={(e) => setSpeed(Number.parseFloat(e.target.value))} className="w-full mt-2" />
            </div>
            <div>
              <label htmlFor="pitch-range" className="font-semibold block mb-1">Ton ({pitch})</label>
              <input id="pitch-range" type="range" min="-1" max="1" step="0.1" value={pitch} onChange={(e) => setPitch(Number.parseFloat(e.target.value))} className="w-full mt-2" />
            </div>
          </div>
        </div>

        {/* Créateur de profil vocal avancé */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[var(--shadow-float)]">
          <div className="flex items-center gap-2 mb-4">
            <SlidersIcon className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Créateur de profil vocal avancé</h2>
          </div>
          
          <div className="space-y-4 text-sm">
            <div>
              <label htmlFor="emphasis-input" className="font-semibold block mb-1">Mots à emphase (séparés par virgule)</label>
              <Input id="emphasis-input" value={emphasis} onChange={(e) => setEmphasis(e.target.value)} className="bg-muted/30" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pause-range" className="font-semibold block mb-1">Pause inter-phrases ({pause}s)</label>
                <input id="pause-range" type="range" min="0" max="5" step="0.5" value={pause} onChange={(e) => setPause(Number.parseFloat(e.target.value))} className="w-full mt-2" />
              </div>
              <div>
                <label htmlFor="volume-range" className="font-semibold block mb-1">Volume relatif ({volume}x)</label>
                <input id="volume-range" type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => setVolume(Number.parseFloat(e.target.value))} className="w-full mt-2" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            <Button onClick={handleSpeak} className="bg-gradient-to-r from-blue-500 to-indigo-600 h-10 rounded-xl" disabled={isPlaying}>
              <PlayIcon className="size-4 mr-2" /> {isPlaying ? "Lecture..." : "Générer & Lire"}
            </Button>
            <Button variant="outline" onClick={stopSpeak} className="h-10 rounded-xl" disabled={!isPlaying}>
              <SquareIcon className="size-4 mr-2" /> Stop
            </Button>
            <Button variant="outline" className="h-10 rounded-xl">
              <PauseIcon className="size-4 mr-2" /> Pause
            </Button>
            <Button variant="outline" className="h-10 rounded-xl">
              Prévisualisation temps réel
            </Button>
            <Button variant="outline" className="h-10 rounded-xl">
              Pré-écoute 5s
            </Button>
          </div>
        </div>
      </div>

      {/* Panneau Droit : Historique et Visualizer */}
      <div className="lg:w-96 flex flex-col gap-6">
        {/* Visualizer */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[var(--shadow-float)] flex flex-col items-center justify-center min-h-[150px]">
          <div className="flex items-center gap-2 mb-4 w-full">
            <AudioWaveformIcon className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Visualiseur</h2>
          </div>
          {isPlaying ? (
            <div className="flex gap-1 items-end h-16">
              <div className="w-2 bg-primary rounded-t-full animate-pulse" style={{ height: "20%" }} />
              <div className="w-2 bg-primary rounded-t-full animate-pulse" style={{ height: "50%" }} />
              <div className="w-2 bg-primary rounded-t-full animate-pulse" style={{ height: "80%" }} />
              <div className="w-2 bg-primary rounded-t-full animate-pulse" style={{ height: "40%" }} />
              <div className="w-2 bg-primary rounded-t-full animate-pulse" style={{ height: "90%" }} />
              <div className="w-2 bg-primary rounded-t-full animate-pulse" style={{ height: "30%" }} />
              <div className="w-2 bg-primary rounded-t-full animate-pulse" style={{ height: "70%" }} />
              <div className="w-2 bg-primary rounded-t-full animate-pulse" style={{ height: "50%" }} />
              <div className="w-2 bg-primary rounded-t-full animate-pulse" style={{ height: "20%" }} />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Prêt à générer...</div>
          )}
        </div>

        {/* Gestionnaire audio (Historique) */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[var(--shadow-float)] flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <ClockIcon className="size-5 text-primary" />
              <h2 className="text-lg font-semibold">Gestionnaire audio</h2>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="size-7"><ListIcon className="size-4" /></Button>
              <Button variant="ghost" size="icon" className="size-7"><GridIcon className="size-4" /></Button>
            </div>
          </div>

          <div className="relative mb-4">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Recherche texte/titre..." className="pl-10 h-9 bg-muted/30" />
          </div>

          <div className="space-y-3 overflow-auto flex-1 max-h-[300px]">
            {history.length > 0 ? (
              history.map((item) => (
                <div key={item.id} className="p-2 bg-muted/50 rounded-lg text-xs flex justify-between items-center">
                  <div>
                    <div className="font-medium truncate max-w-[150px]">{item.text}</div>
                    <div className="text-muted-foreground">{item.date}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="size-6 text-gray-400 hover:text-white"><PlayIcon className="size-3" /></Button>
                    <Button variant="ghost" size="icon" className="size-6 text-gray-400 hover:text-white"><DownloadIcon className="size-3" /></Button>
                    <Button variant="ghost" size="icon" className="size-6 text-red-400 hover:text-red-500"><TrashIcon className="size-3" /></Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground text-xs py-4">
                Aucun audio généré.
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4 text-xs">
            <Button variant="outline" size="sm" className="flex-1 h-8">Export JSON</Button>
            <Button variant="outline" size="sm" className="flex-1 h-8">Import JSON</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
