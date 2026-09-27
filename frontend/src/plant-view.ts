// Pure helpers behind the plant card: easy to test without a browser.

import { localize } from "./i18n";
import type { HomeAssistant, MeasurementKey, Plant, Reason } from "./types";

export const MEASUREMENT_ORDER: MeasurementKey[] = [
  "soil_moisture",
  "temperature",
  "air_humidity",
  "illuminance",
  "conductivity",
];

export interface PlantRef {
  device_id?: string;
  plant_id?: string;
  plant?: string;
}

/** Find the configured plant: by device (editor), id, or name (YAML). */
export function findPlant(plants: Plant[], ref: PlantRef): Plant | undefined {
  if (ref.device_id) return plants.find((p) => p.device_id === ref.device_id);
  if (ref.plant_id) return plants.find((p) => p.id === ref.plant_id);
  if (ref.plant) {
    const wanted = ref.plant.trim().toLocaleLowerCase();
    return plants.find((p) => p.id === ref.plant || p.name.toLocaleLowerCase() === wanted);
  }
  return undefined;
}

const HINT = /_(low|high)$/;

export function isHint(reason: Reason): boolean {
  return HINT.test(reason.code);
}

/** One sentence under the status: why, or how moist the soil is. */
export function detail(hass: HomeAssistant, plant: Plant): string | null {
  const reasons = plant.reasons.filter((r) => !isHint(r));
  if (plant.status && plant.status !== "ok") {
    const reason = reasons.find((r) => r.code !== "snoozed");
    return reason ? localize(hass, `reason.${reason.code}`, reason) : null;
  }
  if (plant.snoozed_until) {
    return localize(hass, "snoozed_until", {
      time: new Intl.DateTimeFormat(hass.language, {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(plant.snoozed_until)),
    });
  }
  if (plant.moisture_level) return localize(hass, `level.${plant.moisture_level}`);
  return null;
}

export function hints(hass: HomeAssistant, plant: Plant): string[] {
  return plant.reasons.filter(isHint).map((r) => localize(hass, `hint.${r.code}`, r));
}

export type WhenChoice = "now" | "hours" | "yesterday";

/** Time for a quick choice; undefined means "now" (the server's clock). */
export function whenFor(choice: WhenChoice, now: Date): Date | undefined {
  if (choice === "hours") return new Date(now.getTime() - 3 * 3_600_000);
  if (choice === "yesterday") {
    // Most people water in the evening; the history shows it, so it's easy to fix.
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    d.setHours(18, 0, 0, 0);
    return d;
  }
  return undefined;
}

/** Value for <input type="datetime-local"> in local time. */
export function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/** A Rootwise plant device for a new card, if the dashboard knows one. */
export function firstPlantDevice(hass: HomeAssistant): string | undefined {
  const entities = Object.values(hass.entities ?? {});
  return entities.find(
    (e) => e.platform === "rootwise" && e.entity_id.endsWith("_status") && e.device_id,
  )?.device_id;
}
