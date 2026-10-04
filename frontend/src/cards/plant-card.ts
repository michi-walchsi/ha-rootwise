import { css, html, nothing, type TemplateResult } from "lit";
import { state } from "lit/decorators.js";
import { canDelete, deleteCare, logCare, resetThresholds, snooze } from "../api";
import { formatNumber, relativeTime, scale, shortDateTime } from "../format";
import { language } from "../i18n";
import { RootwiseCardBase, editorLabel, errorText } from "./base";
import {
  MEASUREMENT_ORDER,
  detail,
  entryDetail,
  findPlant,
  firstPlantDevice,
  hints,
  learnedHint,
  nextLine,
  toLocalInput,
  whenFor,
  type PlantRef,
  type WhenChoice,
} from "../plant-view";
import { ICONS, STATUS_COLOR, theme } from "../theme";
import type {
  HomeAssistant,
  JournalEntry,
  LovelaceCardConfig,
  Measurement,
  MeasurementKey,
  Plant,
} from "../types";

interface PlantCardConfig extends LovelaceCardConfig, PlantRef {
  show_history?: boolean;
  /** Inside the plant page, which shows name and picture itself. */
  embedded?: boolean;
}

interface Toast {
  text: string;
  undo?: JournalEntry;
}

const UNDO_SECONDS = 10;
const LONG_PRESS_MS = 500;

export class RootwisePlantCard extends RootwiseCardBase {
  @state() private config?: PlantCardConfig;
  @state() private panel: "none" | "when" | "more" = "none";
  @state() private pickTime = "";
  @state() private toast?: Toast;
  @state() private confirmDelete?: string;
  @state() private busy = false;

  private pressTimer?: number;
  private longPressed = false;
  private toastTimer?: number;
  private confirmTimer?: number;

  static getConfigForm() {
    return {
      schema: [
        {
          name: "device_id",
          required: true,
          selector: { device: { filter: [{ integration: "rootwise" }] } },
        },
        { name: "show_history", selector: { boolean: {} } },
      ],
      computeLabel: editorLabel,
    };
  }

  static getStubConfig(hass: HomeAssistant): Partial<PlantCardConfig> {
    return { device_id: firstPlantDevice(hass), show_history: true };
  }

  setConfig(config: PlantCardConfig): void {
    this.config = { show_history: true, ...config };
  }

  getCardSize(): number {
    return this.config?.show_history ? 8 : 5;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this.toastTimer);
    window.clearTimeout(this.confirmTimer);
  }

  private get plant(): Plant | undefined {
    return this.payload && this.config ? findPlant(this.payload.plants, this.config) : undefined;
  }

  // ---- actions ------------------------------------------------------------

  private async log(careType: string, when?: Date): Promise<void> {
    const plant = this.plant;
    if (!plant || !this.hass || this.busy) return;
    this.busy = true;
    this.panel = "none";
    try {
      const entry = await logCare(this.hass, plant.id, careType, when);
      this.showToast({ text: this.t("toast.logged", { type: this.t(`care.${careType}`) }), undo: entry });
    } catch (err) {
      this.showToast({ text: this.t("toast.failed", { error: errorText(err) }) });
    } finally {
      this.busy = false;
    }
  }

  private async deleteEntry(entry: JournalEntry, text: string): Promise<void> {
    if (!this.hass) return;
    try {
      await deleteCare(this.hass, entry.id);
      this.showToast({ text });
    } catch (err) {
      this.showToast({ text: this.t("toast.failed", { error: errorText(err) }) });
    }
  }

  private showToast(toast: Toast): void {
    this.toast = toast;
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.toast = undefined;
    }, UNDO_SECONDS * 1000);
  }

  private undo(): void {
    const entry = this.toast?.undo;
    if (entry) void this.deleteEntry(entry, this.t("toast.undone"));
  }

  private pressStart(): void {
    this.longPressed = false;
    window.clearTimeout(this.pressTimer);
    this.pressTimer = window.setTimeout(() => {
      this.longPressed = true;
      this.openWhen();
    }, LONG_PRESS_MS);
  }

  private pressEnd(): void {
    window.clearTimeout(this.pressTimer);
  }

  private waterClick(): void {
    if (this.longPressed) {
      this.longPressed = false;
      return;
    }
    void this.log("watered");
  }

  private openWhen(): void {
    this.pickTime = "";
    this.panel = "when";
  }

  private chooseWhen(choice: WhenChoice): void {
    void this.log("watered", whenFor(choice, new Date()));
  }

  private savePicked(): void {
    if (!this.pickTime) return;
    void this.log("watered", new Date(this.pickTime));
  }

  private askDelete(entry: JournalEntry): void {
    if (this.confirmDelete === entry.id) {
      this.confirmDelete = undefined;
      void this.deleteEntry(entry, this.t("toast.deleted"));
      return;
    }
    this.confirmDelete = entry.id;
    window.clearTimeout(this.confirmTimer);
    this.confirmTimer = window.setTimeout(() => {
      this.confirmDelete = undefined;
    }, 4000);
  }

  // ---- rendering ------------------------------------------------------------

  protected override render(): TemplateResult {
    if (!this.payload) return html`<ha-card><div class="empty muted">…</div></ha-card>`;
    if (!this.payload.loaded) {
      return html`<ha-card><div class="empty muted">${this.t("not_loaded")}</div></ha-card>`;
    }
    const plant = this.plant;
    if (!plant) {
      return html`<ha-card><div class="empty muted">${this.t("unknown_plant")}</div></ha-card>`;
    }
    const detailText = this.hass ? detail(this.hass, plant) : null;
    const hintTexts = this.hass ? hints(this.hass, plant) : [];
    const measurements = MEASUREMENT_ORDER.filter((key) => plant.measurements[key]);

    return html`
      <ha-card>
        ${this.payload.vacation
          ? html`<div class="banner"><ha-icon icon="mdi:airplane"></ha-icon>${this.t("vacation")}</div>`
          : nothing}
        ${this.config?.embedded ? nothing : this.renderHead(plant)}
        ${detailText ? html`<div class="detail">${detailText}</div>` : nothing}
        ${measurements.length
          ? html`<div class="bars">
              ${measurements.map((key) => this.renderBar(key, plant.measurements[key] as Measurement))}
            </div>`
          : nothing}
        ${hintTexts.length
          ? html`<ul class="hints">
              ${hintTexts.map((text) => html`<li><ha-icon icon="mdi:information-outline"></ha-icon>${text}</li>`)}
            </ul>`
          : nothing}
        ${this.renderLearned(plant)}
        <div class="when-block">
          ${this.renderNext(plant)}
          <div class="last muted">${this.lastWatered(plant)}</div>
        </div>
        ${this.renderActions(plant)} ${this.panel === "when" ? this.renderWhen() : nothing}
        ${this.panel === "more" ? this.renderMore() : nothing}
        ${this.toast ? this.renderToast(this.toast) : nothing}
        ${this.config?.show_history ? this.renderHistory(plant) : nothing}
      </ha-card>
    `;
  }

  private renderHead(plant: Plant): TemplateResult {
    const status = plant.status ?? "no_history";
    const common = plant.species.common;
    const scientific = plant.species.scientific;
    const species = [common, scientific].filter(Boolean).filter((s, i, a) => a.indexOf(s) === i);
    return html`
      <div
        class="head"
        role="button"
        tabindex="0"
        @click=${() => this.openPlant(plant)}
        @keydown=${(e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") this.openPlant(plant);
        }}
      >
        <div class="avatar">
          ${plant.species.image_url
            ? html`<img
                src=${plant.species.image_url}
                alt=""
                loading="lazy"
                @error=${(e: Event) => ((e.target as HTMLElement).hidden = true)}
              />`
            : nothing}
          <ha-icon icon="mdi:sprout"></ha-icon>
        </div>
        <div class="titles">
          <div class="name">${plant.name}</div>
          <div class="status">
            <span class="dot" style="background:${STATUS_COLOR[status]}"></span>
            <span>${this.t(`status.${status}`)}${plant.area ? ` · ${plant.area}` : ""}</span>
          </div>
          ${species.length
            ? html`<div class="species muted">${species.join(" · ")}</div>`
            : nothing}
        </div>
      </div>
    `;
  }

  private renderBar(key: MeasurementKey, m: Measurement): TemplateResult {
    const lang = language(this.hass);
    const s = scale(key, m.value, m.min, m.max);
    const unit = m.unit ?? "";
    const value =
      m.value === null ? "–" : `${formatNumber(key, m.value, lang)}${unit ? ` ${unit}` : ""}`;
    const off = m.rating === "low" || m.rating === "high" || m.level === "dry" || m.level === "too_wet";
    const target =
      m.min !== null && m.max !== null
        ? this.t("target.range", { min: m.min, max: m.max })
        : m.min !== null
          ? this.t("target.min", { min: m.min })
          : m.max !== null
            ? this.t("target.max", { max: m.max })
            : "";
    const label = this.t(`m.${key}`);
    const aria = `${label} ${m.value === null ? this.t("no_value") : value}${target ? `, ${target}` : ""}`;
    return html`
      <div
        class="bar-row ${off ? "off" : ""}"
        role="button"
        tabindex="0"
        @click=${() => this.moreInfo(this.plant?.entity_ids[key])}
      >
        <ha-icon icon=${ICONS[key] ?? "mdi:gauge"}></ha-icon>
        <span class="label">${label}</span>
        <div class="bar" role="img" aria-label=${aria}>
          <div class="zone" style="left:${s.low}%;width:${Math.max(s.high - s.low, 0)}%"></div>
          ${key === "soil_moisture" && s.marker !== null
            ? html`<div class="fill" style="width:${s.marker}%"></div>`
            : nothing}
          ${m.min !== null ? html`<div class="tick" style="left:${s.low}%"></div>` : nothing}
          ${m.max !== null ? html`<div class="tick" style="left:${s.high}%"></div>` : nothing}
          ${s.marker !== null ? html`<div class="marker" style="left:${s.marker}%"></div>` : nothing}
        </div>
        <span class="value num">${value}</span>
      </div>
    `;
  }

  private renderNext(plant: Plant): TemplateResult | typeof nothing {
    const line = this.hass ? nextLine(this.hass, plant, new Date()) : null;
    if (!line) return nothing;
    return html`<div class="next">
      <ha-icon icon="mdi:calendar-clock"></ha-icon>
      <span>${line.text}${line.window ? html` <span class="muted">${line.window}</span>` : nothing}</span>
    </div>`;
  }

  private renderLearned(plant: Plant): TemplateResult | typeof nothing {
    const hint = this.hass ? learnedHint(this.hass, plant) : null;
    if (!hint) return nothing;
    return html`<div class="learned muted">
      <ha-icon icon="mdi:school-outline"></ha-icon>
      <span>${hint.text}</span>
      ${hint.canApply
        ? html`<button class="link" @click=${() => void this.applyLearned(plant)}>
            ${this.t("thresholds.apply")}
          </button>`
        : nothing}
    </div>`;
  }

  private async applyLearned(plant: Plant): Promise<void> {
    if (!this.hass) return;
    try {
      await resetThresholds(this.hass, plant.id);
      this.showToast({ text: this.t("toast.thresholds") });
    } catch (err) {
      this.showToast({ text: this.t("toast.failed", { error: errorText(err) }) });
    }
  }

  private lastWatered(plant: Plant): string {
    if (!plant.last_watered) return this.t("never_watered");
    return this.t("last_watered", {
      time: relativeTime(plant.last_watered, new Date(), language(this.hass)),
    });
  }

  private renderActions(plant: Plant): TemplateResult {
    const snoozeEntity = plant.entity_ids.snooze;
    const logged = this.toast?.undo?.type === "watered";
    return html`
      <div class="actions">
        <button
          class="water ${logged ? "done" : ""}"
          ?disabled=${this.busy}
          @pointerdown=${this.pressStart}
          @pointerup=${this.pressEnd}
          @pointerleave=${this.pressEnd}
          @pointercancel=${this.pressEnd}
          @contextmenu=${(e: Event) => e.preventDefault()}
          @click=${this.waterClick}
        >
          <ha-icon icon=${logged ? "mdi:check" : "mdi:watering-can"}></ha-icon>
          ${this.t("action.water")}
        </button>
        ${plant.needs_water && snoozeEntity
          ? html`<button class="secondary" @click=${() => this.hass && void snooze(this.hass, snoozeEntity)}>
              ${this.t("action.snooze")}
            </button>`
          : nothing}
        <button
          class="icon"
          aria-label=${this.t("action.more")}
          aria-haspopup="true"
          aria-expanded=${this.panel === "more" ? "true" : "false"}
          @click=${() => (this.panel = this.panel === "more" ? "none" : "more")}
        >
          <ha-icon icon="mdi:dots-horizontal"></ha-icon>
        </button>
      </div>
    `;
  }

  private renderWhen(): TemplateResult {
    const max = toLocalInput(new Date());
    return html`
      <div class="panel" role="group" aria-label=${this.t("when.title")}>
        <div class="panel-title">${this.t("when.title")}</div>
        <div class="choices">
          ${(["now", "hours", "yesterday"] as WhenChoice[]).map(
            (choice) => html`<button @click=${() => this.chooseWhen(choice)}>${this.t(`when.${choice}`)}</button>`,
          )}
        </div>
        <label class="pick">
          <span class="muted">${this.t("when.pick")}</span>
          <input
            type="datetime-local"
            max=${max}
            .value=${this.pickTime}
            @input=${(e: Event) => (this.pickTime = (e.target as HTMLInputElement).value)}
          />
        </label>
        <div class="panel-actions">
          <button class="secondary" @click=${() => (this.panel = "none")}>${this.t("action.cancel")}</button>
          <button class="primary" ?disabled=${!this.pickTime} @click=${this.savePicked}>
            ${this.t("action.save")}
          </button>
        </div>
      </div>
    `;
  }

  private renderMore(): TemplateResult {
    return html`
      <div class="panel menu" role="menu">
        <button role="menuitem" @click=${this.openWhen}>
          <ha-icon icon="mdi:clock-edit-outline"></ha-icon>${this.t("more.other_time")}
        </button>
        ${["fertilized", "sensor_moved"].map(
          (type) => html`<button role="menuitem" @click=${() => void this.log(type)}>
            <ha-icon icon=${ICONS[type] ?? "mdi:plus"}></ha-icon>${this.t(`care.${type}`)}
          </button>`,
        )}
      </div>
    `;
  }

  private renderToast(toast: Toast): TemplateResult {
    return html`
      <div class="toast" role="status">
        <span>${toast.text}</span>
        ${toast.undo
          ? html`<button class="link" @click=${this.undo}>${this.t("action.undo")}</button>`
          : nothing}
      </div>
    `;
  }

  private renderHistory(plant: Plant): TemplateResult {
    const lang = language(this.hass);
    return html`
      <div class="history">
        <div class="section">${this.t("history")}</div>
        ${plant.recent.length === 0
          ? html`<div class="muted small">${this.t("history.empty")}</div>`
          : html`<ul>
              ${plant.recent.map((entry) => {
                const extra = this.hass ? entryDetail(this.hass, entry) : "";
                const deletable = this.hass ? canDelete(this.hass, entry) : false;
                const confirming = this.confirmDelete === entry.id;
                const detected = entry.source === "auto";
                return html`<li class=${detected ? "detected" : ""}>
                  <ha-icon icon=${ICONS[entry.type] ?? "mdi:circle-small"}></ha-icon>
                  <div class="entry">
                    <span>${this.t(`care.${entry.type}`)}</span>
                    <span class="muted small">
                      ${shortDateTime(entry.ts, lang)}${extra ? ` · ${extra}` : ""}
                    </span>
                  </div>
                  ${deletable
                    ? html`<button
                        class="delete ${confirming ? "confirm" : ""}"
                        aria-label=${this.t(detected ? "history.reject" : "action.delete")}
                        title=${this.t(detected ? "history.reject" : "action.delete")}
                        @click=${() => this.askDelete(entry)}
                      >
                        ${confirming
                          ? this.t(detected ? "history.reject_confirm" : "delete.confirm")
                          : html`<ha-icon
                              icon=${detected ? "mdi:close-circle-outline" : "mdi:delete-outline"}
                            ></ha-icon>`}
                      </button>`
                    : nothing}
                </li>`;
              })}
            </ul>`}
      </div>
    `;
  }

  static override styles = [
    theme,
    css`
      ha-card {
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow: hidden;
      }
      .empty {
        padding: 8px 0;
      }
      ha-icon {
        --mdc-icon-size: 20px;
        flex-shrink: 0;
      }
      .banner {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 10px;
        background: var(--rw-water-soft);
        font-size: 14px;
      }
      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        border-radius: 12px;
      }
      .avatar {
        position: relative;
        width: 56px;
        height: 56px;
        flex-shrink: 0;
        border-radius: 50%;
        overflow: hidden;
        background: var(--rw-accent-soft);
        color: var(--rw-accent);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .avatar ha-icon {
        --mdc-icon-size: 30px;
      }
      .avatar img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .titles {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .name {
        font-size: 18px;
        font-weight: 700;
        line-height: 1.2;
        overflow-wrap: anywhere;
      }
      .status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
      }
      .dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .species {
        font-size: 12px;
        font-style: italic;
      }
      .detail {
        font-size: 15px;
        font-weight: 600;
      }
      .bars {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .bar-row {
        display: grid;
        grid-template-columns: 20px minmax(64px, 7.5em) 1fr minmax(52px, auto);
        align-items: center;
        gap: 10px;
        font-size: 14px;
        cursor: pointer;
        min-height: 28px;
      }
      .bar-row ha-icon {
        color: var(--rw-text2);
      }
      .bar-row .label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .bar {
        position: relative;
        height: 8px;
        border-radius: 4px;
        background: var(--rw-track);
      }
      .zone {
        position: absolute;
        top: 0;
        bottom: 0;
        border-radius: 4px;
        background: var(--rw-accent-soft);
        box-shadow: inset 0 0 0 1px var(--rw-accent-soft);
      }
      .fill {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        border-radius: 4px;
        background: var(--rw-water);
        opacity: 0.55;
      }
      .tick {
        position: absolute;
        top: -3px;
        bottom: -3px;
        width: 2px;
        margin-left: -1px;
        border-radius: 1px;
        background: var(--rw-accent);
        opacity: 0.7;
      }
      .marker {
        position: absolute;
        top: -4px;
        width: 4px;
        height: 16px;
        margin-left: -2px;
        border-radius: 2px;
        background: var(--rw-accent);
        box-shadow: 0 0 0 2px var(--ha-card-background, var(--card-background-color, #fff));
      }
      .off .marker {
        background: var(--rw-warn);
      }
      .off .value {
        color: var(--rw-warn);
      }
      .value {
        text-align: right;
        font-weight: 700;
        white-space: nowrap;
      }
      .hints {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 13px;
      }
      .hints li {
        display: flex;
        gap: 6px;
        align-items: flex-start;
        color: var(--rw-warn);
      }
      .hints ha-icon {
        --mdc-icon-size: 16px;
        margin-top: 1px;
      }
      .when-block {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .next {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 15px;
        font-weight: 600;
      }
      .next ha-icon,
      .learned ha-icon {
        --mdc-icon-size: 18px;
        color: var(--rw-accent);
      }
      .last {
        font-size: 14px;
      }
      .learned {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
        font-size: 13px;
      }
      .learned .link {
        min-height: 32px;
        padding: 0 8px;
      }
      .actions {
        display: flex;
        gap: 8px;
      }
      .actions button,
      .panel button {
        min-height: 48px;
        border-radius: 12px;
        border: 1px solid var(--rw-line);
        background: transparent;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 0 14px;
      }
      .actions .water {
        flex-grow: 1;
        border-color: var(--rw-water);
        background: var(--rw-water-soft);
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
      }
      .actions .water.done {
        background: var(--rw-water);
        color: var(--rw-water-ink);
      }
      .actions .icon {
        width: 48px;
        padding: 0;
      }
      button:disabled {
        opacity: 0.6;
        cursor: default;
      }
      .panel {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
        border-radius: 12px;
        border: 1px solid var(--rw-line);
      }
      .panel-title {
        font-weight: 700;
      }
      .choices {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .choices button {
        justify-content: flex-start;
        font-weight: 500;
      }
      .pick {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 13px;
      }
      .pick input {
        min-height: 44px;
        font: inherit;
        color: inherit;
        background: transparent;
        border: 1px solid var(--rw-line);
        border-radius: 10px;
        padding: 0 10px;
        color-scheme: light dark;
      }
      .panel-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      .panel .primary {
        border-color: var(--rw-water);
        background: var(--rw-water);
        color: var(--rw-water-ink);
      }
      .menu {
        padding: 6px;
        gap: 2px;
      }
      .menu button {
        justify-content: flex-start;
        border: 0;
        font-weight: 500;
      }
      .toast {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 6px 6px 6px 12px;
        border-radius: 10px;
        background: var(--rw-accent-soft);
        font-size: 14px;
      }
      .link {
        min-height: 40px;
        padding: 0 12px;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: var(--rw-accent);
        font-weight: 700;
      }
      .history {
        border-top: 1px solid var(--rw-line);
        padding-top: 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .section {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--rw-text2);
      }
      .history ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
      }
      .history li {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 44px;
      }
      .history li ha-icon {
        color: var(--rw-text2);
      }
      .entry {
        flex-grow: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .small {
        font-size: 12px;
      }
      .delete {
        min-width: 44px;
        min-height: 44px;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: var(--rw-text2);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .delete.confirm {
        color: var(--error-color, #b3261e);
        font-weight: 700;
        padding: 0 10px;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "rootwise-plant-card": RootwisePlantCard;
  }
}
