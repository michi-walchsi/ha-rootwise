import { css, html, nothing, type TemplateResult } from "lit";
import { state } from "lit/decorators.js";
import { deleteCare, logCare } from "../api";
import { language } from "../i18n";
import { bySeverity, checklist, dueLine, duePlants, inArea, summary, tile } from "../overview-view";
import { amountText } from "../plant-info";
import { theme } from "../theme";
import type { JournalEntry, LovelaceCardConfig, Plant } from "../types";
import { RootwiseCardBase, editorLabel, errorText } from "./base";

interface OverviewConfig extends LovelaceCardConfig {
  title?: string;
  area_id?: string;
  show_tiles?: boolean;
}

interface Toast {
  text: string;
  undo?: JournalEntry[];
}

// A ticked row stays visible this long, so a wrong tick can be taken back.
const KEEP_TICKED_MS = 60 * 60 * 1000;
const TOAST_MS = 10_000;

export class RootwiseOverviewCard extends RootwiseCardBase {
  @state() private config?: OverviewConfig;
  @state() private ticked = new Map<string, JournalEntry>();
  @state() private busy = new Set<string>();
  @state() private toast?: Toast;
  private toastTimer?: number;

  static getConfigForm() {
    return {
      schema: [
        { name: "title", selector: { text: {} } },
        { name: "area_id", selector: { area: {} } },
        { name: "show_tiles", selector: { boolean: {} } },
      ],
      computeLabel: editorLabel,
    };
  }

  static getStubConfig(): Partial<OverviewConfig> {
    return { show_tiles: true };
  }

  setConfig(config: OverviewConfig): void {
    this.config = { show_tiles: true, ...config };
  }

  getCardSize(): number {
    return 3 + (this.payload ? duePlants(this.payload.plants).length : 0);
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this.toastTimer);
  }

  // ---- actions ------------------------------------------------------------

  private async toggle(plant: Plant): Promise<void> {
    if (!this.hass || this.busy.has(plant.id)) return;
    this.busy = new Set(this.busy).add(plant.id);
    const entry = this.ticked.get(plant.id);
    try {
      const ticked = new Map(this.ticked);
      if (entry) {
        await deleteCare(this.hass, entry.id);
        ticked.delete(plant.id);
      } else {
        ticked.set(plant.id, await logCare(this.hass, plant.id, "watered"));
      }
      this.ticked = ticked;
    } catch (err) {
      this.showToast({ text: this.t("toast.failed", { error: errorText(err) }) });
    } finally {
      const busy = new Set(this.busy);
      busy.delete(plant.id);
      this.busy = busy;
    }
  }

  private async allDone(plants: Plant[]): Promise<void> {
    const hass = this.hass;
    if (!hass) return;
    const open = plants.filter((p) => !this.ticked.has(p.id));
    try {
      const entries = await Promise.all(open.map((p) => logCare(hass, p.id, "watered")));
      const ticked = new Map(this.ticked);
      open.forEach((p, i) => ticked.set(p.id, entries[i] as JournalEntry));
      this.ticked = ticked;
      this.showToast({ text: this.t("overview.all_logged", { count: entries.length }), undo: entries });
    } catch (err) {
      this.showToast({ text: this.t("toast.failed", { error: errorText(err) }) });
    }
  }

  private async undoAll(entries: JournalEntry[]): Promise<void> {
    const hass = this.hass;
    if (!hass) return;
    try {
      await Promise.all(entries.map((e) => deleteCare(hass, e.id)));
      const ticked = new Map(this.ticked);
      entries.forEach((e) => ticked.delete(e.plant_id));
      this.ticked = ticked;
      this.showToast({ text: this.t("toast.undone") });
    } catch (err) {
      this.showToast({ text: this.t("toast.failed", { error: errorText(err) }) });
    }
  }

  private showToast(toast: Toast): void {
    this.toast = toast;
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.toast = undefined;
    }, TOAST_MS);
  }

  // ---- rendering ------------------------------------------------------------

  protected override render(): TemplateResult {
    const hass = this.hass;
    if (!this.payload || !hass) return html`<ha-card><div class="empty muted">…</div></ha-card>`;
    if (!this.payload.loaded) {
      return html`<ha-card><div class="empty muted">${this.t("not_loaded")}</div></ha-card>`;
    }
    const plants = inArea(this.payload.plants, this.config?.area_id);
    const due = duePlants(plants);
    const now = Date.now();
    const rows = checklist(plants, (p) => {
      const entry = this.ticked.get(p.id);
      return entry !== undefined && now - Date.parse(entry.ts) < KEEP_TICKED_MS;
    });
    const open = due.filter((p) => !this.ticked.has(p.id));

    return html`
      <ha-card>
        <div class="head">
          <span class="badge"><ha-icon icon="mdi:sprout"></ha-icon></span>
          <div class="titles">
            <div class="title">${this.config?.title || this.t("overview.title")}</div>
            <div class="muted small">${plants.length ? summary(hass, plants) : ""}</div>
          </div>
        </div>
        ${this.payload.vacation
          ? html`<div class="banner"><ha-icon icon="mdi:airplane"></ha-icon>${this.t("vacation")}</div>`
          : nothing}
        ${plants.length === 0 ? html`<div class="empty muted">${this.t("overview.empty")}</div>` : nothing}
        ${rows.length
          ? html`<ul class="due" aria-label=${this.t("overview.today")}>
              ${rows.map((p) => this.renderRow(p))}
            </ul>`
          : nothing}
        ${open.length >= 2
          ? html`<button class="all" @click=${() => void this.allDone(open)}>
              <ha-icon icon="mdi:check-all"></ha-icon>${this.t("overview.all_done")}
            </button>`
          : nothing}
        ${this.toast ? this.renderToast(this.toast) : nothing}
        ${this.config?.show_tiles && plants.length
          ? html`<div class="tiles">${bySeverity(plants).map((p) => this.renderTile(p))}</div>`
          : nothing}
      </ha-card>
    `;
  }

  private renderRow(plant: Plant): TemplateResult {
    const hass = this.hass;
    const entry = this.ticked.get(plant.id);
    const amount = hass ? amountText(hass, plant.pot.amount) : null;
    const line = entry
      ? this.t("overview.logged_at", {
          time: new Intl.DateTimeFormat(language(hass), { hour: "2-digit", minute: "2-digit" }).format(
            new Date(entry.ts),
          ),
        })
      : hass
        ? dueLine(hass, plant)
        : "";
    return html`
      <li>
        <button
          class="tick ${entry ? "done" : ""}"
          aria-pressed=${entry ? "true" : "false"}
          aria-label=${this.t(entry ? "overview.undo_row" : "overview.log_row", { name: plant.name })}
          ?disabled=${this.busy.has(plant.id)}
          @click=${() => void this.toggle(plant)}
        >
          <ha-icon icon="mdi:check"></ha-icon>
        </button>
        <div
          class="row-text"
          role="button"
          tabindex="0"
          @click=${() => this.openPlant(plant)}
          @keydown=${(e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") this.openPlant(plant);
          }}
        >
          <span class="name">${plant.name}</span>
          <span class="muted small">${line}</span>
          ${!entry && amount ? html`<span class="muted small">${amount}</span>` : nothing}
        </div>
      </li>
    `;
  }

  private renderTile(plant: Plant): TemplateResult {
    const info = this.hass ? tile(this.hass, plant, new Date()) : { color: "", text: "" };
    return html`
      <button class="tile" @click=${() => this.openPlant(plant)}>
        <span class="tile-name"><span class="dot" style="background:${info.color}"></span>${plant.name}</span>
        <span class="muted tiny">${info.text}</span>
      </button>
    `;
  }

  private renderToast(toast: Toast): TemplateResult {
    const undo = toast.undo;
    return html`
      <div class="toast" role="status">
        <span>${toast.text}</span>
        ${undo
          ? html`<button class="link" @click=${() => void this.undoAll(undo)}>${this.t("action.undo")}</button>`
          : nothing}
      </div>
    `;
  }

  static override styles = [
    theme,
    css`
      ha-card {
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      ha-icon {
        --mdc-icon-size: 20px;
        flex-shrink: 0;
      }
      .empty {
        padding: 0 16px 14px;
      }
      .small {
        font-size: 13px;
      }
      .tiny {
        max-width: 100%;
        font-size: 12px;
        line-height: 1.3;
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        line-clamp: 2;
      }
      .head {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 16px 10px;
      }
      .badge {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        flex-shrink: 0;
        background: var(--rw-accent-soft);
        color: var(--rw-accent);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .titles {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .title {
        font-size: 17px;
        font-weight: 700;
      }
      .banner {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 16px 10px;
        padding: 8px 12px;
        border-radius: 10px;
        background: var(--rw-water-soft);
        font-size: 14px;
      }
      .due {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .due li {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 16px;
        border-top: 1px solid var(--rw-line);
      }
      .tick {
        width: 44px;
        height: 44px;
        flex-shrink: 0;
        border-radius: 50%;
        border: 2px solid var(--rw-water);
        background: transparent;
        color: var(--rw-water);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      }
      .tick.done {
        background: var(--rw-water);
        color: var(--rw-water-ink);
      }
      .tick:disabled {
        opacity: 0.6;
      }
      .row-text {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
        flex-grow: 1;
        cursor: pointer;
      }
      .name {
        font-weight: 700;
      }
      .all {
        margin: 4px 16px 10px;
        min-height: 44px;
        border-radius: 12px;
        border: 1px solid var(--rw-water);
        background: var(--rw-water-soft);
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .toast {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin: 0 16px 10px;
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
      .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
        gap: 6px;
        padding: 10px 12px 14px;
        border-top: 1px solid var(--rw-line);
      }
      .tile {
        min-width: 0;
        min-height: 52px;
        padding: 8px;
        border: 0;
        border-radius: 12px;
        background: var(--rw-track);
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 2px;
        text-align: left;
      }
      .tile-name {
        display: flex;
        align-items: center;
        gap: 5px;
        max-width: 100%;
        font-size: 12px;
        font-weight: 700;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "rootwise-overview-card": RootwiseOverviewCard;
  }
}
