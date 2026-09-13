/**
 * ============================================================================
 * VIBE SOCIAL PLATFORM — RECOMMENDATION ENGINE (vibe-recommender.ts)
 * Moteur de scoring hybride du fil « Pour Vous ».
 * Toutes les fonctions de signaux et la classe HybridRecommender sont
 * regroupées ici à la racine pour assurer la compatibilité avec l'environnement
 * d'exécution et de déploiement (Val Town / Deno / Node).
 * ============================================================================
 */

// ─────────────────────────────────────────────
// SIGNAUX PURS DE SCORING (Fraîcheur, Engagement, Sécurité...)
// ─────────────────────────────────────────────

/** Demi-vie de fraîcheur : une publication perd 50 % de fraîcheur tous les 18 h. */
export const FRESHNESS_HALF_LIFE_HOURS = 18;

/** Poids des impressions (vues) dans l'engagement brut — faible mais réel. */
export const VIEW_WEIGHT = 0.1;

export function ageInHours(publishedAt: Date, now: number = Date.now()): number {
  return Math.max(0.05, (now - publishedAt.getTime()) / (1000 * 60 * 60));
}

/** Décroissance exponentielle à demi-vie : 1.0 à la publication, 0.5 après 18 h. */
export function freshnessDecay(ageHours: number): number {
  return Math.exp((-Math.LN2 * ageHours) / FRESHNESS_HALF_LIFE_HOURS);
}

/** Engagement brut pondéré : Likes ×1, Reposts ×2.5, Réponses ×2, Vues ×0.1. */
export function rawEngagement(
  likes: number,
  reposts: number,
  replies: number,
  views: number
): number {
  return (
    likes * 1.0 +
    reposts * 2.5 +
    replies * 2.0 +
    views * VIEW_WEIGHT
  );
}

/** Compression logarithmique de l'engagement brut vers [0, 1]. */
export function engagementScore(rawEngagements: number): number {
  return Math.min(1.0, Math.log10(rawEngagements + 1) / 2.5);
}

/** Vélocité virale : engagement par heure écoulée, saturé à 1. */
export function velocityScore(rawEngagements: number, ageHours: number): number {
  return Math.min(1.0, rawEngagements / Math.max(0.5, ageHours) / 8.0);
}

/** Facteur de sécurité : pénalise la toxicité (0 → neutre, 1 → score nul). */
export function safetyFactor(toxicityScore: number | undefined): number {
  return Math.max(0, 1 - (toxicityScore || 0) * 2.5);
}

/**
 * Proximité sociale : abonnement + affinité mesurée (historique d'interactions
 * avec l'auteur), borné [0.2, 1].
 */
export function graphProximityScore(
  isFollowedAuthor: boolean | undefined,
  affinity: number | undefined
): number {
  const clampedAffinity = Math.max(0, Math.min(1, affinity || 0));
  return isFollowedAuthor ? 0.7 + 0.3 * clampedAffinity : 0.2 + 0.5 * clampedAffinity;
}

/** Affinement utilisateur : ×0.65 (pas intéressé) .. ×1.35 (intéressé). */
export function interestFactor(interestSignal: number | undefined): number {
  const clamped = Math.max(-1, Math.min(1, interestSignal || 0));
  return 1 + 0.35 * clamped;
}

/** Multiplicateurs de qualité : comptes vérifiés ×1.15, médias ×1.10. */
export function qualityBoost(isVerifiedAuthor?: boolean, hasMedia?: boolean): number {
  let boost = 1.0;
  if (isVerifiedAuthor) boost *= 1.15;
  if (hasMedia) boost *= 1.10;
  return boost;
}

// ─────────────────────────────────────────────
// TYPES ET INTERFACES DU RECOMMANDEUR
// ─────────────────────────────────────────────

export interface FeedTunerWeights {
  freshness: number;
  novelty: number;
  popularity: number;
  serendipity: number;
  proximity: number;
}

export interface PostCandidate {
  postId: string;
  authorId?: number;
  publishedAt: Date;
  likes: number;
  reposts: number;
  replies: number;
  views?: number;
  hasMedia?: boolean;
  isVerifiedAuthor?: boolean;
  semanticSimilarity?: number;
  isFollowedAuthor?: boolean;
  /** Affinité mesurée 0..1 : interactions passées de l'utilisateur avec cet auteur. */
  affinity?: number;
  candidateTopic?: string;
  candidateSentiment?: number;
  toxicityScore?: number;
  /** Signal d'affinement -1..1 issu des retours « Cela m'intéresse / pas » + intérêts. */
  interestSignal?: number;
  matchedInterestTags?: string[];
  tuner?: FeedTunerWeights;
}

export interface RecommendationSignal {
  totalScore: number;
  explanationText: string;
  matchedInterests: string[];
  breakdown: {
    freshnessScore: number;
    engagementScore: number;
    velocityScore: number;
    semanticScore: number;
    graphProximityScore: number;
    safetyFactor: number;
    boostFactor: number;
    interestFactor: number;
  };
}

// ─────────────────────────────────────────────
// MOTEUR DE RECOMMANDATION HYBRIDE
// ─────────────────────────────────────────────

export class HybridRecommender {
  private static readonly DEFAULT_TUNER: FeedTunerWeights = {
    freshness: 0.35,
    novelty: 0.20,
    popularity: 0.25,
    serendipity: 0.10,
    proximity: 0.10,
  };

  public static scorePost(candidate: PostCandidate): RecommendationSignal {
    const tuner = candidate.tuner || this.DEFAULT_TUNER;
    const ageHours = ageInHours(candidate.publishedAt);

    // Récence : demi-vie de 18 h (50 % de fraîcheur restante après 18 h).
    const freshness = freshnessDecay(ageHours);

    // Engagement pondéré (vues incluses) compressé logarithmiquement.
    const engagement = engagementScore(
      rawEngagement(candidate.likes, candidate.reposts, candidate.replies, candidate.views || 0)
    );

    // Vélocité : engagement par heure depuis la publication (effet viral).
    const velocity = velocityScore(
      rawEngagement(candidate.likes, candidate.reposts, candidate.replies, candidate.views || 0),
      ageHours
    );
    const semanticScore = candidate.semanticSimilarity ?? 0.6;
    const proximity = graphProximityScore(candidate.isFollowedAuthor, candidate.affinity);
    const safety = safetyFactor(candidate.toxicityScore);
    const boost = qualityBoost(candidate.isVerifiedAuthor, candidate.hasMedia);
    const interest = interestFactor(candidate.interestSignal);

    const rawScore =
      tuner.freshness * freshness +
      tuner.popularity * engagement +
      tuner.proximity * proximity +
      tuner.novelty * velocity +
      tuner.serendipity * (1 - semanticScore * 0.4);

    const totalScore = Math.max(
      0,
      Math.min(100, Math.round(rawScore * safety * boost * interest * 100))
    );

    let explanationText = "Recommandé selon vos centres d'intérêt et l'engagement.";
    if ((candidate.interestSignal || 0) >= 0.4) {
      explanationText = "🎯 Affiné d'après vos retours « Cela m'intéresse ».";
    } else if ((candidate.interestSignal || 0) <= -0.4) {
      explanationText = "📉 Moins mis en avant : retour « Cela ne m'intéresse pas ».";
    } else if (candidate.isFollowedAuthor) {
      explanationText = "Publication d'un créateur que vous suivez.";
    } else if (velocity > 0.6) {
      explanationText = "🔥 Publication en forte progression.";
    } else if (candidate.isVerifiedAuthor && engagement > 0.5) {
      explanationText = "✨ Publication populaire d'un compte vérifié.";
    } else if (freshness > 0.8) {
      explanationText = "⚡ Publication récente.";
    }

    return {
      totalScore,
      explanationText,
      matchedInterests:
        candidate.matchedInterestTags && candidate.matchedInterestTags.length > 0
          ? candidate.matchedInterestTags
          : candidate.candidateTopic
          ? [candidate.candidateTopic]
          : ["Général"],
      breakdown: {
        freshnessScore: Math.round(freshness * 100),
        engagementScore: Math.round(engagement * 100),
        velocityScore: Math.round(velocity * 100),
        semanticScore: Math.round(semanticScore * 100),
        graphProximityScore: Math.round(proximity * 100),
        safetyFactor: Number(safety.toFixed(2)),
        boostFactor: Number(boost.toFixed(2)),
        interestFactor: Number(interest.toFixed(2)),
      },
    };
  }
}
