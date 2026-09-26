import { describe, expect, it } from "vitest";

import {
  redactApiSecretJson,
  redactApiSecretText,
} from "@/lib/api-key-redaction";

describe("API secret redaction", () => {
  it("redacts a secret from text without leaking it", () => {
    const secret = "mai-pro-ABCDE-secretValue";
    const result = redactApiSecretText(`Bearer ${secret}`, secret);
    expect(result).toBe("Bearer [REDACTED]");
    expect(result).not.toContain(secret);
  });

  it("redacts sensitive fields and nested string values", () => {
    const secret = "mai-pro-ABCDE-secretValue";
    const result = redactApiSecretJson(
      {
        api_key: secret,
        authorization: `Bearer ${secret}`,
        nested: { message: `echo ${secret}` },
        safe: "visible",
      },
      secret,
    );

    expect(result).toEqual({
      api_key: "[REDACTED]",
      authorization: "[REDACTED]",
      nested: { message: "echo [REDACTED]" },
      safe: "visible",
    });
  });
});
