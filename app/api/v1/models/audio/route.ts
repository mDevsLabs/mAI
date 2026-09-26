import { NextRequest, NextResponse } from "next/server";
import { authenticateCatalogRequest } from "@/lib/api-key-session";
import { redactApiSecretJson } from "@/lib/api-key-redaction";

export const runtime = "nodejs";

const FALLBACK_AUDIO_MODELS = [
  {
    architecture: {
      input_modalities: ["text"],
      modality: "text->speech",
      output_modalities: ["speech"],
    },
    created: Math.floor(Date.now() / 1000) - 86_400 * 30,
    description: "Modèle Text-to-Speech (TTS) ultra-rapide et haute fidélité par Deepgram avec rendu naturel des voix.",
    id: "deepgram/flux-tts:free",
    name: "Deepgram: Flux TTS",
    object: "model",
    owned_by: "deepgram",
    supported_parameters: ["voice", "speed", "response_format"],
    voices: [
      "flux-alexis-en",
      "flux-michael-en",
      "flux-stacy-en",
      "flux-sam-en",
      "flux-asteria-en",
      "flux-orion-en",
    ],
  },
];

function cleanModelName(name: string): string {
  return (name || "")
    .replace(/\s*\((free|gratuit|free tier)\)/gi, "")
    .replace(/:free/gi, "")
    .trim();
}

function catalogResponse(body: unknown, isPublic: boolean, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set(
    "Cache-Control",
    isPublic
      ? "public, s-maxage=300, stale-while-revalidate=60"
      : "private, no-store",
  );
  return NextResponse.json(body, { ...init, headers });
}

export async function GET(req: NextRequest) {
  const authResult = await authenticateCatalogRequest(req);
  if (!authResult.ok) return authResult.response;

  const auth = authResult.auth;
  const isPublic = auth.mode === "public";
  const headers: Record<string, string> = { Accept: "application/json" };
  if (auth.mode === "bearer") {
    headers.Authorization = `Bearer ${auth.token}`;
  } else if (auth.mode === "session") {
    headers.Authorization = `Bearer ${auth.secretKey}`;
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_MAI_API_URL?.replace(/\/$/, "") || "https://mai.val.run";
    const res = await fetch(`${backendUrl}/v1/models/speech`, {
      headers,
      ...(isPublic ? { next: { revalidate: 300 } } : { cache: "no-store" }),
    });

    if (res.ok) {
      const data = redactApiSecretJson(
        await res.json(),
        auth.mode === "bearer" ? auth.token : auth.mode === "session" ? auth.secretKey : null,
      );
      if (data && Array.isArray(data.data) && data.data.length > 0) {
        return catalogResponse(data, isPublic);
      }
    }

    if (!isPublic) {
      return catalogResponse(
        { error: { code: "catalog_unavailable", message: "Le catalogue audio est temporairement indisponible." } },
        false,
        { status: 502 },
      );
    }

    // Fallback public uniquement.
    const orRes = await fetch("https://openrouter.ai/api/v1/models?output_modalities=speech", {
      next: { revalidate: 300 },
    });
    if (orRes.ok) {
      const orJson = await orRes.json();
      const rawList = Array.isArray(orJson.data) ? orJson.data : [];
      const freeSpeechModels = rawList
        .filter((model: any) => model && model.id && model.id.toLowerCase().includes(":free"))
        .map((model: any) => ({
          architecture: model.architecture || {
            input_modalities: ["text"],
            modality: "text->speech",
            output_modalities: ["speech"],
          },
          created: model.created || Math.floor(Date.now() / 1000),
          description: model.description || `Modèle de synthèse vocale (TTS) ${cleanModelName(model.name || model.id)}.`,
          id: model.id,
          name: cleanModelName(model.name || model.id),
          object: "model",
          owned_by: (model.id || "").split("/")[0] || "openrouter",
          supported_parameters: model.supported_parameters || ["voice", "speed", "response_format"],
          voices: model.voices || [
            "flux-alexis-en",
            "flux-michael-en",
            "flux-stacy-en",
            "flux-sam-en",
            "flux-asteria-en",
            "flux-orion-en",
          ],
        }));

      if (freeSpeechModels.length > 0) {
        return catalogResponse({ data: freeSpeechModels, object: "list" }, true);
      }
    }

    return catalogResponse({ data: FALLBACK_AUDIO_MODELS, object: "list" }, true);
  } catch {
    if (!isPublic) {
      return catalogResponse(
        { error: { code: "catalog_unavailable", message: "Le catalogue audio est temporairement indisponible." } },
        false,
        { status: 502 },
      );
    }
    return catalogResponse({ data: FALLBACK_AUDIO_MODELS, object: "list" }, true);
  }
}
