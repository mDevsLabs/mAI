import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  activeProjects,
  allProjects,
  publicArchivedProjects,
} from "@/lib/projects-data";

describe("public project catalogue", () => {
  it("keeps the five active project names", () => {
    expect(activeProjects.map(({ name }) => name)).toEqual([
      "Vibe",
      "Web",
      "Pulse",
      "CLI",
      "Coder",
    ]);
  });

  it("publishes only the three selected archives", () => {
    expect(publicArchivedProjects.map(({ id }) => id)).toEqual([
      "msearch",
      "openprovider",
      "snob",
    ]);
  });

  it("preserves historical archives outside the public list", () => {
    expect(allProjects.length).toBeGreaterThan(
      activeProjects.length + publicArchivedProjects.length,
    );
    expect(allProjects.some(({ id }) => id === "mai-legacy")).toBe(true);
  });

  it("removes the team page so /about resolves as not found", () => {
    expect(existsSync(join(process.cwd(), "app/about/page.tsx"))).toBe(false);
  });

  it("does not expose development status on active project data", () => {
    expect(activeProjects.every((project) => project.label === undefined)).toBe(true);
  });
});
