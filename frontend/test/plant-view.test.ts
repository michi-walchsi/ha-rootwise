import { describe, expect, it } from "vitest";
import {
  detail,
  entryDetail,
  findPlant,
  firstPlantDevice,
  hints,
  learnedHint,
  nextLine,
  toLocalInput,
  whenFor,
} from "../src/plant-view";
import type { HomeAssistant } from "../src/types";
import { plant } from "./fixtures";

const hass = { language: "de" } as unknown as HomeAssistant;

describe("findPlant", () => {
  const plants = [plant(), plant({ id: "p2", name: "Efeutute", device_id: "d2" })];

  it("finds by device, id or name", () => {
    expect(findPlant(plants, { device_id: "d2" })?.name).toBe("Efeutute");
    expect(findPlant(plants, { plant_id: "p1" })?.name).toBe("Monstera");
    expect(findPlant(plants, { plant: " efeutute " })?.id).toBe("p2");
    expect(findPlant(plants, {})).toBeUndefined();
  });
});

describe("detail", () => {
  it("explains a thirsty plant", () => {
    const p = plant({
      status: "thirsty",
      reasons: [{ code: "below_threshold", value: 19, threshold: 30 }],
    });
    expect(detail(hass, p)).toBe("Bodenfeuchte 19 % unter 30 %");
  });

  it("says freshly watered instead of alarming", () => {
    expect(detail(hass, plant({ moisture_level: "fresh" }))).toBe("Nass, frisch gegossen");
  });

  it("keeps climate hints apart", () => {
    const p = plant({ reasons: [{ code: "air_humidity_low", value: 41, min: 50 }] });
    expect(detail(hass, p)).toBe("Passt");
    expect(hints(hass, p)).toEqual(["Luft zu trocken: 41 %, mindestens 50 %"]);
  });
});

describe("whenFor", () => {
  const now = new Date(2026, 8, 27, 12, 7);

  it("maps the quick choices", () => {
    expect(whenFor("now", now)).toBeUndefined();
    expect(whenFor("hours", now)).toEqual(new Date(2026, 8, 27, 9, 7));
    expect(whenFor("yesterday", now)).toEqual(new Date(2026, 8, 26, 18, 0));
  });

  it("formats for the date-time input", () => {
    expect(toLocalInput(new Date(2026, 8, 6, 8, 5))).toBe("2026-09-06T08:05");
  });
});

describe("firstPlantDevice", () => {
  it("picks a Rootwise plant device", () => {
    const h = {
      entities: {
        "sensor.x": { entity_id: "sensor.x", platform: "mqtt", device_id: "m" },
        "sensor.monstera_status": {
          entity_id: "sensor.monstera_status",
          platform: "rootwise",
          device_id: "d1",
        },
      },
    } as unknown as HomeAssistant;
    expect(firstPlantDevice(h)).toBe("d1");
  });
});

describe("next watering", () => {
  const now = new Date(2026, 9, 3, 12, 0);
  const iso = (d: number, h = 12) => new Date(2026, 9, d, h).toISOString();

  it("says when, with a window", () => {
    const p = plant({
      next_watering: {
        due: iso(5),
        earliest: iso(4, 18),
        latest: iso(6, 8),
        confidence: "medium",
        rate: 2.2,
        method: "trend",
      },
    });
    const line = nextLine(hass, p, now);
    expect(line?.text).toBe("Nächstes Gießen übermorgen");
    // Weekday abbreviations differ between ICU versions ("So" or "So.").
    expect(line?.window).toMatch(/^\(So\.? – Di\.?\)$/);
  });

  it("is rough with low confidence and names the interval", () => {
    const rough = plant({
      next_watering: { due: iso(6), confidence: "low", method: "trend" },
    });
    expect(nextLine(hass, rough, now)?.text).toBe("Nächstes Gießen ungefähr in 3 Tagen");
    const interval = plant({ next_watering: { due: iso(9), method: "interval" } });
    expect(nextLine(hass, interval, now)?.text).toBe(
      "Nächstes Gießen in 6 Tagen (übliches Intervall)",
    );
  });

  it("says due and learning", () => {
    expect(nextLine(hass, plant({ next_watering: { due: iso(2), method: "trend" } }), now))
      .toEqual({ text: "Gießen ist fällig" });
    const learning = plant({
      next_watering: null,
      measurements: {
        soil_moisture: {
          value: 50,
          unit: "%",
          min: 20,
          max: 60,
          rating: "ok",
          level: "ok",
          range_source: "species",
          source: "sensor.x",
        },
      },
    });
    expect(nextLine(hass, learning, now)?.text).toContain("lernt noch");
    expect(nextLine(hass, plant({ next_watering: null }), now)).toBeNull();
  });
});

describe("learned thresholds", () => {
  const base = { waterings: 2, learned: [57, 85] as [number, number] };

  it("offers learned values when own ones differ", () => {
    const p = plant({ thresholds: { ...base, low: 60, high: 85, source: "custom" } });
    expect(learnedHint(hass, p)).toEqual({
      text: "Gelernt aus deinem Gießen: trocken 57 %, nass 85 %",
      canApply: true,
    });
  });

  it("stays quiet when they match, and explains learned ones", () => {
    const same = plant({ thresholds: { ...base, low: 58, high: 86, source: "custom" } });
    expect(learnedHint(hass, same)).toBeNull();
    const learned = plant({ thresholds: { ...base, low: 57, high: 85, source: "learned" } });
    expect(learnedHint(hass, learned)).toEqual({
      text: "Schwellen gelernt aus 2× Gießen",
      canApply: false,
    });
  });
});

describe("history detail", () => {
  const entry = { id: "e", plant_id: "p", ts: "", type: "watered", source: "card" };

  it("shows the moisture of manual entries and the rise of detected ones", () => {
    expect(entryDetail(hass, { ...entry, data: { moisture: 38 } })).toBe("38 % Bodenfeuchte");
    expect(
      entryDetail(hass, { ...entry, source: "auto", data: { before: 59.9, settled: 78.7 } }),
    ).toBe("erkannt · 60 → 79 %");
    expect(entryDetail(hass, entry)).toBe("");
  });
});
