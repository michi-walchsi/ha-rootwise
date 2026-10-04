import { describe, expect, it } from "vitest";
import { amountText, potLine, speciesFacts, toxicityInfo, wateringHow } from "../src/plant-info";
import type { HomeAssistant, Pot } from "../src/types";
import { plant } from "./fixtures";

const de = { language: "de" } as HomeAssistant;
const en = { language: "en" } as HomeAssistant;

const pot = (overrides: Partial<Pot> = {}): Pot => ({ ...plant().pot, ...overrides });

describe("amountText", () => {
  it("uses litres from one litre on", () => {
    expect(amountText(de, [1500, 1900])).toBe("ca. 1,5–1,9 l");
    expect(amountText(en, [1500, 1900])).toBe("about 1.5–1.9 l");
    expect(amountText(de, [600, 1000])).toBe("ca. 0,6–1 l");
  });

  it("uses millilitres below", () => {
    expect(amountText(de, [200, 300])).toBe("ca. 200–300 ml");
    expect(amountText(de, [50, 50])).toBe("ca. 50 ml");
  });

  it("is empty without a pot size", () => {
    expect(amountText(de, null)).toBeNull();
  });
});

describe("potLine", () => {
  it("names size, material and window", () => {
    expect(potLine(de, pot())).toBe("24 cm · Kunststoff · Fenster West");
  });

  it("says when water can't drain and leaves out a missing window", () => {
    expect(potLine(de, pot({ diameter: 14, material: "terracotta", window: "none", drainage: false }))).toBe(
      "14 cm · Terrakotta · ohne Abzugsloch",
    );
  });
});

describe("wateringHow", () => {
  it("fits the pot", () => {
    expect(wateringHow(de, pot())).toContain("bis unten Wasser austritt");
    expect(wateringHow(de, pot({ drainage: false }))).toContain("Kein Abzugsloch");
    expect(wateringHow(de, pot({ material: "self_watering" }))).toContain("Vorratsbehälter");
  });
});

describe("speciesFacts", () => {
  it("lists watering, light, climate and fertilizing", () => {
    const facts = speciesFacts(de, plant().species);
    expect(facts.map((f) => f.key)).toEqual(["watering", "light", "temperature", "humidity", "fertilize"]);
    const text = Object.fromEntries(facts.map((f) => [f.key, f.text]));
    expect(text.watering).toBe("Oben 3–5 cm antrocknen lassen, dann gründlich");
    expect(text.light).toBe("6–12 mol/m² am Tag");
    expect(text.temperature).toBe("18–27 °C");
    expect(text.humidity).toBe("ab 50 %");
    expect(text.fertilize).toBe("März bis September alle 3 Wochen");
  });

  it("skips what isn't known", () => {
    const species = { ...plant().species, watering_style: null, fertilize_weeks: null, dli: null, ranges: {} };
    expect(speciesFacts(de, species)).toEqual([]);
  });
});

describe("toxicityInfo", () => {
  it("rates cats, dogs and children, with substance and source", () => {
    const info = toxicityInfo(de, plant().species);
    expect(info?.badges.map((b) => `${b.who}: ${b.text}`)).toEqual([
      "Katzen: reizend",
      "Hunde: reizend",
      "Kinder: reizend",
    ]);
    expect(info?.note).toBe("Enthält Calciumoxalat.");
    expect(info?.source).toBe("Richtwerte nach ASPCA.");
  });

  it("says non-toxic plainly", () => {
    const species = plant().species;
    const safe = { ...species, toxicity: { cats: "none", dogs: "none", humans: "none", note: "", source: "x" } as const };
    expect(toxicityInfo(en, safe)?.badges.map((b) => b.text)).toEqual(["non-toxic", "non-toxic", "non-toxic"]);
    expect(toxicityInfo(en, safe)?.note).toBeNull();
  });

  it("is empty without data", () => {
    expect(toxicityInfo(de, { ...plant().species, toxicity: null })).toBeNull();
  });
});
