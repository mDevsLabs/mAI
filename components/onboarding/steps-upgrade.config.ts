"use client";

import { Sparkles, Gauge, Rocket } from "lucide-react";
import type { StepDef } from "./types";

export const UPGRADE_STEPS: StepDef[] = [
  {
    id: "unlock",
    title: "Forfait débloqué",
    titleAccent: "félicitations",
    description:
      "Ton nouveau forfait est actif. Découvre l'ampleur de tes nouvelles limites.",
    icon: Sparkles,
  },
  {
    id: "quotas-up",
    title: "Nouvelles limites",
    titleAccent: "× plus de puissance",
    description:
      "Tokens, requêtes, images et stockage Cloud viennent de bondir. Et les modèles payants :free → premium sont maintenant accessibles.",
    icon: Gauge,
  },
  {
    id: "next",
    title: "À toi de jouer",
    titleAccent: "explore",
    description:
      "Parcours le hub modèles ou crée une clé dédiée à ton nouveau forfait.",
    icon: Rocket,
    ctaLabel: "Explorer les modèles",
    ctaAction: "goModels",
  },
];
