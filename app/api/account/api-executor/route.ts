import { NextRequest, NextResponse } from "next/server";
import { authenticateSession } from "@/lib/session-auth";
import { resolveUserApiKeyByRef } from "@/lib/api-key-manager";
import {
  isAllowedExecutorRoute as isAllowedRoute,
  isPublicExecutorRoute as isPublicRoute,
  type ApiRouteMethod,
} from "@/lib/api-key-routes";

export const runtime = "nodejs";

type ExecutorMethod = ApiRouteMethod;

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json(
    { error: { code, message } },
    { status, headers: { "Cache-Control": "private, no-store" } },
  );
}

function sanitizeClientValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeClientValue);
  if (!value || typeof value !== "object") return value;

  const sanitized: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (/^(api[_-]?key|authorization|x-api-key|x-goog-api-key)$/i.test(key)) continue;
    sanitized[key] = sanitizeClientValue(nested);
  }
  return sanitized;
}

function redactResponseValue(value: unknown, secret: string | null): unknown {
  if (typeof value === "string") {
    return secret ? value.split(secret).join("[REDACTED]") : value;
  }
  if (Array.isArray(value)) return value.map((item) => redactResponseValue(item, secret));
  if (!value || typeof value !== "object") return value;

  const sanitized: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    sanitized[key] = /^(api[_-]?key|authorization)$/i.test(key)
      ? "[REDACTED]"
      : redactResponseValue(nested, secret);
  }
  return sanitized;
}

function redactSecretBytes(buffer: ArrayBuffer, secret: string): Uint8Array {
  const bytes = new Uint8Array(buffer);
  const needle = new TextEncoder().encode(secret);
  if (needle.length === 0 || needle.length > bytes.length) return bytes;

  outer: for (let index = 0; index <= bytes.length - needle.length; index++) {
    for (let offset = 0; offset < needle.length; offset++) {
      if (bytes[index + offset] !== needle[offset]) continue outer;
    }
    // Remplacement à longueur constante : l'audio reste décodable et la
    // valeur exacte de la clé ne peut pas atteindre le navigateur.
    bytes.fill(0x2a, index, index + needle.length);
    index += needle.length - 1;
  }
  return bytes;
}

async function safeUpstreamResponse(
  upstream: Response,
  secret: string | null,
): Promise<Response> {
  const headers = new Headers();
  const contentType = upstream.headers.get("content-type") || "application/octet-stream";
  headers.set("Content-Type", contentType);
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Content-Type-Options", "nosniff");

  if (!contentType.toLowerCase().includes("json") && !contentType.toLowerCase().startsWith("text/")) {
    if (!secret) {
      const binaryBody = await upstream.arrayBuffer();
      return new Response(binaryBody, { status: upstream.status, headers });
    }
    const rawBytes = await upstream.arrayBuffer();
    const redacted = redactSecretBytes(rawBytes, secret);
    const safeBytes = new Uint8Array(redacted.byteLength);
    safeBytes.set(redacted);
    return new Response(safeBytes.buffer, {
      status: upstream.status,
      headers,
    });
  }

  const raw = await upstream.text();
  if (!raw) return new Response(null, { status: upstream.status, headers });
  if (contentType.toLowerCase().includes("json")) {
    try {
      const parsed = JSON.parse(raw);
      return new Response(JSON.stringify(redactResponseValue(parsed, secret)), {
        status: upstream.status,
        headers,
      });
    } catch {
      // La réponse sera traitée comme texte ci-dessous.
    }
  }
  return new Response(secret ? raw.split(secret).join("[REDACTED]") : raw, {
    status: upstream.status,
    headers,
  });
}

function getLoopbackOllamaUrl(): URL | null {
  const configured = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
  try {
    const url = new URL(configured);
    if (!["localhost", "127.0.0.1", "[::1]", "::1"].includes(url.hostname)) return null;
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await authenticateSession(req);
    if (!session.ok) return session.response;

    const body = await req.json().catch(() => null) as {
      target?: string;
      method?: string;
      path?: string;
      body?: unknown;
      keyRef?: string;
    } | null;
    if (!body || typeof body !== "object") {
      return errorResponse("invalid_request", "Corps de requête invalide.", 400);
    }

    const target = body.target === "ollama" ? "ollama" : "mai";
    const method = String(body.method || "GET").toUpperCase() as ExecutorMethod;
    if (!["GET", "POST", "PUT", "DELETE"].includes(method)) {
      return errorResponse("method_not_allowed", "Méthode HTTP non autorisée.", 405);
    }

    const path = String(body.path || "").trim().replace(/^\/+/, "");
    if (
      !path ||
      path.length > 240 ||
      path.includes("\\") ||
      path.includes("?") ||
      path.includes("#") ||
      path.includes("..") ||
      !isAllowedRoute(method, path)
    ) {
      return errorResponse("path_not_allowed", "Ce chemin API n'est pas dans l'allowlist.", 403);
    }

    if (body.body !== undefined) {
      const serialized = JSON.stringify(sanitizeClientValue(body.body));
      if (serialized.length > 1_000_000) {
        return errorResponse("body_too_large", "Le corps de la requête dépasse 1 Mo.", 413);
      }
    }

    if (target === "ollama") {
      if (method !== "POST" || path !== "v1/chat/completions") {
        return errorResponse("target_not_allowed", "La cible Ollama n'accepte que les requêtes de chat.", 403);
      }
      const ollamaUrl = getLoopbackOllamaUrl();
      if (!ollamaUrl) {
        return errorResponse("target_not_allowed", "La cible Ollama doit être configurée sur une adresse loopback.", 403);
      }
      const requestBody = sanitizeClientValue(body.body) as {
        max_tokens?: unknown;
        messages?: unknown;
        model?: unknown;
        temperature?: unknown;
        top_p?: unknown;
      } | null;
      if (!requestBody || typeof requestBody.model !== "string") {
        return errorResponse("invalid_body", "Un modèle Ollama est requis.", 400);
      }
      const upstream = await fetch(new URL("/api/chat", ollamaUrl), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: Array.isArray(requestBody.messages) ? requestBody.messages : [],
          model: requestBody.model,
          options: {
            max_tokens: requestBody.max_tokens,
            temperature: requestBody.temperature,
            top_p: requestBody.top_p,
          },
          stream: false,
        }),
        signal: AbortSignal.timeout(45_000),
      });
      return safeUpstreamResponse(upstream, null);
    }

    let secret: string | null = null;
    if (body.keyRef) {
      const resolved = await resolveUserApiKeyByRef(session.identity.userId, String(body.keyRef));
      if (!resolved) {
        return errorResponse(
          "invalid_key_ref",
          "La référence de clé est invalide, inactive ou n'appartient pas à votre compte.",
          403,
        );
      }
      secret = resolved.secretKey;
    } else if (!isPublicRoute(method, path)) {
      return errorResponse("key_ref_required", "Sélectionnez une clé API active pour cette route.", 400);
    }

    const headers: Record<string, string> = { Accept: "application/json, text/plain;q=0.9" };
    if (secret) headers.Authorization = `Bearer ${secret}`;
    const upstream = await fetch(`https://mai.val.run/${path}`, {
      method,
      headers,
      body: method === "GET" || method === "DELETE" ? undefined : JSON.stringify(sanitizeClientValue(body.body ?? {})),
      signal: AbortSignal.timeout(45_000),
    });
    return safeUpstreamResponse(upstream, secret);
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      return errorResponse("upstream_timeout", "L'API mAI a expiré avant de répondre.", 504);
    }
    console.error("Erreur de l'exécuteur API sécurisé:", error);
    return errorResponse("upstream_unavailable", "L'API mAI est temporairement indisponible.", 502);
  }
}
