import { z } from 'zod';

export interface OpenAICompatibleKeyVault {
  apiKey?: string;
  baseURL?: string;
}

export const OpenAICompatibleKeyVaultSchema = z.object({
  apiKey: z.string().optional(),
  baseURL: z.string().optional(),
});

export interface FalKeyVault {
  apiKey?: string;
}

export const FalKeyVaultSchema = z.object({
  apiKey: z.string().optional(),
});

export interface AzureOpenAIKeyVault {
  apiKey?: string;
  apiVersion?: string;
  baseURL?: string;
  /**
   * @deprecated
   */
  endpoint?: string;
}

export const AzureOpenAIKeyVaultSchema = z.object({
  apiKey: z.string().optional(),
  apiVersion: z.string().optional(),
  baseURL: z.string().optional(),
  endpoint: z.string().optional(),
});

export interface AWSBedrockKeyVault {
  accessKeyId?: string;
  region?: string;
  secretAccessKey?: string;
  sessionToken?: string;
}

export const AWSBedrockKeyVaultSchema = z.object({
  accessKeyId: z.string().optional(),
  region: z.string().optional(),
  secretAccessKey: z.string().optional(),
  sessionToken: z.string().optional(),
});

export interface VertexAIKeyVault {
  apiKey?: string;
  region?: string;
}

export const VertexAIKeyVaultSchema = z.object({
  apiKey: z.string().optional(),
  region: z.string().optional(),
});

export interface CloudflareKeyVault {
  apiKey?: string;
  baseURLOrAccountID?: string;
}

export const CloudflareKeyVaultSchema = z.object({
  apiKey: z.string().optional(),
  baseURLOrAccountID: z.string().optional(),
});

export interface ComfyUIKeyVault {
  apiKey?: string;
  authType?: 'none' | 'basic' | 'bearer' | 'custom';
  baseURL?: string;
  customHeaders?: Record<string, string>;
  password?: string;
  username?: string;
}

export const ComfyUIKeyVaultSchema = z.object({
  apiKey: z.string().optional(),
  authType: z.enum(['none', 'basic', 'bearer', 'custom']).optional(),
  baseURL: z.string().optional(),
  customHeaders: z.record(z.string()).optional(),
  password: z.string().optional(),
  username: z.string().optional(),
});

export interface GithubCopilotKeyVault {
  /**
   * Traditional PAT (Personal Access Token)
   */
  apiKey?: string;
  /**
   * Provider-specific bearer token (Copilot API token)
   */
  bearerToken?: string;
  /**
   * Bearer token expiration timestamp (ms)
   */
  bearerTokenExpiresAt?: string;
  /**
   * OAuth access token (e.g., GitHub's ghu_xxx)
   */
  oauthAccessToken?: string;
}

export const GithubCopilotKeyVaultSchema = z.object({
  apiKey: z.string().optional(),
  bearerToken: z.string().optional(),
  bearerTokenExpiresAt: z.string().optional(),
  oauthAccessToken: z.string().optional(),
});

export interface SearchEngineKeyVaults {
  searchxng?: {
    apiKey?: string;
    baseURL?: string;
  };
}

export const SearchEngineKeyVaultsSchema = z.object({
  searchxng: z.object({
    apiKey: z.string().optional(),
    baseURL: z.string().optional(),
  }).optional(),
});

export interface UserKeyVaults extends SearchEngineKeyVaults {
  search1api?: OpenAICompatibleKeyVault;
}

export const UserKeyVaultsSchema = SearchEngineKeyVaultsSchema.extend({
  search1api: OpenAICompatibleKeyVaultSchema.optional(),
}).passthrough();
