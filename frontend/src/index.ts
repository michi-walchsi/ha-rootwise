// Entry point: Home Assistant loads this module on every page (registered by
// custom_components/rootwise/frontend.py), so the cards need no resource entry.

import "./cards/plant-card";

window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "rootwise-plant-card",
  name: "Rootwise plant",
  description: "One plant: status, moisture and climate ranges, watering with undo and history.",
  preview: true,
  documentationURL: "https://github.com/michi-walchsi/ha-rootwise",
});

console.info(`%c ROOTWISE-CARDS %c ${__VERSION__} `, "background:#2e7d32;color:#fff", "");
