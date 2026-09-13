/**
 * Données de la page Téléchargements.
 *
 * Module sans dépendance React, partagé entre la page /downloads (client)
 * et l'index de recherche côté serveur (app/api/search).
 */

export type DownloadPlatform = {
  label: string;
  url: string;
  /** Clé d'icône d'appareil : android | ios | windows | macos | linux | web */
  device?: string;
};

export type AppDownload = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** Clé d'icône lucide, résolue par la page. */
  iconKey: string;
  releaseUrl: string;
  platforms?: DownloadPlatform[];
  terminalCommand?: {
    label: string;
    command: string;
    key: string;
  };
};

export const OFFICIAL_APPS: AppDownload[] = [
  {
    id: "vibe",
    name: "mAI Vibe",
    tagline: "Le réseau social mAI, sur le web, Android et iOS.",
    description:
      "Publiez, échangez en messages privés et créez avec mAI intégré. Installez l'application mobile pour rester connecté à vos cercles et à vos collections.",
    iconKey: "messages-square",
    releaseUrl: "https://github.com/mDevsLabs/Vibe/releases/latest",
    platforms: [
      {
        label: "Android",
        url: "https://github.com/mDevsLabs/Vibe/releases/latest",
        device: "google",
      },
      {
        label: "iOS",
        url: "https://github.com/mDevsLabs/Vibe/releases/latest",
        device: "apple",
      },
    ],
  },
  {
    id: "desktop",
    name: "mAI Desktop",
    tagline: "L'application native pour votre poste de travail et appareils mobiles.",
    description:
      "Accédez à la puissance de mAI avec accélération matérielle locale, multi-fenêtres et synchronisation complète de vos sessions.",
    iconKey: "monitor",
    releaseUrl: "https://github.com/mDevsLabs/Desktop/releases/latest",
    platforms: [
      { label: "Windows", url: "https://github.com/mDevsLabs/Desktop/releases/latest", device: "microsoft" },
      { label: "macOS", url: "https://github.com/mDevsLabs/Desktop/releases/latest", device: "apple" },
      { label: "Linux", url: "https://github.com/mDevsLabs/Desktop/releases/latest", device: "linux" },
      { label: "Android", url: "https://github.com/mDevsLabs/Desktop/releases/latest", device: "google" },
      { label: "iOS", url: "https://github.com/mDevsLabs/Desktop/releases/latest", device: "apple" },
    ],
  },
  {
    id: "web",
    name: "mAI Web",
    tagline: "L'assistant IA Web direct, accessible depuis n'importe quel navigateur.",
    description:
      "Interface web réactive et progressive pour échanger avec vos modèles, générer du code et synchroniser vos projets dans le Cloud.",
    iconKey: "globe",
    releaseUrl: "https://github.com/mDevsLabs/Web/releases/latest",
    platforms: [
      { label: "Windows", url: "https://github.com/mDevsLabs/Web/releases/latest", device: "microsoft" },
      { label: "macOS", url: "https://github.com/mDevsLabs/Web/releases/latest", device: "apple" },
      { label: "Linux", url: "https://github.com/mDevsLabs/Web/releases/latest", device: "linux" },
      { label: "Android", url: "https://github.com/mDevsLabs/Web/releases/latest", device: "google" },
      { label: "iOS", url: "https://github.com/mDevsLabs/Web/releases/latest", device: "apple" },
    ],
  },
  {
    id: "cli",
    name: "mAI CLI",
    tagline: "Discussions et sessions de codage assistées directement dans votre terminal.",
    description:
      "Outil CLI professionnel ultra-rapide pour développeurs : analyse de code, scripts automatisés et pipelines CI/CD.",
    iconKey: "terminal",
    releaseUrl: "https://github.com/mDevsLabs/CLI/releases/latest",
    terminalCommand: {
      label: "mAI CLI (npm)",
      command: "npm install -g @mdevs/mai-cli",
      key: "cli-npm",
    },
  },
  {
    id: "pulse",
    name: "mAI Pulse",
    tagline: "L'IA intégrée directement dans vos outils du quotidien.",
    description:
      "Ensemble d'extensions pour navigateurs et éditeurs (VS Code) pour invoquer mAI instantanément dans votre contexte de travail.",
    iconKey: "cpu",
    releaseUrl: "https://github.com/mDevsLabs/Pulse/releases/latest",
    platforms: [
      { label: "Windows", url: "https://github.com/mDevsLabs/Pulse/releases/latest", device: "microsoft" },
      { label: "macOS", url: "https://github.com/mDevsLabs/Pulse/releases/latest", device: "apple" },
      { label: "Linux", url: "https://github.com/mDevsLabs/Pulse/releases/latest", device: "linux" },
    ],
  },
];

/** Modèle local distribuable (Ollama / Hugging Face). */
export type LocalModel = {
  id: string;
  name: string;
  description: string;
  image: string;
  ollamaCommand: string;
  hfCommand: string;
};

export const LOCAL_MODELS: LocalModel[] = [
  {
    id: "mai-1.5-light",
    name: "mAI-1.5-Light",
    description:
      "Assistant IA local 4B ultra-rapide et multimodal. Vision intégrée, thinking & tools pour une agilité quotidienne maximale.",
    image: "/mai-1.5-light/mAI-1.5-Light.png",
    ollamaCommand: "ollama run mDevsLabs/mAI-1.5-Light",
    hfCommand: "hf download mDevsLabs/mAI-1.5-Light",
  },
  {
    id: "mai-1.5-apex",
    name: "mAI-1.5-Apex",
    description:
      "Le top tier Flagship 9B de la famille mAI. Puissance maximale, vision multimodale, raisonnement approfondi et outils — zéro cloud.",
    image: "/mai-1.5-apex/mAI-1.5-Apex.png",
    ollamaCommand: "ollama run mDevsLabs/mAI-1.5-Apex",
    hfCommand: "hf download mDevsLabs/mAI-1.5-Apex",
  },
  {
    id: "mai-1.5-opal",
    name: "mAI-1.5-Opal",
    description:
      "Le sweet spot 27B ultime entre vélocité et haute intelligence. Multimodal avec vision, thinking et tools 100% local.",
    image: "/mai-1.5-opal/mAI-1.5-Opal.png",
    ollamaCommand: "ollama run mDevsLabs/mAI-1.5-Opal",
    hfCommand: "hf download mDevsLabs/mAI-1.5-Opal",
  },
  {
    id: "mai-1.2-light",
    name: "mAI-1.2-Light",
    description:
      "Assistant IA local ultra-rapide et multimodal. Vision intégrée, légèreté maximale et productivité au quotidien.",
    image: "/mai-1.2-light/mai-1.2-light.png",
    ollamaCommand: "ollama run mDevsLabs/mAI-1.2-Light",
    hfCommand: "hf download mDevsLabs/mAI-1.2-Light",
  },
  {
    id: "mai-1.2-apex",
    name: "mAI-1.2-Apex",
    description:
      "Le top tier de la famille mAI. Performances maximales, vision multimodale et raisonnement avancé — zéro cloud.",
    image: "/mai-1.2-apex/mai-1.2-apex.png",
    ollamaCommand: "ollama run mDevsLabs/mAI-1.2-Apex",
    hfCommand: "hf download mDevsLabs/mAI-1.2-Apex",
  },
  {
    id: "mai-1.2-opal",
    name: "mAI-1.2-Opal",
    description:
      "Le sweet spot parfait entre rapidité et intelligence. Ultra-fluide, multimodal et 100% local via Ollama.",
    image: "/mai-1.2-opal/mai-1.2-opal.png",
    ollamaCommand: "ollama run mDevsLabs/mAI-1.2-Opal",
    hfCommand: "hf download mDevsLabs/mAI-1.2-Opal",
  },
  {
    id: "mai-1",
    name: "mAI-1",
    description:
      "Assistant IA local puissant et multimodal. Raisonnement complexe, génération de code et analyse d'images.",
    image: "/mai-1/mai-1-carre.png",
    ollamaCommand: "ollama run mDevsLabs/mAI-1",
    hfCommand: "hf download mDevsLabs/mAI-1",
  },
  {
    id: "mai-1-light",
    name: "mAI-1-Light",
    description:
      "Assistant IA local ultra-léger et ultra-rapide. Optimisé pour tourner sur n'importe quelle machine.",
    image: "/mai-1-light/mai-1-light-carre.png",
    ollamaCommand: "ollama run mDevsLabs/mAI-1-Light",
    hfCommand: "hf download mDevsLabs/mAI-1-Light",
  },
];
