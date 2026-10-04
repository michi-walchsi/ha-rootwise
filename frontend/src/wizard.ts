// The wizard's choices without the DOM: pot sizes, preselected sensors and
// the summary on the last page.

import { localize, plural } from "./i18n";
import type { HomeAssistant, SensorRole, SensorSuggestions } from "./types";

export const SENSOR_ROLES: readonly SensorRole[] = [
  "moisture_sensor",
  "temperature_sensor",
  "humidity_sensor",
  "illuminance_sensor",
  "conductivity_sensor",
  "battery_sensor",
];

export type PotSize = "s" | "m" | "l" | "xl";

/** Size chips: the diameter they set and the largest diameter they cover. */
export const POT_SIZES: readonly { key: PotSize; diameter: number; upTo: number }[] = [
  { key: "s", diameter: 12, upTo: 12 },
  { key: "m", diameter: 18, upTo: 20 },
  { key: "l", diameter: 24, upTo: 28 },
  { key: "xl", diameter: 32, upTo: Infinity },
];

export type Chosen =
  | { kind: "offline"; id: string; label: string; common: string }
  | { kind: "opb"; pid: string; label: string; common: string | null }
  | null;

export function sizeFor(diameter: number): PotSize {
  return (POT_SIZES.find((size) => diameter <= size.upTo) ?? POT_SIZES[POT_SIZES.length - 1])?.key ?? "m";
}

/**
 * Start with what the server suggests (the soil sensor's own device, then
 * the room). A soil sensor is only preselected when it is free and in the
 * plant's room: a wrong guess there would mean wrong waterings.
 */
export function initialSensors(
  suggestions: SensorSuggestions,
  areaName: string | null,
): Record<SensorRole, string | null> {
  const picked = Object.fromEntries(
    SENSOR_ROLES.map((role) => [role, suggestions.suggested[role] ?? null]),
  ) as Record<SensorRole, string | null>;
  if (!picked.moisture_sensor && areaName) {
    const free = suggestions.candidates.moisture_sensor.find((c) => !c.in_use && c.area === areaName);
    picked.moisture_sensor = free?.entity_id ?? null;
  }
  return picked;
}

/** A name to start with: the species' common name, else its label. */
export function nameFor(chosen: Chosen): string {
  if (!chosen) return "";
  return chosen.common || chosen.label;
}

/** "Wohnzimmer · 3 Sensoren · Topf 24 cm". */
export function summary(
  hass: HomeAssistant,
  areaName: string | null,
  picked: Record<SensorRole, string | null>,
  diameter: number,
): string {
  const count = SENSOR_ROLES.filter((role) => picked[role]).length;
  const parts = [
    areaName,
    count ? plural(hass, "wizard.sensors", count) : localize(hass, "wizard.no_sensors"),
    localize(hass, "wizard.pot", { diameter }),
  ];
  return parts.filter(Boolean).join(" · ");
}
