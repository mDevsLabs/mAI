/**
 * Page des Statistiques de mAI
 * Affiche le niveau, l'XP, les tokens et les badges débloqués.
 * 
 * @version 0.0.7
 */
"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon, TrophyIcon, LockIcon, InfoIcon, XIcon, CheckCircle2Icon } from "lucide-react";

type BadgeData = {
  id: number;
  category: string;
  name: string;
  emoji: string;
  condition: string;
  rarity: "Commun" | "Peu commun" | "Rare" | "Légendaire" | "Rare secret";
  xp: number;
};

const badges: BadgeData[] = [
  { id: 1, category: "💬 Conversation & Chat", name: "Premier Mot", emoji: "🐣", condition: "Envoyer son tout premier message", rarity: "Commun", xp: 100 },
  { id: 2, category: "💬 Conversation & Chat", name: "Bavard", emoji: "💬", condition: "Envoyer 100 messages au total", rarity: "Peu commun", xp: 200 },
  { id: 3, category: "💬 Conversation & Chat", name: "Marathonien", emoji: "🏃", condition: "Envoyer 1 000 messages au total", rarity: "Rare", xp: 300 },
  { id: 4, category: "💬 Conversation & Chat", name: "Légende Vivante", emoji: "👑", condition: "Envoyer 10 000 messages au total", rarity: "Légendaire", xp: 500 },
  // ... (Garder les autres badges mais avec les XP associés selon la rareté)
  { id: 11, category: "🎨 Création — Studio / Images", name: "Artiste en Herbe", emoji: "🎨", condition: "Générer sa première image avec Studio", rarity: "Commun", xp: 100 },
  { id: 14, category: "🎨 Création — Studio / Images", name: "Architecte", emoji: "🏗️", condition: "Créer son premier artifact", rarity: "Commun", xp: 100 },
  { id: 16, category: "📁 Projets & Organisation", name: "Chef de Projet", emoji: "📋", condition: "Créer son premier projet", rarity: "Commun", xp: 100 },
  { id: 20, category: "🔥 Streaks & Fidélité", name: "Flamme Naissante", emoji: "🔥", condition: "Streak 7 jours", rarity: "Commun", xp: 100 },
];

const rarityXP = {
  "Commun": 100,
  "Peu commun": 200,
  "Rare": 300,
  "Légendaire": 500,
  "Rare secret": 500,
};

export default function StatsPage() {
  const [unlockedBadges, setUnlockedBadges] = useState<number[]>([1, 11]); // Débloqués par défaut
  const [xp, setXp] = useState(38);
  const [level, setLevel] = useState(3);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Tous" | "Débloqués" | "Verrouillés">("Tous");
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/stats");
        const data = await response.json();
        if (data) {
          setXp(data.xp);
          setLevel(data.level);
          setUnlockedBadges(data.badges.length > 0 ? data.badges : [1, 11]); // Fallback
          setHistory(data.history);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    }
    fetchStats();
  }, []);

  const xpToNextLevel = 150;

  const filteredBadges = badges.filter(badge => {
    const matchesSearch = badge.name.toLowerCase().includes(search.toLowerCase()) || 
                          badge.category.toLowerCase().includes(search.toLowerCase());
    const isUnlocked = unlockedBadges.includes(badge.id);
    
    if (filter === "Débloqués") return matchesSearch && isUnlocked;
    if (filter === "Verrouillés") return matchesSearch && !isUnlocked;
    return matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full overflow-auto text-foreground">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Statistiques</h1>
        <Button variant="outline" size="sm" onClick={() => setShowHistory(true)} className="rounded-lg">
          Historique XP
        </Button>
      </div>
      
      {/* Niveau & Tokens */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Niveau */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[var(--shadow-float)] col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <TrophyIcon className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Niveau</h2>
          </div>
          <div className="text-3xl font-bold mb-1">Niveau {level}</div>
          <div className="text-sm text-muted-foreground mb-3">{xp} / {xpToNextLevel} XP (prochain palier {xpToNextLevel})</div>
          
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600" 
              style={{ width: `${(xp / xpToNextLevel) * 100}%` }}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <div>+3 Tier 3 (niveau)</div>
            <div>+0 Tier 2 (tous les 5 niveaux)</div>
            <div>+0 Tier 3 bonus (tous les 10)</div>
            <div>+0 recherches web (tous les 20)</div>
            <div>+0 images (tous les 30)</div>
            <div>+0 musiques (tous les 50)</div>
          </div>
        </div>

        {/* Tokens */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[var(--shadow-float)]">
          <div className="flex items-center gap-2 mb-4">
            <LockIcon className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Tokens</h2>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/50 p-2 rounded-lg">
              <div className="text-sm text-muted-foreground">Entrée</div>
              <div className="text-xl font-bold">33</div>
            </div>
            <div className="bg-muted/50 p-2 rounded-lg">
              <div className="text-sm text-muted-foreground">Sortie</div>
              <div className="text-xl font-bold">0</div>
            </div>
            <div className="bg-muted/50 p-2 rounded-lg">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-xl font-bold">33</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            XP: +5/message, +3/vote, +10/image, +20/musique et bonus de connexion quotidien.
          </p>
          <p className="text-xs text-muted-foreground">
            Appels API (modes/apps): 11
          </p>
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[var(--shadow-float)]">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <TrophyIcon className="size-5 text-primary" />
            <h2 className="text-xl font-semibold">Badges ({unlockedBadges.length}/{badges.length})</h2>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1 md:w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher un badge" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-lg h-9"
              />
            </div>
            <div className="flex gap-1 bg-muted p-0.5 rounded-lg h-9">
              {(["Tous", "Débloqués", "Verrouillés"] as const).map((t) => (
                <Button
                  key={t}
                  variant={filter === t ? "default" : "ghost"}
                  size="sm"
                  className="rounded-md text-xs h-8"
                  onClick={() => setFilter(t)}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map((badge) => {
            const isUnlocked = unlockedBadges.includes(badge.id);
            return (
              <div 
                key={badge.id}
                className={`border rounded-xl p-4 transition-all duration-200 flex flex-col gap-3 ${
                  isUnlocked 
                    ? "bg-emerald-500/5 border-emerald-500/20" 
                    : "bg-card/20 border-border/20"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl size-10 flex items-center justify-center bg-muted/50 rounded-full shrink-0">
                      {badge.emoji}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{badge.name}</h4>
                      <p className="text-xs text-muted-foreground">{badge.category}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-xs ${isUnlocked ? "bg-emerald-500/10 text-emerald-500" : "text-muted-foreground"}`}>
                    {isUnlocked ? "Débloqué" : "Verrouillé"}
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground">{badge.condition}</p>
                
                <div className="flex items-center justify-between text-xs mt-auto pt-2 border-t border-border/20">
                  <span className="text-muted-foreground">{badge.rarity} · +{badge.xp} XP</span>
                  <span className="font-medium">{isUnlocked ? "100%" : "0%"}</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${isUnlocked ? "bg-emerald-500" : "bg-primary/50"}`} 
                    style={{ width: isUnlocked ? "100%" : "0%" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Historique XP */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/50 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-border/40">
              <div>
                <h3 className="font-bold text-lg">Historique des XP gagnés</h3>
                <p className="text-xs text-muted-foreground">Exemples: Message +5 XP, Vote +3 XP, Image +10 XP...</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowHistory(false)} className="rounded-full">
                <XIcon className="size-4" />
              </Button>
            </div>
            
            <div className="overflow-auto p-4 space-y-2">
              {history.length > 0 ? (
                history.map((item, index) => (
                  <div key={index} className={`flex justify-between items-center p-2 rounded-lg ${item.reason.includes('Badge') ? 'bg-emerald-500/10' : 'bg-muted/50'}`}>
                    <div>
                      <div className="text-sm font-medium flex items-center gap-1">
                        {item.reason.includes('Badge') && <CheckCircle2Icon className="size-3" />}
                        {item.reason}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className={`${item.reason.includes('Badge') ? 'bg-emerald-500 text-white text-xs px-2 py-1 rounded-full' : 'text-emerald-500'} font-bold`}>
                      +{item.amount} XP
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground text-sm py-4">
                  Aucun historique pour le moment.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
