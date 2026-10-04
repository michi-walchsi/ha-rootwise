// Data shapes of the Rootwise WebSocket API (custom_components/rootwise/websocket.py)
// and the small part of Home Assistant's frontend object the cards use.

export type Rating = "low" | "ok" | "high";
export type MoistureLevel = "dry" | "drying" | "ok" | "fresh" | "too_wet";
export type Status = "ok" | "thirsty" | "too_wet" | "sensor_offline" | "no_history";
export type MeasurementKey =
  | "soil_moisture"
  | "temperature"
  | "air_humidity"
  | "illuminance"
  | "conductivity"
  | "battery";

export interface Measurement {
  value: number | null;
  unit: string | null;
  min: number | null;
  max: number | null;
  rating: Rating | null;
  level: MoistureLevel | null;
  range_source: string | null;
  source: string;
  /** Soil moisture on the plant's calibrated scale, if calibrated. */
  calibrated?: number;
}

export interface JournalEntry {
  id: string;
  plant_id: string;
  ts: string;
  type: string;
  source: string;
  note?: string;
  user_id?: string;
  data?: { moisture?: number; before?: number; peak?: number; settled?: number };
}

export interface NextWatering {
  due: string;
  earliest?: string;
  latest?: string;
  confidence?: "high" | "medium" | "low";
  rate?: number;
  method: "trend" | "interval";
}

export interface Thresholds {
  low: number;
  high: number;
  source: "custom" | "calibrated" | "learned" | "species";
  learned: [number, number] | null;
  waterings: number;
}

export interface Reason {
  code: string;
  value?: number;
  min?: number;
  max?: number;
  [key: string]: unknown;
}

export type Toxicity = "unknown" | "none" | "mild" | "moderate" | "severe";
export type WateringStyle = "dry_out" | "mostly_dry" | "slightly_dry" | "evenly_moist";

export interface Range {
  min: number | null;
  max: number | null;
}

export interface Species {
  scientific: string | null;
  common: string | null;
  image_url: string | null;
  source: string | null;
  watering_style: WateringStyle | null;
  fertilize_weeks: number | null;
  toxicity: {
    cats: Toxicity;
    dogs: Toxicity;
    humans: Toxicity;
    /** Code of the toxic substance, e.g. "calcium_oxalate". */
    note: string;
    /** URL or name of the source. */
    source: string;
  } | null;
  ranges: Partial<Record<"temperature" | "air_humidity" | "illuminance", Range>>;
  /** Daily light integral, mol/m² per day. */
  dli: { min: number; max: number } | null;
}

export interface Pot {
  diameter: number;
  material: string;
  drainage: boolean;
  window: string;
  location: string;
  /** ml per watering, from and to. */
  amount: [number, number] | null;
}

/** Raw readings at 0 % (really dry) and 100 % (field capacity). */
export interface Scale {
  dry: number;
  wet: number;
}

export interface CalibrationInfo extends Scale {
  at: string | null;
  /** The probe was moved or the plant repotted since. */
  outdated: boolean;
}

export type CalibrationPhase =
  | "need_wet"
  | "need_dry"
  | "draining"
  | "measuring"
  | "done"
  | "no_rise"
  | "too_close";

/** rootwise/calibration/*: what the assistant shows. */
export interface CalibrationState {
  calibration: CalibrationInfo | null;
  pending: {
    phase: CalibrationPhase;
    dry: number | null;
    wet: number | null;
    watered_at: string | null;
    value: number | null;
    hours: number;
  } | null;
  suggestion: { dry: number; wet: number; waterings: number } | null;
  current: number | null;
  style: WateringStyle | null;
  /** Water below, too wet above: percent of the calibrated scale. */
  scale: [number, number];
}

export interface PhotoInfo {
  id: string;
  ts: string;
  width: number;
  height: number;
}

/** rootwise/photos/list: one photo with its journal entry. */
export interface PhotoEntry {
  entry_id: string;
  photo_id: string;
  ts: string;
  width: number;
  height: number;
  note: string | null;
  user_id: string | null;
}

export interface Plant {
  id: string;
  name: string;
  device_id: string | null;
  area_id: string | null;
  area: string | null;
  entity_ids: Record<string, string>;
  status: Status | null;
  moisture_level: MoistureLevel | null;
  needs_water: boolean;
  reasons: Reason[];
  snoozed_until: string | null;
  last_watered: string | null;
  species: Species;
  pot: Pot;
  /** The cover photo: the chosen one, else the newest. */
  photo: PhotoInfo | null;
  /** Raw values for 0 % (dry) and 100 % (field capacity) of this probe. */
  calibration: CalibrationInfo | null;
  measurements: Partial<Record<MeasurementKey, Measurement>>;
  next_watering: NextWatering | null;
  thresholds: Thresholds | null;
  recent: JournalEntry[];
}

/** [epoch ms, mean, min, max] of one chart bin. */
export type ChartPoint = [number, number, number, number];

export interface ChartEvent {
  id?: string;
  ts: string;
  type: string;
  source: string;
  data?: JournalEntry["data"];
}

export interface ForecastData {
  due: string;
  earliest: string;
  latest: string;
  level: number;
  rate: number;
  confidence: "high" | "medium" | "low";
}

/** rootwise/plant/history: soil moisture of the last days. */
export interface HistoryPayload {
  start: string;
  end: string;
  /** Seconds per bin. */
  step: number;
  points: ChartPoint[];
  thresholds: Thresholds | null;
  forecast: ForecastData | null;
  events: ChartEvent[];
  calibration?: Scale | null;
}

export interface PlantsPayload {
  loaded: boolean;
  vacation: boolean;
  plants: Plant[];
}

export interface HassConnection {
  subscribeMessage<T>(
    callback: (message: T) => void,
    subscribe: Record<string, unknown>,
  ): Promise<() => Promise<void>>;
}

export interface HomeAssistant {
  connection: HassConnection;
  callWS<T>(message: Record<string, unknown>): Promise<T>;
  /** fetch with the user's token: photos are only served to logged-in users. */
  fetchWithAuth(path: string, init?: RequestInit): Promise<Response>;
  config?: { external_url?: string | null; internal_url?: string | null };
  language: string;
  locale?: { language: string };
  user?: { id: string; is_admin: boolean; name?: string };
  themes?: { darkMode?: boolean };
  entities?: Record<string, { entity_id: string; device_id?: string; platform?: string }>;
}

export interface LovelaceCardConfig {
  type: string;
  [key: string]: unknown;
}
