import { describe, expect, it } from "vitest";
import { SENSOR_ROLES, initialSensors, nameFor, sizeFor, summary } from "../src/wizard";
import type { HomeAssistant, SensorSuggestions } from "../src/types";

const de = { language: "de" } as HomeAssistant;

function candidate(entity_id: string, area: string | null, in_use = false) {
  return { entity_id, name: entity_id, state: "40", unit: "%", area, in_use };
}

const suggestions: SensorSuggestions = {
  suggested: { temperature_sensor: "sensor.probe_temperature" },
  candidates: {
    moisture_sensor: [
      candidate("sensor.used_soil", "Wohnzimmer", true),
      candidate("sensor.kitchen_soil", "Küche"),
      candidate("sensor.free_soil", "Wohnzimmer"),
    ],
    temperature_sensor: [candidate("sensor.probe_temperature", "Wohnzimmer")],
    humidity_sensor: [],
    illuminance_sensor: [],
    conductivity_sensor: [],
    battery_sensor: [],
  },
};

describe("initialSensors", () => {
  it("takes the suggestions and a free soil sensor of the room", () => {
    const picked = initialSensors(suggestions, "Wohnzimmer");
    expect(picked.moisture_sensor).toBe("sensor.free_soil");
    expect(picked.temperature_sensor).toBe("sensor.probe_temperature");
    expect(picked.humidity_sensor).toBeNull();
    expect(Object.keys(picked)).toEqual([...SENSOR_ROLES]);
  });

  it("doesn't guess a soil sensor from another room", () => {
    expect(initialSensors(suggestions, "Bad").moisture_sensor).toBeNull();
    expect(initialSensors(suggestions, null).moisture_sensor).toBeNull();
  });
});

describe("sizeFor", () => {
  it("finds the size chip of a diameter", () => {
    expect(sizeFor(10)).toBe("s");
    expect(sizeFor(18)).toBe("m");
    expect(sizeFor(24)).toBe("l");
    expect(sizeFor(40)).toBe("xl");
  });
});

describe("nameFor", () => {
  it("proposes the common name, else the label", () => {
    expect(nameFor({ kind: "offline", id: "monstera_deliciosa", label: "Monstera (Monstera deliciosa)", common: "Monstera" })).toBe(
      "Monstera",
    );
    expect(nameFor({ kind: "opb", pid: "ficus lyrata", label: "Ficus lyrata", common: null })).toBe("Ficus lyrata");
    expect(nameFor(null)).toBe("");
  });
});

describe("summary", () => {
  it("names room, sensors and pot like the mockup", () => {
    const picked = { ...initialSensors(suggestions, "Wohnzimmer"), humidity_sensor: "sensor.room_humidity" };
    expect(summary(de, "Wohnzimmer", picked, 24)).toBe("Wohnzimmer · 3 Sensoren · Topf 24 cm");
    expect(summary(de, null, initialSensors(suggestions, null), 12)).toBe("1 Sensor · Topf 12 cm");
  });
});
