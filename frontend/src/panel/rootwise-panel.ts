import { css, html, nothing, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { RootwiseCardBase } from "../cards/base";
import { navigate, PANEL_PATH, plantPath } from "../navigate";
import { theme } from "../theme";
import type { Plant } from "../types";
import { configure } from "./configure";

interface Route {
  prefix: string;
  path: string;
}

type Page =
  | { kind: "overview" }
  | { kind: "add" }
  | { kind: "plant"; id: string }
  | { kind: "calibrate"; id: string };

/** Route below /rootwise: "", "/add", "/plant/<id>" or "/plant/<id>/calibrate". */
export function pageFor(path: string | undefined): Page {
  if (path === "/add") return { kind: "add" };
  const match = /^\/plant\/([^/]+)(\/calibrate)?/.exec(path ?? "");
  if (!match?.[1]) return { kind: "overview" };
  const id = decodeURIComponent(match[1]);
  return match[2] ? { kind: "calibrate", id } : { kind: "plant", id };
}

function areas(plants: Plant[]): { id: string; name: string }[] {
  const seen = new Map<string, string>();
  for (const plant of plants) {
    if (plant.area_id && plant.area) seen.set(plant.area_id, plant.area);
  }
  return [...seen].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
}

/** The "Plants" panel in the sidebar. Home Assistant sets hass, narrow and route. */
export class RootwisePanel extends RootwiseCardBase {
  @property({ type: Boolean }) narrow = false;
  @property({ attribute: false }) route?: Route;
  @property({ attribute: false }) panel?: unknown;
  @state() private area: string | null = null;

  protected override render(): TemplateResult {
    const page = pageFor(this.route?.path);
    const plant =
      page.kind === "plant" || page.kind === "calibrate"
        ? this.payload?.plants.find((p) => p.id === page.id)
        : undefined;
    const back = page.kind === "calibrate" ? plantPath(page.id) : PANEL_PATH;
    const title =
      page.kind === "overview"
        ? this.t("panel.title")
        : page.kind === "add"
          ? this.t("wizard.title")
          : page.kind === "calibrate"
            ? this.t("calibration.title")
            : (plant?.name ?? "");
    return html`
      <header class="toolbar">
        ${page.kind !== "overview"
          ? html`<button class="icon" aria-label=${this.t("panel.back")} @click=${() => navigate(back)}>
              <ha-icon icon="mdi:arrow-left"></ha-icon>
            </button>`
          : this.narrow
            ? html`<button class="icon" aria-label=${this.t("panel.menu")} @click=${this.toggleMenu}>
                <ha-icon icon="mdi:menu"></ha-icon>
              </button>`
            : nothing}
        <h1 class="title">${title}</h1>
        ${page.kind === "plant" && plant?.device_id && this.hass?.user?.is_admin
          ? html`<button
              class="icon"
              aria-label=${this.t("panel.settings")}
              title=${this.t("panel.settings")}
              @click=${() => navigate(`/config/devices/device/${plant.device_id}`)}
            >
              <ha-icon icon="mdi:tune-variant"></ha-icon>
            </button>`
          : nothing}
      </header>
      <main>
        ${page.kind === "overview"
          ? this.renderOverview()
          : page.kind === "add"
            ? html`<rootwise-wizard-page .hass=${this.hass}></rootwise-wizard-page>`
            : page.kind === "calibrate"
              ? html`<rootwise-calibration-page .hass=${this.hass} .plantId=${page.id}></rootwise-calibration-page>`
              : this.renderPlant(page.id)}
      </main>
    `;
  }

  private renderOverview(): TemplateResult {
    const rooms = areas(this.payload?.plants ?? []);
    // A room can disappear (plant moved); then show all again.
    const area = rooms.some((r) => r.id === this.area) ? this.area : null;
    return html`
      ${rooms.length > 1
        ? html`<div class="chips" role="group" aria-label=${this.t("panel.rooms")}>
            ${[{ id: null, name: this.t("panel.all") }, ...rooms].map(
              (room) => html`<button
                class="chip"
                aria-pressed=${room.id === area ? "true" : "false"}
                @click=${() => (this.area = room.id)}
              >
                ${room.name}
              </button>`,
            )}
          </div>`
        : nothing}
      <rootwise-overview-card
        .hass=${this.hass}
        ${configure({ type: "custom:rootwise-overview-card", area_id: area ?? undefined, show_tiles: true })}
      ></rootwise-overview-card>
      ${this.hass?.user?.is_admin
        ? html`<button class="fab" @click=${() => navigate(`${PANEL_PATH}/add`)}>
            <ha-icon icon="mdi:plus"></ha-icon>${this.t("panel.add")}
          </button>`
        : nothing}
    `;
  }

  private renderPlant(id: string): TemplateResult {
    return html`<rootwise-plant-page .hass=${this.hass} .plantId=${id}></rootwise-plant-page>`;
  }

  private toggleMenu = (): void => {
    this.dispatchEvent(new CustomEvent("hass-toggle-menu", { bubbles: true, composed: true }));
  };

  static override styles = [
    theme,
    css`
      :host {
        min-height: 100%;
        background: var(--primary-background-color);
      }
      .toolbar {
        position: sticky;
        top: 0;
        z-index: 2;
        display: flex;
        align-items: center;
        gap: 4px;
        height: var(--header-height, 56px);
        padding: 0 4px;
        background: var(--app-header-background-color, var(--primary-background-color));
        color: var(--app-header-text-color, var(--primary-text-color));
        border-bottom: var(--app-header-border-bottom, 1px solid var(--divider-color));
      }
      .title {
        flex: 1;
        margin: 0 0 0 12px;
        font-size: 20px;
        font-weight: 400;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .icon {
        width: 48px;
        height: 48px;
        border: 0;
        border-radius: 50%;
        background: none;
        display: grid;
        place-items: center;
        color: inherit;
      }
      .icon:hover {
        background: rgba(127, 127, 127, 0.12);
      }
      main {
        max-width: 720px;
        margin: 0 auto;
        padding: 12px 12px 32px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .fab {
        position: fixed;
        right: calc(16px + env(safe-area-inset-right, 0px));
        bottom: calc(16px + env(safe-area-inset-bottom, 0px));
        z-index: 3;
        min-height: 56px;
        padding: 0 22px 0 18px;
        border: 0;
        border-radius: 28px;
        background: var(--rw-accent);
        color: #fff;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;
        font-weight: 500;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
      }
      main {
        padding-bottom: 88px;
      }
      .chips {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding: 2px 0;
        scrollbar-width: none;
      }
      .chip {
        flex-shrink: 0;
        min-height: 36px;
        padding: 0 14px;
        border-radius: 18px;
        border: 1px solid var(--rw-line);
        background: var(--ha-card-background, var(--card-background-color, #fff));
        font-size: 14px;
      }
      .chip[aria-pressed="true"] {
        background: var(--rw-accent-soft);
        border-color: var(--rw-accent);
        color: var(--rw-accent);
        font-weight: 500;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "rootwise-panel": RootwisePanel;
  }
}
