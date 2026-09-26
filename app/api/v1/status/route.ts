import { NextResponse } from "next/server";
import type {
  SupportStatus,
  SupportStatusResponse,
  SupportStatusService,
} from "@/components/support/support-status-types";

export const runtime = "nodejs";
export const revalidate = 60;

const STATUS_URL = "https://mai.instatus.com/summary.json";
const CACHE_TTL_MS = 60_000;
const REQUEST_TIMEOUT_MS = 5_000;
const FALLBACK_ERROR = "Le fournisseur de statut est momentanément indisponible.";

type JsonRecord = Record<string, unknown>;

type StatusCacheEntry = {
  response: SupportStatusResponse;
  expiresAt: number;
};

let statusCache: StatusCacheEntry | null = null;
let lastGoodResponse: SupportStatusResponse | null = null;

const FALLBACK_SERVICES: readonly Omit<SupportStatusService, "status">[] = [
  { id: "vibe", name: "Vibe", description: "État non communiqué par Instatus" },
  { id: "web", name: "Web", description: "État non communiqué par Instatus" },
  { id: "pulse", name: "Pulse", description: "État non communiqué par Instatus" },
  { id: "cli", name: "CLI", description: "État non communiqué par Instatus" },
  { id: "coder", name: "Coder", description: "État non communiqué par Instatus" },
  { id: "api-models", name: "API & Modèles IA", description: "État non communiqué par Instatus" },
];

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeStatus(value: unknown): SupportStatus | null {
  const raw = asString(value)?.toUpperCase().replace(/[\s-]+/g, "_");
  if (!raw) return null;

  switch (raw) {
    case "UP":
    case "OK":
    case "OPERATIONAL":
    case "NONE":
      return "UP";
    case "HASISSUES":
    case "ISSUES":
    case "DEGRADED":
    case "PARTIAL_OUTAGE":
      return "HASISSUES";
    case "MINOROUTAGE":
    case "MINOR_OUTAGE":
      return "MINOROUTAGE";
    case "MAJOROUTAGE":
    case "MAJOR_OUTAGE":
    case "OUTAGE":
    case "DOWN":
      return "MAJOROUTAGE";
    case "UNDERMAINTENANCE":
    case "UNDER_MAINTENANCE":
    case "MAINTENANCE":
      return "UNDERMAINTENANCE";
    case "UNKNOWN":
      return "UNKNOWN";
    default:
      return null;
  }
}

function safeStatusUrl(value: unknown, fallback: string): string {
  const candidate = asString(value);
  if (!candidate) return fallback;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

function slugify(value: string): string {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "service";
}

function normalizeService(value: unknown, index: number): SupportStatusService | null {
  if (!isRecord(value)) return null;
  const name = asString(value.name) || asString(value.title);
  if (!name) return null;
  const status = normalizeStatus(value.status);
  if (!status) return null;

  const id = asString(value.id) || asString(value.slug) || `${slugify(name)}-${index + 1}`;
  return {
    id,
    name,
    status,
    description: asString(value.description) || "",
  };
}

function normalizeServices(payload: JsonRecord): SupportStatusService[] {
  const page = isRecord(payload.page) ? payload.page : {};
  const rawServices = Array.isArray(payload.components)
    ? payload.components
    : Array.isArray(payload.services)
      ? payload.services
      : Array.isArray(page.components)
        ? page.components
        : [];

  return rawServices
    .map((service, index) => normalizeService(service, index))
    .filter((service): service is SupportStatusService => service !== null);
}

function normalizePayload(payload: unknown, now: string): SupportStatusResponse | null {
  if (!isRecord(payload) || !isRecord(payload.page)) return null;
  const status = normalizeStatus(payload.page.status);
  if (!status) return null;

  const services = normalizeServices(payload);
  const updatedAt = asString(payload.updated_at) || asString(payload.page.updated_at) || now;
  const pageName = asString(payload.page.name) || "mAI";
  const pageUrl = safeStatusUrl(payload.page.url, "https://mai.instatus.com/");

  return {
    page: { name: pageName, url: pageUrl, status },
    services,
    components: services,
    updatedAt,
    source: "instatus",
    stale: false,
  };
}

function createFallback(now: string, reason = FALLBACK_ERROR): SupportStatusResponse {
  const services = FALLBACK_SERVICES.map((service) => ({ ...service, status: "UNKNOWN" as const }));
  return {
    page: {
      name: "mAI",
      url: "https://mai.instatus.com/",
      status: "UNKNOWN",
    },
    services,
    components: services,
    updatedAt: now,
    source: "fallback",
    stale: true,
    error: reason,
  };
}

function responseHeaders(): HeadersInit {
  return {
    "Cache-Control": "public, max-age=60, s-maxage=60",
  };
}

export async function GET() {
  const now = Date.now();
  if (statusCache && statusCache.expiresAt > now) {
    return NextResponse.json(statusCache.response, { headers: responseHeaders() });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(STATUS_URL, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
      next: { revalidate: 60 },
    });
    if (response.ok === false) {
      throw new Error(`Instatus HTTP ${response.status}`);
    }

    const payload: unknown = await response.json();
    const normalized = normalizePayload(payload, new Date().toISOString());
    if (!normalized) {
      throw new Error("Réponse Instatus invalide");
    }

    lastGoodResponse = normalized;
    statusCache = { response: normalized, expiresAt: Date.now() + CACHE_TTL_MS };
    return NextResponse.json(normalized, { headers: responseHeaders() });
  } catch (error: unknown) {
    console.error("[SUPPORT STATUS]", error instanceof Error ? error.message : "Indisponible");

    const fallback = lastGoodResponse
      ? {
          ...lastGoodResponse,
          source: "cache" as const,
          stale: true,
          error: FALLBACK_ERROR,
        }
      : createFallback(new Date().toISOString());

    statusCache = { response: fallback, expiresAt: Date.now() + CACHE_TTL_MS };
    return NextResponse.json(fallback, { headers: responseHeaders() });
  } finally {
    clearTimeout(timeout);
  }
}
