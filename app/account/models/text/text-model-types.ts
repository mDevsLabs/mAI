export interface TextModelItem {
  id: string;
  name: string;
  description: string;
  maxContext: number;
  maxOutput: number;
  supported_parameters?: string[];
  owned_by?: string;
  created?: number;
  object?: string;
}

export function getTextModelId(model: TextModelItem): string {
  return model.id;
}
