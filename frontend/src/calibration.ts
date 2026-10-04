// The calibrated scale in the browser: 0 % really dry, 100 % field capacity.
// The server keeps raw values (detection, thresholds); this turns them into
// what the user sees once a probe is calibrated.

import type { HistoryPayload, Plant, Reason, Scale } from "./types";

/** A fresh watering may read a little above field capacity. */
export const TOP = 110;
const MOISTURE_REASONS = new Set(["below_threshold", "too_wet"]);

export function percentOf(scale: Scale, raw: number): number {
  return Math.min(TOP, Math.max(0, ((raw - scale.dry) / (scale.wet - scale.dry)) * 100));
}

const tenth = (value: number) => Math.round(value * 10) / 10;

/** "Bodenfeuchte 10 % unter 15 %" instead of the raw "35 % unter 37 %". */
export function calibrateReason(reason: Reason, scale: Scale): Reason {
  if (!MOISTURE_REASONS.has(reason.code)) return reason;
  const mapped: Reason = { ...reason };
  for (const key of ["value", "threshold"] as const) {
    const raw = reason[key];
    if (typeof raw === "number") mapped[key] = Math.round(percentOf(scale, raw));
  }
  return mapped;
}

export interface MoistureShown {
  value: number | null;
  min: number | null;
  max: number | null;
  raw: number | null;
  calibrated: boolean;
}

/** Soil moisture as the cards show it: calibrated percent if possible. */
export function moistureShown(plant: Plant): MoistureShown | null {
  const reading = plant.measurements.soil_moisture;
  if (!reading) return null;
  const scale = plant.calibration;
  if (!scale) {
    return { value: reading.value, min: reading.min, max: reading.max, raw: reading.value, calibrated: false };
  }
  const map = (raw: number | null) => (raw === null ? null : Math.round(percentOf(scale, raw)));
  return {
    value: reading.calibrated ?? map(reading.value),
    min: map(reading.min),
    max: map(reading.max),
    raw: reading.value,
    calibrated: true,
  };
}

/** Chart data on the calibrated scale; uncalibrated data stays as it is. */
export function calibrateHistory(data: HistoryPayload): HistoryPayload {
  const scale = data.calibration;
  if (!scale) return data;
  const map = (raw: number) => tenth(percentOf(scale, raw));
  return {
    ...data,
    points: data.points.map(([t, mean, low, high]) => [t, map(mean), map(low), map(high)]),
    thresholds: data.thresholds
      ? { ...data.thresholds, low: map(data.thresholds.low), high: map(data.thresholds.high) }
      : null,
    forecast: data.forecast ? { ...data.forecast, level: map(data.forecast.level) } : null,
  };
}
