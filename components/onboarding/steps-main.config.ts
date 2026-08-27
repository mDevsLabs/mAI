"use client";

import {
  Sparkles,
  KeyRound,
  ShieldAlert,
  Layers,
  Gauge,
  Rocket,
} from "lucide-react";
import type { StepDef } from "./types";

export const MAIN_STEPS: StepDef[] = [
  {
    id: "welcome",
    title: "Bienvenue",
    titleAccent: "sur mAI",
    description:
      "Ton compte est prêt. En 90 secondes, découvre comment exploiter clés API et modèles.",
    icon: Sparkles,
  },
  {
    id: "keys-system",
    title: "Ta clé API",
    titleAccent: "le système",
    description:
      "Une clé = un secret unique mp-... affiché une seule fois, stocké côté serveur en hash SHA-256. Seul le préfixe reste visible. Révoque ou régénère à tout moment.",
    icon: KeyRound,
    // Pas d'exemple de clé, explication système uniquement
  },
  {
    id: "models-hub",
    title: "Hub Modèles",
    titleAccent: "4 univers",
    description:
      "Le catalogue /account/models regroupe Texte, Images, Audio et mAI locaux souverains. Filtre par contexte, outils, laboratoire et copie l'ID en un clic.",
    icon: Layers,
  },
  {
    id: "quotas",
    title: "Tes quotas",
    titleAccent: "en clair",
    description:
      "Tokens hebdo, requêtes mensuelles, images/jour et stockage Cloud — tout est détaillé dans /account. Chaque upgrade multiplie tes limites.",
    icon: Gauge,
  },
  {
    id: "finish",
    title: "Prêt à builder",
    titleAccent: "just build.",
    description:
      "Crée ta première clé API ou explore le catalogue des modèles. Docs, Discord et support sont à portée de main.",
    icon: Rocket,
    ctaLabel: "Créer ma première clé",
    ctaAction: "goKeys",
  },
];

// Icône secondaire pour le shard ShieldAlert sur step keys-system (explication sécurité)
export const KEYS_EXTRA_ICON = ShieldAlert;
