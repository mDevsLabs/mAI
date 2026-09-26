import { describe, expect, it } from "vitest";

import {
  generateSecretKey,
  getApiKeyRef,
  isValidApiKeyRef,
} from "@/lib/api-key-manager";

describe("public API key references", () => {
  it("derives only the non-secret prefix from current key formats", () => {
    const { secretKey } = generateSecretKey("pro");
    const keyRef = getApiKeyRef(secretKey);

    expect(keyRef).toMatch(/^mai-pro-[A-Z0-9]{5}$/);
    expect(secretKey.startsWith(`${keyRef}-`)).toBe(true);
    expect(secretKey).not.toBe(keyRef);
    expect(isValidApiKeyRef(keyRef)).toBe(true);
  });

  it("supports legacy public prefixes without exposing their suffix", () => {
    expect(getApiKeyRef("mai_liveAbCdEfGhIjKl")).toBe("mai_liveAbC");
    expect(getApiKeyRef("mp-AbCdEfGhIjKlMnOp")).toBe("mp-AbCdEfGh");
    expect(isValidApiKeyRef("mai_liveAbC")).toBe(true);
    expect(isValidApiKeyRef("mp-AbCdEfGh")).toBe(true);
  });

  it("rejects hashes, wildcard-like values and incomplete references", () => {
    const hash = "a".repeat(64);
    expect(getApiKeyRef(hash)).toBeNull();
    expect(isValidApiKeyRef(hash)).toBe(false);
    expect(isValidApiKeyRef("mai-pro-ABCDE-")).toBe(false);
    expect(isValidApiKeyRef("mai-pro-%")).toBe(false);
  });
});
