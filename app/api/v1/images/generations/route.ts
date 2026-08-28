import { NextRequest, NextResponse } from "next/server";
import { authenticateOpenAIRequest } from "@/lib/openai-auth";
import { neon } from "@neondatabase/serverless";
import { getTierDailyImageLimit, getTierImageRequestCost } from "@/lib/tiers";
import { getCometApiKey } from "@/lib/comet";
import { recordApiLog } from "@/lib/api-key-manager";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const startTime = performance.now();
  // 1. Authentification
  const auth = await authenticateOpenAIRequest(req);
  if (!auth.valid) {
    return auth.response;
  }

  try {
    const body = await req.json().catch(() => ({}));
    const prompt = body.prompt;
    const model = body.model || "black-forest-labs/flux-1-schnell";
    const width = body.width || (body.size ? parseInt(body.size.split("x")[0], 10) : 1024);
    const height = body.height || (body.size ? parseInt(body.size.split("x")[1], 10) : 1024);
    const negativePrompt = body.negative_prompt || "";

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        {
          error: {
            message: "Missing required parameter: 'prompt'.",
            type: "invalid_request_error",
            param: "prompt",
            code: "missing_required_parameter",
          },
        },
        { status: 400 }
      );
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json(
        { error: "Configuration base de données manquante." },
        { status: 500 }
      );
    }

    const sql = neon(databaseUrl);
    const userId = auth.apiKeyId || "api_user";
    const userPlan = auth.plan || "Free";

    // 2. Vérification des droits selon le forfait
    const planStr = userPlan.toLowerCase().trim();
    const isPaidPlan = ["plus", "pro", "max"].includes(planStr);

    if (!isPaidPlan) {
      return NextResponse.json(
        {
          error: {
            code: "image_generation_tier_restricted",
            message: `La génération d'images via l'API est réservée aux forfaits payants (Plus, Pro, Max). Votre forfait actuel (${userPlan}) ne permet pas d'utiliser l'API de génération d'images.`,
            param: null,
            type: "permission_error",
          },
        },
        { status: 403 }
      );
    }

    // 3. Vérification des quotas journaliers (Plus: 5/j, Pro: 10/j, Max: 20/j)
    const dailyLimit = getTierDailyImageLimit(userPlan);
    const requestCost = getTierImageRequestCost(userPlan);

    const usageRows = await sql`
      SELECT images_generated 
      FROM mprojects_daily_image_usage 
      WHERE user_id = ${userId}::text AND usage_date = CURRENT_DATE 
      LIMIT 1
    `;
    const currentDailyUsage = usageRows[0]?.images_generated || 0;

    if (currentDailyUsage >= dailyLimit) {
      return NextResponse.json(
        {
          error: {
            code: "daily_image_quota_exceeded",
            limit: dailyLimit,
            message: `Votre quota journalier de génération d'images est atteint (${currentDailyUsage}/${dailyLimit} par jour pour le forfait ${userPlan}). Réinitialisation automatique à minuit UTC.`,
            type: "quota_error",
            used: currentDailyUsage,
          },
        },
        { status: 429 }
      );
    }

    // 4. Appel à Comet API
    const cometApiKey = getCometApiKey();
    let generatedImageUrl = "";
    let cometResultData: any[] = [];

    if (cometApiKey) {
      const cometRes = await fetch("https://api.cometapi.com/v1/images/generations", {
        body: JSON.stringify({
          model,
          n: 1,
          prompt,
          response_format: body.response_format || "url",
          size: `${width}x${height}`,
        }),
        headers: {
          Authorization: `Bearer ${cometApiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!cometRes.ok) {
        const errText = await cometRes.text().catch(() => "");
        return NextResponse.json(
          {
            error: {
              code: "comet_api_error",
              details: errText,
              message: "Erreur retournée par le fournisseur Comet API.",
              type: "api_error",
            },
          },
          { status: cometRes.status }
        );
      }

      const cometJson = await cometRes.json();
      cometResultData = cometJson.data || [];
      if (cometResultData.length > 0) {
        generatedImageUrl = cometResultData[0].url || cometResultData[0].b64_json || "";
      }
    } else {
      // Fallback placeholder de qualité pour démonstration locale
      generatedImageUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt.slice(0, 20))}/${width}/${height}`;
      cometResultData = [{ url: generatedImageUrl }];
    }

    // 5. Mise à jour de la base de données (Quota & Historique)
    await sql`
      INSERT INTO mprojects_daily_image_usage (user_id, usage_date, images_generated, updated_at)
      VALUES (${userId}::text, CURRENT_DATE, 1, NOW())
      ON CONFLICT (user_id, usage_date)
      DO UPDATE SET 
        images_generated = mprojects_daily_image_usage.images_generated + 1,
        updated_at = NOW()
    `;

    await sql`
      INSERT INTO mprojects_image_generations (
        user_id, api_key, model, prompt, negative_prompt, width, height, image_url, status
      ) VALUES (
        ${userId}::text,
        ${auth.apiKeyToken}::text,
        ${model}::text,
        ${prompt}::text,
        ${negativePrompt || null},
        ${width}::integer,
        ${height}::integer,
        ${generatedImageUrl}::text,
        'completed'
      )
    `;

    // 6. Incrémentation du compteur de requêtes de la clé API
    if (auth.apiKeyToken) {
      await sql`
        UPDATE mprojects_api_keys
        SET request_count = request_count + ${requestCost}, last_used_at = NOW()
        WHERE api_key = ${auth.apiKeyToken}
      `;
    }

    // 7. Enregistrement d'usage log automatique
    const latency = Math.round(performance.now() - startTime);
    await recordApiLog({
      apiKey: auth.apiKeyToken || "anonymous",
      endpoint: "/v1/images/generations",
      method: "POST",
      statusCode: 200,
      latencyMs: latency,
    });

    return NextResponse.json({
      created: Math.floor(Date.now() / 1000),
      data: cometResultData,
      usage: {
        daily_limit: dailyLimit,
        daily_used: currentDailyUsage + 1,
        plan: userPlan,
        request_cost: requestCost,
      },
    });
  } catch (err: any) {
    console.error("Image Generation API Error:", err);
    return NextResponse.json(
      {
        error: {
          code: "internal_error",
          message: err.message || "Erreur interne lors de la génération d'images.",
          type: "api_error",
        },
      },
      { status: 500 }
    );
  }
}
