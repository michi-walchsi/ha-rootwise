import type { ReactiveController, ReactiveControllerHost } from "lit";
import { fetchHistory } from "./api";
import type { HistoryPayload, HomeAssistant, Plant } from "./types";

const REFRESH_MS = 10 * 60 * 1000;

/** What makes a plant's chart out of date: care, a calibration, the range. */
export function historyKey(plant: Plant, days: number): string {
  return [plant.id, days, plant.last_watered, plant.recent[0]?.id, plant.calibration?.at].join("|");
}

/**
 * A plant's chart data for a card or page. Loads again after care was logged
 * or deleted, after a calibration, for another range, and every ten minutes,
 * since readings arrive all the time.
 */
export class HistoryController implements ReactiveController {
  data?: HistoryPayload;
  private key = "";
  private timer?: number;

  constructor(private readonly host: ReactiveControllerHost) {
    host.addController(this);
  }

  hostConnected(): void {
    this.timer = window.setInterval(() => {
      this.key = "";
      this.host.requestUpdate();
    }, REFRESH_MS);
  }

  hostDisconnected(): void {
    window.clearInterval(this.timer);
  }

  /** Call from the host's updated(); loads only when something changed. */
  sync(hass: HomeAssistant | undefined, plant: Plant | undefined, days: number): void {
    if (!hass || !plant) return;
    const key = historyKey(plant, days);
    if (key === this.key) return;
    // Another plant: don't show the old one's curve meanwhile.
    if (!this.key.startsWith(`${plant.id}|`)) this.data = undefined;
    this.key = key;
    fetchHistory(hass, plant.id, days).then(
      (data) => {
        if (this.key !== key) return;
        this.data = data;
        this.host.requestUpdate();
      },
      () => {
        // Try again with the next change or refresh.
        if (this.key === key) this.key = "";
      },
    );
  }
}
