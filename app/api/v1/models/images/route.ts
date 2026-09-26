import { NextRequest, NextResponse } from "next/server";
import { authenticateCatalogRequest } from "@/lib/api-key-session";
import { getCometApiKey, FALLBACK_IMAGE_MODELS } from "@/lib/comet";

export const runtime = "nodejs";

function publicResponse(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=60");
  return NextResponse.json(body, { ...init, headers });
}

function privateResponse(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "private, no-store");
  return NextResponse.json(body, { ...init, headers });
}

export async function GET(req: NextRequest) {
  const authResult = await authenticateCatalogRequest(req);
  if (!authResult.ok) return authResult.response;

  const auth = authResult.auth;
  const isPublic = auth.mode === 'public';
  const userPlan = isPublic ? "Free" : auth.plan;
  const planStr = String(userPlan || "Free").toLowerCase().trim();
  const shouldFilterFreeOnly = !["plus", "pro", "max"].includes(planStr);

  try {
    let rawModels: any[] = [];
    const cometApiKey = getCometApiKey();

    if (cometApiKey) {
      const cometRes = await fetch("https://api.cometapi.com/v1/models", {
        headers: {
          Authorization: `Bearer ${cometApiKey}`,
          "Content-Type": "application/json",
        },
        ...(isPublic ? { next: { revalidate: 300 } } : { cache: "no-store" }),
      });

      if (cometRes.ok) {
        const json = await cometRes.json();
        rawModels = json.data || json.models || [];
      }
    }

    if (rawModels.length === 0) {
      rawModels = FALLBACK_IMAGE_MODELS;
    }

    let imageModels = rawModels.filter((model) => {
      const modelType = (model.model_type || model.type || model.architecture?.modality || "").toLowerCase();
      const features = (model.features || model.supported_features || []).map((feature: string) => feature.toLowerCase());
      return modelType.includes("image") ||
        features.includes("text-to-image") ||
        features.includes("image-to-image") ||
        model.id.toLowerCase().includes("flux") ||
        model.id.toLowerCase().includes("diffusion") ||
        model.id.toLowerCase().includes("dall-e") ||
        model.id.toLowerCase().includes("midjourney");
    });

    if (shouldFilterFreeOnly) {
      imageModels = imageModels.filter((model) => {
        const idLower = (model.id || "").toLowerCase();
        const features = (model.features || model.supported_features || ["text-to-image"]).map((feature: string) => feature.toLowerCase());
        return (features.includes("text-to-image") || !model.features) && idLower.includes("flux");
      });
    }

    const formatted = imageModels.map((model) => ({
      created: model.created || Math.floor(Date.now() / 1000),
      description: model.description || `Modèle de génération d'images ${model.name || model.id}.`,
      id: model.id,
      name: model.name || model.id,
    }));

    return isPublic
      ? publicResponse({ data: formatted, object: "list" })
      : privateResponse({ data: formatted, object: "list" });
  } catch {
    if (!isPublic) {
      return privateResponse(
        { error: { code: "catalog_unavailable", message: "Le catalogue d'images est temporairement indisponible." } },
        { status: 502 },
      );
    }

    const fallback = FALLBACK_IMAGE_MODELS.filter(
      (model) => !shouldFilterFreeOnly || model.id.toLowerCase().includes("flux"),
    );
    const formatted = fallback.map((model) => ({
      created: model.created,
      description: model.description,
      id: model.id,
      name: model.name,
    }));
    return publicResponse({ data: formatted, object: "list" });
  }
}
