/**
 * Fichier de suggestions aléatoires pour la page d'accueil de mAI
 * Chaque suggestion est un texte d'action que l'utilisateur peut cliquer
 * pour démarrer une conversation avec le modèle.
 * 
 * @version 0.0.2
 */

// Pool complet de suggestions disponibles
export const allSuggestions: string[] = [
  // Productivité & rédaction
  "Génère un script de réunion hebdo avec points d'action.",
  "Écris un template de compte-rendu de réunion actionnable.",
  "Aide-moi à écrire une FAQ produit claire en français.",
  "Rédige un email professionnel pour relancer un client.",
  "Crée un plan de présentation pour un pitch de startup.",
  "Écris une lettre de motivation pour un stage en IA.",

  // Traduction
  "Traduis ce message en allemand avec un ton professionnel et chaleureux.",
  "Traduis ce texte en anglais avec un style académique.",
  "Traduis cette phrase en espagnol de manière naturelle.",

  // Code & développement
  "Écris un composant React avec TypeScript pour un formulaire de contact.",
  "Explique-moi comment fonctionne l'algorithme de Dijkstra.",
  "Génère une API REST en Node.js avec Express et validation Zod.",
  "Aide-moi à débugger cette erreur TypeScript.",
  "Crée un script Python pour analyser un fichier CSV.",
  "Explique les design patterns les plus utilisés en développement web.",

  // Créativité
  "Invente une histoire courte de science-fiction en 200 mots.",
  "Crée un poème sur le thème de l'intelligence artificielle.",
  "Génère 10 noms créatifs pour une application mobile de bien-être.",
  "Propose des idées de logo pour une marque de café artisanal.",

  // Éducation & apprentissage
  "Explique la théorie de la relativité comme si j'avais 10 ans.",
  "Quels sont les avantages et inconvénients de Next.js ?",
  "Résume les points clés du machine learning en 5 bullets.",
  "Comment fonctionne le protocole HTTPS ?",
  "Explique-moi les bases de données NoSQL vs SQL.",

  // Analyse & données
  "Analyse les tendances du marché de l'IA en 2026.",
  "Compare les frameworks frontend React, Vue et Angular.",
  "Quels sont les meilleurs outils de productivité pour développeurs ?",
  "Résume cet article en 3 points essentiels.",

  // Business
  "Crée un business model canvas pour une app de livraison.",
  "Rédige un cahier des charges pour un site e-commerce.",
  "Propose une stratégie marketing digital pour une PME.",
  "Génère un planning de projet Agile sur 4 sprints.",
];

/**
 * Retourne un nombre donné de suggestions aléatoires sans doublons.
 * Utilise l'algorithme de Fisher-Yates pour un shuffle efficace.
 * 
 * @param count - Nombre de suggestions à retourner (par défaut 4)
 * @returns Un tableau de suggestions aléatoires
 */
export function getRandomSuggestions(count = 4): string[] {
  // Copie du tableau pour ne pas modifier l'original
  const shuffled = [...allSuggestions];
  
  // Algorithme de Fisher-Yates (shuffle partiel)
  for (let i = shuffled.length - 1; i > 0 && i >= shuffled.length - count; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Retourner les `count` derniers éléments (les plus shufflés)
  return shuffled.slice(-count);
}
