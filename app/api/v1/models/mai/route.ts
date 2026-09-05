import { NextRequest, NextResponse } from "next/server";
import { maiModelsList } from "@/lib/mai-models";

export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  try {
    const formattedModels = maiModelsList.map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      object: "model",
      created: Math.floor(new Date(m.releaseDate).getTime() / 1000) || Math.floor(Date.now() / 1000),
      owned_by: "mDevsLabs",
      context_length: m.contextWindow,
      max_output_tokens: m.maxOutputTokens,
      parameters: m.parameters ?? null,
      status: m.status,
      tagline: m.tagline,
      capabilities: m.capabilities,
      recommended_hardware: m.recommendedHardware ?? null,
      ollama_tag: m.ollamaTag ?? null,
      huggingface_tag: m.huggingFaceTag ?? null,
      license: m.license,
      cloud: m.cloud,
      // mAI-2 / mAI-2-Mini : appelables via l'API mAI (cloud) ;
      // générations locales (1 / 1.2 / 1.5) : exécution locale uniquement.
      usable_in_cloud_chat: m.cloud,
      execution_mode: m.cloud ? "cloud_api" : "local_ollama_gguf",
    }));

    return NextResponse.json({
      object: "list",
      data: formattedModels,
      count: formattedModels.length,
      note: "Les modèles cloud: true (mAI-2, mAI-2-Mini) sont appelables via /v1/chat/completions avec leur identifiant API (ex: 'mai/mai-2'). Les autres modèles mAI sont destinés à une exécution locale (Ollama / HuggingFace). Les modèles status 'deprecated' ne sont plus disponibles.",
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: {
          code: "internal_error",
          message: err.message || "Erreur lors de la récupération des modèles mAI.",
          type: "api_error",
        },
      },
      { status: 500 }
    );
  }
}
