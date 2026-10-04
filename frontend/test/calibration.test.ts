import { describe, expect, it } from "vitest";
import { calibrateHistory, calibrateReason, moistureShown, percentOf } from "../src/calibration";
import type { HistoryPayload, Plant } from "../src/types";
import { plant } from "./fixtures";

const scale = { dry: 31, wet: 71 };

function calibrated(overrides: Partial<Plant> = {}): Plant {
  return plant({
    calibration: { dry: 31, wet: 71, at: "2026-10-04T15:00:00+00:00", outdated: false },
    measurements: {
      soil_moisture: {
        value: 51,
        unit: "%",
        min: 37,
        max: 63,
        rating: "ok",
        level: "ok",
        range_source: "calibrated",
        source: "sensor.probe",
        calibrated: 50,
      },
    },
    ...overrides,
  });
}

describe("percentOf", () => {
  it("maps raw values onto the plant's own scale", () => {
    expect(percentOf(scale, 51)).toBe(50);
    expect(percentOf(scale, 20)).toBe(0);
    expect(percentOf(scale, 90)).toBe(110);
  });
});

describe("calibrateReason", () => {
  it("shows moisture reasons in calibrated percent", () => {
    expect(calibrateReason({ code: "below_threshold", value: 35, threshold: 37 }, scale)).toEqual({
      code: "below_threshold",
      value: 10,
      threshold: 15,
    });
    expect(calibrateReason({ code: "too_wet", value: 69, threshold: 63 }, scale)).toEqual({
      code: "too_wet",
      value: 95,
      threshold: 80,
    });
  });

  it("leaves other reasons alone", () => {
    const reason = { code: "interval_due", days: 7 };
    expect(calibrateReason(reason, scale)).toBe(reason);
  });
});

describe("moistureShown", () => {
  it("uses the calibrated scale when there is one, and keeps the raw value", () => {
    expect(moistureShown(calibrated())).toEqual({ value: 50, min: 15, max: 80, raw: 51, calibrated: true });
  });

  it("shows the raw value otherwise", () => {
    const raw = calibrated({ calibration: null });
    expect(moistureShown(raw)).toEqual({ value: 51, min: 37, max: 63, raw: 51, calibrated: false });
  });

  it("is empty without a soil sensor", () => {
    expect(moistureShown(plant())).toBeNull();
  });
});

describe("calibrateHistory", () => {
  const history: HistoryPayload = {
    start: "2026-09-20T10:00:00+00:00",
    end: "2026-10-04T10:00:00+00:00",
    step: 7200,
    points: [[1, 51, 47, 55]],
    thresholds: { low: 37, high: 63, source: "calibrated", learned: null, waterings: 2 },
    forecast: {
      due: "2026-10-06T10:00:00+00:00",
      earliest: "2026-10-06T00:00:00+00:00",
      latest: "2026-10-07T00:00:00+00:00",
      level: 51,
      rate: 2,
      confidence: "medium",
    },
    events: [],
    calibration: scale,
  };

  it("puts points, thresholds and forecast on the calibrated scale", () => {
    const result = calibrateHistory(history);
    expect(result.points).toEqual([[1, 50, 40, 60]]);
    expect([result.thresholds?.low, result.thresholds?.high]).toEqual([15, 80]);
    expect(result.forecast?.level).toBe(50);
  });

  it("returns uncalibrated data as it is", () => {
    const raw = { ...history, calibration: null };
    expect(calibrateHistory(raw)).toBe(raw);
  });
});
