// Pure helpers behind the overview card.

import { formatNumber, relativeTime } from "./format";
import { language, localize, plural } from "./i18n";
import { detail, isHint } from "./plant-view";
import type { HomeAssistant, MeasurementKey, Plant } from "./types";

const SEVERITY: Record<string, number> = {
  thirsty: 0,
  too_wet: 1,
  sensor_offline: 2,
  no_history: 3,
  ok: 4,
};

export function inArea(plants: Plant[], areaId?: string): Plant[] {
  return areaId ? plants.filter((p) => p.area_id === areaId) : plants;
}

const byName = (a: Plant, b: Plant) => a.name.localeCompare(b.name);

/** Plants to water today. */
export function duePlants(plants: Plant[]): Plant[] {
  return plants.filter((p) => p.needs_water).sort(byName);
}

/**
 * Rows of the "water today" list: due plants plus the ones just ticked.
 * Sorted by name, so a ticked row stays where the finger was.
 */
export function checklist(plants: Plant[], ticked: (plant: Plant) => boolean): Plant[] {
  return plants.filter((p) => p.needs_water || ticked(p)).sort(byName);
}

/** "Schlafzimmer · 19 %" or "Küche · Fällig nach 7 Tagen". */
export function dueLine(hass: HomeAssistant, plant: Plant): string {
  const moisture = plant.measurements.soil_moisture?.value;
  const what =
    moisture !== null && moisture !== undefined
      ? `${formatNumber("soil_moisture", moisture, language(hass))} %`
      : detail(hass, plant);
  return [plant.area, what].filter(Boolean).join(" · ");
}

export function summary(hass: HomeAssistant, plants: Plant[]): string {
  const due = plants.filter((p) => p.needs_water).length;
  const withHints = plants.filter((p) => p.reasons.some(isHint)).length;
  const parts = [due ? plural(hass, "overview.due", due) : localize(hass, "overview.none")];
  if (withHints) parts.push(plural(hass, "overview.hints", withHints));
  return parts.join(" · ");
}

export interface Tile {
  color: string;
  text: string;
}

/** Colour and a few words for a plant tile. */
export function tile(hass: HomeAssistant, plant: Plant, now: Date): Tile {
  const status = plant.status ?? "no_history";
  if (status === "thirsty") return { color: "var(--rw-warn)", text: localize(hass, "status.thirsty") };
  if (status === "too_wet") return { color: "var(--rw-prob)", text: localize(hass, "level.too_wet") };
  if (status === "sensor_offline") {
    return { color: "var(--rw-text2)", text: localize(hass, "status.sensor_offline") };
  }
  const hint = plant.reasons.find(isHint);
  if (hint) {
    const [, key, rating] = /^(.*)_(low|high)$/.exec(hint.code) ?? [];
    const measure = localize(hass, `m.${key as MeasurementKey}`);
    return { color: "var(--rw-warn)", text: localize(hass, `tile.${rating}`, { measure }) };
  }
  if (plant.moisture_level) {
    return { color: "var(--rw-accent)", text: localize(hass, `level.${plant.moisture_level}`) };
  }
  if (!plant.last_watered) return { color: "var(--rw-text2)", text: localize(hass, "tile.never") };
  return {
    color: "var(--rw-accent)",
    text: relativeTime(plant.last_watered, now, language(hass)),
  };
}

export function bySeverity(plants: Plant[]): Plant[] {
  return [...plants].sort(
    (a, b) =>
      (SEVERITY[a.status ?? "ok"] ?? 9) - (SEVERITY[b.status ?? "ok"] ?? 9) ||
      Number(b.reasons.some(isHint)) - Number(a.reasons.some(isHint)) ||
      a.name.localeCompare(b.name),
  );
}

