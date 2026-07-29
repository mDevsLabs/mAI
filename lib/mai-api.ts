/**
 * Client HTTP pour le backend mAI (Val Town).
 * Base : https://mai.val.run
 */

export const MAI_API_BASE =
  process.env.NEXT_PUBLIC_MAI_API_URL?.replace(/\/$/, "") ||
  "https://mprojects.val.run";

export type MaiAuthResponse = {
  success: boolean;
  token: string;
  tier: string;
  error?: string;
};

export type MaiUsage = {
  tier: string;
  email: string;
  username: string;
  tokensUsed: number;
  limit: number;
  weekStart: string;
  resetAt: string;
};

export type MaiVerifyCodeResponse = {
  success: boolean;
  tier: string;
  token: string;
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

export async function login(params: {
  email: string;
  password: string;
}): Promise<MaiAuthResponse> {
  return request<MaiAuthResponse>("/login", {
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
  params: { username?: string; password?: string }
): Promise<{ success: boolean; username?: string; tier?: string; email?: string; error?: string }> {
  return request("/update-profile", {
    method: "POST",
    token,
    body: JSON.stringify(params),
  });
}
