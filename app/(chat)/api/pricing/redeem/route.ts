import { auth } from "@/app/(auth)/auth";
import { ChatbotError } from "@/lib/errors";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/queries";
import { userCredits } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * API pour activer un forfait via un code
 * @version 0.1.0
 */
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  try {
    const { code } = await request.json();

    let plan = "free";
    let credits = 100;

    // Vérification des codes via les variables d'environnement
    if (code === process.env.CODE_PLUS) {
      plan = "plus";
      credits = 500;
    } else if (code === process.env.CODE_PRO) {
      plan = "pro";
      credits = 1500;
    } else if (code === process.env.CODE_MAX) {
      plan = "max";
      credits = 5000;
    } else {
      return NextResponse.json({ error: "Code invalide" }, { status: 400 });
    }

    // Mettre à jour les crédits et le forfait
    await db
      .update(userCredits)
      .set({ plan, credits, updatedAt: new Date() })
      .where(eq(userCredits.userId, session.user.id));

    return NextResponse.json({ success: true, plan, credits });
  } catch (error) {
    console.error("Failed to redeem code:", error);
    return new ChatbotError("bad_request:database", "Erreur lors de l'activation du code").toResponse();
  }
}
