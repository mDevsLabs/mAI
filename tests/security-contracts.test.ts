import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

function readTree(relativePath: string): string {
  const walk = (directory: string): string =>
    readdirSync(directory, { withFileTypes: true })
      .map((entry) => {
        const path = join(directory, entry.name);
        return entry.isDirectory() ? walk(path) : readFileSync(path, "utf8");
      })
      .join("\n");

  const directory = join(ROOT, relativePath);
  return existsSync(directory) ? walk(directory) : "";
}

describe("security contracts", () => {
  it("keeps /api as a server redirect to the canonical keys page", () => {
    const source = read("app/api/page.tsx");
    expect(source).toContain('from "next/navigation"');
    expect(source).toContain('redirect("/account/keys")');
    expect(source).not.toContain('"use client"');
  });

  it("does not claim hash-only storage while the server still resolves stored secrets", () => {
    for (const path of [
      "components/onboarding/steps-main.config.ts",
      "components/onboarding/onboarding-card.tsx",
      "docs/documentation/2-authentification.md",
      "docs/news/cles-api-v2/index.md",
      "docs/news/api-v2/index.md",
      "docs/documentation/guide-security-privacy.md",
      "docs/documentation/politique-confidentialite-stockage.md",
      "docs/documentation/terms-and-licensing.md",
    ]) {
      const source = read(path).toLowerCase();
      expect(source).not.toContain("seul le hash");
      expect(source).not.toContain("seul le hachage");
    }
  });

  it("loads personalized model catalogues through the server route", () => {
    const config = readTree("app/account/config");
    expect(config).toContain("x-mai-key-ref");
    expect(config).toMatch(/fetch\(['"]\/api\/v1\/models['"]/);
    expect(config).not.toMatch(/fetch\(['"]https:\/\/mai\.val\.run\/v1\/models/);
    expect(config).toContain("VOTRE_CLE_API");
  });

  it("executes studio requests through the allowlisted server executor", () => {
    const requests = readTree("app/account/requests");
    expect(requests).toContain("/api/account/api-executor");
    expect(requests).toContain("VOTRE_CLE_API");
    expect(requests).not.toMatch(/Authorization["']?\s*:\s*`Bearer\s+\$\{selected/);
  });

  it("keeps stored API secrets out of non-management client screens", () => {
    for (const path of [
      "app/account/config",
      "app/account/requests",
      "app/account/models",
      "app/account/usage",
      "components/account/usage",
    ]) {
      const source = readTree(path);
      expect(source).not.toMatch(/\.apiKey\b/);
      expect(source).not.toMatch(/\.secretKey\b/);
    }
  });

  it("does not expose an existing secret field in public key metadata", () => {
    const source = read("lib/api-key-types.ts");
    const metadata = source.slice(
      source.indexOf("export interface ApiKeyMetadata"),
      source.indexOf("export interface CreatedApiKeyResult"),
    );

    expect(metadata).toContain("keyRef: string");
    expect(metadata).not.toMatch(/\bapiKey\??:/);
    expect(metadata).not.toMatch(/\bsecretKey\??:/);
  });
});
