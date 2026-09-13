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
      version: m.version,
      status: m.status,
      tagline: m.tagline,
      capabilities: m.capabilities,
      recommended_hardware: m.recommendedHardware ?? null,
      ollama_tag: m.ollamaTag ?? null,
      huggingface_tag: m.huggingFaceTag ?? null,
      license: m.license,
      // Les modèles de la génération mAI-2 sont servis dans le cloud via l'alias API.
      usable_in_cloud_chat: Boolean(m.cloud),
      execution_mode: m.cloud ? "cloud_api" : "local_ollama_gguf",
      api_alias: m.apiAlias ?? null,
    }));

    return NextResponse.json({
      object: "list",
      data: formattedModels,
      count: formattedModels.length,
      note: "Les modèles locaux s'exécutent via Ollama / HuggingFace. Les modèles cloud (génération mAI-2) sont appelables via /v1/chat/completions avec leur alias API (ex: « mai-2 »).",
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
