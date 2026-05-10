import { auth } from "@/app/(auth)/auth";
import { ChatbotError } from "@/lib/errors";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/queries";
import { chat as chatTable, message as messageTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * API pour exporter toutes les données de l'utilisateur en JSON
 * @version 0.0.6
 */
export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  try {
    // Récupérer toutes les conversations de l'utilisateur
    const userChats = await db
      .select()
      .from(chatTable)
      .where(eq(chatTable.userId, session.user.id));

    const exportData: any[] = [];

    // Pour chaque conversation, récupérer les messages
    for (const chat of userChats) {
      const messages = await db
        .select()
        .from(messageTable)
        .where(eq(messageTable.chatId, chat.id));

      exportData.push({
        ...chat,
        messages,
      });
    }

    // Retourner le fichier JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="mai-export-${session.user.id}.json"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return new Response("Erreur lors de l'exportation", { status: 500 });
  }
}
