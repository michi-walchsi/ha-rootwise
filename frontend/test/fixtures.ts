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
    species: {
      scientific: "Monstera deliciosa",
      common: "Monstera",
      image_url: null,
      source: "openplantbook",
      watering_style: "mostly_dry",
      fertilize_weeks: 3,
      toxicity: {
        cats: "mild",
        dogs: "mild",
        humans: "mild",
        note: "calcium_oxalate",
        source: "https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants",
      },
      ranges: { temperature: { min: 18, max: 27 }, air_humidity: { min: 50, max: null } },
      dli: { min: 6, max: 12 },
    },
    photo: null,
    pot: {
      diameter: 24,
      material: "plastic",
      drainage: true,
      window: "w",
      location: "indoor",
      amount: [1500, 1900],
    },
    measurements: {},
    next_watering: null,
    thresholds: null,
    recent: [],
    ...overrides,
  };
}
