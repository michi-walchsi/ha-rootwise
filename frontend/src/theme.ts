import { css } from "lit";

// Colours from the approved mockup. The card surface and text follow the
// dashboard theme; the plant colours switch with it via the [dark] attribute.
// Everything is defined on :host, never on :root, so nothing leaks out.
export const theme = css`
  :host {
    --rw-accent: #2e7d4a;
    --rw-accent-soft: rgba(46, 125, 74, 0.12);
    --rw-water: #1f6fb2;
    --rw-water-ink: #ffffff;
    --rw-water-soft: rgba(31, 111, 178, 0.12);
    --rw-warn: #a8620a;
    --rw-warn-soft: rgba(168, 98, 10, 0.13);
    --rw-prob: #9a3fb0;
    --rw-prob-soft: rgba(154, 63, 176, 0.12);
    --rw-track: rgba(127, 127, 127, 0.16);
    --rw-text: var(--primary-text-color, #16201a);
    --rw-text2: var(--secondary-text-color, #3d4c41);
    --rw-line: var(--divider-color, rgba(127, 127, 127, 0.25));
    --rw-radius: var(--ha-card-border-radius, 12px);
    display: block;
    color: var(--rw-text);
  }
  :host([dark]) {
    --rw-accent: #48a566;
    --rw-accent-soft: rgba(72, 165, 102, 0.16);
    --rw-water: #3e8fd4;
    --rw-water-ink: #06111c;
    --rw-water-soft: rgba(62, 143, 212, 0.18);
    --rw-warn: #c4821a;
    --rw-warn-soft: rgba(196, 130, 26, 0.18);
    --rw-prob: #c064d2;
    --rw-prob-soft: rgba(192, 100, 210, 0.17);
    --rw-track: rgba(255, 255, 255, 0.08);
  }
  * {
    box-sizing: border-box;
  }
  button {
    font: inherit;
    color: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  button:focus-visible,
  [role="button"]:focus-visible,
  input:focus-visible {
    outline: 2px solid var(--rw-accent);
    outline-offset: 2px;
  }
  .num {
    font-variant-numeric: tabular-nums;
  }
  .muted {
    color: var(--rw-text2);
  }
  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
      animation: none !important;
    }
  }
`;

export const STATUS_COLOR: Record<string, string> = {
  ok: "var(--rw-accent)",
  thirsty: "var(--rw-warn)",
  too_wet: "var(--rw-prob)",
  sensor_offline: "var(--rw-text2)",
  no_history: "var(--rw-text2)",
};

export const ICONS: Record<string, string> = {
  soil_moisture: "mdi:water-percent",
  temperature: "mdi:thermometer",
  air_humidity: "mdi:water-opacity",
  illuminance: "mdi:white-balance-sunny",
  conductivity: "mdi:sprout-outline",
  battery: "mdi:battery-40",
  watered: "mdi:watering-can",
  fertilized: "mdi:bottle-tonic-plus",
  repotted: "mdi:pot-mix",
  cleaned: "mdi:leaf",
  rotated: "mdi:rotate-3d-variant",
  pest_check: "mdi:bug-check",
  pruned: "mdi:content-cut",
  sensor_moved: "mdi:cursor-move",
  note: "mdi:note-text-outline",
  photo: "mdi:camera",
};
