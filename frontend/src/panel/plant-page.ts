import { css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { calibrateHistory } from "../calibration";
import { HistoryController } from "../history-controller";
import { navigate, plantPath } from "../navigate";
import { RootwiseCardBase } from "../cards/base";
import { language } from "../i18n";
import { amountText, potLine, speciesFacts, toxicityInfo, wateringHow } from "../plant-info";
import { theme } from "../theme";
import type { Plant } from "../types";
import { configure } from "./configure";

const TOX_ICONS = { cats: "mdi:cat", dogs: "mdi:dog", humans: "mdi:human-child" } as const;

/** One plant in the panel: picture, the plant card, chart, pot and species. */
export class RootwisePlantPage extends RootwiseCardBase {
  @property() plantId = "";
  @state() private days: 14 | 30 = 14;
  private readonly history = new HistoryController(this);

  private get plant(): Plant | undefined {
    return this.payload?.plants.find((p) => p.id === this.plantId);
  }

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    this.history.sync(this.hass, this.plant, this.days);
  }

  protected override render(): TemplateResult {
    if (!this.payload) return html`<div class="empty muted">…</div>`;
    const plant = this.plant;
    if (!plant) return html`<div class="empty muted">${this.t("panel.unknown")}</div>`;
    return html`
      ${this.renderHero(plant)}
      <rootwise-plant-card
        .hass=${this.hass}
        ${configure({
          type: "custom:rootwise-plant-card",
          plant_id: plant.id,
          show_history: true,
          embedded: true,
        })}
      ></rootwise-plant-card>
      ${plant.thresholds || plant.measurements.soil_moisture ? this.renderChart() : nothing}
      <rootwise-photo-gallery
        .hass=${this.hass}
        .plant=${plant}
        ?dark=${Boolean(this.hass?.themes?.darkMode)}
      ></rootwise-photo-gallery>
      ${this.renderCalibration(plant)} ${this.renderPot(plant)} ${this.renderSpecies(plant)}
    `;
  }

  private renderHero(plant: Plant): TemplateResult {
    const species = [plant.species.common, plant.species.scientific].filter(
      (name, i, all): name is string => Boolean(name) && all.indexOf(name) === i,
    );
    const place = [plant.area, plant.pot.window !== "none" ? this.t(`window.${plant.pot.window}`) : null];
    if (plant.photo) {
      const taken = new Intl.DateTimeFormat(language(this.hass), { day: "numeric", month: "numeric" }).format(
        new Date(plant.photo.ts),
      );
      return html`
        <section class="hero big">
          <rootwise-auth-image
            class="cover"
            .hass=${this.hass}
            plantId=${plant.id}
            photoId=${plant.photo.id}
            size="full"
            alt=${plant.name}
          ></rootwise-auth-image>
          <div class="hero-text">
            <h2>${plant.name}</h2>
            <div class="muted">${place.filter(Boolean).join(" · ")}</div>
            ${species.length ? html`<div class="muted italic">${species.join(" · ")}</div>` : nothing}
            <div class="muted small">${this.t("photo.cover_caption", { date: taken })}</div>
          </div>
        </section>
      `;
    }
    return html`
      <section class="hero">
        <div class="photo">
          ${plant.species.image_url
            ? html`<img
                src=${plant.species.image_url}
                alt=""
                @error=${(e: Event) => ((e.target as HTMLElement).hidden = true)}
              />`
            : nothing}
          <ha-icon icon="mdi:sprout"></ha-icon>
        </div>
        <div class="hero-text">
          <h2>${plant.name}</h2>
          <div class="muted">${place.filter(Boolean).join(" · ")}</div>
          ${species.length ? html`<div class="muted italic">${species.join(" · ")}</div>` : nothing}
        </div>
      </section>
    `;
  }

  private renderChart(): TemplateResult {
    // Same scale as the chart: calibrated percent if the probe is calibrated.
    const data = this.history.data;
    const thresholds = data ? calibrateHistory(data).thresholds : null;
    return html`
      <section class="surface">
        <div class="section-head">
          <h3>${this.t("section.moisture")}</h3>
          <div class="segments" role="group">
            ${([14, 30] as const).map(
              (days) => html`<button
                aria-pressed=${days === this.days ? "true" : "false"}
                @click=${() => (this.days = days)}
              >
                ${this.t("panel.days", { days })}
              </button>`,
            )}
          </div>
        </div>
        <rootwise-moisture-chart
          .data=${data}
          language=${language(this.hass)}
          ?dark=${Boolean(this.hass?.themes?.darkMode)}
          height="200"
        ></rootwise-moisture-chart>
        <div class="legend muted">
          <span><i class="key drop"></i>${this.t("care.watered")}</span>
          <span><i class="key dash"></i>${this.t("chart.forecast")}</span>
          ${thresholds
            ? html`<span
                ><i class="key band"></i>${this.t("chart.target", {
                  low: Math.round(thresholds.low),
                  high: Math.round(thresholds.high),
                })}</span
              >`
            : nothing}
        </div>
      </section>
    `;
  }

  private renderCalibration(plant: Plant): TemplateResult | typeof nothing {
    if (!plant.measurements.soil_moisture || !this.hass?.user?.is_admin) return nothing;
    const scale = plant.calibration;
    return html`
      <section class="surface">
        <div class="section-head">
          <h3>${this.t("calibration.section")}</h3>
          <button class="link" @click=${() => navigate(`${plantPath(plant.id)}/calibrate`)}>
            ${this.t(scale ? "calibration.open" : "calibration.start")}
          </button>
        </div>
        <p class="muted small">
          ${scale
            ? this.t("calibration.section_done", { dry: scale.dry, wet: scale.wet })
            : this.t("calibration.section_none")}
        </p>
        ${scale?.outdated ? html`<p class="warn small">${this.t("calibration.outdated")}</p>` : nothing}
      </section>
    `;
  }

  private renderPot(plant: Plant): TemplateResult {
    const amount = this.hass ? amountText(this.hass, plant.pot.amount) : null;
    return html`
      <section class="surface">
        <h3>${this.t("section.pot")}</h3>
        <div class="row">
          <ha-icon icon="mdi:pot-outline"></ha-icon>
          <span>${this.hass ? potLine(this.hass, plant.pot) : ""}</span>
        </div>
        ${amount && this.hass
          ? html`<div class="row">
              <ha-icon icon="mdi:cup-water"></ha-icon>
              <span>
                <b>${this.t("amount.per_watering", { amount })}</b><br />
                <span class="muted">${wateringHow(this.hass, plant.pot)}</span>
              </span>
            </div>`
          : nothing}
      </section>
    `;
  }

  private renderSpecies(plant: Plant): TemplateResult | typeof nothing {
    if (!this.hass) return nothing;
    const facts = speciesFacts(this.hass, plant.species);
    const toxicity = toxicityInfo(this.hass, plant.species);
    if (!facts.length && !toxicity) return nothing;
    return html`
      <section class="surface">
        <h3>${this.t("section.species")}</h3>
        ${facts.length
          ? html`<dl class="facts">
              ${facts.map((fact) => html`<dt>${fact.label}</dt><dd>${fact.text}</dd>`)}
            </dl>`
          : nothing}
        ${toxicity
          ? html`<div class="tox">
              <div class="tox-title">${this.t("species.toxicity")}</div>
              <div class="badges">
                ${toxicity.badges.map(
                  (badge) => html`<span class="badge ${badge.level}">
                    <ha-icon icon=${TOX_ICONS[badge.key]}></ha-icon>${badge.who}: ${badge.text}
                  </span>`,
                )}
              </div>
              <p class="muted small">
                ${[toxicity.note, toxicity.source, this.t("tox.emergency")].filter(Boolean).join(" ")}
              </p>
            </div>`
          : nothing}
      </section>
    `;
  }

  static override styles = [
    theme,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .empty {
        padding: 32px 16px;
        text-align: center;
      }
      ha-icon {
        --mdc-icon-size: 20px;
        flex-shrink: 0;
      }
      .hero {
        display: flex;
        gap: 14px;
        align-items: center;
      }
      .hero.big {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
      }
      .cover {
        width: 100%;
        aspect-ratio: 4 / 3;
        max-height: 320px;
        border-radius: var(--rw-radius);
      }
      .photo {
        position: relative;
        width: 96px;
        height: 96px;
        flex-shrink: 0;
        border-radius: 20px;
        overflow: hidden;
        background: var(--rw-accent-soft);
        color: var(--rw-accent);
        display: grid;
        place-items: center;
      }
      .photo ha-icon {
        --mdc-icon-size: 40px;
      }
      .photo img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .hero-text {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      h2 {
        margin: 0 0 2px;
        font-size: 22px;
        font-weight: 500;
        line-height: 1.2;
      }
      .italic {
        font-style: italic;
      }
      .surface {
        background: var(--ha-card-background, var(--card-background-color, #fff));
        border-radius: var(--rw-radius);
        border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--rw-line));
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }
      .section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .segments {
        display: flex;
        border: 1px solid var(--rw-line);
        border-radius: 18px;
        overflow: hidden;
      }
      .segments button {
        min-height: 32px;
        padding: 0 12px;
        border: 0;
        background: none;
        font-size: 13px;
      }
      .segments button[aria-pressed="true"] {
        background: var(--rw-accent-soft);
        color: var(--rw-accent);
        font-weight: 500;
      }
      .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 14px;
        font-size: 12px;
      }
      .legend span {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .key {
        display: inline-block;
      }
      .key.drop {
        width: 8px;
        height: 8px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        background: var(--rw-water);
      }
      .key.dash {
        width: 16px;
        border-top: 2px dashed var(--rw-water);
      }
      .key.band {
        width: 14px;
        height: 10px;
        border-radius: 2px;
        background: var(--rw-accent-soft);
        border: 1px solid var(--rw-accent);
      }
      .row {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        line-height: 1.4;
      }
      .row ha-icon {
        color: var(--rw-text2);
        margin-top: 1px;
      }
      .facts {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 6px 16px;
        margin: 0;
      }
      dt {
        color: var(--rw-text2);
      }
      dd {
        margin: 0;
      }
      .tox {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-top: 4px;
        border-top: 1px solid var(--rw-line);
      }
      .tox-title {
        color: var(--rw-text2);
        padding-top: 8px;
      }
      .badges {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 14px;
        font-size: 13px;
        background: var(--rw-track);
      }
      .badge ha-icon {
        --mdc-icon-size: 16px;
      }
      .badge.none {
        background: var(--rw-accent-soft);
        color: var(--rw-accent);
      }
      .badge.mild,
      .badge.moderate {
        background: var(--rw-warn-soft);
        color: var(--rw-warn);
      }
      .badge.severe {
        background: var(--rw-prob-soft);
        color: var(--rw-prob);
      }
      .small {
        font-size: 13px;
        margin: 0;
        line-height: 1.4;
      }
      .link {
        border: 0;
        background: none;
        padding: 6px 4px;
        color: var(--rw-accent);
        font-weight: 500;
      }
      .warn {
        color: var(--rw-warn);
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "rootwise-plant-page": RootwisePlantPage;
  }
}
