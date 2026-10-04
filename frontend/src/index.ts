// Entry point: Home Assistant loads this module on every page (registered by
// custom_components/rootwise/frontend.py), so the cards need no resource entry.
// The Plants panel lives in the same module.

import { RootwiseOverviewCard } from "./cards/overview-card";
import { RootwisePlantCard } from "./cards/plant-card";
import { RootwiseAuthImage } from "./components/auth-image";
import { RootwiseMoistureChart } from "./components/moisture-chart";
import { RootwisePhotoCapture } from "./components/photo-capture";
import { RootwisePhotoGallery } from "./components/photo-gallery";
import { defineWhenReady } from "./define";
import { RootwiseCalibrationPage } from "./panel/calibration-page";
import { RootwisePlantPage } from "./panel/plant-page";
import { RootwisePanel } from "./panel/rootwise-panel";
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
  ["rootwise-auth-image", RootwiseAuthImage],
  ["rootwise-moisture-chart", RootwiseMoistureChart],
  ["rootwise-photo-capture", RootwisePhotoCapture],
  ["rootwise-photo-gallery", RootwisePhotoGallery],
  ["rootwise-overview-card", RootwiseOverviewCard],
  ["rootwise-plant-card", RootwisePlantCard],
  ["rootwise-plant-page", RootwisePlantPage],
  ["rootwise-calibration-page", RootwiseCalibrationPage],
  ["rootwise-panel", RootwisePanel],
]);

console.info(`%c ROOTWISE-CARDS %c ${__VERSION__} `, "background:#2e7d32;color:#fff", "");
