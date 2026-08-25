import { NextRequest, NextResponse } from "next/server";
import { maiModelsList } from "@/lib/mai-models";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
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
      parameters: m.parameters,
      version: m.version,
      status: m.status,
      tagline: m.tagline,
      capabilities: m.capabilities,
      recommended_hardware: m.recommendedHardware,
      ollama_tag: m.ollamaTag,
      huggingface_tag: m.huggingFaceTag,
      license: m.license,
      // Indication explicite de modèle local
      usable_in_cloud_chat: false,
      execution_mode: "local_ollama_gguf",
    }));

    return NextResponse.json({
      object: "list",
      data: formattedModels,
      count: formattedModels.length,
      note: "Ces modèles sont destinés à une exécution locale (Ollama / HuggingFace) et ne sont pas directement appelables via les requêtes /v1/chat/completions en ligne.",
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
