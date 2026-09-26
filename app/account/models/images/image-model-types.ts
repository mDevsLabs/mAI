export interface ImageModelItem {
  id: string;
  name: string;
  description: string;
  created?: number;
  provider?: string;
  model_type?: string;
  features?: string[];
  maxResolution?: string;
  supported_parameters?: string[];
}

export function getImageModelId(model: ImageModelItem): string {
  return model.id;
}
