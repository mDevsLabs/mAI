import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

function section(markdown: string, heading: string): string {
  const marker = new RegExp(`(?:^|\\r?\\n)## ${heading}\\r?\\n`);
  const match = marker.exec(markdown);
  if (!match) return "";
  const start = match.index + match[0].length;
  const remainder = markdown.slice(start);
  const nextHeading = remainder.search(/\r?\n## /);
  return nextHeading >= 0 ? remainder.slice(0, nextHeading) : remainder;
}

function tableRows(markdown: string, benchmark: string): string[] {
  return markdown
    .split("\n")
    .map((line) => line.trim().replace(/\s+/g, " "))
    .filter((line) => line.startsWith(`| **${benchmark}**`));
}

describe("mAI-2 benchmark content", () => {
  const article = read("docs/news/introducing-mai-2/index.md");
  const fullModel = read("docs/mai-2/README.md");
  const miniModel = read("docs/mai-2-mini/README.md");
  const fullArticleSection = section(article, "mAI-2");
  const miniArticleSection = section(article, "mAI-2 Mini");

  it("uses the approved full-model comparison columns", () => {
    expect(article).toContain("Claude Opus 5.5");
    expect(article).toContain("GLM 5.3 Flash");
    expect(article).not.toMatch(/\|\s*Claude Opus 5\s*\|/);
    expect(article).not.toMatch(/\|\s*Gemini 3\.1 Pro\s*\|/);
  });

  it("uses the approved Mini comparison columns", () => {
    const miniHeader = article
      .split("\n")
      .find((line) => line.includes("mAI-2 Mini") && line.includes("GPT-6 Luna"));

    expect(miniHeader).toBeTruthy();
    expect(miniHeader).not.toContain("Claude Opus");
    expect(miniHeader).not.toContain("Gemini 3.1 Pro");
    expect(miniHeader).toContain("Gemini 3.8 Flash");
  });

  it.each([
    "Terminal-Bench 2.1",
    "DeepSWE v1.1",
    "AutomationBench",
    "Agents' Last Exam",
    "Humanity's Last Exam — avec outils",
  ])("keeps the full %s row synchronized", (benchmark) => {
    expect(tableRows(fullArticleSection, benchmark)).toEqual(
      tableRows(fullModel, benchmark),
    );
  });

  it.each([
    "SWE-Bench Pro",
    "Terminal-Bench 2.1",
    "SWE-fficiency",
    "KernelBench Hard",
    "MCP Atlas",
  ])("keeps the Mini %s row synchronized", (benchmark) => {
    expect(tableRows(miniArticleSection, benchmark)).toEqual(
      tableRows(miniModel, benchmark),
    );
  });

  it("does not substitute a different benchmark version", () => {
    expect(article).not.toMatch(/\|\s*Claude Opus 5\.5\s*\|[^|]*66,4\s*%/);
  });
});
