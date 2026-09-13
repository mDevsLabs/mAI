import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

/**
 * Vérification serveur de la session mAI (JWT HS256 signé par le backend Val Town).
 * L'identité provient exclusivement du token signé — jamais d'un en-tête ou d'un champ fourni par le client.
 */

export type SessionIdentity = {
  userId: string;
  tier: string;
};

function getSecret(): Uint8Array | null {
  const secret = process.env.MAI_JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export async function verifyMaiSessionToken(
  token: string | null | undefined
): Promise<SessionIdentity | null> {
  const secret = getSecret();
  if (!secret || !token) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    const userId = typeof payload.sub === "string" ? payload.sub.trim() : "";
    if (!userId) return null;
    return {
      userId,
      tier: typeof payload.tier === "string" ? payload.tier : "Free",
    };
  } catch {
    return null;
  }
}

function extractToken(req: NextRequest): string {
  const authHeader = req.headers.get("authorization") || "";
  const bearer = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (bearer) return bearer;
  return req.cookies.get("mai_token")?.value || "";
}

export type SessionAuthResult =
  | { ok: true; identity: SessionIdentity }
  | { ok: false; response: NextResponse };

export async function authenticateSession(req: NextRequest): Promise<SessionAuthResult> {
  const identity = await verifyMaiSessionToken(extractToken(req));
  if (!identity) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: { code: "unauthorized", message: "Session invalide ou expirée. Reconnectez-vous." } },
        { status: 401 }
      ),
    };
  }
  return { ok: true, identity };
}

/** Pour les Server Actions : identité dérivée du cookie de session signé. */
export async function getSessionIdentity(): Promise<SessionIdentity | null> {
  const store = await cookies();
  const token = store.get("mai_token")?.value || "";
  return verifyMaiSessionToken(token);
}
