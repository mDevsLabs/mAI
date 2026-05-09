/**
 * API Route pour récupérer les images du Studio
 * 
 * @version 0.0.4
 */
import { auth } from "@/app/(auth)/auth";
import { getStudioImages } from "@/lib/db/queries";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const images = await getStudioImages(session.user.id);
    return Response.json({ images });
  } catch (error) {
    console.error("Erreur récupération images Studio:", error);
    return Response.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}
