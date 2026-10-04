import type { MeasurementKey } from "./types";

const DAY = 86_400_000;

/** "vor 2 Stunden", "gestern", "vor 3 Tagen"; "gerade eben" under a minute. */
export function relativeTime(iso: string, now: Date, lang: string): string {
  const diff = new Date(iso).getTime() - now.getTime();
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  const abs = Math.abs(diff);
  if (abs < 60_000) return rtf.format(0, "second");
  if (abs < 3_600_000) return rtf.format(Math.round(diff / 60_000), "minute");
  // Hours only within today; before that whole calendar days ("yesterday").
  const days = calendarDays(new Date(iso), now);
  if (days === 0) return rtf.format(Math.round(diff / 3_600_000), "hour");
  if (Math.abs(days) < 30) return rtf.format(days, "day");
  return new Intl.DateTimeFormat(lang, { dateStyle: "medium" }).format(new Date(iso));
}

function calendarDays(date: Date, now: Date): number {
  const start = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((start(date) - start(now)) / DAY);
}

export function shortDateTime(iso: string, lang: string): string {
  return new Intl.DateTimeFormat(lang, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** "So., 27. Sept., 02:00–04:00": the shared day only once. */
export function timeRange(start: Date, end: Date, lang: string): string {
  return new Intl.DateTimeFormat(lang, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).formatRange(start, end);
}

export function formatNumber(key: MeasurementKey, value: number, lang: string): string {
  const digits = key === "temperature" ? 1 : 0;
  return new Intl.NumberFormat(lang, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export interface Scale {
  /** Start of the green zone, 0–100 % of the bar. */
  low: number;
  /** End of the green zone, 0–100 % of the bar. */
  high: number;
  /** Position of the value, 0–100 % of the bar; null without a value. */
  marker: number | null;
}

const PERCENT_KEYS: MeasurementKey[] = ["soil_moisture", "air_humidity", "battery"];

/**
 * Place a value and its target range on a bar. Percent values use 0–100;
 * others get a quarter of the range as margin on each side. Light uses a
 * log scale because 50 lx and 50,000 lx both occur in one room. Zero is a
 * real value, not "missing".
 */
export function scale(
  key: MeasurementKey,
  value: number | null,
  min: number | null,
  max: number | null,
): Scale {
  const f = key === "illuminance" ? (x: number) => Math.log10(Math.max(x, 0) + 1) : (x: number) => x;
  let lo: number;
  let hi: number;
  if (PERCENT_KEYS.includes(key)) {
    lo = 0;
    hi = 100;
  } else {
    const a = f(min ?? max ?? value ?? 0);
    const b = f(max ?? min ?? value ?? 1);
    const span = Math.max(b - a, key === "illuminance" ? 1 : 2);
    lo = key === "illuminance" ? 0 : a - span / 4;
    hi = b + span / 4;
    if (value !== null) {
      lo = Math.min(lo, f(value));
      hi = Math.max(hi, f(value));
    }
  }
  const pct = (x: number) => Math.min(100, Math.max(0, ((f(x) - lo) / (hi - lo)) * 100));
  return {
    low: min === null ? 0 : pct(min),
    high: max === null ? 100 : pct(max),
    marker: value === null ? null : pct(value),
  };
}
