import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(join(process.cwd(), "app/pricing/page.tsx"), "utf8");

describe("Max plan feature", () => {
  it("adds the priority access benefit only to Max", () => {
    expect(source).toContain("Accès prioritaire aux nouvelles fonctionnalités");
    expect(source.match(/Accès prioritaire aux nouvelles fonctionnalités/g)).toHaveLength(1);

    const maxStart = source.indexOf('id: "max"');
    const plusStart = source.indexOf('id: "plus"');
    const proStart = source.indexOf('id: "pro"');
    expect(maxStart).toBeGreaterThan(proStart);
    expect(source.slice(maxStart, source.indexOf("];", maxStart))).toContain(
      "priorityFeatures",
    );
    expect(source.slice(plusStart, maxStart)).not.toContain("priorityFeatures");
  });
});
