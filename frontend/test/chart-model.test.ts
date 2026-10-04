import { describe, expect, it } from "vitest";
import { chartModel, nearestPoint } from "../src/chart-model";
import type { ChartPoint, ForecastData, HistoryPayload } from "../src/types";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const END = Date.parse("2026-10-04T12:00:00Z");
const START = END - 14 * DAY;
const iso = (t: number) => new Date(t).toISOString();

function must<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error("expected a value");
  return value;
}

/** 14 days in 2-hour bins, drying from 80 to 46.6. */
function history(overrides: Partial<HistoryPayload> = {}): HistoryPayload {
  const points = Array.from({ length: 168 }, (_, i): ChartPoint => {
    const value = 80 - i * 0.2;
    return [START + i * 2 * HOUR, value, value - 1, value + 1];
  });
  return {
    start: iso(START),
    end: iso(END),
    step: 7200,
    points,
    thresholds: { low: 45, high: 85, source: "learned", learned: [45, 85], waterings: 3 },
    forecast: null,
    events: [],
    ...overrides,
  };
}

function forecast(dueInHours: number): ForecastData {
  return {
    due: iso(END + dueInHours * HOUR),
    earliest: iso(END + (dueInHours - 12) * HOUR),
    latest: iso(END + (dueInHours + 12) * HOUR),
    level: 46.6,
    rate: 2.4,
    confidence: "medium",
  };
}

describe("chartModel", () => {
  it("spans the plot from start to now", () => {
    const model = chartModel(history(), 400, 200, "de");
    expect([model.domain.t0, model.domain.t1]).toEqual([START, END]);
    expect(model.nowX).toBeCloseTo(model.plot.right);
    expect(model.forecast).toBeNull();
  });

  it("makes room for the forecast and draws it from now to the dry threshold", () => {
    const model = chartModel(history({ forecast: forecast(48) }), 400, 200, "de");
    expect(model.domain.t1).toBe(END + 3.5 * DAY);
    const line = must(model.forecast);
    expect(line.x1).toBeCloseTo(model.nowX);
    expect(line.x2).toBeGreaterThan(line.x1);
    expect(line.y2).toBeGreaterThan(line.y1); // drier = lower on the chart
    expect(line.from).toBeLessThan(line.to);
  });

  it("clips a forecast beyond the chart at its edge", () => {
    const model = chartModel(history({ forecast: forecast(240) }), 400, 200, "de");
    const line = must(model.forecast);
    expect(line.x2).toBeCloseTo(model.plot.right);
    expect(line.from).toBe(line.to);
  });

  it("breaks the line where the sensor was silent", () => {
    const data = history();
    data.points = [...data.points.slice(0, 50), ...data.points.slice(60)];
    const model = chartModel(data, 400, 200, "de");
    expect(model.line.match(/M/g)).toHaveLength(2);
    expect(model.envelope.match(/Z/g)).toHaveLength(2);
  });

  it("fits the value axis to data and thresholds in steps of ten", () => {
    const model = chartModel(history(), 400, 200, "de");
    expect([model.domain.v0, model.domain.v1]).toEqual([40, 90]);
    expect(model.yTicks.map((tick) => tick.value)).toEqual([40, 50, 60, 70, 80, 90]);
  });

  it("keeps the value axis within 0 and 100", () => {
    const points: ChartPoint[] = [
      [START, 2, 1, 3],
      [START + 2 * HOUR, 98, 97, 99],
    ];
    const model = chartModel(history({ points, thresholds: null }), 400, 200, "de");
    expect([model.domain.v0, model.domain.v1]).toEqual([0, 100]);
    expect(model.yTicks.map((tick) => tick.value)).toEqual([0, 20, 40, 60, 80, 100]);
    expect(model.band).toBeNull();
  });

  it("puts the target band between the thresholds", () => {
    const model = chartModel(history(), 400, 200, "de");
    expect(must(model.band).top).toBeLessThan(must(model.band).bottom);
    expect(must(model.band).top).toBeGreaterThanOrEqual(model.plot.top);
  });

  it("puts day ticks on local midnights, every second day for two weeks", () => {
    const model = chartModel(history(), 400, 200, "de");
    expect(model.xTicks).toHaveLength(7);
    for (const tick of model.xTicks) expect(new Date(tick.time).getHours()).toBe(0);
    expect(must(model.xTicks[1]).time - must(model.xTicks[0]).time).toBe(2 * DAY);
    expect(must(model.xTicks.at(-1)).time).toBeLessThanOrEqual(END);
  });

  it("places care events and leaves out older ones", () => {
    const events = [
      { ts: iso(END - 30 * HOUR), type: "watered", source: "auto" },
      { ts: iso(START - HOUR), type: "watered", source: "card" },
    ];
    const model = chartModel(history({ events }), 400, 200, "de");
    expect(model.events).toHaveLength(1);
    expect(must(model.events[0]).x).toBeGreaterThan(model.plot.left);
    expect(must(model.events[0]).x).toBeLessThan(model.nowX);
  });

  it("is empty but well formed without data", () => {
    const model = chartModel(history({ points: [], thresholds: null }), 400, 200, "de");
    expect(model.line).toBe("");
    expect([model.domain.v0, model.domain.v1]).toEqual([0, 100]);
  });
});

describe("nearestPoint", () => {
  it("finds the bin under the pointer", () => {
    const data = history();
    const model = chartModel(data, 400, 200, "de");
    expect(nearestPoint(data, model, model.plot.left + 1)?.point[0]).toBe(START);
    expect(nearestPoint(data, model, model.nowX)?.point).toBe(data.points.at(-1));
  });

  it("finds nothing over the future", () => {
    const data = history({ forecast: forecast(48) });
    const model = chartModel(data, 400, 200, "de");
    expect(nearestPoint(data, model, model.plot.right - 1)).toBeNull();
  });
});
