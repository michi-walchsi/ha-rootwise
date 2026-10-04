// Texts for the plant page: how much to water, the pot, what the species
// wants and how toxic it is. Pure functions over the plant payload.

import { language, localize, plural } from "./i18n";
import type { HomeAssistant, Pot, Range, Species, Toxicity } from "./types";

export interface Fact {
  key: "watering" | "light" | "temperature" | "humidity" | "fertilize";
  label: string;
  text: string;
}

export interface ToxicityInfo {
  badges: { who: string; key: "cats" | "dogs" | "humans"; level: Toxicity; text: string }[];
  note: string | null;
  source: string;
}

/** "ca. 1,5–1,9 l" or "ca. 200–300 ml". */
export function amountText(hass: HomeAssistant, amount: [number, number] | null): string | null {
  if (!amount) return null;
  const [low, high] = amount;
  const litres = high >= 1000;
  const format = new Intl.NumberFormat(language(hass), { maximumFractionDigits: litres ? 1 : 0 });
  const show = (ml: number) => format.format(litres ? ml / 1000 : ml);
  const unit = litres ? "l" : "ml";
  if (low === high) return localize(hass, "amount.one", { value: show(low), unit });
  return localize(hass, "amount.range", { from: show(low), to: show(high), unit });
}

/** "24 cm · Kunststoff · Fenster West". */
export function potLine(hass: HomeAssistant, pot: Pot): string {
  const parts = [`${pot.diameter} cm`, localize(hass, `pot.${pot.material}`)];
  if (pot.window !== "none") parts.push(localize(hass, `window.${pot.window}`));
  if (!pot.drainage) parts.push(localize(hass, "pot.no_drainage"));
  return parts.join(" · ");
}

/** How to water this pot. */
export function wateringHow(hass: HomeAssistant, pot: Pot): string {
  if (pot.material === "self_watering") return localize(hass, "how.self_watering");
  return localize(hass, pot.drainage ? "how.drainage" : "how.no_drainage");
}

function rangeText(hass: HomeAssistant, range: Range | undefined, unit: string): string | null {
  if (!range) return null;
  const { min, max } = range;
  if (min !== null && max !== null) return localize(hass, "range.both", { min, max, unit });
  if (min !== null) return localize(hass, "range.min", { min, unit });
  if (max !== null) return localize(hass, "range.max", { max, unit });
  return null;
}

/** What the species wants, as far as it is known. */
export function speciesFacts(hass: HomeAssistant, species: Species): Fact[] {
  const facts: Fact[] = [];
  const add = (key: Fact["key"], text: string | null) => {
    if (text) facts.push({ key, label: localize(hass, `species.${key}`), text });
  };
  add("watering", species.watering_style ? localize(hass, `style.${species.watering_style}`) : null);
  add(
    "light",
    species.dli
      ? localize(hass, "light.dli", { min: species.dli.min, max: species.dli.max })
      : rangeText(hass, species.ranges.illuminance, "lx"),
  );
  add("temperature", rangeText(hass, species.ranges.temperature, "°C"));
  add("humidity", rangeText(hass, species.ranges.air_humidity, "%"));
  add("fertilize", species.fertilize_weeks ? plural(hass, "fertilize", species.fertilize_weeks) : null);
  return facts;
}

/** Badges for cats, dogs and children, with substance and source. */
export function toxicityInfo(hass: HomeAssistant, species: Species): ToxicityInfo | null {
  const toxicity = species.toxicity;
  if (!toxicity) return null;
  const keys = ["cats", "dogs", "humans"] as const;
  return {
    badges: keys.map((key) => ({
      key,
      who: localize(hass, `tox.${key}`),
      level: toxicity[key],
      text: localize(hass, `tox.${toxicity[key]}`),
    })),
    note: toxicity.note ? localize(hass, `tox.note.${toxicity.note}`) : null,
    source: localize(hass, toxicity.source.includes("aspca.org") ? "tox.source.aspca" : "tox.source.other"),
  };
}
