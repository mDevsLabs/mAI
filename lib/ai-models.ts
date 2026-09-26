export interface AIModel {
  id: string;
  name: string;
  provider?: string;
  maxContext: number;
  maxOutput: number;
}

/**
 * Catalogue de modèles cloud.
 *
 * Aucun modèle n'est codé en dur : le catalogue exposé par `GET /api/v1/models`
 * est un relais transparent de l'API distante. Ce tableau reste donc vide par
 * conception — il ne sert plus de liste de secours locale.
 */
export const openRouterModels: AIModel[] = [];

export const maiModels: AIModel[] = [];
