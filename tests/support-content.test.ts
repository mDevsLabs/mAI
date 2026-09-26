import { describe, expect, it } from "vitest";

import {
  SUPPORT_CONTENT_CATEGORIES,
  SUPPORT_FAQS,
  SUPPORT_GUIDES,
} from "@/lib/support-content";

describe("support content", () => {
  it("provides non-empty typed FAQ entries", () => {
    expect(SUPPORT_FAQS.length).toBeGreaterThanOrEqual(6);
    expect(
      SUPPORT_FAQS.every(
        (entry) => entry.id && entry.question.trim() && entry.answer.trim(),
      ),
    ).toBe(true);
  });

  it("uses unique stable identifiers", () => {
    const ids = [...SUPPORT_FAQS, ...SUPPORT_GUIDES].map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("references known support categories", () => {
    const categoryIds = new Set(
      SUPPORT_CONTENT_CATEGORIES.map((category) => category.id),
    );
    expect(
      [...SUPPORT_FAQS, ...SUPPORT_GUIDES].every((entry) =>
        categoryIds.has(entry.category),
      ),
    ).toBe(true);
  });

  it("uses internal links or explicitly marked external links", () => {
    expect(
      SUPPORT_FAQS.every(
        (entry) =>
          !entry.link ||
          entry.link.href.startsWith("/") ||
          entry.link.external === true,
      ),
    ).toBe(true);
  });
});
