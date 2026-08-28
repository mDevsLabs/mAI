import { NextRequest, NextResponse } from "next/server";
import { authenticateOpenAIRequest } from "@/lib/openai-auth";
import { getUserImageUsage } from "@/app/actions/image-usage";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await authenticateOpenAIRequest(req);
  if (!auth.valid) {
    return auth.response;
  }

  const userId = auth.apiKeyId || req.headers.get("x-user-id") || "dev_user";
  const result = await getUserImageUsage(userId);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result.data);
}
