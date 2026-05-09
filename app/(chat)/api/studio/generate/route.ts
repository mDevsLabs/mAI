/**
 * API Route pour la génération d'images via Studio
 * Supporte FranceStudent (SDK OpenAI) et AI Horde (REST API)
 * 
 * @version 0.0.4
 */
import { auth } from "@/app/(auth)/auth";
import { allImageModels } from "@/lib/ai/models-images";
import { put } from "@vercel/blob";
import { createStudioImage, creditXP, checkAndUnlockBadges } from "@/lib/db/queries";

export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { prompt, model, ratio, variants, sourceImage, denoisingStrength, loras } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return Response.json(
        { error: "Le prompt est requis" },
        { status: 400 }
      );
    }

    // Déterminer le provider du modèle d'image
    const imageModel = allImageModels.find((m) => m.id === model);
    const provider = imageModel?.provider ?? "francestudent";

    if (provider === "francestudent") {
      return await generateWithFranceStudent({ prompt, model, ratio, variants, userId: session.user.id });
    }

    if (provider === "ai-horde") {
      return await generateWithAIHorde({ prompt, model, ratio, variants, sourceImage, denoisingStrength, loras, userId: session.user.id });
    }

    return Response.json(
      { error: "Provider non supporté" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erreur Studio:", error);
    return Response.json(
      { error: "Erreur lors de la génération" },
      { status: 500 }
    );
  }
}

/**
 * Génération via FranceStudent (compatible SDK OpenAI)
 */
async function generateWithFranceStudent({
  prompt,
  model,
  ratio,
  variants,
  userId,
}: {
  prompt: string;
  model: string;
  ratio: string;
  variants: number;
  userId: string;
}) {
  const apiKey = process.env.FS_API_KEY;
  const baseUrl = process.env.FS_BASE_URL ?? "https://api.francestudent.org/v1/";

  if (!apiKey) {
    return Response.json(
      { error: "Clé API FranceStudent non configurée (FS_API_KEY)" },
      { status: 500 }
    );
  }

  // Convertir le ratio en dimensions
  const size = ratioToSize(ratio);

  try {
    const response = await fetch(`${baseUrl}images/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt,
        n: Math.min(variants, 4),
        size,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return Response.json(
        { error: err.error?.message || "Erreur FranceStudent" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const savedImages = [];
    for (const img of data.data ?? []) {
      let imageUrl = img.url ?? `data:image/png;base64,${img.b64_json}`;
      
      // Si c'est du base64, on l'uploade sur Vercel Blob
      if (imageUrl.startsWith("data:image")) {
        try {
          const base64Data = imageUrl.split(",")[1];
          const buffer = Buffer.from(base64Data, "base64");
          const blobData = await put(`studio-${crypto.randomUUID()}.png`, buffer, {
            access: "public",
          });
          imageUrl = blobData.url;
        } catch (uploadError) {
          console.error("Échec de l'upload vers Vercel Blob:", uploadError);
        }
      } else if (imageUrl) {
        // Si c'est déjà une URL, on la télécharge et la ré-uploade pour la pérenniser
        try {
          const imgRes = await fetch(imageUrl);
          const blob = await imgRes.blob();
          const fileBuffer = await blob.arrayBuffer();
          const blobData = await put(`studio-${crypto.randomUUID()}.png`, fileBuffer, {
            access: "public",
          });
          imageUrl = blobData.url;
        } catch (uploadError) {
          console.error("Échec de l'upload vers Vercel Blob, utilisation de l'URL d'origine:", uploadError);
        }
      }

      // Enregistrement en BDD
      const dbRecord = await createStudioImage({
        prompt,
        model,
        provider: "francestudent",
        url: imageUrl,
        ratio,
        userId,
      });
      
      savedImages.push(dbRecord[0]);

      // Créditer 10 XP à l'utilisateur pour l'image
      await creditXP({
        userId,
        amount: 10,
        reason: "Image générée",
      }).catch(err => console.error("Failed to credit XP for image:", err));

      // Vérifier et débloquer les badges
      await checkAndUnlockBadges(userId);
    }

    return Response.json({ images: savedImages });
  } catch (error) {
    console.error("Erreur FranceStudent:", error);
    return Response.json(
      { error: "Impossible de contacter FranceStudent" },
      { status: 502 }
    );
  }
}

/**
 * Génération via AI Horde (REST API)
 */
async function generateWithAIHorde({
  prompt,
  model,
  ratio,
  variants,
  sourceImage,
  denoisingStrength,
  loras,
  userId,
}: {
  prompt: string;
  model: string;
  ratio: string;
  variants: number;
  sourceImage?: string | null;
  denoisingStrength?: number;
  loras?: { name: string; model: number }[];
  userId: string;
}) {
  const apiKey = process.env.AIHORDE_API_KEY ?? "0000000000";
  const { width, height } = ratioToDimensions(ratio);

  try {
    // Étape 1 : Soumettre la requête
    const submitRes = await fetch(
      "https://aihorde.net/api/v2/generate/async",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey,
        },
        body: JSON.stringify({
          prompt,
          params: {
            width,
            height,
            steps: 30,
            n: Math.min(variants, 4),
            denoising_strength: denoisingStrength,
            ...(loras && loras.length > 0 && {
              loras: loras.map(l => ({ name: l.name, model: l.model, clip: l.model })),
            }),
          },
          models: [model],
          nsfw: false,
          censor_nsfw: true,
          ...(sourceImage && {
            source_image: sourceImage.includes(",") ? sourceImage.split(",")[1] : sourceImage,
            source_processing: "img2img",
          }),
        }),
      }
    );

    if (!submitRes.ok) {
      const err = await submitRes.json().catch(() => ({}));
      return Response.json(
        { error: err.message || "Erreur AI Horde" },
        { status: submitRes.status }
      );
    }

    const { id } = await submitRes.json();

    // Étape 2 : Attendre le résultat (polling simple)
    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 2000));
      attempts++;

      const checkRes = await fetch(
        `https://aihorde.net/api/v2/generate/check/${id}`
      );
      const checkData = await checkRes.json();

      if (checkData.done) {
        // Récupérer les résultats
        const resultRes = await fetch(
          `https://aihorde.net/api/v2/generate/status/${id}`
        );
        const resultData = await resultRes.json();
        const savedImages = [];
        for (const gen of resultData.generations ?? []) {
          let imageUrl = gen.img;
          
          // Téléchargement et upload vers Vercel Blob pour pérenniser l'image
          try {
            const imgRes = await fetch(gen.img);
            const blob = await imgRes.blob();
            const fileBuffer = await blob.arrayBuffer();
            const blobData = await put(`studio-${id}.png`, fileBuffer, {
              access: "public",
            });
            imageUrl = blobData.url;
          } catch (uploadError) {
            console.error("Échec de l'upload vers Vercel Blob, utilisation de l'URL d'origine:", uploadError);
          }

          // Enregistrement en BDD
          const dbRecord = await createStudioImage({
            prompt,
            model,
            provider: "ai-horde",
            url: imageUrl,
            ratio,
            userId,
            loras,
            denoisingStrength: denoisingStrength?.toString(),
          });
          
          savedImages.push(dbRecord[0]);

          // Créditer 10 XP à l'utilisateur pour l'image
          await creditXP({
            userId,
            amount: 10,
            reason: "Image générée",
          }).catch(err => console.error("Failed to credit XP for image:", err));

          // Vérifier et débloquer les badges
          await checkAndUnlockBadges(userId);
        }

        return Response.json({ images: savedImages });
      }

      if (checkData.faulted) {
        return Response.json(
          { error: "La génération a échoué sur AI Horde" },
          { status: 500 }
        );
      }
    }

    return Response.json(
      { error: "Timeout — la génération a pris trop de temps" },
      { status: 504 }
    );
  } catch (error) {
    console.error("Erreur AI Horde:", error);
    return Response.json(
      { error: "Impossible de contacter AI Horde" },
      { status: 502 }
    );
  }
}

/**
 * Convertit un ratio en taille pour l'API OpenAI-compatible
 */
function ratioToSize(ratio: string): string {
  switch (ratio) {
    case "16:9":
      return "1792x1024";
    case "4:5":
      return "1024x1280";
    case "1:1":
    default:
      return "1024x1024";
  }
}

/**
 * Convertit un ratio en dimensions width/height pour AI Horde
 */
function ratioToDimensions(ratio: string): { width: number; height: number } {
  switch (ratio) {
    case "16:9":
      return { width: 1024, height: 576 };
    case "4:5":
      return { width: 512, height: 640 };
    case "1:1":
    default:
      return { width: 512, height: 512 };
  }
}
