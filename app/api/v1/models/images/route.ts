import { NextRequest, NextResponse } from "next/server";
import { authenticateOpenAIRequest } from "@/lib/openai-auth";
import { getCometApiKey, FALLBACK_IMAGE_MODELS } from "@/lib/comet";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  let userPlan = "Free";

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const authResult = await authenticateOpenAIRequest(req);
    if (authResult.valid) {
      userPlan = authResult.plan || "Free";
    }
  }

  const planStr = String(userPlan || "Free").toLowerCase().trim();
  const isPaidPlan = ["plus", "pro", "max"].includes(planStr);
  const shouldFilterFreeOnly = !isPaidPlan;

  const cometApiKey = getCometApiKey();

  try {
    let rawModels: any[] = [];

    if (cometApiKey) {
      const cometRes = await fetch("https://api.cometapi.com/v1/models", {
        headers: {
          Authorization: `Bearer ${cometApiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (cometRes.ok) {
        const json = await cometRes.json();
        rawModels = json.data || json.models || [];
      }
    }

    if (rawModels.length === 0) {
      rawModels = FALLBACK_IMAGE_MODELS;
    }

    // 1. Premier filtre : model_type: 'image'
    let imageModels = rawModels.filter((m) => {
      const mType = (m.model_type || m.type || m.architecture?.modality || "").toLowerCase();
      const features = (m.features || m.supported_features || []).map((f: string) => f.toLowerCase());
      const isImg =
        mType.includes("image") ||
        features.includes("text-to-image") ||
        features.includes("image-to-image") ||
        m.id.toLowerCase().includes("flux") ||
        m.id.toLowerCase().includes("diffusion") ||
        m.id.toLowerCase().includes("dall-e") ||
        m.id.toLowerCase().includes("midjourney");
      return isImg;
    });

    // 2. Si Free : feature text-to-image ET ID contenant 'flux'
    if (shouldFilterFreeOnly) {
      imageModels = imageModels.filter((m) => {
        const idLower = (m.id || "").toLowerCase();
        const features = (m.features || m.supported_features || ["text-to-image"]).map((f: string) => f.toLowerCase());
        const hasTextToImage = features.includes("text-to-image") || !m.features;
        const containsFlux = idLower.includes("flux");
        return hasTextToImage && containsFlux;
      });
    }

    // 3. Renvoyer les données : id, description, name et created
    const formatted = imageModels.map((m) => ({
      created: m.created || Math.floor(Date.now() / 1000),
      description: m.description || `Modèle de génération d'images ${m.name || m.id}.`,
      id: m.id,
      name: m.name || m.id,
    }));

    return NextResponse.json({ data: formatted, object: "list" });
  } catch {
    let fallback = FALLBACK_IMAGE_MODELS;
    if (shouldFilterFreeOnly) {
      fallback = fallback.filter((m) => m.id.toLowerCase().includes("flux"));
    }
    const formatted = fallback.map((m) => ({
      created: m.created,
      description: m.description,
      id: m.id,
      name: m.name,
    }));
    return NextResponse.json({ data: formatted, object: "list" });
  }
}
