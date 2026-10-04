import type {
  CalibrationState,
  HassConnection,
  HistoryPayload,
  HomeAssistant,
  JournalEntry,
  PlantsPayload,
  SensorRole,
  SensorSuggestions,
  SpeciesSearch,
} from "./types";

type Listener = (payload: PlantsPayload) => void;

interface Shared {
  listeners: Set<Listener>;
  last?: PlantsPayload;
  unsubscribe?: Promise<() => Promise<void>>;
}

// One subscription per connection, shared by every Rootwise card on the page.
const shared = new WeakMap<HassConnection, Shared>();

export function subscribePlants(hass: HomeAssistant, listener: Listener): () => void {
  const connection = hass.connection;
  let entry = shared.get(connection);
  if (!entry) {
    const created: Shared = { listeners: new Set() };
    created.unsubscribe = connection.subscribeMessage<PlantsPayload>(
      (payload) => {
        created.last = payload;
        created.listeners.forEach((fn) => fn(payload));
      },
      { type: "rootwise/plants/subscribe" },
    );
    shared.set(connection, created);
    entry = created;
  }
  const current = entry;
  current.listeners.add(listener);
  if (current.last) listener(current.last);

  return () => {
    current.listeners.delete(listener);
    if (current.listeners.size === 0) {
      shared.delete(connection);
      void current.unsubscribe?.then((unsub) => unsub()).catch(() => undefined);
    }
  };
}

export async function logCare(
  hass: HomeAssistant,
  plantId: string,
  careType: string,
  when?: Date,
): Promise<JournalEntry> {
  const message: Record<string, unknown> = {
    type: "rootwise/care/log",
    plant_id: plantId,
    care_type: careType,
  };
  if (when) message.when = when.toISOString();
  const result = await hass.callWS<{ entry: JournalEntry }>(message);
  return result.entry;
}

export async function deleteCare(hass: HomeAssistant, entryId: string): Promise<void> {
  await hass.callWS({ type: "rootwise/care/delete", entry_id: entryId });
}

export async function snooze(hass: HomeAssistant, entityId: string): Promise<void> {
  await hass.callWS({
    type: "call_service",
    domain: "button",
    service: "press",
    target: { entity_id: entityId },
  });
}

export async function resetThresholds(hass: HomeAssistant, plantId: string): Promise<void> {
  await hass.callWS({ type: "rootwise/thresholds/reset", plant_id: plantId });
}

/**
 * Admins may delete everything, others what they logged themselves and
 * waterings Rootwise detected ("that wasn't me").
 */
export function canDelete(hass: HomeAssistant, entry: JournalEntry): boolean {
  const user = hass.user;
  if (!user) return false;
  if (user.is_admin || entry.source === "auto") return true;
  return entry.user_id !== undefined && entry.user_id === user.id;
}

/** Soil moisture of the last days, with care markers and the forecast. */
export function fetchHistory(
  hass: HomeAssistant,
  plantId: string,
  days: number,
): Promise<HistoryPayload> {
  return hass.callWS<HistoryPayload>({ type: "rootwise/plant/history", plant_id: plantId, days });
}

export type CalibrationStep = "get" | "dry" | "wet" | "clear";

/** One step of the calibration assistant; every step answers with its state. */
export function calibrate(hass: HomeAssistant, plantId: string, step: CalibrationStep): Promise<CalibrationState> {
  return hass.callWS<CalibrationState>({ type: `rootwise/calibration/${step}`, plant_id: plantId });
}

export function applyCalibration(
  hass: HomeAssistant,
  plantId: string,
  dry: number,
  wet: number,
): Promise<CalibrationState> {
  return hass.callWS<CalibrationState>({ type: "rootwise/calibration/apply", plant_id: plantId, dry, wet });
}

/** What the wizard sends to rootwise/plants/create. */
export interface NewPlant {
  name: string;
  area_id?: string | null;
  species?: string | null;
  opb_pid?: string | null;
  sensors?: Partial<Record<SensorRole, string | null>>;
  pot?: { pot_diameter: number; pot_material: string; drainage: boolean; window: string; location: string };
}

export async function createPlant(hass: HomeAssistant, plant: NewPlant): Promise<string> {
  const result = await hass.callWS<{ plant_id: string }>({ type: "rootwise/plants/create", ...plant });
  return result.plant_id;
}

export function searchSpecies(hass: HomeAssistant, query: string): Promise<SpeciesSearch> {
  return hass.callWS<SpeciesSearch>({ type: "rootwise/species/search", query });
}

export function speciesInfo(
  hass: HomeAssistant,
  pid: string,
): Promise<{ info: { scientific: string; common?: string | null; image_url?: string | null }; species: string | null }> {
  return hass.callWS({ type: "rootwise/species/info", pid });
}

export function suggestSensors(
  hass: HomeAssistant,
  areaId: string | null,
  moisture: string | null,
): Promise<SensorSuggestions> {
  const message: Record<string, unknown> = { type: "rootwise/sensors/suggest" };
  if (areaId) message.area_id = areaId;
  if (moisture) message.moisture_sensor = moisture;
  return hass.callWS<SensorSuggestions>(message);
}
