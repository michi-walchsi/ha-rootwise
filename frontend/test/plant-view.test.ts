import { describe, expect, it } from "vitest";
import {
  detail,
  findPlant,
  firstPlantDevice,
  hints,
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
