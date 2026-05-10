/**
 * Page des paramètres de mAI
 * Permet de gérer les préférences, le compte, les crédits et les notifications.
 * Mis à jour avec les modèles par défaut et le profil.
 * 
 * @version 0.1.3
 */
"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { DiscIcon as Discord, SendIcon as Telegram, ShieldIcon, CreditCardIcon, AccessibilityIcon } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function SettingsPage() {
  const { setTheme, theme } = useTheme();
  
  // Simulation d'états pour les switches
  const [notifSound, setNotifSound] = useState(false);
  const [notifBrowser, setNotifBrowser] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full overflow-auto text-foreground">
      <h1 className="text-3xl font-bold">Paramètres</h1>
      
      {/* Modèles par défaut */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[var(--shadow-float)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="defaultTextModel" className="text-sm text-muted-foreground mb-1 block">Texte</label>
            <select id="defaultTextModel" className="w-full bg-muted border border-border/50 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option>GPT-5.5</option>
              <option>Gemini 2.5 Pro</option>
              <option>FranceStudent</option>
            </select>
          </div>
          <div>
            <label htmlFor="defaultImageModel" className="text-sm text-muted-foreground mb-1 block">Images (Studio)</label>
            <select id="defaultImageModel" className="w-full bg-muted border border-border/50 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option>Stable Diffusion</option>
              <option>Midjourney</option>
              <option>DALL-E 3</option>
            </select>
          </div>
        </div>
      </div>

      {/* Installation PWA */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[var(--shadow-float)]">
        <div className="font-semibold mb-1">Installation PWA</div>
        <div className="text-sm text-muted-foreground mb-4">Installez mAI sur l'écran d'accueil pour un usage natif.</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-lg gap-2">
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Installer mAI en PWA
          </Button>
          <Button variant="ghost" size="sm" className="rounded-lg">Fermer</Button>
        </div>
      </div>

      {/* Profil */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[var(--shadow-float)]">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <div className="size-16 bg-muted rounded-full flex items-center justify-center font-bold text-2xl relative shrink-0">
            <Image alt="Logo" className="size-10" src="/logo.png" width={40} height={40} />
            <button type="button" className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-1 border border-border shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700">
              <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          </div>
          <div className="flex-1 w-full">
            <label htmlFor="profileName" className="text-sm text-muted-foreground mb-1 block">Nom de profil</label>
            <input id="profileName" type="text" placeholder="Ex: Dr. Lemaire" className="w-full bg-muted border border-border/50 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            <div className="text-xs text-muted-foreground mt-1">Ce nom est utilisé dans les en-têtes et interactions personnalisées.</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="aiName" className="text-sm text-muted-foreground mb-1 block">Nom (comment l'IA doit vous appeler)</label>
            <input id="aiName" type="text" placeholder="Ex: Alex" className="w-full bg-muted border border-border/50 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label htmlFor="profession" className="text-sm text-muted-foreground mb-1 block">Profession</label>
            <input id="profession" type="text" placeholder="Ex: Product Designer" className="w-full bg-muted border border-border/50 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
        </div>
      </div>

      {/* Affichage du compteur de saisie */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[var(--shadow-float)]">
        <div className="font-semibold mb-1">Affichage du compteur de saisie</div>
        <div className="text-sm text-muted-foreground mb-4">Affiche/masque les mots et caractères dans la barre de chat.</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-lg">Afficher</Button>
          <Button variant="default" size="sm" className="rounded-lg">Masquer</Button>
        </div>
      </div>
      
      {/* Profil & Compte */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[var(--shadow-float)]">
        <div className="flex items-center gap-4 mb-6">
          <div className="size-12 bg-muted rounded-full flex items-center justify-center font-bold text-lg">
            M
          </div>
          <div>
            <div className="font-semibold">Utilisateur mAI</div>
            <div className="text-sm text-muted-foreground">utilisateur@example.com</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between py-4 border-t border-border/40">
          <div>
            <div className="font-medium">Thème</div>
            <div className="text-sm text-muted-foreground">Changer l'apparence de l'application</div>
          </div>
          <div className="flex gap-2">
            <Button variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")} size="sm" className="rounded-lg">Clair</Button>
            <Button variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")} size="sm" className="rounded-lg">Sombre</Button>
            <Button variant={theme === "system" ? "default" : "outline"} onClick={() => setTheme("system")} size="sm" className="rounded-lg">Système</Button>
          </div>
        </div>
      </div>

      {/* Crédits */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[var(--shadow-float)]">
        <div className="flex items-center gap-2 mb-4">
          <CreditCardIcon className="size-5 text-primary" />
          <h2 className="text-xl font-semibold">Crédits & Utilisation</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Modèles Tier 1</span>
              <span className="font-medium">10 / 15</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${(10/15)*100}%` }} />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Modèles Tier 2</span>
              <span className="font-medium">5 / 30</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${(5/30)*100}%` }} />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Studio (Génération d'images)</span>
              <span className="font-medium">2 / 15</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${(2/15)*100}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Quizzly</span>
              <span className="font-medium">50 / 70</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${(50/70)*100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Accessibilité & Notifications */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[var(--shadow-float)]">
        <div className="flex items-center gap-2 mb-4">
          <AccessibilityIcon className="size-5 text-primary" />
          <h2 className="text-xl font-semibold">Accessibilité & Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-medium">Notifications sonores</div>
              <div className="text-sm text-muted-foreground">Émettre un son lors d'une réponse de l'IA</div>
            </div>
            <button 
              type="button"
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${notifSound ? 'bg-primary' : 'bg-muted'}`}
              onClick={() => setNotifSound(!notifSound)}
            >
              <div className={`bg-white size-4 rounded-full shadow-md transform transition-transform ${notifSound ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between py-2 border-t border-border/40">
            <div>
              <div className="font-medium">Notifications système</div>
              <div className="text-sm text-muted-foreground">Afficher les notifications du navigateur</div>
            </div>
            <button 
              type="button"
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${notifBrowser ? 'bg-primary' : 'bg-muted'}`}
              onClick={() => setNotifBrowser(!notifBrowser)}
            >
              <div className={`bg-white size-4 rounded-full shadow-md transform transition-transform ${notifBrowser ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-border/40">
            <div>
              <div className="font-medium">Notifications par Email</div>
              <div className="text-sm text-muted-foreground">Recevoir les nouveautés par mail</div>
            </div>
            <button 
              type="button"
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${notifEmail ? 'bg-primary' : 'bg-muted'}`}
              onClick={() => setNotifEmail(!notifEmail)}
            >
              <div className={`bg-white size-4 rounded-full shadow-md transform transition-transform ${notifEmail ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Communauté & Liens */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[var(--shadow-float)]">
        <h2 className="text-xl font-semibold mb-4">Communauté</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button 
            variant="outline" 
            className="rounded-lg justify-start gap-2 h-11"
            onClick={() => window.open("https://discord.com/oauth2/authorize?client_id=1494660523688591510&permissions=8&integration_type=0&scope=bot+applications.commands", "_blank")}
          >
            <Discord className="size-5 text-[#5865F2]" />
            Discuter dans Discord
          </Button>
          <Button 
            variant="outline" 
            className="rounded-lg justify-start gap-2 h-11"
            onClick={() => window.open("https://discord.gg/fV7zwdGPpY", "_blank")}
          >
            <Discord className="size-5 text-[#5865F2]" />
            Rejoindre le serveur
          </Button>
          <Button 
            variant="outline" 
            className="rounded-lg justify-start gap-2 h-11"
            disabled
          >
            <Telegram className="size-5 text-[#24A1DE]" />
            Telegram (Bientôt)
          </Button>
        </div>
      </div>

      {/* Zone de danger */}
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[var(--shadow-float)]">
        <div className="flex items-center gap-2 mb-4">
          <ShieldIcon className="size-5 text-destructive" />
          <h2 className="text-xl font-semibold text-destructive">Zone de danger</h2>
        </div>
        
        <div className="flex items-center justify-between py-4">
          <div>
            <div className="font-medium">Supprimer le compte</div>
            <div className="text-sm text-muted-foreground">Cette action supprime définitivement vos données.</div>
          </div>
          <Button variant="destructive" size="sm" className="rounded-lg">Supprimer</Button>
        </div>
      </div>
    </div>
  );
}
