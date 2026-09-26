export interface ApiUsageStat {
  keyRef: string;
  name: string;
  prefix: string;
  requestCount: number;
  limit: number;
}

export interface AudioUsageData {
  tokensUsed: number;
  requestsCount: number;
  weeklyLimit: number;
  resetAt: string;
  plan: string;
}

export function formatTokens(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}k`;
  }
  return String(value);
}

export function formatResetDate(iso?: string | null): string {
  if (!iso) return "—";
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function getWeeklyResetDate(): string {
  const now = new Date();
  const day = now.getUTCDay() || 7;
  const nextMonday = new Date(now);
  nextMonday.setUTCDate(now.getUTCDate() + (8 - day));
  nextMonday.setUTCHours(0, 0, 0, 0);
  return nextMonday.toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function getSafeKeyPrefix(value: unknown, fallback: string): string {
  if (typeof value !== "string" || !value.trim()) return fallback;
  const cleaned = value.trim();
  if (cleaned.startsWith("mai-")) {
    const parts = cleaned.split("-");
    if (parts.length >= 3) return `${parts[0]}-${parts[1]}-${parts[2]}`;
  }
  return cleaned.substring(0, 16);
}
