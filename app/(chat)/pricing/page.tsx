"use client";

import { useState } from "react";
import { CheckIcon, SparklesIcon } from "lucide-react";

/**
 * Page de tarification pour mAI
 * @version 0.1.2b
 */
export default function PricingPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const plans = [
    {
      name: "Free",
      price: "0",
      description: "Pour découvrir mAI",
      credits: "100 crédits",
      features: ["Accès aux modèles de base", "Historique limité", "Support communautaire"],
      color: "border-border",
    },
    {
      name: "Plus",
      price: "7",
      description: "Pour les passionnés",
      credits: "500 crédits",
      features: ["Accès aux modèles Plus", "Historique illimité", "Génération d'images (Studio)"],
      color: "border-purple-500/50 dark:border-purple-500/30",
      popular: true,
    },
    {
      name: "Pro",
      price: "15",
      description: "Pour les professionnels",
      credits: "1500 crédits",
      features: ["Accès à tous les modèles", "Priorité de génération", "Support prioritaire"],
      color: "border-blue-500/50 dark:border-blue-500/30",
    },
    {
      name: "Max",
      price: "25",
      description: "Pour une utilisation intensive",
      credits: "5000 crédits",
      features: ["Crédits massifs", "Accès anticipé aux nouveautés", "Modèles personnalisés"],
      color: "border-amber-500/50 dark:border-amber-500/30",
    },
  ];

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/pricing/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: `Forfait ${data.plan} activé avec succès ! (${data.credits} crédits)` });
        setCode("");
      } else {
        setMessage({ type: "error", text: data.error || "Une erreur est survenue" });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur lors de la communication avec le serveur" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 p-8 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Forfaits & Crédits</h1>
        <p className="text-muted-foreground">Choisissez le forfait qui vous convient ou activez-en un avec un code.</p>
      </div>

      {/* Section Code */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-card max-w-md mx-auto w-full">
        <form onSubmit={handleRedeem} className="flex flex-col gap-4">
          <label htmlFor="code" className="text-sm font-medium">
            Activer un forfait par code
          </label>
          <div className="flex gap-2">
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Entrez votre code (ex: MAIPLUS)"
              className="flex-1 px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={loading || !code}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "..." : "Activer"}
            </button>
          </div>
          {message && (
            <p className={`text-sm ${message.type === "success" ? "text-green-500" : "text-destructive"}`}>
              {message.text}
            </p>
          )}
        </form>
      </div>

      {/* Grille des forfaits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-card p-6 rounded-xl border ${plan.color} shadow-card flex flex-col justify-between relative`}
          >
            {plan.popular && (
              <span className="absolute -top-3 right-4 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <SparklesIcon className="size-3" /> Populaire
              </span>
            )}
            <div>
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">{plan.description}</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">EUR / mois</span>
              </div>
              <p className="text-sm font-semibold text-amber-500 mb-4">💎 {plan.credits}</p>
              <ul className="text-sm space-y-2 text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckIcon className="size-4 text-green-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              className={`w-full mt-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                plan.name === "Free"
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
              onClick={() => {
                if (plan.name !== "Free") {
                  document.getElementById("code")?.focus();
                }
              }}
            >
              {plan.name === "Free" ? "Actuel" : "Activer"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
