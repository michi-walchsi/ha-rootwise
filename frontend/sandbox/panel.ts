// Sandbox page with the Plants panel, light and dark, at phone width. Both
// follow the same route; tapping a tile or a plant opens its page.

import "../src/index";
import { hass } from "./fake";

const panels: HTMLElementTagNameMap["rootwise-panel"][] = [];

function path(): string {
  const prefix = "/rootwise";
  if (location.pathname.startsWith(prefix)) return location.pathname.slice(prefix.length);
  return location.hash.slice(1);
}

for (const [id, dark] of [
  ["light", false],
  ["dark", true],
] as const) {
  const panel = document.createElement("rootwise-panel");
  panel.hass = hass(dark);
  panel.narrow = true;
  panel.route = { prefix: "/rootwise", path: path() };
  document.getElementById(id)?.append(panel);
  panels.push(panel);
}

const follow = () => panels.forEach((panel) => (panel.route = { prefix: "/rootwise", path: path() }));
window.addEventListener("location-changed", follow);
window.addEventListener("popstate", follow);
