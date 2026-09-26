import { describe, expect, it } from "vitest";

import {
  checkLinkActive,
  checkSubActive,
  navLinks,
} from "@/components/navbar/navigation-config";

const more = navLinks.find((link) => link.name === "Plus");
const models = navLinks.find((link) => link.name === "Modèles");

if (!more || !models) {
  throw new Error("Configuration de navigation incomplète");
}

describe("navbar navigation configuration", () => {
  it("does not expose the removed team page", () => {
    expect(JSON.stringify(navLinks)).not.toContain("/about");
    expect(more.subitems?.map((item) => item.name)).toEqual([
      "Support",
      "Documentation",
      "Téléchargements",
    ]);
  });

  it("uses a real destination for the More menu", () => {
    expect(more.href).toBe("/support");
  });

  it("marks nested model routes as active", () => {
    const mai2 = models.subitems?.find((item) => item.name === "mAI-2");
    if (!mai2) throw new Error("Groupe mAI-2 absent");
    expect(checkSubActive(mai2, "/models/mai-2-mini")).toBe(true);
    expect(checkLinkActive(models, "/models/mai-2-mini")).toBe(true);
  });
});
