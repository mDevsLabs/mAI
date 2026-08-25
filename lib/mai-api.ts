/**
 * Client HTTP pour le backend mAI (Val Town).
 * Base : https://mai.val.run
 */

export const MAI_API_BASE =
  process.env.NEXT_PUBLIC_MAI_API_URL?.replace(/\/$/, "") ||
  "https://mai.val.run";

export type MaiAuthResponse = {
  success: boolean;
  status?: string; // "verification_required"
  email?: string;
  token?: string;
  tier?: string;
  error?: string;
};

export type MaiUsage = {
  tier: string;
  email: string;
  username: string;
  phone?: string;
  avatarUrl?: string;
  newsletter?: boolean;
  notify_limits?: boolean;
  tokensUsed: number;
  limit: number;
  weekStart: string;
  resetAt: string;
};

export type MaiCloudStorageUsage = {
  bytes_limit: number;
  bytes_used: number;
  files_count: number;
  over_limit: boolean;
  percent_used: number;
  tier: string;
};

import { CLOUD_STORAGE_LIMITS } from "./tiers";
// Ré-export depuis la source unique lib/tiers.ts (évite divergence frontend/backend)
export { CLOUD_STORAGE_LIMITS, STORAGE_LIMITS_BYTES, TIER_REQUEST_LIMITS, TIER_TOKEN_LIMITS, TIER_LIMITS, TIER_DAILY_IMAGE_LIMITS, TIER_IMAGE_REQUEST_COST, getTierQuotaLimit, getTierDailyImageLimit, getTierImageRequestCost, getTierStorageLimit, formatStorageBytes } from "./tiers";

export type MaiVerifyCodeResponse = {
  success: boolean;
  tier?: string;
  token?: string;
  error?: string;
};

export class MaiApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "MaiApiError";
    this.status = status;
  }
}

async function parseJsonSafe(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function errorMessage(data: Record<string, unknown>, fallback: string): string {
  if (typeof data.error === "string" && data.error.trim()) return data.error;
  return fallback;
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, headers: extraHeaders, ...rest } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(extraHeaders as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${MAI_API_BASE}${path}`, {
    ...rest,
    headers,
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    throw new MaiApiError(
      errorMessage(data, `Erreur HTTP ${res.status}`),
      res.status
    );
  }

  return data as T;
}

export async function register(params: {
  email: string;
  username: string;
  password: string;
}): Promise<MaiAuthResponse> {
  return request<MaiAuthResponse>("/register", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function verifyRegister(params: {
  email: string;
  username: string;
  password: string;
  code: string;
}): Promise<MaiAuthResponse> {
  return request<MaiAuthResponse>("/verify-register", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function login(params: {
  identifier?: string;
  email?: string;
  password: string;
}): Promise<MaiAuthResponse> {
  return request<MaiAuthResponse>("/login", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function verifyLogin(params: {
  email: string;
  code: string;
}): Promise<MaiAuthResponse> {
  return request<MaiAuthResponse>("/verify-login", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function resendVerificationCode(params: {
  email: string;
  action: "register" | "login";
}): Promise<{ success: boolean; error?: string }> {
  return request<{ success: boolean; error?: string }>("/resend-code", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function getUsage(token: string): Promise<MaiUsage> {
  return request<MaiUsage>("/usage", {
    method: "GET",
    token,
  });
}

export async function getCloudStorage(token: string): Promise<MaiCloudStorageUsage> {
  const data = await request<MaiCloudStorageUsage>("/cloud/storage", {
    method: "GET",
    token,
  });
  
  // Limites canoniques depuis lib/tiers.ts (Free 500MB, Plus 5GB, Pro 20GB, Max 100GB)
  const tier = data.tier || "Free";
  const limit = CLOUD_STORAGE_LIMITS[tier] || CLOUD_STORAGE_LIMITS["Free"];
  const bytesUsed = Number(data.bytes_used || 0);
  const percentUsed = limit > 0 ? Math.min(100, Math.round((bytesUsed / limit) * 10000) / 100) : 0;

  return {
    ...data,
    bytes_limit: limit,
    bytes_used: bytesUsed,
    files_count: Number(data.files_count || 0),
    over_limit: bytesUsed >= limit,
    percent_used: percentUsed,
    tier,
  };
}

export async function verifyCode(
  token: string,
  code: string
): Promise<MaiVerifyCodeResponse> {
  return request<MaiVerifyCodeResponse>("/verify-code", {
    method: "POST",
    token,
    body: JSON.stringify({ code }),
  });
}

export async function updateProfile(
  token: string,
  params: { username?: string; email?: string; phone?: string; password?: string; currentPassword?: string; newsletter?: boolean; notify_limits?: boolean }
): Promise<{ success: boolean; username?: string; tier?: string; email?: string; phone?: string; newsletter?: boolean; notify_limits?: boolean; error?: string }> {
  return request("/update-profile", {
    method: "POST",
    token,
    body: JSON.stringify(params),
  });
}

export async function uploadAvatar(
  token: string,
  file: File
): Promise<{ success: boolean; avatarUrl?: string; error?: string }> {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await fetch(`${MAI_API_BASE}/upload-avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData,
  });

  try {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Erreur HTTP " + res.status);
    }
    return data;
  } catch (err: any) {
    throw new MaiApiError(err.message, res.status);
  }
}
