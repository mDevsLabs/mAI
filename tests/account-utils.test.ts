import { describe, expect, it } from "vitest";

import {
  formatResetDate,
  formatTokens,
  getSafeKeyPrefix,
} from "@/components/account/account-utils";

describe("account utils", () => {
  it("formats token quotas compactly", () => {
    expect(formatTokens(999)).toBe("999");
    expect(formatTokens(1_500)).toBe("1.5k");
    expect(formatTokens(2_000_000)).toBe("2M");
  });

  it("never returns a complete API secret as a public prefix", () => {
    const secret = "mai-pro-ABCDE-verySecretValue";
    expect(getSafeKeyPrefix(secret, "fallback")).toBe("mai-pro-ABCDE");
    expect(getSafeKeyPrefix(undefined, "fallback")).toBe("fallback");
  });

  it("handles missing reset dates", () => {
    expect(formatResetDate()).toBe("—");
    expect(formatResetDate("not-a-date")).toBe("not-a-date");
  });
});
