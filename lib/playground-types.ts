export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id?: string;
  role: Role;
  content: string;
  images?: string[];
  timestamp?: number;
}

export interface PlaygroundConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}
