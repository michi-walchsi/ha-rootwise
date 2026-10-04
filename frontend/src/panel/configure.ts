import { ref } from "lit/directives/ref.js";
import type { LovelaceCardConfig } from "../types";

interface Configurable {
  setConfig(config: LovelaceCardConfig): void;
}

const applied = new WeakMap<Element, string>();

/**
 * Hand a card its config from a template, the way a dashboard does: through
 * setConfig, and only when the config really changed (a new object on every
 * render would redraw the card each time hass changes).
 */
export function configure(config: LovelaceCardConfig) {
  return ref((element) => {
    if (!element) return;
    const key = JSON.stringify(config);
    if (applied.get(element) === key) return;
    applied.set(element, key);
    (element as unknown as Configurable).setConfig(config);
  });
}
