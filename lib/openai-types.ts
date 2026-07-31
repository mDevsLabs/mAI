// Types standards de l'API OpenAI v1 pour la couche de compatibilité mAI / mProjects

export interface OpenAIChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  name?: string;
  images?: string[];
}

export interface OpenAIChatCompletionRequest {
  model: string;
  messages: OpenAIChatMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  user?: string;
  n?: number;
  stop?: string | string[];
}

export interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface OpenAIChatCompletionChoice {
  index: number;
  message: {
    role: 'assistant';
    content: string;
  };
  finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
}

export interface OpenAIChatCompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: OpenAIChatCompletionChoice[];
  usage: OpenAIUsage;
}

export interface OpenAIChatCompletionChunkDelta {
  role?: 'assistant' | 'system' | 'user';
  content?: string;
}

export interface OpenAIChatCompletionChunkChoice {
  index: number;
  delta: OpenAIChatCompletionChunkDelta;
  finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
}

export interface OpenAIChatCompletionChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: OpenAIChatCompletionChunkChoice[];
}

export interface OpenAIModelObject {
  id: string;
  object: 'model';
  created: number;
  owned_by: string;
  permission?: any[];
  root?: string;
  parent?: string;
}

export interface OpenAIModelListResponse {
  object: 'list';
  data: OpenAIModelObject[];
}

export interface OpenAIErrorResponse {
  error: {
    message: string;
    type: string;
    param: string | null;
    code: string | null;
  };
}
