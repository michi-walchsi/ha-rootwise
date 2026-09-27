// Fake Home Assistant for the card sandbox. Data resembles a real setup:
// a Monstera the day after watering, a thirsty Calathea, an Efeutute
// without sensor.

import * as mdi from "@mdi/js";
import "../src/index";
import type { HomeAssistant, JournalEntry, Plant, PlantsPayload } from "../src/types";

// ---- stand-ins for Home Assistant's own elements ------------------------------

class HaCard extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `<style>:host{display:block;background:var(--ha-card-background);
      border-radius:12px;border:1px solid var(--divider-color);color:var(--primary-text-color)}
      </style><slot></slot>`;
  }
}

class HaIcon extends HTMLElement {
  static observedAttributes = ["icon"];
  private readonly root = this.attachShadow({ mode: "open" });

  attributeChangedCallback(): void {
    // Shadow DOM like the real ha-icon: children would confuse Lit's templates.
    const name = (this.getAttribute("icon") ?? "").replace("mdi:", "");
    const key = `mdi${name.replace(/(^|-)(\w)/g, (_m, _d, c: string) => c.toUpperCase())}`;
    const path = (mdi as Record<string, string>)[key] ?? mdi.mdiHelpCircleOutline;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "currentColor");
    svg.setAttribute("aria-hidden", "true");
    svg.style.cssText = "width:var(--mdc-icon-size,24px);height:var(--mdc-icon-size,24px)";
    const shape = document.createElementNS("http://www.w3.org/2000/svg", "path");
    shape.setAttribute("d", path);
    svg.append(shape);
    this.style.display = "inline-flex";
    this.root.replaceChildren(svg);
  }
}

customElements.define("ha-card", HaCard);
customElements.define("ha-icon", HaIcon);

// ---- data -------------------------------------------------------------------

const now = Date.now();
const iso = (hoursAgo: number) => new Date(now - hoursAgo * 3_600_000).toISOString();

const plants: Plant[] = [
  {
    id: "p-calathea",
    name: "Calathea",
    device_id: "d-calathea",
    area_id: "schlafzimmer",
    area: "Schlafzimmer",
    entity_ids: { status: "sensor.calathea_status", snooze: "button.calathea_snooze" },
    status: "thirsty",
    moisture_level: "dry",
    needs_water: true,
    reasons: [
      { code: "below_threshold", value: 19, threshold: 35 },
      { code: "air_humidity_low", value: 41, min: 60 },
    ],
    snoozed_until: null,
    last_watered: iso(24 * 6),
    species: {
      scientific: "Goeppertia orbifolia",
      common: "Korbmarante",
      image_url: null,
      source: "openplantbook",
    },
    measurements: {
      soil_moisture: m(19, "%", 35, 75, "low", "dry"),
      temperature: m(20.8, "°C", 18, 27, "ok"),
      air_humidity: m(41, "%", 60, 90, "low"),
      illuminance: m(850, "lx", 500, 5000, "ok"),
    },
    recent: [entry("p-calathea", "watered", 24 * 6, "button", 33)],
  },
  {
    id: "p-efeu",
    name: "Efeutute",
    device_id: "d-efeu",
    area_id: "kueche",
    area: "Küche",
    entity_ids: { status: "sensor.efeutute_status" },
    status: "ok",
    moisture_level: null,
    needs_water: false,
    reasons: [],
    snoozed_until: null,
    last_watered: iso(72),
    species: {
      scientific: "Epipremnum aureum",
      common: "Efeutute",
      image_url: null,
      source: "offline",
    },
    measurements: {},
    recent: [entry("p-efeu", "watered", 72, "card")],
  },
  {
    id: "p-monstera",
    name: "Monstera",
    device_id: "d-monstera",
    area_id: "wohnzimmer",
    area: "Wohnzimmer",
    entity_ids: { status: "sensor.monstera_status", snooze: "button.monstera_snooze" },
    status: "ok",
    moisture_level: "fresh",
    needs_water: false,
    reasons: [],
    snoozed_until: null,
    last_watered: iso(1),
    species: {
      scientific: "Monstera deliciosa",
      common: "Monstera",
      image_url: "https://opb-img.plantbook.io/monstera%20deliciosa.jpg",
      source: "openplantbook",
    },
    measurements: {
      soil_moisture: m(74, "%", 20, 60, "ok", "fresh"),
      temperature: m(22.5, "°C", 12, 32, "ok"),
      air_humidity: m(48, "%", 30, 85, "ok"),
      battery: m(87, "%", 15, null, "ok"),
    },
    recent: [
      entry("p-monstera", "watered", 1, "button", 76),
      entry("p-monstera", "watered", 18, "card", 31),
      entry("p-monstera", "fertilized", 24 * 12, "card", 45),
    ],
  },
  {
    id: "p-ficus",
    name: "Geigenfeige",
    device_id: "d-ficus",
    area_id: "wohnzimmer",
    area: "Wohnzimmer",
    entity_ids: { status: "sensor.geigenfeige_status" },
    status: "ok",
    moisture_level: "ok",
    needs_water: false,
    reasons: [{ code: "illuminance_low", value: 120, min: 800 }],
    snoozed_until: null,
    last_watered: iso(24 * 4),
    species: { scientific: "Ficus lyrata", common: "Geigenfeige", image_url: null, source: "offline" },
    measurements: {
      soil_moisture: m(44, "%", 25, 65, "ok", "ok"),
      illuminance: m(120, "lx", 800, 20000, "low"),
    },
    recent: [],
  },
  {
    id: "p-zz",
    name: "Zamioculcas",
    device_id: "d-zz",
    area_id: "kueche",
    area: "Küche",
    entity_ids: { status: "sensor.zamioculcas_status" },
    status: "thirsty",
    moisture_level: null,
    needs_water: true,
    reasons: [{ code: "interval_due", days: 21 }],
    snoozed_until: null,
    last_watered: iso(24 * 22),
    species: { scientific: "Zamioculcas zamiifolia", common: "Glücksfeder", image_url: null, source: "offline" },
    measurements: {},
    recent: [],
  },
];

function m(
  value: number,
  unit: string,
  min: number | null,
  max: number | null,
  rating: "low" | "ok" | "high",
  level: Plant["moisture_level"] = null,
) {
  return { value, unit, min, max, rating, level, range_source: "openplantbook", source: "sensor.x" };
}

function entry(
  plantId: string,
  type: string,
  hoursAgo: number,
  source: string,
  moisture?: number,
): JournalEntry {
  return {
    id: `${plantId}-${type}-${hoursAgo}`,
    plant_id: plantId,
    ts: iso(hoursAgo),
    type,
    source,
    user_id: "u1",
    ...(moisture === undefined ? {} : { data: { moisture } }),
  };
}

// ---- fake connection ----------------------------------------------------------

const initial = structuredClone(plants);

const listeners = new Set<(p: PlantsPayload) => void>();
const payload = (): PlantsPayload => ({
  loaded: true,
  vacation: false,
  plants: structuredClone(plants),
});
const push = () => listeners.forEach((fn) => fn(payload()));

const connection = {
  async subscribeMessage<T>(callback: (message: T) => void) {
    const fn = callback as unknown as (p: PlantsPayload) => void;
    listeners.add(fn);
    setTimeout(() => fn(payload()), 50);
    return async () => {
      listeners.delete(fn);
    };
  },
};

async function callWS<T>(message: Record<string, unknown>): Promise<T> {
  await new Promise((r) => setTimeout(r, 150));
  const plant = plants.find((p) => p.id === message.plant_id);
  if (message.type === "rootwise/care/log" && plant) {
    const ts = (message.when as string | undefined) ?? new Date().toISOString();
    const logged: JournalEntry = {
      id: crypto.randomUUID(),
      plant_id: plant.id,
      ts,
      type: String(message.care_type),
      source: "card",
      user_id: "u1",
    };
    const moisture = plant.measurements.soil_moisture?.value;
    if (moisture != null && !message.when) logged.data = { moisture };
    plant.recent = [logged, ...plant.recent]
      .sort((a, b) => b.ts.localeCompare(a.ts))
      .slice(0, 5);
    if (logged.type === "watered") {
      plant.last_watered = plant.recent.find((e) => e.type === "watered")?.ts ?? ts;
      plant.needs_water = false;
      plant.status = "ok";
    }
    push();
    return { entry: logged } as T;
  }
  if (message.type === "rootwise/care/delete") {
    for (const p of plants) {
      p.recent = p.recent.filter((e) => e.id !== message.entry_id);
      // Like the real backend re-evaluating: back to the state before watering.
      const before = initial.find((i) => i.id === p.id);
      p.last_watered =
        p.recent.find((e) => e.type === "watered")?.ts ?? before?.last_watered ?? null;
      if (before && p.last_watered === before.last_watered) {
        p.status = before.status;
        p.needs_water = before.needs_water;
      }
    }
    push();
  }
  return {} as T;
}

function hass(dark: boolean): HomeAssistant {
  return {
    connection,
    callWS,
    language: "de",
    user: { id: "u1", is_admin: true },
    themes: { darkMode: dark },
  };
}

// ---- page --------------------------------------------------------------------

for (const [id, dark] of [
  ["light", false],
  ["dark", true],
] as const) {
  const frame = document.getElementById(id);
  const overview = document.createElement("rootwise-overview-card");
  overview.setConfig({ type: "custom:rootwise-overview-card" });
  overview.hass = hass(dark);
  frame?.append(overview);
  for (const plant of ["d-monstera", "d-calathea"]) {
    const card = document.createElement("rootwise-plant-card");
    card.setConfig({ type: "custom:rootwise-plant-card", device_id: plant, show_history: plant === "d-monstera" });
    card.hass = hass(dark);
    frame?.append(card);
  }
}
