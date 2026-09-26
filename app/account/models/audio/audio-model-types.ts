export interface AudioModelItem {
  id: string;
  name: string;
  description: string;
  created?: number;
  owned_by?: string;
  provider?: string;
  voices?: string[];
  supported_parameters?: string[];
}

export function getAudioModelId(model: AudioModelItem): string {
  return model.id;
}
