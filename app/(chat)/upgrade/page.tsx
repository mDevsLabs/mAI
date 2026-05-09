/**
 * Page de mise à niveau de mAI
 * Présente les forfaits et permet de les débloquer via un code.
 * 
 * @version 0.0.6
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckIcon } from "lucide-react";

type Plan = {
  name: string;
  price: string;
  description: string;
  limits: {
    tier1: string;
    tier2: string;
    tier3: string;
    quizzly: string;
    studio: string;
    vibs: string;
    bipper: string;
    humanizy: string;
    cooker: string;
    health: string;
    traduction: string;
    coder: string;
  };
  gradient: string;
  featured?: boolean;
};

const plans: Plan[] = [
  {
    name: "Free",
    price: "0€",
    description: "Pour découvrir mAI et ses fonctionnalités de base.",
    gradient: "from-slate-500 to-slate-700",
    limits: {
      tier1: "15 crédits/jour",
      tier2: "30 crédits/jour",
      tier3: "50 crédits/jour",
      quizzly: "70 crédits/jour",
      studio: "15/semaine",
      vibs: "15/3 jours",
      bipper: "100 crédits/jour",
      humanizy: "Illimité",
      cooker: "15/semaine",
      health: "20/mois",
      traduction: "Illimité",
      coder: "20 crédits/jour",
    },
  },
  {
    name: "Plus",
    price: "9.99€",
    description: "Pour les utilisateurs réguliers qui veulent plus de puissance.",
    gradient: "from-blue-500 to-cyan-600",
    limits: {
      tier1: "30 crédits/jour",
      tier2: "60 crédits/jour",
      tier3: "100 crédits/jour",
      quizzly: "150 crédits/jour",
      studio: "30/semaine",
      vibs: "30/3 jours",
      bipper: "200 crédits/jour",
      humanizy: "Illimité",
      cooker: "25/semaine",
      health: "30/mois",
      traduction: "Illimité",
      coder: "100 crédits/jour",
    },
  },
  {
    name: "Pro",
    price: "19.99€",
    description: "Le meilleur rapport qualité/prix pour les créateurs.",
    gradient: "from-purple-500 to-pink-600",
    featured: true,
    limits: {
      tier1: "75 crédits/jour",
      tier2: "150 crédits/jour",
      tier3: "300 crédits/jour",
      quizzly: "300 crédits/jour",
      studio: "50/semaine",
      vibs: "50/3 jours",
      bipper: "300 crédits/jour",
      humanizy: "Illimité",
      cooker: "50/semaine",
      health: "50/mois",
      traduction: "Illimité",
      coder: "300 crédits/jour",
    },
  },
  {
    name: "Max",
    price: "39.99€",
    description: "Pour une liberté totale sans aucune limite.",
    gradient: "from-amber-500 to-orange-600",
    limits: {
      tier1: "100 crédits/jour",
      tier2: "300 crédits/jour",
      tier3: "500 crédits/jour",
      quizzly: "Illimité",
      studio: "100/semaine",
      vibs: "100/3 jours",
      bipper: "Illimité",
      humanizy: "Illimité",
      cooker: "100/semaine",
      health: "100/mois",
      traduction: "Illimité",
      coder: "500 crédits/jour",
    },
  },
];

export default function UpgradePage() {
  const [code, setCode] = useState("");
  const [activePlan, setActivePlan] = useState("Free");

  const handleApplyCode = () => {
    const upperCode = code.toUpperCase();
    if (upperCode === "MAIPLUS") {
      setActivePlan("Plus");
      toast.success("Forfait Plus activé ! 🎉");
    } else if (upperCode === "MAIPRO") {
      setActivePlan("Pro");
      toast.success("Forfait Pro activé ! 🎉");
    } else if (upperCode === "MAIMAX") {
      setActivePlan("Max");
      toast.success("Forfait Max activé ! 🎉");
    } else {
      toast.error("Code invalide ❌");
    }
    setCode("");
  };

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full overflow-auto">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Mettre à niveau votre compte</h1>
        <p className="text-muted-foreground">Choisissez le forfait qui correspond à vos besoins ou entrez un code partenaire.</p>
      </div>

      {/* Code Promotionnel */}
      <div className="max-w-md mx-auto w-full bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-[var(--shadow-float)]">
        <div className="flex gap-2">
          <Input 
            placeholder="Entrez un code (ex: MAIPLUS)" 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="rounded-lg"
          />
          <Button onClick={handleApplyCode} className="rounded-lg">Appliquer</Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Forfait actuel : <span className="font-semibold text-foreground">{activePlan}</span>
        </p>
      </div>

      {/* Grille des Forfaits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className={`relative bg-card/50 backdrop-blur-xl border rounded-2xl p-6 flex flex-col shadow-[var(--shadow-float)] transition-all duration-200 ${
              plan.featured ? "border-purple-500/50 scale-105 z-10" : "border-border/50"
            } ${activePlan === plan.name ? "ring-2 ring-primary" : ""}`}
          >
            {plan.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                Populaire
              </div>
            )}
            
            <div className="space-y-2 mb-6">
              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              <div className="text-3xl font-bold text-foreground">{plan.price}</div>
              <p className="text-xs text-muted-foreground">{plan.description}</p>
            </div>

            <div className="space-y-3 flex-1 text-xs">
              <div className="font-semibold text-foreground border-b border-border/40 pb-1">Limites quotidiennes</div>
              <div className="flex justify-between"><span>Tier 1 Models</span><span className="font-medium">{plan.limits.tier1}</span></div>
              <div className="flex justify-between"><span>Tier 2 Models</span><span className="font-medium">{plan.limits.tier2}</span></div>
              <div className="flex justify-between"><span>Tier 3 Models</span><span className="font-medium">{plan.limits.tier3}</span></div>
              <div className="flex justify-between"><span>Quizzly</span><span className="font-medium">{plan.limits.quizzly}</span></div>
              <div className="flex justify-between"><span>Bipper</span><span className="font-medium">{plan.limits.bipper}</span></div>
              <div className="flex justify-between"><span>Coder</span><span className="font-medium">{plan.limits.coder}</span></div>
              
              <div className="font-semibold text-foreground border-b border-border/40 pb-1 mt-4">Autres limites</div>
              <div className="flex justify-between"><span>Studio</span><span className="font-medium">{plan.limits.studio}</span></div>
              <div className="flex justify-between"><span>Vibs</span><span className="font-medium">{plan.limits.vibs}</span></div>
              <div className="flex justify-between"><span>Humanizy</span><span className="font-medium">{plan.limits.humanizy}</span></div>
              <div className="flex justify-between"><span>Cooker</span><span className="font-medium">{plan.limits.cooker}</span></div>
              <div className="flex justify-between"><span>Health</span><span className="font-medium">{plan.limits.health}</span></div>
              <div className="flex justify-between"><span>Traduction</span><span className="font-medium">{plan.limits.traduction}</span></div>
            </div>

            <Button 
              className={`w-full mt-6 rounded-lg bg-gradient-to-r ${plan.gradient} text-white hover:opacity-90 transition-opacity`}
              onClick={() => setActivePlan(plan.name)}
            >
              {activePlan === plan.name ? "Plan Actif" : "Choisir"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
