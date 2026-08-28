import { NextRequest, NextResponse } from "next/server";
import { authenticateOpenAIRequest } from "@/lib/openai-auth";

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

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    await authenticateOpenAIRequest(req);
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_MAI_API_URL?.replace(/\/$/, "") || "https://mai.val.run";
    const res = await fetch(`${backendUrl}/v1/models/speech`, {
      headers: {
        "Accept": "application/json",
      },
      next: { revalidate: 300 }
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.data) && data.data.length > 0) {
        return NextResponse.json(data);
      }
    }

    // Requête directe OpenRouter si disponible
    const orRes = await fetch("https://openrouter.ai/api/v1/models?output_modalities=speech");
    if (orRes.ok) {
      const orJson = await orRes.json();
      const rawList = orJson.data || [];
      const freeSpeechModels = rawList
        .filter((m: any) => m && m.id && m.id.toLowerCase().includes(":free"))
        .map((m: any) => ({
          architecture: m.architecture || {
            input_modalities: ["text"],
            modality: "text->speech",
            output_modalities: ["speech"],
          },
          created: m.created || Math.floor(Date.now() / 1000),
          description: m.description || `Modèle de synthèse vocale (TTS) ${cleanModelName(m.name || m.id)}.`,
          id: m.id,
          name: cleanModelName(m.name || m.id),
          object: "model",
          owned_by: (m.id || "").split("/")[0] || "openrouter",
          supported_parameters: m.supported_parameters || ["voice", "speed", "response_format"],
          voices: m.voices || [
            "flux-alexis-en",
            "flux-michael-en",
            "flux-stacy-en",
            "flux-sam-en",
            "flux-asteria-en",
            "flux-orion-en",
          ],
        }));

      if (freeSpeechModels.length > 0) {
        return NextResponse.json({ data: freeSpeechModels, object: "list" });
      }
    }

    return NextResponse.json({ data: FALLBACK_AUDIO_MODELS, object: "list" });
  } catch (_err: any) {
    return NextResponse.json({ data: FALLBACK_AUDIO_MODELS, object: "list" });
  }
}
