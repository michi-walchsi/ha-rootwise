// Fake Home Assistant for the sandbox pages. Data resembles a real setup:
// a Monstera the day after watering, a thirsty Calathea, an Efeutute
// without sensor.

import * as mdi from "@mdi/js";
import type {
  CalibrationState,
  ChartPoint,
  PhotoEntry,
  PhotoInfo,
  HistoryPayload,
  HomeAssistant,
  JournalEntry,
  Plant,
  PlantsPayload,
  Pot,
  Species,
} from "../src/types";

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

type BasePlant = Omit<Plant, "next_watering" | "thresholds" | "pot" | "species" | "photo" | "calibration"> & {
  species: Pick<Species, "scientific" | "common" | "image_url" | "source">;
};

const base: BasePlant[] = [
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
      { ...entry("p-monstera", "watered", 18, "auto"), data: { before: 59.9, peak: 92, settled: 78.7 } },
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

const inHours = (hours: number) => new Date(now + hours * 3_600_000).toISOString();
const extras: Record<string, Pick<Plant, "next_watering" | "thresholds">> = {
  "p-monstera": {
    next_watering: {
      due: inHours(50),
      earliest: inHours(38),
      latest: inHours(70),
      confidence: "medium",
      rate: 2.2,
      method: "trend",
    },
    thresholds: { low: 60, high: 85, source: "custom", learned: [57, 85], waterings: 2 },
  },
  "p-calathea": {
    next_watering: { due: iso(5), confidence: "medium", rate: 3.1, method: "trend" },
    thresholds: { low: 35, high: 75, source: "learned", learned: [35, 75], waterings: 3 },
  },
  "p-efeu": { next_watering: { due: inHours(96), method: "interval" }, thresholds: null },
  "p-ficus": {
    next_watering: { due: inHours(120), confidence: "low", rate: 1.1, method: "trend" },
    thresholds: { low: 25, high: 65, source: "species", learned: null, waterings: 0 },
  },
  "p-zz": { next_watering: { due: iso(24), method: "interval" }, thresholds: null },
};
const ASPCA = "https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants";
type Care = Omit<Species, "scientific" | "common" | "image_url" | "source">;
const care: Record<string, { species: Care; pot: Pot }> = {
  "p-monstera": {
    species: {
      watering_style: "mostly_dry",
      fertilize_weeks: 3,
      toxicity: { cats: "mild", dogs: "mild", humans: "mild", note: "calcium_oxalate", source: ASPCA },
      ranges: { temperature: { min: 18, max: 27 }, air_humidity: { min: 50, max: null } },
      dli: { min: 6, max: 12 },
    },
    pot: { diameter: 24, material: "plastic", drainage: true, window: "w", location: "indoor", amount: [1500, 1900] },
  },
  "p-calathea": {
    species: {
      watering_style: "evenly_moist",
      fertilize_weeks: 4,
      toxicity: { cats: "none", dogs: "none", humans: "none", note: "", source: ASPCA },
      ranges: { temperature: { min: 18, max: 27 }, air_humidity: { min: 60, max: null } },
      dli: { min: 3, max: 8 },
    },
    pot: { diameter: 17, material: "ceramic_glazed", drainage: true, window: "n", location: "indoor", amount: [700, 900] },
  },
  "p-efeu": {
    species: {
      watering_style: "slightly_dry",
      fertilize_weeks: 4,
      toxicity: { cats: "mild", dogs: "mild", humans: "mild", note: "calcium_oxalate", source: ASPCA },
      ranges: { temperature: { min: 15, max: 30 }, air_humidity: { min: 40, max: null } },
      dli: { min: 4, max: 10 },
    },
    pot: { diameter: 14, material: "terracotta", drainage: false, window: "e", location: "indoor", amount: [300, 500] },
  },
};
const noCare: { species: Care; pot: Pot } = {
  species: { watering_style: null, fertilize_weeks: null, toxicity: null, ranges: {}, dli: null },
  pot: { diameter: 18, material: "plastic", drainage: true, window: "none", location: "indoor", amount: [600, 1000] },
};
const plants: Plant[] = base.map((p) => {
  const extra = care[p.id] ?? noCare;
  return {
    ...p,
    species: { ...p.species, ...extra.species },
    pot: extra.pot,
    photo: null,
    calibration: null,
    ...(extras[p.id] ?? { next_watering: null, thresholds: null }),
  };
});

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

// ---- chart data ----------------------------------------------------------------

const HOUR = 3_600_000;

/** A pot drying with a daily wobble; each watering jumps, then drains a little. */
export function fakeHistory(plantId: string, days: number): HistoryPayload {
  const plant = plants.find((p) => p.id === plantId);
  const end = now;
  const step = days > 16 ? 4 : 2;
  // Whole-hour bins, as the backend sends them.
  const start = Math.floor((end - days * 24 * HOUR) / (step * HOUR)) * step * HOUR;
  const curves: Record<string, { from: number; rate: number; waterings: [number, number, number][] }> = {
    // [hours ago, peak, settled]
    "p-monstera": { from: 66, rate: 1.7, waterings: [[24 * 12.5, 88, 79], [18, 92, 78.7]] },
    "p-calathea": { from: 58, rate: 3.4, waterings: [[24 * 11, 81, 74], [24 * 6, 79, 72]] },
    "p-ficus": { from: 52, rate: 1.4, waterings: [[24 * 9, 70, 63]] },
  };
  const curve = curves[plantId];
  if (!plant || !curve) {
    return { start: iso((end - start) / HOUR), end: iso(0), step: step * 3600, points: [], thresholds: null, forecast: null, events: [] };
  }
  const value = (t: number): [number, number] => {
    let level = curve.from - ((t - start) / (24 * HOUR)) * curve.rate;
    let peak = level;
    for (const [ago, top, settled] of curve.waterings) {
      const at = end - ago * HOUR;
      if (t < at) continue;
      const drained = Math.min(1, (t - at) / (6 * HOUR));
      level = settled - ((t - at) / (24 * HOUR)) * curve.rate + (top - settled) * (1 - drained);
      peak = t - at < step * HOUR ? top : level;
    }
    const wobble = Math.sin(((t / HOUR) % 24) / 24 * 2 * Math.PI) * 0.7;
    return [level + wobble, peak + wobble];
  };
  const points: ChartPoint[] = [];
  for (let t = start; t < end; t += step * HOUR) {
    const [mean, peak] = value(t);
    points.push([t, +mean.toFixed(1), +(mean - 0.6).toFixed(1), +Math.max(mean + 0.6, peak).toFixed(1)]);
  }
  const next = plant.next_watering;
  const last = points.at(-1)?.[1] ?? 0;
  return {
    start: new Date(start).toISOString(),
    end: new Date(end).toISOString(),
    step: step * 3600,
    points,
    thresholds: plant.thresholds,
    calibration: plant.calibration ? { dry: plant.calibration.dry, wet: plant.calibration.wet } : null,
    forecast:
      next?.method === "trend" && next.earliest && next.latest && new Date(next.due).getTime() > now
        ? { due: next.due, earliest: next.earliest, latest: next.latest, level: last, rate: next.rate ?? 0, confidence: next.confidence ?? "low" }
        : null,
    events: [
      ...curve.waterings.map(([ago], i) => ({
        ts: iso(ago),
        type: "watered",
        source: i === curve.waterings.length - 1 && plantId === "p-monstera" ? "auto" : "card",
      })),
      ...(plantId === "p-monstera" ? [{ ts: iso(24 * 12), type: "fertilized", source: "card" }] : []),
    ].filter((e) => new Date(e.ts).getTime() >= start),
  };
}

// ---- photos --------------------------------------------------------------------

interface FakePhoto {
  entry: PhotoEntry;
  blob: Blob;
}

const photos = new Map<string, FakePhoto[]>(); // newest first
const covers = new Map<string, string>();

function coverOf(plantId: string): PhotoInfo | null {
  const list = photos.get(plantId) ?? [];
  const photo = list.find((p) => p.entry.photo_id === covers.get(plantId)) ?? list[0];
  if (!photo) return null;
  const { photo_id: id, ts, width, height } = photo.entry;
  return { id, ts, width, height };
}

/** A made-up plant photo: leaves in a pot, drawn on a canvas. */
function samplePhoto(seed: number): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("canvas"));
  const sky = ctx.createLinearGradient(0, 0, 0, 900);
  sky.addColorStop(0, seed % 2 ? "#e9e4d8" : "#dfe8e2");
  sky.addColorStop(1, "#b9b2a3");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1200, 900);
  for (let i = 0; i < 9 + seed * 3; i++) {
    const angle = -Math.PI / 2 + (i - 5) * 0.32;
    const x = 600 + Math.cos(angle) * (180 + (i % 3) * 60);
    const y = 520 + Math.sin(angle) * (230 + (i % 2) * 50);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillStyle = `hsl(${128 + (i % 4) * 6}, 45%, ${24 + (i % 3) * 6}%)`;
    ctx.beginPath();
    ctx.ellipse(0, 0, 70, 120, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = "#a35a3a";
  ctx.beginPath();
  ctx.moveTo(470, 640);
  ctx.lineTo(730, 640);
  ctx.lineTo(700, 880);
  ctx.lineTo(500, 880);
  ctx.closePath();
  ctx.fill();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("jpeg"))), "image/jpeg", 0.85),
  );
}

async function addPhoto(plantId: string, blob: Blob, note: string | null, hoursAgo = 0): Promise<JournalEntry> {
  const bitmap = await createImageBitmap(blob);
  const id = `PH${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const ts = iso(hoursAgo);
  const entry: PhotoEntry = {
    entry_id: crypto.randomUUID(),
    photo_id: id,
    ts,
    width: bitmap.width,
    height: bitmap.height,
    note,
    user_id: "u1",
  };
  bitmap.close();
  photos.set(plantId, [{ entry, blob }, ...(photos.get(plantId) ?? [])]);
  const journal: JournalEntry = {
    id: entry.entry_id,
    plant_id: plantId,
    ts,
    type: "photo",
    source: "card",
    user_id: "u1",
    ...(note ? { note } : {}),
  };
  const plant = plants.find((p) => p.id === plantId);
  if (plant) {
    plant.photo = coverOf(plantId);
    plant.recent = [journal, ...plant.recent].sort((a, b) => b.ts.localeCompare(a.ts)).slice(0, 5);
  }
  push();
  return journal;
}

async function fetchWithAuth(path: string, init?: RequestInit): Promise<Response> {
  await new Promise((r) => setTimeout(r, 120));
  const upload = /^\/api\/rootwise\/photos\/([^/]+)$/.exec(path);
  if (upload?.[1] && init?.method === "POST") {
    const form = init.body as FormData;
    const file = form.get("file");
    if (!(file instanceof Blob)) return new Response(JSON.stringify({ message: "No photo" }), { status: 400 });
    const note = form.get("note");
    const entry = await addPhoto(decodeURIComponent(upload[1]), file, typeof note === "string" ? note : null);
    return new Response(JSON.stringify({ entry }));
  }
  const get = /^\/api\/rootwise\/photos\/([^/]+)\/([^/?]+)/.exec(path);
  const photo = get?.[1] && get[2]
    ? photos.get(decodeURIComponent(get[1]))?.find((p) => p.entry.photo_id === decodeURIComponent(get[2] ?? ""))
    : undefined;
  if (photo) return new Response(photo.blob, { headers: { "Content-Type": "image/jpeg" } });
  return new Response(JSON.stringify({ message: "Unknown photo" }), { status: 404 });
}

void (async () => {
  await addPhoto("p-monstera", await samplePhoto(0), "Erstes neues Blatt", 24 * 21);
  await addPhoto("p-monstera", await samplePhoto(1), null, 24 * 3);
})();

// ---- calibration ---------------------------------------------------------------

type Pending = NonNullable<CalibrationState["pending"]>;
const pendingCalibration = new Map<string, Pending>([
  // The Calathea: dry saved, watered three hours ago, measuring.
  [
    "p-calathea",
    { phase: "measuring", dry: 19, wet: null, watered_at: iso(3), value: 63.4, hours: 1 },
  ],
]);
const suggestions: Record<string, CalibrationState["suggestion"]> = {
  "p-monstera": { dry: 55, wet: 77.5, waterings: 2 },
};

function calibrationState(plant: Plant): CalibrationState {
  const style = plant.species.watering_style;
  const scale: [number, number] =
    style === "dry_out" ? [5, 60] : style === "mostly_dry" ? [15, 80] : style === "evenly_moist" ? [50, 97] : [30, 90];
  return {
    calibration: plant.calibration,
    pending: pendingCalibration.get(plant.id) ?? null,
    suggestion: suggestions[plant.id] ?? null,
    current: plant.measurements.soil_moisture?.value ?? null,
    style,
    scale,
  };
}

function setCalibration(plant: Plant, dry: number, wet: number): void {
  plant.calibration = { dry, wet, at: new Date().toISOString(), outdated: false };
  pendingCalibration.delete(plant.id);
  // Like the backend: thresholds from the watering style on the new scale.
  const [lowPct, highPct] = calibrationState(plant).scale;
  const raw = (pct: number) => Math.round((dry + (pct / 100) * (wet - dry)) * 10) / 10;
  if (plant.thresholds) {
    plant.thresholds = { ...plant.thresholds, low: raw(lowPct), high: raw(highPct), source: "calibrated" };
  }
  const reading = plant.measurements.soil_moisture;
  if (reading?.value != null) {
    reading.calibrated = Math.round(Math.min(110, Math.max(0, ((reading.value - dry) / (wet - dry)) * 100)));
    reading.min = raw(lowPct);
    reading.max = raw(highPct);
  }
  push();
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
  if (message.type === "rootwise/plant/history") {
    return fakeHistory(String(message.plant_id), Number(message.days ?? 14)) as T;
  }
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
  if (String(message.type).startsWith("rootwise/calibration/") && plant) {
    const step = String(message.type).split("/").at(-1);
    if (step === "dry") {
      const current = plant.measurements.soil_moisture?.value ?? null;
      const before = pendingCalibration.get(plant.id);
      pendingCalibration.set(plant.id, {
        phase: before?.wet != null ? "done" : "need_wet",
        dry: current,
        wet: before?.wet ?? null,
        watered_at: null,
        value: null,
        hours: 0,
      });
      if (before?.wet != null && current != null) setCalibration(plant, current, before.wet);
    } else if (step === "wet") {
      const before = pendingCalibration.get(plant.id);
      pendingCalibration.set(plant.id, {
        phase: "draining",
        dry: before?.dry ?? null,
        wet: null,
        watered_at: new Date().toISOString(),
        value: null,
        hours: 0,
      });
    } else if (step === "apply") {
      setCalibration(plant, Number(message.dry), Number(message.wet));
    } else if (step === "clear") {
      plant.calibration = null;
      pendingCalibration.delete(plant.id);
      delete plant.measurements.soil_moisture?.calibrated;
      push();
    }
    return calibrationState(plant) as T;
  }
  if (message.type === "rootwise/photos/list") {
    const id = String(message.plant_id);
    return {
      photos: (photos.get(id) ?? []).map((p) => p.entry),
      cover: coverOf(id)?.id ?? null,
    } as T;
  }
  if (message.type === "rootwise/photos/cover" && plant) {
    if (message.photo_id) covers.set(plant.id, String(message.photo_id));
    else covers.delete(plant.id);
    plant.photo = coverOf(plant.id);
    push();
    return {} as T;
  }
  if (message.type === "rootwise/care/delete") {
    for (const [plantId, list] of photos) {
      photos.set(plantId, list.filter((p) => p.entry.entry_id !== message.entry_id));
      if (covers.get(plantId) && !photos.get(plantId)?.some((p) => p.entry.photo_id === covers.get(plantId))) {
        covers.delete(plantId);
      }
    }
    for (const p of plants) {
      p.photo = coverOf(p.id);
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

export function hass(dark: boolean): HomeAssistant {
  return {
    connection,
    callWS,
    fetchWithAuth,
    config: { external_url: "https://home.example.ts.net", internal_url: "http://192.168.1.5:8123" },
    language: "de",
    user: { id: "u1", is_admin: true },
    themes: { darkMode: dark },
  };
}
