/**
 * ============================================================================
 * VIBE SOCIAL PLATFORM — COMMON HELPERS (vibe-common.ts)
 * Shared utilities for routes, JWT extraction & multi-alias registration
 * ============================================================================
 */

import type { Hono } from "npm:hono@4";
import { extractToken, verifyToken, getDb } from "./config.ts";

export type RegisterMultiFn = (
  method: "get" | "post" | "delete",
  paths: string[],
  handler: (c: any) => Promise<any> | any
) => void;

/**
 * Creates a helper that registers multiple alias paths for a single route handler
 */
export function createRegisterMulti(app: Hono): RegisterMultiFn {
  return (
    method: "get" | "post" | "delete",
    paths: string[],
    handler: (c: any) => Promise<any> | any
  ) => {
    for (const p of paths) {
      if (method === "get") app.get(p, handler);
      else if (method === "post") app.post(p, handler);
      else if (method === "delete") app.delete(p, handler);
    }
  };
}

/**
 * Extracts and verifies the JWT user ID from request headers
 */
export async function getAuthUserId(c: any): Promise<number | null> {
  try {
    const token = extractToken(c.req.raw);
    if (!token) return null;
    const payload = await verifyToken(token);
    const userId = Number(payload.sub || (payload as any).id || (payload as any).userId);
    if (!userId || isNaN(userId)) return null;
    return userId;
  } catch {
    return null;
  }
}
