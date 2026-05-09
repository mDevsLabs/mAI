import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getUserCredits, deductCredits } from "@/lib/db/queries";
import { ChatbotError } from "@/lib/errors";
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return new ChatbotError("unauthorized:chat").toResponse();
    }

    const creditsData = await getUserCredits(session.user.id);

    return NextResponse.json(creditsData);
  } catch (error) {
    console.error("Failed to fetch credits:", error);
    return new ChatbotError("bad_request:database", "Failed to fetch credits").toResponse();
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new ChatbotError("unauthorized:chat").toResponse();
    }

    const { amount } = await request.json();

    if (!amount || typeof amount !== "number") {
      return new ChatbotError("bad_request:api", "Amount is required and must be a number").toResponse();
    }

    const updatedCredits = await deductCredits(session.user.id, amount);

    return NextResponse.json(updatedCredits);
  } catch (error) {
    console.error("Failed to deduct credits:", error);
    return new ChatbotError("bad_request:database", error instanceof Error ? error.message : "Failed to deduct credits").toResponse();
  }
}
