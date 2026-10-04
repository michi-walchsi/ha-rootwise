// Geometry of the soil moisture chart, without DOM: scales, the line with
// gaps, the min–max band, the target band, day ticks, care markers and the
// forecast. The chart element only draws what this returns.

import type { ChartPoint, HistoryPayload } from "./types";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
/** Share of the span shown after now while there is a forecast. */
const FUTURE = 0.25;
/** A bin this many steps after the previous one starts a new line. */
const GAP_STEPS = 1.5;

/** Days between day ticks; the first that leaves room for the labels wins. */
const TICK_DAYS = [1, 2, 7, 14, 28];
/** Pixels a "22.9." label needs; "Di., 22." needs WIDE_LABEL. */
const MIN_LABEL = 36;
const WIDE_LABEL = 64;

const PAD = { left: 30, right: 8, top: 8, bottom: 22 };
const PAD_COMPACT = { left: 4, right: 4, top: 6, bottom: 18 };

export interface ChartOptions {
  /** The small chart in the plant card: tighter padding, no value axis. */
  compact?: boolean;
}

export interface ChartModel {
  width: number;
  height: number;
  plot: { left: number; right: number; top: number; bottom: number };
  domain: { t0: number; t1: number; v0: number; v1: number };
  x: (time: number) => number;
  y: (value: number) => number;
  /** Mean of each bin, one subpath per stretch without gaps. */
  line: string;
  /** Min–max area of each stretch. */
  envelope: string;
  /** Bins without neighbours, which a line can't show. */
  dots: { x: number; y: number }[];
  band: { top: number; bottom: number } | null;
  xTicks: { x: number; time: number; label: string }[];
  yTicks: { y: number; value: number }[];
  events: { x: number; time: number; type: string; source: string }[];
  forecast: { x1: number; y1: number; x2: number; y2: number; from: number; to: number } | null;
  nowX: number;
}

const fmt = (n: number) => n.toFixed(1);
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function valueDomain(data: HistoryPayload): [number, number] {
  const values: number[] = [];
  for (const [, , low, high] of data.points) values.push(low, high);
  if (data.thresholds) values.push(data.thresholds.low, data.thresholds.high);
  if (data.forecast) values.push(data.forecast.level);
  if (!values.length) return [0, 100];
  // A calibrated probe reads up to 110 % right after watering.
  const ceiling = Math.max(...values) > 100 ? 110 : 100;
  let v0 = Math.max(0, Math.floor((Math.min(...values) - 5) / 10) * 10);
  let v1 = Math.min(ceiling, Math.ceil((Math.max(...values) + 5) / 10) * 10);
  if (v1 - v0 < 20) {
    v1 = Math.min(100, v0 + 20);
    v0 = Math.max(0, v1 - 20);
  }
  return [v0, v1];
}

function runs(points: ChartPoint[], gap: number): ChartPoint[][] {
  const result: ChartPoint[][] = [];
  let current: ChartPoint[] = [];
  for (const point of points) {
    const previous = current.at(-1);
    if (previous && point[0] - previous[0] > gap) {
      result.push(current);
      current = [];
    }
    current.push(point);
  }
  if (current.length) result.push(current);
  return result;
}

function dayTicks(
  t0: number,
  end: number,
  t1: number,
  lang: string,
  dayWidth: number,
): { time: number; label: string }[] {
  const every = TICK_DAYS.find((days) => days * dayWidth >= MIN_LABEL) ?? 28;
  const anchor = new Date(end);
  anchor.setHours(0, 0, 0, 0);
  // Weekly ticks sit on Mondays, like a calendar.
  if (every >= 7) while (anchor.getDay() !== 1) anchor.setDate(anchor.getDate() - 1);
  const times: number[] = [];
  for (const d = new Date(anchor); d.getTime() >= t0; d.setDate(d.getDate() - every)) {
    times.unshift(d.getTime());
  }
  const after = new Date(anchor);
  for (after.setDate(after.getDate() + every); after.getTime() <= t1; after.setDate(after.getDate() + every)) {
    times.push(after.getTime());
  }
  const wide = every < 7 && every * dayWidth >= WIDE_LABEL;
  const format = new Intl.DateTimeFormat(
    lang,
    wide ? { weekday: "short", day: "numeric" } : { day: "numeric", month: "numeric" },
  );
  return times.map((time) => ({ time, label: format.format(new Date(time)) }));
}

export function chartModel(
  data: HistoryPayload,
  width: number,
  height: number,
  lang: string,
  options: ChartOptions = {},
): ChartModel {
  const compact = Boolean(options.compact);
  const pad = compact ? PAD_COMPACT : PAD;
  const plot = {
    left: pad.left,
    right: Math.max(pad.left + 1, width - pad.right),
    top: pad.top,
    bottom: Math.max(pad.top + 1, height - pad.bottom),
  };
  const t0 = Date.parse(data.start);
  const end = Date.parse(data.end);
  const due = data.forecast ? Date.parse(data.forecast.due) : null;
  const ahead = due !== null && due > end && data.thresholds !== null;
  const t1 = ahead ? end + (end - t0) * FUTURE : end;
  const [v0, v1] = valueDomain(data);
  const x = (time: number) => plot.left + ((time - t0) / (t1 - t0)) * (plot.right - plot.left);
  const y = (value: number) => plot.bottom - ((value - v0) / (v1 - v0)) * (plot.bottom - plot.top);

  // Points sit in the middle of their bin.
  const half = data.step * 500;
  const stretches = runs(data.points, data.step * 1000 * GAP_STEPS);
  const at = (p: ChartPoint, value: number) => `${fmt(x(p[0] + half))} ${fmt(y(value))}`;
  const line = stretches
    .filter((run) => run.length > 1)
    .map((run) => run.map((p, i) => `${i ? "L" : "M"}${at(p, p[1])}`).join(""))
    .join("");
  const envelope = stretches
    .filter((run) => run.length > 1)
    .map((run) => {
      const upper = run.map((p, i) => `${i ? "L" : "M"}${at(p, p[3])}`).join("");
      const lower = [...run].reverse().map((p) => `L${at(p, p[2])}`).join("");
      return `${upper}${lower}Z`;
    })
    .join("");
  const dots: ChartModel["dots"] = [];
  for (const [only, ...rest] of stretches) {
    if (only && !rest.length) dots.push({ x: x(only[0] + half), y: y(only[1]) });
  }

  const thresholds = data.thresholds;
  const band = thresholds
    ? {
        top: clamp(y(thresholds.high), plot.top, plot.bottom),
        bottom: clamp(y(thresholds.low), plot.top, plot.bottom),
      }
    : null;

  const yStep = v1 - v0 <= 50 ? 10 : 20;
  const yTicks = [];
  for (let value = v0; value <= v1; value += yStep) yTicks.push({ y: y(value), value });

  const nowX = x(end);
  let forecast: ChartModel["forecast"] = null;
  if (ahead && data.forecast && thresholds && due !== null) {
    const x1 = nowX;
    const y1 = y(data.forecast.level);
    let x2 = x(due);
    let y2 = y(thresholds.low);
    if (x2 > plot.right) {
      y2 = y1 + ((y2 - y1) * (plot.right - x1)) / (x2 - x1);
      x2 = plot.right;
    }
    forecast = {
      x1,
      y1,
      x2,
      y2,
      from: clamp(x(Date.parse(data.forecast.earliest)), x1, plot.right),
      to: clamp(x(Date.parse(data.forecast.latest)), x1, plot.right),
    };
  }

  return {
    width,
    height,
    plot,
    domain: { t0, t1, v0, v1 },
    x,
    y,
    line,
    envelope,
    dots,
    band,
    xTicks: dayTicks(t0, end, t1, lang, ((plot.right - plot.left) * DAY) / (t1 - t0)).map(
      (tick) => ({ ...tick, x: x(tick.time) }),
    ),
    yTicks: compact ? [] : yTicks,
    events: data.events
      .map((event) => ({ time: Date.parse(event.ts), type: event.type, source: event.source }))
      .filter((event) => event.time >= t0 && event.time <= t1)
      .map((event) => ({ ...event, x: x(event.time) })),
    forecast,
    nowX,
  };
}

/** The bin under a pointer position, or null outside the measured time. */
export function nearestPoint(
  data: HistoryPayload,
  model: ChartModel,
  px: number,
): { point: ChartPoint; x: number; y: number } | null {
  const first = data.points[0];
  const last = data.points.at(-1);
  if (!first || !last) return null;
  const { t0, t1 } = model.domain;
  const { left, right } = model.plot;
  const time = t0 + ((px - left) / (right - left)) * (t1 - t0);
  const step = data.step * 1000;
  if (time < first[0] || time > last[0] + step) return null;
  let best = first;
  for (const point of data.points) {
    if (Math.abs(point[0] + step / 2 - time) < Math.abs(best[0] + step / 2 - time)) best = point;
  }
  return { point: best, x: model.x(best[0] + step / 2), y: model.y(best[1]) };
}
