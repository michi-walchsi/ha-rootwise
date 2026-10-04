import { describe, expect, it } from "vitest";
import { historyKey } from "../src/history-controller";
import { plant } from "./fixtures";

describe("historyKey", () => {
  const base = plant({ last_watered: "2026-10-03T18:00:00+00:00" });

  it("changes when the chart would look different", () => {
    const key = historyKey(base, 14);
    expect(historyKey(base, 30)).not.toBe(key);
    expect(historyKey({ ...base, last_watered: "2026-10-04T08:00:00+00:00" }, 14)).not.toBe(key);
    const logged = { ...base, recent: [{ id: "e9", plant_id: "p1", ts: "2026-10-04T08:00:00+00:00", type: "fertilized", source: "card" }] };
    expect(historyKey(logged, 14)).not.toBe(key);
    const calibrated = { ...base, calibration: { dry: 30, wet: 70, at: "2026-10-04T09:00:00+00:00", outdated: false } };
    expect(historyKey(calibrated, 14)).not.toBe(key);
  });

  it("stays the same for unrelated changes", () => {
    expect(historyKey({ ...base, name: "Andere" }, 14)).toBe(historyKey(base, 14));
  });
});
