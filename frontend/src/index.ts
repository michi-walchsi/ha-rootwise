// Entry point: Home Assistant loads this module on every page (registered by
// custom_components/rootwise/frontend.py), so the cards need no resource entry.

import { RootwiseOverviewCard } from "./cards/overview-card";
import { RootwisePlantCard } from "./cards/plant-card";
import { RootwiseMoistureChart } from "./components/moisture-chart";
import { defineWhenReady } from "./define";
import { localize } from "./i18n";
import type { HomeAssistant } from "./types";

const page = { language: document.documentElement.lang || navigator.language } as HomeAssistant;

window.customCards = window.customCards ?? [];
for (const type of ["overview", "plant"]) {
  window.customCards.push({
    type: `rootwise-${type}-card`,
    name: localize(page, `picker.${type}.name`),
    description: localize(page, `picker.${type}.description`),
    preview: true,
    documentationURL: "https://github.com/michi-walchsi/ha-rootwise",
  });
}

void defineWhenReady([
  ["rootwise-moisture-chart", RootwiseMoistureChart],
  ["rootwise-overview-card", RootwiseOverviewCard],
  ["rootwise-plant-card", RootwisePlantCard],
]);

console.info(`%c ROOTWISE-CARDS %c ${__VERSION__} `, "background:#2e7d32;color:#fff", "");
