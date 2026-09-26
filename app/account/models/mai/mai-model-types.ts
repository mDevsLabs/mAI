export interface MaiModelItem {
  id: string;
  name: string;
  description: string;
  tagline?: string;
  version?: string;
  parameters?: string;
  status?: "active" | "beta" | "deprecated";
  context_length: number;
  max_output_tokens?: number;
  capabilities?: {
    coding?: boolean;
    reasoning?: boolean;
    vision?: boolean;
    jsonOutput?: boolean;
    functionCalling?: boolean;
  };
  recommended_hardware?: {
    minVram?: string;
    recommendedVram?: string;
    ram?: string;
  };
  ollama_tag?: string | null;
  huggingface_tag?: string | null;
  license?: string;
  usable_in_cloud_chat?: boolean;
  execution_mode?: string;
}

export type MaiModelSort =
  | "default"
  | "name-asc"
  | "name-desc"
  | "params-desc"
  | "context-desc";

export interface MaiParamPreset {
  id: string;
  label: string;
  minB: number | null;
  maxB: number | null;
}
