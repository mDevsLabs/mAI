/**
 * Contenu d'assistance local et typé.
 *
 * Le support reste utile même si la recherche globale ou un service externe
 * est momentanément indisponible. Les liens pointent vers les pages déjà
 * publiées du site ; aucun contenu n'est chargé depuis le navigateur.
 */

export const SUPPORT_CONTENT_CATEGORIES = [
  {
    id: "account",
    label: "Compte & accès",
    description: "Connexion, sessions et compte mAI",
  },
  {
    id: "api",
    label: "API & modèles",
    description: "Clés, requêtes, quotas et inférence",
  },
  {
    id: "apps",
    label: "Applications",
    description: "Vibe, Web, Pulse, CLI et Coder",
  },
  {
    id: "storage",
    label: "Stockage & pièces jointes",
    description: "Fichiers Z1 et limites de transfert",
  },
  {
    id: "incident",
    label: "Incident & dépannage",
    description: "Diagnostic, statut et signalement",
  },
] as const;

export type SupportContentCategoryId = (typeof SUPPORT_CONTENT_CATEGORIES)[number]["id"];

export type SupportContentLink = {
  label: string;
  href: string;
  external?: boolean;
};

export interface SupportFaq {
  id: string;
  question: string;
  answer: string;
  category: SupportContentCategoryId;
  keywords: readonly string[];
  link?: SupportContentLink;
}

export interface SupportGuide {
  id: string;
  title: string;
  description: string;
  category: SupportContentCategoryId;
  href: string;
  readTime: string;
  keywords: readonly string[];
}

export const SUPPORT_FAQS = [
  {
    id: "session-expired",
    question: "Pourquoi ma session expire-t-elle ?",
    answer:
      "Pour protéger votre compte, une session inactive peut être invalidée. Reconnectez-vous puis rouvrez votre ticket : l'historique reste attaché à votre compte.",
    category: "account",
    keywords: ["session", "connexion", "expiration", "login"],
    link: { label: "Ouvrir mon compte", href: "/account", external: false },
  },
  {
    id: "api-key",
    question: "Où créer ou révoquer une clé d'API ?",
    answer:
      "Les clés sont gérées depuis votre espace développeur. Si une clé est compromise, révoquez-la immédiatement puis créez-en une nouvelle avant de reprendre vos appels.",
    category: "api",
    keywords: ["clé", "api", "token", "révoquer", "secret"],
    link: { label: "Gérer mes clés", href: "/account/keys", external: false },
  },
  {
    id: "quota",
    question: "Comment vérifier un quota ou une erreur 429 ?",
    answer:
      "Un 429 indique généralement une limite de débit ou un quota atteint. Attendez la fenêtre indiquée dans la réponse, puis vérifiez votre consommation dans le compte avant de réessayer.",
    category: "api",
    keywords: ["429", "quota", "limite", "débit", "rate limit"],
    link: { label: "Lire le guide des quotas", href: "/docs?doc=6-erreurs-et-limites", external: false },
  },
  {
    id: "local-or-cloud",
    question: "Puis-je utiliser un modèle en local ou dans le cloud ?",
    answer:
      "Oui. Les modèles mAI peuvent être exécutés localement avec Ollama ou appelés depuis l'API cloud. Choisissez le mode adapté à votre matériel et à vos exigences de confidentialité.",
    category: "api",
    keywords: ["local", "cloud", "ollama", "modèle", "inférence"],
    link: { label: "Découvrir les modèles", href: "/models", external: false },
  },
  {
    id: "web-guide",
    question: "Par où commencer avec mAI Web ?",
    answer:
      "Commencez par le guide de l'application pour découvrir les espaces de travail, puis consultez les exemples d'intégration avant de brancher vos propres données.",
    category: "apps",
    keywords: ["web", "application", "démarrage", "guide"],
    link: { label: "Guide de l'application Web", href: "/docs?doc=app-web", external: false },
  },
  {
    id: "attachment-z1",
    question: "Quels fichiers puis-je joindre à un ticket ?",
    answer:
      "Les captures JPG, PNG, WEBP ou GIF et les fichiers texte .txt ou .md sont acceptés. Chaque fichier fait au maximum 8 Mo et cinq fichiers sont autorisés à la création.",
    category: "storage",
    keywords: ["fichier", "pièce jointe", "z1", "image", "log", "limite"],
    link: { label: "Créer un ticket", href: "/support/new", external: false },
  },
  {
    id: "service-status",
    question: "Comment savoir si un service est indisponible ?",
    answer:
      "La page de statut indique l'état global et, lorsqu'ils sont publiés, les composants concernés. Une indisponibilité peut aussi être suivie depuis la page publique Instatus.",
    category: "incident",
    keywords: ["statut", "indisponible", "panne", "instatus", "service"],
    link: { label: "Voir la page de statut", href: "https://mai.instatus.com/", external: true },
  },
  {
    id: "report-bug",
    question: "Comment signaler une anomalie reproductible ?",
    answer:
      "Décrivez les étapes, le résultat attendu et le résultat obtenu. Ajoutez une capture ou un log expurgé, puis choisissez la priorité qui correspond à l'impact réel.",
    category: "incident",
    keywords: ["bug", "anomalie", "erreur", "reproduction", "incident"],
    link: { label: "Signaler un incident", href: "/support/new?type=bug", external: false },
  },
] as const satisfies readonly SupportFaq[];

export const SUPPORT_GUIDES = [
  {
    id: "api-introduction",
    title: "Premiers pas avec l'API",
    description: "Comprendre les endpoints, les formats et le parcours d'une première requête.",
    category: "api",
    href: "/docs?doc=1-introduction",
    readTime: "5 min",
    keywords: ["api", "introduction", "endpoint", "requête"],
  },
  {
    id: "api-auth",
    title: "Authentification de l'API",
    description: "Utiliser une clé de manière sûre et diagnostiquer les erreurs d'accès.",
    category: "api",
    href: "/docs?doc=2-authentification",
    readTime: "7 min",
    keywords: ["api", "authentification", "clé", "token"],
  },
  {
    id: "api-quotas",
    title: "Quotas et limites d'appel",
    description: "Lire les réponses de limite et planifier un appel sans interruption.",
    category: "api",
    href: "/docs?doc=6-erreurs-et-limites",
    readTime: "4 min",
    keywords: ["quota", "limite", "429", "débit"],
  },
  {
    id: "app-vibe",
    title: "Premiers pas avec Vibe",
    description: "Repérer les fonctions principales et organiser un premier espace de travail.",
    category: "apps",
    href: "/projects/vibe",
    readTime: "6 min",
    keywords: ["vibe", "application", "projet", "démarrage"],
  },
  {
    id: "app-web",
    title: "Utiliser mAI Web",
    description: "Un guide rapide des parcours et des intégrations disponibles dans Web.",
    category: "apps",
    href: "/docs?doc=app-web",
    readTime: "6 min",
    keywords: ["web", "application", "intégration"],
  },
  {
    id: "app-pulse",
    title: "Utiliser mAI Pulse",
    description: "Découvrir les vues et les indicateurs de suivi disponibles dans Pulse.",
    category: "apps",
    href: "/docs?doc=app-pulse",
    readTime: "5 min",
    keywords: ["pulse", "application", "tableau de bord"],
  },
  {
    id: "app-cli",
    title: "Installer et utiliser la CLI",
    description: "Installer l'outil en ligne de commande et vérifier une première exécution.",
    category: "apps",
    href: "/docs?doc=app-cli",
    readTime: "8 min",
    keywords: ["cli", "terminal", "installation", "ligne de commande"],
  },
  {
    id: "app-coder",
    title: "Configuration de Coder",
    description: "Relier votre environnement de développement et préparer vos premiers changements.",
    category: "apps",
    href: "/docs?doc=app-coder",
    readTime: "7 min",
    keywords: ["coder", "code", "configuration", "développement"],
  },
  {
    id: "images",
    title: "Générer des images",
    description: "Paramétrer une génération d'image et lire les erreurs de quota ou de format.",
    category: "api",
    href: "/docs?doc=image-generation",
    readTime: "6 min",
    keywords: ["image", "génération", "visuel", "modèle"],
  },
  {
    id: "bug-checklist",
    title: "Checklist avant de signaler un bug",
    description: "Réunir les informations qui accélèrent la reproduction et la résolution.",
    category: "incident",
    href: "/support/new?type=bug",
    readTime: "3 min",
    keywords: ["bug", "checklist", "diagnostic", "ticket"],
  },
] as const satisfies readonly SupportGuide[];

export const SUPPORT_CONTENT_CATEGORY_BY_ID = Object.fromEntries(
  SUPPORT_CONTENT_CATEGORIES.map((category) => [category.id, category]),
) as Record<SupportContentCategoryId, (typeof SUPPORT_CONTENT_CATEGORIES)[number]>;
