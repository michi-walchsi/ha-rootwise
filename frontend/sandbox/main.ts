// Sandbox page with the cards, light and dark.

import "../src/index";
import { fakeHistory, hass } from "./fake";

// ---- page --------------------------------------------------------------------

for (const [id, dark] of [
  ["light", false],
  ["dark", true],
] as const) {
  const frame = document.getElementById(id);
  const overview = document.createElement("rootwise-overview-card");
  overview.setConfig({ type: "custom:rootwise-overview-card" });
  overview.hass = hass(dark);
  frame?.append(overview);
  for (const plant of ["d-monstera", "d-calathea"]) {
    const card = document.createElement("rootwise-plant-card");
    card.setConfig({ type: "custom:rootwise-plant-card", device_id: plant, show_history: plant === "d-monstera" });
    card.hass = hass(dark);
    frame?.append(card);
  }
  for (const days of [14, 30]) {
    const chart = document.createElement("rootwise-moisture-chart");
    chart.language = "de";
    chart.dark = dark;
    chart.height = days === 14 ? 200 : 160;
    chart.data = fakeHistory("p-monstera", days);
    frame?.append(chart);
  }
}
