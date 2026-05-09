/**
 * API Route pour mettre à jour ou supprimer une image du Studio
 * 
 * @version 0.0.4
 */
import { auth } from "@/app/(auth)/auth";
import { deleteStudioImage, toggleStudioImageFavorite } from "@/lib/db/queries";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { favorite } = await request.json();
    await toggleStudioImageFavorite(id, favorite);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Erreur mise à jour image Studio:", error);
    return Response.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteStudioImage(id);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression image Studio:", error);
    return Response.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
