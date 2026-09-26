/**
 * Types partagés par la route de statut et son affichage client.
 * Le fournisseur Instatus peut évoluer : ces types décrivent la réponse
 * normalisée exposée par notre API, et non la forme brute du fournisseur.
 */

export const SUPPORT_STATUS_VALUES = [
  "UP",
  "HASISSUES",
  "MAJOROUTAGE",
  "MINOROUTAGE",
  "UNDERMAINTENANCE",
  "UNKNOWN",
] as const;

export type SupportStatus = (typeof SUPPORT_STATUS_VALUES)[number];

export type SupportStatusSource = "instatus" | "cache" | "fallback";

export interface SupportStatusPage {
  name: string;
  url: string;
  status: SupportStatus;
}

export interface SupportStatusService {
  id: string;
  name: string;
  status: SupportStatus;
  description: string;
}

export interface SupportStatusResponse {
  page: SupportStatusPage;
  /** Services exposés par Instatus. */
  services: SupportStatusService[];
  /**
   * Alias de `services` conservé pour les consommateurs de l'ancienne
   * réponse Instatus, qui utilisaient `components`.
   */
  components: SupportStatusService[];
  updatedAt: string;
  source: SupportStatusSource;
  /** Vrai lorsque la réponse vient du cache après une indisponibilité. */
  stale: boolean;
  error?: string;
}
