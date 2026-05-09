/**
 * API pour récupérer les statistiques de l'utilisateur (XP, Badges, Historique)
 * 
 * @version 0.0.7
 */
import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getUserXP, getUserBadges, getXPHistory } from "@/lib/db/queries";
import { ChatbotError } from "@/lib/errors";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return new ChatbotError("unauthorized:chat").toResponse();
    }

    const userId = session.user.id;

    const [xpData, badgesData, historyData] = await Promise.all([
      getUserXP(userId),
      getUserBadges(userId),
      getXPHistory(userId),
    ]);

    return NextResponse.json({
      xp: xpData[0]?.xp || 0,
      level: xpData[0]?.level || 1,
      badges: badgesData.map(b => b.badgeId),
      history: historyData,
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return new ChatbotError("bad_request:database", "Failed to fetch stats").toResponse();
  }
}
