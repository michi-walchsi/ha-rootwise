import { describe, expect, it } from "vitest";
import { language, localize, TRANSLATIONS } from "../src/i18n";
import type { HomeAssistant } from "../src/types";

const hass = (lang: string) => ({ language: lang }) as unknown as HomeAssistant;

describe("localize", () => {
  it("fills in numbers the local way", () => {
    expect(localize(hass("de"), "hint.temperature_low", { value: 15.5, min: 18 })).toBe(
      "Zu kalt: 15,5 °C, mindestens 18 °C",
    );
  });

  it("falls back to English", () => {
    expect(language(hass("fr"))).toBe("en");
    expect(localize(hass("fr"), "action.water")).toBe("Watered");
  });

  it("returns the key for unknown texts", () => {
    expect(localize(hass("de"), "nope")).toBe("nope");
  });

  it("has every text in both languages", () => {
    expect(Object.keys(TRANSLATIONS.de ?? {}).sort()).toEqual(
      Object.keys(TRANSLATIONS.en ?? {}).sort(),
    );
  });
});
