import { describe, expect, it } from "vitest";
import {
  bySeverity,
  checklist,
  dueLine,
  duePlants,
  inArea,
  summary,
  tile,
} from "../src/overview-view";
import type { HomeAssistant, Measurement } from "../src/types";
import { plant } from "./fixtures";

const hass = { language: "de" } as unknown as HomeAssistant;
const now = new Date(2026, 8, 27, 12, 7);

const soil = (value: number): Measurement => ({
  value,
  unit: "%",
  min: 30,
  max: 70,
  rating: value < 30 ? "low" : "ok",
  level: value < 30 ? "dry" : "ok",
  range_source: "species",
  source: "sensor.x",
});

const calathea = plant({
  id: "c",
  name: "Calathea",
  area: "Schlafzimmer",
  area_id: "schlafzimmer",
  status: "thirsty",
  needs_water: true,
  measurements: { soil_moisture: soil(11) },
});
const efeu = plant({
  id: "e",
  name: "Efeutute",
  area: "Küche",
  area_id: "kueche",
  status: "thirsty",
  needs_water: true,
  moisture_level: null,
  reasons: [{ code: "interval_due", days: 7 }],
});
const ficus = plant({
  id: "f",
  name: "Geigenfeige",
  reasons: [{ code: "illuminance_low", value: 120, min: 800 }],
});
const monstera = plant({ moisture_level: "fresh" });

describe("overview", () => {
  it("lists thirsty plants by name", () => {
    expect(duePlants([efeu, monstera, calathea]).map((p) => p.name)).toEqual([
      "Calathea",
      "Efeutute",
    ]);
  });

  it("keeps a ticked plant in its place", () => {
    const watered = { ...calathea, needs_water: false, status: "ok" as const };
    const rows = checklist([efeu, monstera, watered], (p) => p.id === "c");
    expect(rows.map((p) => p.name)).toEqual(["Calathea", "Efeutute"]);
  });

  it("describes why a plant is due", () => {
    expect(dueLine(hass, calathea)).toBe("Schlafzimmer · 11 %");
    expect(dueLine(hass, efeu)).toBe("Küche · Fällig nach 7 Tagen");
  });

  it("sums up the day", () => {
    expect(summary(hass, [calathea, efeu, ficus, monstera])).toBe(
      "2 brauchen heute Wasser · 1 Hinweis",
    );
    expect(summary(hass, [monstera])).toBe("Niemand hat Durst");
  });

  it("filters by room", () => {
    expect(inArea([calathea, efeu], "kueche")).toEqual([efeu]);
    expect(inArea([calathea, efeu])).toHaveLength(2);
  });

  it("gives tiles a colour and a few words", () => {
    expect(tile(hass, ficus, now)).toEqual({ color: "var(--rw-warn)", text: "Licht zu niedrig" });
    expect(tile(hass, monstera, now).text).toBe("Nass, frisch gegossen");
    expect(
      tile(hass, plant({ moisture_level: null, last_watered: new Date(2026, 8, 24).toISOString() }), now)
        .text,
    ).toBe("vor 3 Tagen");
  });

  it("sorts problems first", () => {
    expect(bySeverity([monstera, ficus, calathea]).map((p) => p.name)).toEqual([
      "Calathea",
      "Geigenfeige",
      "Monstera",
    ]);
  });
});
