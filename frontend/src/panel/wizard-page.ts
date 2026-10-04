import { css, html, nothing, type TemplateResult } from "lit";
import { state } from "lit/decorators.js";
import { calibrate, createPlant, searchSpecies, speciesInfo, suggestSensors } from "../api";
import { RootwiseCardBase, errorText } from "../cards/base";
import { language, plural } from "../i18n";
import { navigate, PANEL_PATH, plantPath } from "../navigate";
import { uploadPhoto } from "../photos";
import { theme } from "../theme";
import type { MeasurementKey, SensorRole, SensorSuggestions, SpeciesHit, SpeciesSearch } from "../types";
import { POT_SIZES, SENSOR_ROLES, initialSensors, nameFor, sizeFor, summary, type Chosen } from "../wizard";

type Step = "photo" | "species" | "basics" | "sensors" | "pot" | "done";
const STEPS: Step[] = ["photo", "species", "basics", "sensors", "pot", "done"];
const MATERIALS = ["plastic", "terracotta", "ceramic_glazed", "self_watering"];
const WINDOWS = ["none", "n", "ne", "e", "se", "s", "sw", "w", "nw"];
const LOCATIONS = ["indoor", "balcony", "outdoor"];
const ROLE_MEASUREMENT: Record<SensorRole, MeasurementKey> = {
  moisture_sensor: "soil_moisture",
  temperature_sensor: "temperature",
  humidity_sensor: "air_humidity",
  illuminance_sensor: "illuminance",
  conductivity_sensor: "conductivity",
  battery_sensor: "battery",
};
const ERRORS = new Set([
  "name_missing",
  "sensor_in_use",
  "unknown_species",
  "unknown_area",
  "unknown_sensor",
  "opb_failed",
  "unauthorized",
]);
const SEARCH_DELAY = 300;
const APPEAR_TIMEOUT = 20_000;
const READING_MS = 8000;

const nobody = (): Record<SensorRole, string | null> =>
  Object.fromEntries(SENSOR_ROLES.map((role) => [role, null])) as Record<SensorRole, string | null>;

/** "Add plant" in six steps: photo, species, name and room, sensors, pot, done. */
export class RootwiseWizardPage extends RootwiseCardBase {
  @state() private step: Step = "photo";
  @state() private photo?: Blob;
  @state() private photoUrl?: string;
  @state() private capturing = false;
  @state() private query = "";
  @state() private results?: SpeciesSearch;
  @state() private chosen: Chosen = null;
  @state() private name = "";
  @state() private areaId: string | null = null;
  @state() private suggestions?: SensorSuggestions;
  @state() private picked = nobody();
  @state() private diameter = 18;
  @state() private material = "plastic";
  @state() private drainage = true;
  @state() private window = "none";
  @state() private location = "indoor";
  @state() private placeOpen = false;
  @state() private busy = false;
  @state() private error?: string;
  @state() private createdId?: string;
  @state() private photoFailed = false;

  private nameTouched = false;
  private sensorsFor?: string;
  private searchTimer?: number;
  private started = Date.now();
  private createdAt = 0;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this.searchTimer);
    if (this.photoUrl) URL.revokeObjectURL(this.photoUrl);
  }

  // ---- steps ------------------------------------------------------------------

  private go(step: Step): void {
    this.error = undefined;
    if (step === "basics" && !this.nameTouched) this.name = nameFor(this.chosen);
    if (step === "sensors") void this.loadSensors();
    this.step = step;
    this.renderRoot.querySelector("main")?.scrollIntoView({ block: "start" });
  }

  private next = (): void => {
    const index = STEPS.indexOf(this.step);
    if (this.step === "pot") void this.create();
    else this.go(STEPS[index + 1] ?? "done");
  };

  private back = (): void => {
    const index = STEPS.indexOf(this.step);
    if (index <= 0) navigate(PANEL_PATH);
    else this.go(STEPS[index - 1] ?? "photo");
  };

  private get areas(): { id: string; name: string }[] {
    return Object.values(this.hass?.areas ?? {})
      .map((area) => ({ id: area.area_id, name: area.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private get areaName(): string | null {
    return this.areas.find((area) => area.id === this.areaId)?.name ?? null;
  }

  // ---- photo ----------------------------------------------------------------------

  private photoTaken = (event: CustomEvent<{ photo: Blob }>): void => {
    if (this.photoUrl) URL.revokeObjectURL(this.photoUrl);
    this.photo = event.detail.photo;
    this.photoUrl = URL.createObjectURL(event.detail.photo);
  };

  // ---- species ----------------------------------------------------------------------

  private onQuery = (event: Event): void => {
    this.query = (event.target as HTMLInputElement).value;
    window.clearTimeout(this.searchTimer);
    this.searchTimer = window.setTimeout(() => void this.search(), SEARCH_DELAY);
  };

  private async search(): Promise<void> {
    const query = this.query.trim();
    if (!this.hass || query.length < 2) {
      this.results = undefined;
      return;
    }
    try {
      const results = await searchSpecies(this.hass, query);
      if (this.query.trim() === query) this.results = results;
    } catch (err) {
      this.error = this.t("toast.failed", { error: errorText(err) });
    }
  }

  private choose(hit: SpeciesHit): void {
    if (hit.source === "offline") {
      this.chosen = { kind: "offline", id: hit.id, label: hit.label, common: hit.common };
      return;
    }
    this.chosen = { kind: "opb", pid: hit.pid, label: hit.label, common: null };
    const hass = this.hass;
    if (!hass) return;
    // The common name in the user's language makes a better default name.
    speciesInfo(hass, hit.pid).then(
      ({ info }) => {
        if (this.chosen?.kind === "opb" && this.chosen.pid === hit.pid) {
          this.chosen = { ...this.chosen, common: info.common ?? null };
        }
      },
      () => undefined,
    );
  }

  // ---- sensors ----------------------------------------------------------------------

  private async loadSensors(moisture?: string | null): Promise<void> {
    if (!this.hass) return;
    const key = `${this.areaId ?? ""}|${moisture ?? ""}`;
    if (moisture === undefined && this.sensorsFor?.startsWith(`${this.areaId ?? ""}|`)) return;
    this.sensorsFor = key;
    try {
      let suggestions = await suggestSensors(this.hass, this.areaId, moisture ?? null);
      let proposal = initialSensors(suggestions, this.areaName);
      if (moisture === undefined && proposal.moisture_sensor) {
        // A soil sensor of the room: its own device knows the plant best,
        // as in the HA dialog.
        suggestions = await suggestSensors(this.hass, this.areaId, proposal.moisture_sensor);
        proposal = { ...initialSensors(suggestions, this.areaName), moisture_sensor: proposal.moisture_sensor };
      }
      this.suggestions = suggestions;
      if (moisture === undefined) {
        this.picked = proposal;
      } else {
        // A new soil sensor: fill what is still empty from its device.
        const picked = { ...this.picked };
        for (const role of SENSOR_ROLES) picked[role] ??= proposal[role];
        this.picked = picked;
      }
    } catch (err) {
      this.error = this.t("toast.failed", { error: errorText(err) });
    }
  }

  private pick(role: SensorRole, entityId: string): void {
    this.picked = { ...this.picked, [role]: entityId || null };
    if (role === "moisture_sensor" && entityId) void this.loadSensors(entityId);
  }

  // ---- create ----------------------------------------------------------------------

  private async create(): Promise<void> {
    const hass = this.hass;
    if (!hass || this.busy) return;
    this.busy = true;
    this.error = undefined;
    try {
      const sensors = Object.fromEntries(SENSOR_ROLES.filter((r) => this.picked[r]).map((r) => [r, this.picked[r]]));
      const id = await createPlant(hass, {
        name: this.name,
        area_id: this.areaId,
        species: this.chosen?.kind === "offline" ? this.chosen.id : null,
        opb_pid: this.chosen?.kind === "opb" ? this.chosen.pid : null,
        sensors,
        pot: {
          pot_diameter: this.diameter,
          pot_material: this.material,
          drainage: this.material === "self_watering" ? true : this.drainage,
          window: this.window,
          location: this.location,
        },
      });
      // The entry reloads with the new plant; wait until it is there.
      await this.appeared(id);
      if (this.photo) {
        await uploadPhoto(hass, id, this.photo).catch(() => {
          this.photoFailed = true;
        });
      }
      this.createdId = id;
      this.createdAt = Date.now();
      this.go("done");
    } catch (err) {
      const code = (err as { code?: string }).code;
      this.error = code && ERRORS.has(code) ? this.t(`wizard.error.${code}`) : this.t("toast.failed", { error: errorText(err) });
    } finally {
      this.busy = false;
    }
  }

  private appeared(id: string): Promise<void> {
    return new Promise((resolve) => {
      const deadline = Date.now() + APPEAR_TIMEOUT;
      const check = () => {
        if (this.payload?.plants.some((p) => p.id === id) || Date.now() > deadline) resolve();
        else window.setTimeout(check, 300);
      };
      check();
    });
  }

  private async calibrateWet(): Promise<void> {
    const hass = this.hass;
    const id = this.createdId;
    if (!hass || !id) return;
    try {
      await calibrate(hass, id, "wet");
      navigate(`${plantPath(id)}/calibrate`);
    } catch (err) {
      this.error = this.t("toast.failed", { error: errorText(err) });
    }
  }

  // ---- rendering ----------------------------------------------------------------------

  protected override render(): TemplateResult {
    if (this.hass && !this.hass.user?.is_admin) {
      return html`<div class="surface muted">${this.t("wizard.error.unauthorized")}</div>`;
    }
    const index = STEPS.indexOf(this.step);
    return html`
      <div class="progress" aria-hidden="true"><div style="width:${((index + 1) / STEPS.length) * 100}%"></div></div>
      <div class="muted small">${this.t("wizard.step", { n: index + 1 })} · ${this.t(`wizard.steps.${this.step}`)}</div>
      <main>${this.renderStep()}</main>
      ${this.error ? html`<div class="error" role="alert">${this.error}</div>` : nothing}
      ${this.step === "done" ? nothing : this.renderNav()}
      <rootwise-photo-capture
        .hass=${this.hass}
        local
        ?open=${this.capturing}
        ?dark=${Boolean(this.hass?.themes?.darkMode)}
        @rootwise-photo-closed=${() => (this.capturing = false)}
        @rootwise-photo-taken=${this.photoTaken}
      ></rootwise-photo-capture>
    `;
  }

  private renderNav(): TemplateResult {
    const canNext =
      this.step === "photo"
        ? Boolean(this.photo)
        : this.step === "species"
          ? Boolean(this.chosen)
          : this.step === "basics"
            ? Boolean(this.name.trim())
            : true;
    const skippable = this.step === "photo" || this.step === "species";
    return html`
      <nav class="row">
        <button class="secondary" ?disabled=${this.busy} @click=${this.back}>${this.t("wizard.back")}</button>
        <span class="grow"></span>
        ${skippable
          ? html`<button class="secondary" @click=${() => this.go(STEPS[STEPS.indexOf(this.step) + 1] ?? "basics")}>
              ${this.t("wizard.skip")}
            </button>`
          : nothing}
        <button class="primary" ?disabled=${!canNext || this.busy} @click=${this.next}>
          ${this.step === "pot" ? (this.busy ? this.t("wizard.creating") : this.t("wizard.create")) : this.t("wizard.next")}
        </button>
      </nav>
    `;
  }

  private renderStep(): TemplateResult {
    switch (this.step) {
      case "photo":
        return this.renderPhoto();
      case "species":
        return this.renderSpecies();
      case "basics":
        return this.renderBasics();
      case "sensors":
        return this.renderSensors();
      case "pot":
        return this.renderPot();
      default:
        return this.renderDone();
    }
  }

  private renderPhoto(): TemplateResult {
    return html`
      <section class="surface">
        <h2>${this.t("wizard.photo_title")}</h2>
        <p class="muted">${this.t("wizard.photo_text")}</p>
        ${this.photoUrl
          ? html`<img class="preview" src=${this.photoUrl} alt="" />
              <p class="ok"><ha-icon icon="mdi:check-circle"></ha-icon>${this.t("wizard.photo_done")}</p>`
          : nothing}
        <button class="choice" @click=${() => (this.capturing = true)}>
          <ha-icon icon="mdi:camera"></ha-icon>${this.photoUrl ? this.t("wizard.photo_change") : this.t("wizard.photo_take")}
        </button>
      </section>
    `;
  }

  private renderSpecies(): TemplateResult {
    const results = this.results;
    return html`
      <section class="surface">
        <h2>${this.t("wizard.species_title")}</h2>
        <label class="search">
          <ha-icon icon="mdi:magnify"></ha-icon>
          <input
            type="search"
            .value=${this.query}
            placeholder=${this.t("wizard.species_search")}
            aria-label=${this.t("wizard.species_search")}
            @input=${this.onQuery}
          />
        </label>
        ${results?.opb_failed ? html`<p class="warn small">${this.t("wizard.species_opb_failed")}</p>` : nothing}
        ${results && !results.species.length ? html`<p class="muted small">${this.t("wizard.species_none")}</p>` : nothing}
        ${results?.species.length
          ? html`<ul class="hits" role="listbox" aria-label=${this.t("wizard.species_title")}>
              ${results.species.map((hit) => this.renderHit(hit))}
            </ul>`
          : nothing}
        ${this.chosen
          ? html`<p class="ok"><ha-icon icon="mdi:check-circle"></ha-icon>${this.t("wizard.species_chosen", {
              name: this.chosen.label,
            })}</p>`
          : html`<p class="muted small">${this.t("wizard.species_hint")}</p>`}
      </section>
    `;
  }

  private renderHit(hit: SpeciesHit): TemplateResult {
    const chosen =
      (hit.source === "offline" && this.chosen?.kind === "offline" && this.chosen.id === hit.id) ||
      (hit.source === "openplantbook" && this.chosen?.kind === "opb" && this.chosen.pid === hit.pid);
    return html`<li>
      <button class="hit" role="option" aria-selected=${chosen ? "true" : "false"} @click=${() => this.choose(hit)}>
        <span>${hit.label}</span>
        <span class="tag">${hit.source === "openplantbook" ? "OpenPlantbook" : this.t("wizard.offline")}</span>
      </button>
    </li>`;
  }

  private renderBasics(): TemplateResult {
    return html`
      <section class="surface">
        <h2>${this.t("wizard.steps.basics")}</h2>
        <label class="field">
          <span class="muted">${this.t("wizard.name")}</span>
          <input
            type="text"
            maxlength="60"
            .value=${this.name}
            @input=${(e: Event) => {
              this.nameTouched = true;
              this.name = (e.target as HTMLInputElement).value;
            }}
          />
        </label>
        <div class="field">
          <span class="muted">${this.t("wizard.room")}</span>
          <div class="chips" role="group" aria-label=${this.t("wizard.room")}>
            ${[{ id: null, name: this.t("wizard.no_room") }, ...this.areas].map(
              (area) => html`<button
                class="chip"
                aria-pressed=${area.id === this.areaId ? "true" : "false"}
                @click=${() => {
                  this.areaId = area.id;
                  this.sensorsFor = undefined;
                }}
              >
                ${area.name}
              </button>`,
            )}
          </div>
        </div>
      </section>
    `;
  }

  private renderSensors(): TemplateResult {
    const suggestions = this.suggestions;
    const room = this.areaName;
    return html`
      <section class="surface">
        <h2>${room ? this.t("wizard.sensors_in", { room }) : this.t("wizard.steps.sensors")}</h2>
        <p class="muted small">${this.t("wizard.sensors_text")}</p>
        ${suggestions
          ? SENSOR_ROLES.map((role) => this.renderRole(role, suggestions))
          : html`<p class="muted">…</p>`}
      </section>
    `;
  }

  private renderRole(role: SensorRole, suggestions: SensorSuggestions): TemplateResult | typeof nothing {
    const candidates = suggestions.candidates[role] ?? [];
    if (!candidates.length) {
      return role === "illuminance_sensor"
        ? html`<p class="muted small"><ha-icon icon="mdi:white-balance-sunny"></ha-icon>${this.t("wizard.no_light")}</p>`
        : nothing;
    }
    const selected = candidates.find((c) => c.entity_id === this.picked[role]);
    const label = this.t(`m.${ROLE_MEASUREMENT[role]}`);
    return html`
      <label class="sensor">
        <span class="sensor-head">
          <span>${label}</span>
          ${selected ? html`<b class="num">${selected.state}${selected.unit ? ` ${selected.unit}` : ""}</b>` : nothing}
        </span>
        <select aria-label=${label} @change=${(e: Event) => this.pick(role, (e.target as HTMLSelectElement).value)}>
          <option value="" ?selected=${!this.picked[role]}>${this.t("wizard.sensor_none")}</option>
          ${candidates.map(
            (c) => html`<option value=${c.entity_id} ?selected=${c.entity_id === this.picked[role]} ?disabled=${c.in_use}>
              ${c.name}${c.area ? ` · ${c.area}` : ""}${c.in_use ? ` (${this.t("wizard.in_use")})` : ""}
            </option>`,
          )}
        </select>
      </label>
    `;
  }

  private renderPot(): TemplateResult {
    const size = sizeFor(this.diameter);
    return html`
      <section class="surface">
        <h2>${this.t("wizard.steps.pot")}</h2>
        <div class="field">
          <span class="muted">${this.t("wizard.diameter")}</span>
          <div class="chips" role="group" aria-label=${this.t("wizard.diameter")}>
            ${POT_SIZES.map(
              (option) => html`<button
                class="chip"
                aria-pressed=${option.key === size ? "true" : "false"}
                @click=${() => (this.diameter = option.diameter)}
              >
                ${this.t(`wizard.size.${option.key}`)}
              </button>`,
            )}
          </div>
          <label class="inline">
            <span class="muted small">${this.t("wizard.diameter_exact")}</span>
            <input
              type="number"
              min="5"
              max="80"
              step="1"
              .value=${String(this.diameter)}
              @input=${(e: Event) => {
                const value = Number((e.target as HTMLInputElement).value);
                if (value >= 5 && value <= 80) this.diameter = value;
              }}
            />
          </label>
        </div>
        <div class="field">
          <span class="muted">${this.t("wizard.material")}</span>
          <div class="chips" role="group" aria-label=${this.t("wizard.material")}>
            ${MATERIALS.map(
              (material) => html`<button
                class="chip"
                aria-pressed=${material === this.material ? "true" : "false"}
                @click=${() => (this.material = material)}
              >
                ${this.t(`pot.${material}`)}
              </button>`,
            )}
          </div>
        </div>
        <button class="toggle" aria-expanded=${this.placeOpen ? "true" : "false"} @click=${() => (this.placeOpen = !this.placeOpen)}>
          <span>${this.t("wizard.place")}</span>
          <span class="muted small">${this.t(`window.${this.window}`)} · ${this.t(`location.${this.location}`)}</span>
          <ha-icon icon=${this.placeOpen ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>
        </button>
        ${this.placeOpen ? this.renderPlace() : nothing}
      </section>
    `;
  }

  private renderPlace(): TemplateResult {
    return html`
      <label class="field">
        <span class="muted">${this.t("wizard.window")}</span>
        <select @change=${(e: Event) => (this.window = (e.target as HTMLSelectElement).value)}>
          ${WINDOWS.map((w) => html`<option value=${w} ?selected=${w === this.window}>${this.t(`window.${w}`)}</option>`)}
        </select>
      </label>
      <div class="field">
        <span class="muted">${this.t("wizard.location")}</span>
        <div class="chips" role="group" aria-label=${this.t("wizard.location")}>
          ${LOCATIONS.map(
            (location) => html`<button
              class="chip"
              aria-pressed=${location === this.location ? "true" : "false"}
              @click=${() => (this.location = location)}
            >
              ${this.t(`location.${location}`)}
            </button>`,
          )}
        </div>
      </div>
      ${this.material === "self_watering"
        ? nothing
        : html`<label class="check">
            <input
              type="checkbox"
              .checked=${this.drainage}
              @change=${(e: Event) => (this.drainage = (e.target as HTMLInputElement).checked)}
            />
            <span>${this.t("wizard.drainage")}</span>
          </label>`}
    `;
  }

  private renderDone(): TemplateResult {
    const plant = this.payload?.plants.find((p) => p.id === this.createdId);
    const seconds = Math.max(1, Math.round((this.createdAt - this.started) / 1000));
    const waterings = plant?.thresholds?.waterings ?? 0;
    const reading = Date.now() - this.createdAt < READING_MS;
    const id = this.createdId;
    return html`
      <section class="surface done">
        <ha-icon class="big" icon="mdi:check-circle"></ha-icon>
        <h2>${this.t("wizard.done_title", { name: this.name.trim() })}</h2>
        <p class="muted">
          ${this.t("wizard.done_time", { seconds: new Intl.NumberFormat(language(this.hass)).format(seconds) })}
          ${this.hass ? summary(this.hass, this.areaName, this.picked, this.diameter) : ""}
        </p>
        ${this.photoFailed ? html`<p class="warn small">${this.t("wizard.photo_upload_failed")}</p>` : nothing}
        ${this.picked.moisture_sensor
          ? html`<p class="info">
              <ha-icon icon="mdi:chart-bell-curve-cumulative"></ha-icon>
              ${waterings
                ? plural(this.hass, "wizard.done_waterings", waterings)
                : reading
                  ? this.t("wizard.done_reading")
                  : nothing}
            </p>`
          : nothing}
        <div class="column">
          ${this.picked.moisture_sensor
            ? html`<button class="secondary wide" @click=${() => void this.calibrateWet()}>
                <ha-icon icon="mdi:water"></ha-icon>${this.t("wizard.calibrate_wet")}
              </button>`
            : nothing}
          <button class="primary wide" @click=${() => id && navigate(plantPath(id))}>${this.t("wizard.open")}</button>
        </div>
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
      ha-icon {
        --mdc-icon-size: 20px;
        flex-shrink: 0;
      }
      main {
        display: contents;
      }
      .progress {
        height: 6px;
        border-radius: 3px;
        background: var(--rw-track);
        overflow: hidden;
      }
      .progress div {
        height: 100%;
        background: var(--rw-accent);
        transition: width 0.3s;
      }
      .small {
        font-size: 13px;
      }
      .surface {
        background: var(--ha-card-background, var(--card-background-color, #fff));
        border-radius: var(--rw-radius);
        border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--rw-line));
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
      }
      p {
        margin: 0;
        line-height: 1.45;
      }
      p ha-icon {
        margin-right: 6px;
        vertical-align: -4px;
      }
      .preview {
        width: 100%;
        max-height: 300px;
        object-fit: cover;
        border-radius: 14px;
      }
      .choice {
        min-height: 88px;
        border-radius: 16px;
        border: 1px dashed var(--rw-accent);
        background: var(--rw-accent-soft);
        color: var(--rw-accent);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 15px;
        font-weight: 500;
      }
      .choice ha-icon {
        --mdc-icon-size: 30px;
      }
      .ok {
        color: var(--rw-accent);
        font-weight: 500;
      }
      .warn {
        color: var(--rw-warn);
      }
      .search {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 12px;
        border-radius: 22px;
        border: 1px solid var(--rw-line);
        min-height: 44px;
      }
      .search input {
        flex: 1;
        border: 0;
        background: none;
        font: inherit;
        font-size: 15px;
        color: var(--rw-text);
        min-width: 0;
        outline: none;
      }
      .hits {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .hit {
        width: 100%;
        min-height: 44px;
        padding: 8px 12px;
        border-radius: 12px;
        border: 1px solid var(--rw-line);
        background: none;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        text-align: left;
      }
      .hit[aria-selected="true"] {
        border-color: var(--rw-accent);
        background: var(--rw-accent-soft);
      }
      .tag {
        flex-shrink: 0;
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 10px;
        background: var(--rw-track);
        color: var(--rw-text2);
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 14px;
      }
      .field input,
      .field select,
      .sensor select,
      .inline input {
        font: inherit;
        font-size: 15px;
        min-height: 44px;
        padding: 0 10px;
        border-radius: 10px;
        border: 1px solid var(--rw-line);
        background: var(--ha-card-background, var(--card-background-color, #fff));
        color: var(--rw-text);
      }
      .inline {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .inline input {
        width: 90px;
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .chip {
        min-height: 40px;
        padding: 0 14px;
        border-radius: 20px;
        border: 1px solid var(--rw-line);
        background: none;
        font-size: 14px;
      }
      .chip[aria-pressed="true"] {
        background: var(--rw-accent-soft);
        border-color: var(--rw-accent);
        color: var(--rw-accent);
        font-weight: 500;
      }
      .sensor {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .sensor-head {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
      }
      .num {
        font-variant-numeric: tabular-nums;
      }
      .toggle {
        display: grid;
        grid-template-columns: 1fr auto;
        grid-template-areas: "title icon" "sub icon";
        align-items: center;
        text-align: left;
        border: 0;
        background: none;
        padding: 6px 0;
      }
      .toggle span:first-child {
        grid-area: title;
      }
      .toggle .small {
        grid-area: sub;
      }
      .toggle ha-icon {
        grid-area: icon;
      }
      .check {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 44px;
      }
      .check input {
        width: 20px;
        height: 20px;
      }
      .row {
        display: flex;
        gap: 10px;
        align-items: center;
        position: sticky;
        bottom: 0;
        padding: 10px 0 calc(10px + env(safe-area-inset-bottom, 0px));
        background: var(--primary-background-color);
      }
      .grow {
        flex: 1;
      }
      .row button,
      .column button {
        min-height: 44px;
        padding: 0 18px;
        border-radius: 22px;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .primary {
        border: 0;
        background: var(--rw-water);
        color: var(--rw-water-ink);
      }
      .secondary {
        border: 1px solid var(--rw-line);
        background: none;
      }
      button:disabled {
        opacity: 0.5;
      }
      .done {
        align-items: center;
        text-align: center;
      }
      .done .big {
        --mdc-icon-size: 56px;
        color: var(--rw-accent);
      }
      .info {
        padding: 10px 12px;
        border-radius: 12px;
        background: var(--rw-water-soft);
        text-align: left;
      }
      .column {
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-self: stretch;
      }
      .wide {
        width: 100%;
      }
      .error {
        padding: 10px 14px;
        border-radius: 12px;
        background: var(--rw-prob-soft);
        color: var(--rw-prob);
        font-size: 14px;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "rootwise-wizard-page": RootwiseWizardPage;
  }
}
