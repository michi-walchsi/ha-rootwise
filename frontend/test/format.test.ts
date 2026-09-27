import { describe, expect, it } from "vitest";
import { formatNumber, relativeTime, scale } from "../src/format";

const now = new Date(2026, 8, 27, 12, 7);
const at = (d: number, h: number, m = 0) => new Date(2026, 8, d, h, m).toISOString();

describe("relativeTime", () => {
  it("says yesterday for last evening, not hours", () => {
    expect(relativeTime(at(26, 19), now, "de")).toBe("gestern");
    expect(relativeTime(at(26, 19), now, "en")).toBe("yesterday");
  });

  it("uses minutes and hours within today", () => {
    expect(relativeTime(at(27, 11, 37), now, "en")).toBe("30 minutes ago");
    expect(relativeTime(at(27, 9, 7), now, "de")).toBe("vor 3 Stunden");
    expect(relativeTime(at(27, 12, 7), now, "de")).toBe("jetzt");
  });

  it("counts calendar days", () => {
    expect(relativeTime(at(24, 8), now, "en")).toBe("3 days ago");
  });
});

describe("formatNumber", () => {
  it("keeps one decimal for temperature only", () => {
    expect(formatNumber("temperature", 22.46, "de")).toBe("22,5");
    expect(formatNumber("soil_moisture", 38, "de")).toBe("38");
  });
});

describe("scale", () => {
  it("puts percent values on 0–100", () => {
    expect(scale("soil_moisture", 38, 30, 70)).toEqual({ low: 30, high: 70, marker: 38 });
  });

  it("centers a value inside its range with margins", () => {
    const s = scale("temperature", 22.5, 18, 27);
    expect(s.marker).toBeCloseTo(50);
    expect(s.low).toBeCloseTo(16.67, 1);
    expect(s.high).toBeCloseTo(83.33, 1);
  });

  it("stretches the bar for a value far outside", () => {
    expect(scale("temperature", 35, 18, 27).marker).toBe(100);
  });

  it("treats zero lux as a real value on a log scale", () => {
    const s = scale("illuminance", 0, 800, 15000);
    expect(s.marker).toBe(0);
    expect(s.low).toBeGreaterThan(50);
    expect(s.high).toBeLessThan(100);
  });

  it("handles open ranges", () => {
    expect(scale("air_humidity", 41, 50, null)).toEqual({ low: 50, high: 100, marker: 41 });
    expect(scale("conductivity", null, null, null).marker).toBeNull();
  });
});
