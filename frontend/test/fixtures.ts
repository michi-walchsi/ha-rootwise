import type { Plant } from "../src/types";

export function plant(overrides: Partial<Plant> = {}): Plant {
  return {
    id: "p1",
    name: "Monstera",
    device_id: "d1",
    area_id: "wohnzimmer",
    area: "Wohnzimmer",
    entity_ids: { status: "sensor.monstera_status" },
    status: "ok",
    moisture_level: "ok",
    needs_water: false,
    reasons: [],
    snoozed_until: null,
    last_watered: null,
    species: { scientific: "Monstera deliciosa", common: "Monstera", image_url: null, source: "openplantbook" },
    measurements: {},
    next_watering: null,
    thresholds: null,
    recent: [],
    ...overrides,
  };
}
