/**
 * Contrats API publics pour les clés mAI.
 *
 * Règle de sécurité : aucun type de liste n contient le secret d'une clé
 * existante. `keyRef` est le préfixe public exact (par exemple
 * `mai-pro-7TK9W`) et sert uniquement à sélectionner une clé côté serveur.
 * `secretKey` n'apparaît que dans la réponse immédiate de création.
 */
export interface ApiKeyMetadata {
  /** Identifiant historique ; vaut actuellement le keyRef. */
  id: string;
  /** Préfixe public exact et non secret ; une collision est rejetée lors de la résolution. */
  keyRef: string;
  name: string;
  /** Alias d'affichage rétrocompatible, toujours égal au préfixe public. */
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  usageCount: number;
  maxLimit: number | null;
  isActive: boolean;
  /** Forfait de la clé après validation de son propriétaire en base. */
  plan: string;
  /** Identifiant serveur du propriétaire, disponible uniquement après résolution. */
  ownerId?: string;
}

export interface CreatedApiKeyResult {
  id: string;
  keyRef: string;
  name: string;
  /** Alias d'affichage rétrocompatible, sans segment secret. */
  prefix: string;
  /** Secret complet : retourne uniquement dans la réponse de création. */
  secretKey: string;
  createdAt: string;
}
