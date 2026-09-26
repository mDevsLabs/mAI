import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  API_ROUTE_DEFINITIONS,
  isAllowedExecutorRoute,
  isPublicExecutorRoute,
} from "@/lib/api-key-routes";

const ROOT = process.cwd();
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

describe("server API security boundaries", () => {
  it("does not trust x-user-id or a tier encoded in an unverified key", () => {
    const middleware = read("api-middleware.ts");
    expect(middleware).not.toMatch(/\.header\(["']x-user-id["']/i);
    expect(middleware).not.toMatch(/\.get\(["']x-user-id["']/i);
    expect(middleware).not.toContain("extractTierFromApiKey");
  });

  it("does not forward x-user-id through the Next model proxy", () => {
    const route = read("app/api/v1/models/route.ts");
    expect(route).not.toMatch(/\.get\(["']x-user-id["']/i);
    expect(route).not.toMatch(/headers\[['"]x-user-id['"]\]/i);
    expect(route).toContain("authenticateCatalogRequest");
    expect(route).toContain("private, no-store");
  });

  it("uses an allowlisted fixed upstream in the browser request executor", () => {
    const executor = read("app/api/account/api-executor/route.ts");
    expect(executor).toContain("isAllowedRoute");
    expect(executor).toContain('fetch(`https://mai.val.run/${path}`');
    expect(executor).not.toContain("fetch(body.url");
    expect(executor).not.toContain("new URL(body.");
  });

  it("allowlists every route exposed by the request studio", () => {
    expect(API_ROUTE_DEFINITIONS.length).toBeGreaterThan(15);
    for (const route of API_ROUTE_DEFINITIONS) {
      expect(isAllowedExecutorRoute(route.method, route.path)).toBe(true);
    }
    expect(isAllowedExecutorRoute("GET", "v1/admin/users")).toBe(false);
    expect(isPublicExecutorRoute("GET", "v1/models")).toBe(true);
    expect(isPublicExecutorRoute("POST", "v1/chat/completions")).toBe(false);
  });
});
