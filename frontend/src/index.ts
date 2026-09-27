// Entry point: Home Assistant loads this module on every page (registered by
// custom_components/rootwise/frontend.py), so the cards need no resource entry.

import "./cards/overview-card";
import "./cards/plant-card";
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

console.info(`%c ROOTWISE-CARDS %c ${__VERSION__} `, "background:#2e7d32;color:#fff", "");
