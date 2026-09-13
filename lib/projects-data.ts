/**
 * Données des projets mAI.
 *
 * Module volontairement sans dépendance React : il est consommé à la fois
 * par la page /projects (composant client) et par l'index de recherche
 * côté serveur (app/api/search).
 */

export type Project = {
  id: string;
  name: string;
  /** Numéro décoratif affiché sur la carte (projets actifs). */
  number?: string;
  /** Statut affiché sous forme d'étiquette. */
  label?: string;
  /** Clé d'icône lucide, résolue par la page. */
  iconKey?: string;
  /** Image affichée à la place de l'icône (projets archivés). */
  image?: string;
  tagline?: string;
  description: string;
  /** Page de détail du projet — absente pour les archives sans page publiée. */
  link?: string;
  repo?: string;
  /** Page de téléchargement publique du projet, si elle existe. */
  releaseUrl?: string;
  platforms: string[];
};

export const activeProjects: Project[] = [
  {
    id: "vibe",
    name: "Vibe",
    number: "01",
    label: "Bêta",
    iconKey: "messages-square",
    tagline: "Le réseau social où l'IA fait partie de la conversation.",
    description:
      "Publiez, discutez et créez avec mAI intégré nativement : fil personnalisé, messages privés, cercles, collections et assistants IA. Disponible sur le web, Android et iOS.",
    link: "/projects/vibe",
    repo: "mDevsLabs/Vibe",
    releaseUrl: "https://github.com/mDevsLabs/Vibe/releases/latest",
    platforms: ["Web", "Android", "iOS"],
  },
  {
    id: "web",
    name: "Web",
    number: "02",
    label: "Bêta",
    iconKey: "globe",
    tagline: "Application d'IA en ligne web directe et intuitive.",
    description:
      "Application d'IA en ligne web directement et simplement pour discuter avec l'IA mAI.",
    link: "/projects/web",
    repo: "mDevsLabs/Web",
    platforms: ["Web", "Multi-plateforme"],
  },
  {
    id: "pulse",
    name: "Pulse",
    number: "03",
    label: "Bêta",
    iconKey: "cpu",
    tagline: "L'IA intégrée directement dans vos outils du quotidien.",
    description:
      "Ensemble d'extensions pour diverses applications pour discuter avec mAI directement (navigateur, VS Code...).",
    link: "/projects/pulse",
    repo: "mDevsLabs/Pulse",
    platforms: ["Navigateur", "VS Code", "Extensions"],
  },
  {
    id: "cli",
    name: "CLI",
    number: "04",
    label: "Release Candidate",
    iconKey: "terminal",
    tagline: "L'assistant de développement qui vit dans votre terminal.",
    description: "Discussions et séances de codage dans le terminal CLI via mAI.",
    link: "/projects/cli",
    repo: "mDevsLabs/CLI",
    platforms: ["macOS", "Linux", "Windows"],
  },
  {
    id: "coder",
    name: "Coder",
    number: "05",
    label: "Bêta",
    iconKey: "code",
    tagline: "L'IDE IA pensé pour les agents autonomes et les outils MCP.",
    description:
      "IDE IA de nouvelle génération avec agents IA autonomes, orchestration multi-modèles et support natif des outils MCP.",
    link: "/projects/coder",
    repo: "mDevsLabs/Coder",
    platforms: ["macOS", "Windows", "Linux"],
  },
];

export const archivedProjects: Project[] = [
  {
    id: "site",
    name: "Site",
    iconKey: "globe",
    description: "Site officiel et web mAI.",
    repo: "mDevsLabs/Site",
    platforms: ["Web"],
  },
  {
    id: "mai-legacy",
    name: "mAI Web (Legacy)",
    iconKey: "layers",
    description: "Ancienne version web de mAI avec intégration locale et cloud.",
    link: "/projects/mai",
    repo: "mDevsLabs/mAI",
    platforms: ["Web"],
  },
  {
    id: "mai-cli-legacy",
    name: "mAI CLI (Legacy)",
    iconKey: "terminal",
    description: "Première itération de l'assistant terminal et messageries.",
    link: "/projects/mai-cli",
    repo: "mDevsLabs/mAI-CLI",
    platforms: ["CLI"],
  },
  {
    id: "pulse-web",
    name: "Pulse - Web",
    iconKey: "cpu",
    description: "Extension Pulse pour le navigateur web.",
    link: "/projects/pulse",
    repo: "mDevsLabs/Pulse",
    platforms: ["Navigateur"],
  },
  {
    id: "pulse-jetbrains",
    name: "Pulse - JetBrains",
    iconKey: "cpu",
    description: "Extension Pulse pour l'IDE JetBrains.",
    link: "/projects/pulse",
    repo: "mDevsLabs/Pulse",
    platforms: ["JetBrains"],
  },
  {
    id: "pulse-vscode",
    name: "Pulse - VS Code",
    iconKey: "cpu",
    description: "Extension Pulse pour VS Code.",
    link: "/projects/pulse",
    repo: "mDevsLabs/Pulse",
    platforms: ["VS Code"],
  },
  {
    id: "desktop",
    name: "Desktop",
    iconKey: "layers",
    description: "Application desktop intégrée mAI.",
    repo: "mDevsLabs/Desktop",
    platforms: ["Desktop"],
  },
  {
    id: "skills",
    name: "Skills",
    iconKey: "file-text",
    description: "Compétences et agents spécialisés mAI.",
    repo: "mDevsLabs/Skills",
    platforms: ["Agents"],
  },
  {
    id: "plugins",
    name: "Plugins",
    iconKey: "file-text",
    description: "Écosystème de plugins mAI.",
    repo: "mDevsLabs/Plugins",
    platforms: ["Plugins"],
  },
  {
    id: "api",
    name: "API",
    iconKey: "layers",
    description: "Hub API et agrégation de modèles LLM.",
    repo: "mDevsLabs/API",
    platforms: ["API"],
  },
  {
    id: "msearch",
    name: "mSearch",
    iconKey: "search",
    image: "/msearch.PNG",
    description: "Moteur de recherche sémantique et d'indexation vectorielle unifié.",
    link: "/projects/msearch",
    repo: "mDevsLabs/mSearch",
    platforms: ["Windows", "macOS", "Linux"],
  },
  {
    id: "openprovider",
    name: "OpenProvider",
    iconKey: "layers",
    image: "/openprovider.png",
    description: "Proxy universel de routage de modèles LLM et compatibilité Codex.",
    link: "/projects/openprovider",
    repo: "mDevsLabs/OpenProvider",
    platforms: ["CLI", "Proxy"],
  },
  {
    id: "snob",
    name: "Snob",
    iconKey: "gamepad",
    image: "/snob.png",
    description: "Jeu de réflexion et puzzle inspiré de Block Blast.",
    link: "/projects/snob",
    repo: "mDevsLabs/Snob",
    platforms: ["Web", "Android"],
  },
  {
    id: "autre",
    name: "Autre",
    iconKey: "archive",
    description: "Autres projets et expérimentations.",
    platforms: ["Divers"],
  },
];

/** Tous les projets, actifs puis archivés. */
export const allProjects: Project[] = [...activeProjects, ...archivedProjects];

/**
 * Icônes système associées à certaines plateformes, pour afficher un label
 * illustré (Android / iOS) plutôt qu'une simple pastille textuelle.
 */
export const PLATFORM_DEVICE_ICONS: Record<string, { src: string; alt: string }> = {
  Android: { src: "/devices/google.png", alt: "Android" },
  iOS: { src: "/devices/apple.png", alt: "iOS" },
  macOS: { src: "/devices/apple.png", alt: "macOS" },
  Windows: { src: "/devices/microsoft.png", alt: "Windows" },
  Linux: { src: "/devices/linux.png", alt: "Linux" },
};
