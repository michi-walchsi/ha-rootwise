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
  source: "custom" | "learned" | "species";
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
  species: {
    scientific: string | null;
    common: string | null;
    image_url: string | null;
    source: string | null;
  };
  measurements: Partial<Record<MeasurementKey, Measurement>>;
  next_watering: NextWatering | null;
  thresholds: Thresholds | null;
  recent: JournalEntry[];
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
