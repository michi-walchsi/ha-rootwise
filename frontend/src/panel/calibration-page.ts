import { css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { applyCalibration, calibrate, resetThresholds, type CalibrationStep } from "../api";
import { RootwiseCardBase, errorText } from "../cards/base";
import { percentOf } from "../calibration";
import { language } from "../i18n";
import { theme } from "../theme";
import type { CalibrationState, Plant } from "../types";

const POLL_MS = 60_000;
const ERRORS = new Set(["no_sensor", "no_value", "too_close", "unauthorized"]);

/** The calibration assistant: dry point, watering, field capacity, result. */
export class RootwiseCalibrationPage extends RootwiseCardBase {
  @property() plantId = "";
  @state() private data?: CalibrationState;
  @state() private busy = false;
  @state() private error?: string;
  @state() private hideSuggestion = false;

  private loadedFor = "";
  private poll?: number;

  override connectedCallback(): void {
    super.connectedCallback();
    // Draining and measuring take hours; check in now and then.
    this.poll = window.setInterval(() => {
      const phase = this.data?.pending?.phase;
      if (phase === "draining" || phase === "measuring") void this.run("get");
    }, POLL_MS);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearInterval(this.poll);
  }

  private get plant(): Plant | undefined {
    return this.payload?.plants.find((p) => p.id === this.plantId);
  }

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    // Reload for another plant, or when the calibration changed elsewhere
    // (for example the server finished measuring field capacity).
    const key = `${this.plantId}|${this.plant?.calibration?.at ?? ""}`;
    if (this.hass && this.plantId && key !== this.loadedFor) {
      this.loadedFor = key;
      void this.run("get");
    }
  }

  private async run(step: CalibrationStep | (() => Promise<CalibrationState>)): Promise<void> {
    if (!this.hass || this.busy) return;
    this.busy = true;
    this.error = undefined;
    try {
      this.data = typeof step === "function" ? await step() : await calibrate(this.hass, this.plantId, step);
    } catch (err) {
      const code = (err as { code?: string }).code;
      this.error = code && ERRORS.has(code) ? this.t(`calibration.error.${code}`) : this.t("toast.failed", { error: errorText(err) });
    } finally {
      this.busy = false;
    }
  }

  private raw(value: number | null | undefined): string {
    if (value === null || value === undefined) return "?";
    return new Intl.NumberFormat(language(this.hass), { maximumFractionDigits: 1 }).format(value);
  }

  protected override render(): TemplateResult {
    if (this.hass && !this.hass.user?.is_admin) {
      return html`<div class="surface muted">${this.t("calibration.error.unauthorized")}</div>`;
    }
    const data = this.data;
    const plant = this.plant;
    if (!data || !plant) return html`<div class="surface muted">${this.error ?? "…"}</div>`;
    const calibrated = data.calibration;
    return html`
      <section class="surface">
        <h2>${this.t("calibration.headline")}</h2>
        <p class="muted">${this.t("calibration.intro")}</p>
        ${this.renderScale(data)}
      </section>
      ${this.error ? html`<div class="error" role="alert">${this.error}</div>` : nothing}
      ${calibrated?.outdated ? html`<div class="warn" role="status">${this.t("calibration.outdated")}</div>` : nothing}
      ${calibrated ? this.renderResult(data, plant) : nothing}
      ${!calibrated && data.suggestion && !this.hideSuggestion ? this.renderSuggestion(data) : nothing}
      ${this.renderDry(data)} ${this.renderWet(data)}
    `;
  }

  private renderScale(data: CalibrationState): TemplateResult {
    const dry = data.calibration?.dry ?? data.pending?.dry ?? null;
    const wet = data.calibration?.wet ?? data.pending?.wet ?? null;
    const at = (value: number) => `left:${Math.min(100, Math.max(0, value))}%`;
    return html`
      <div class="scale" role="img" aria-label=${`${this.t("calibration.dry")} ${this.raw(dry)}, ${this.t("calibration.wet")} ${this.raw(wet)}`}>
        <div class="track">
          ${dry !== null && wet !== null
            ? html`<div class="span" style="left:${dry}%;width:${Math.max(0, wet - dry)}%"></div>`
            : nothing}
          ${dry !== null ? html`<div class="mark dry" style=${at(dry)}></div>` : nothing}
          ${wet !== null ? html`<div class="mark wet" style=${at(wet)}></div>` : nothing}
          ${data.current !== null ? html`<div class="now" style=${at(data.current)}></div>` : nothing}
        </div>
        <div class="ends muted"><span>0 % ${this.t("calibration.raw")}</span><span>100 %</span></div>
        <div class="legend">
          <span><i class="key dry"></i>${this.t("calibration.dry")} ${this.raw(dry)}</span>
          <span><i class="key now"></i>${this.t("calibration.now")} ${this.t("calibration.raw_value", { value: this.raw(data.current) })}</span>
          <span><i class="key wet"></i>${this.t("calibration.wet")} ${this.raw(wet)}</span>
        </div>
      </div>
    `;
  }

  private renderDry(data: CalibrationState): TemplateResult {
    const done = data.pending?.dry ?? data.calibration?.dry;
    return html`
      <section class="surface step ${done !== undefined && done !== null ? "done" : ""}">
        <div class="step-head">
          <span class="badge">${this.t("calibration.step", { n: 1 })}</span>
          <h3>${this.t("calibration.dry_title")}</h3>
        </div>
        ${done !== undefined && done !== null
          ? html`<p class="ok"><ha-icon icon="mdi:check-circle"></ha-icon>${this.t("calibration.dry_done", { value: this.raw(done) })}</p>`
          : html`<p class="muted">
              ${data.current === null
                ? this.t("calibration.dry_text_none")
                : this.t("calibration.dry_text", { value: this.raw(data.current) })}
            </p>`}
        <div class="row">
          <button
            class=${done !== undefined && done !== null ? "secondary" : "primary"}
            ?disabled=${this.busy || data.current === null}
            @click=${() => void this.run("dry")}
          >
            ${done !== undefined && done !== null ? this.t("calibration.again") : this.t("calibration.dry_save")}
          </button>
        </div>
      </section>
    `;
  }

  private renderWet(data: CalibrationState): TemplateResult {
    const pending = data.pending;
    const done = pending?.wet ?? data.calibration?.wet;
    const phase = pending?.phase;
    let body: TemplateResult;
    if (phase === "draining" && pending?.watered_at) {
      const start = new Date(Date.parse(pending.watered_at) + 2 * 3_600_000);
      const time = new Intl.DateTimeFormat(language(this.hass), { hour: "2-digit", minute: "2-digit" }).format(start);
      body = html`<p class="muted"><ha-icon icon="mdi:water-sync"></ha-icon>${this.t("calibration.draining", { time })}</p>`;
    } else if (phase === "measuring") {
      body = html`
        <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="4" aria-valuenow=${pending?.hours ?? 0}>
          <div style="width:${((pending?.hours ?? 0) / 4) * 100}%"></div>
        </div>
        <p class="muted">${this.t("calibration.measuring", { hours: pending?.hours ?? 0, value: this.raw(pending?.value) })}</p>
      `;
    } else if (phase === "no_rise") {
      body = html`<p class="error-text">${this.t("calibration.no_rise")}</p>`;
    } else if (done !== undefined && done !== null) {
      body = html`<p class="ok"><ha-icon icon="mdi:check-circle"></ha-icon>${this.t("calibration.wet_done", { value: this.raw(done) })}</p>`;
    } else {
      body = html`<p class="muted">${this.t("calibration.wet_text")}</p>`;
    }
    const running = phase === "draining" || phase === "measuring";
    return html`
      <section class="surface step ${done !== undefined && done !== null && !running ? "done" : ""}">
        <div class="step-head">
          <span class="badge">${this.t("calibration.step", { n: 2 })}</span>
          <h3>${this.t("calibration.wet_title")}</h3>
        </div>
        ${body}
        ${running
          ? nothing
          : html`<div class="row">
              <button
                class=${done !== undefined && done !== null ? "secondary" : "primary"}
                ?disabled=${this.busy}
                @click=${() => void this.run("wet")}
              >
                <ha-icon icon="mdi:watering-can"></ha-icon>${done !== undefined && done !== null
                  ? this.t("calibration.again")
                  : this.t("calibration.wet_start")}
              </button>
            </div>`}
        ${phase === "too_close" ? html`<p class="error-text">${this.t("calibration.too_close")}</p>` : nothing}
      </section>
    `;
  }

  private renderResult(data: CalibrationState, plant: Plant): TemplateResult {
    const scale = data.calibration;
    if (!scale) return html``;
    const [low, high] = data.scale;
    const now = data.current === null ? null : Math.round(percentOf(scale, data.current));
    const custom = plant.thresholds?.source === "custom";
    const style = data.style ? this.t(`style.${data.style}`) : this.t("calibration.style_unknown");
    return html`
      <section class="surface result">
        <h3><ha-icon icon="mdi:check-decagram"></ha-icon>${this.t("calibration.done")}</h3>
        <dl class="facts">
          <dt>${this.t("calibration.result_dry")}</dt><dd>${this.t("calibration.raw_value", { value: this.raw(scale.dry) })}</dd>
          <dt>${this.t("calibration.result_wet")}</dt><dd>${this.t("calibration.raw_value", { value: this.raw(scale.wet) })}</dd>
          <dt>${this.t("calibration.now")}</dt><dd>${now === null ? "–" : `${now} %`}</dd>
        </dl>
        <p><b>${this.t("calibration.thresholds", { low, high })}</b></p>
        <p class="muted small">${this.t("calibration.style", { style })}</p>
        ${custom
          ? html`<p class="muted small">
                ${this.t("calibration.custom", { low: plant.thresholds?.low, high: plant.thresholds?.high })}
              </p>
              <div class="row">
                <button class="primary" ?disabled=${this.busy} @click=${() => void this.useStyle(plant)}>
                  ${this.t("calibration.use_style")}
                </button>
              </div>`
          : nothing}
        <div class="row">
          <button class="secondary" ?disabled=${this.busy} @click=${() => void this.run("clear")}>
            ${this.t("calibration.redo")}
          </button>
        </div>
      </section>
    `;
  }

  private renderSuggestion(data: CalibrationState): TemplateResult {
    const suggestion = data.suggestion;
    if (!suggestion) return html``;
    return html`
      <section class="surface suggestion">
        <h3><ha-icon icon="mdi:lightbulb-on-outline"></ha-icon>${this.t("calibration.suggestion")}</h3>
        <p>
          ${this.t("calibration.suggestion_text", {
            count: suggestion.waterings,
            dry: this.raw(suggestion.dry),
            wet: this.raw(suggestion.wet),
          })}
        </p>
        <p class="muted small">${this.t("calibration.suggestion_note")}</p>
        <div class="row">
          <button class="secondary" @click=${() => (this.hideSuggestion = true)}>${this.t("calibration.later")}</button>
          <button
            class="primary"
            ?disabled=${this.busy}
            @click=${() => {
              const hass = this.hass;
              if (hass) void this.run(() => applyCalibration(hass, this.plantId, suggestion.dry, suggestion.wet));
            }}
          >
            ${this.t("calibration.apply")}
          </button>
        </div>
      </section>
    `;
  }

  private async useStyle(plant: Plant): Promise<void> {
    if (!this.hass) return;
    try {
      await resetThresholds(this.hass, plant.id);
    } catch (err) {
      this.error = this.t("toast.failed", { error: errorText(err) });
    }
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
      .surface {
        background: var(--ha-card-background, var(--card-background-color, #fff));
        border-radius: var(--rw-radius);
        border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--rw-line));
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
      }
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      p {
        margin: 0;
        line-height: 1.45;
      }
      p ha-icon {
        margin-right: 6px;
        vertical-align: -4px;
      }
      .small {
        font-size: 13px;
      }
      .scale {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding-top: 4px;
      }
      .track {
        position: relative;
        height: 14px;
        border-radius: 7px;
        background: var(--rw-track);
      }
      .span {
        position: absolute;
        top: 0;
        bottom: 0;
        border-radius: 7px;
        background: linear-gradient(90deg, var(--rw-warn-soft), var(--rw-water-soft));
      }
      .mark {
        position: absolute;
        top: -4px;
        width: 4px;
        height: 22px;
        margin-left: -2px;
        border-radius: 2px;
      }
      .mark.dry,
      .key.dry {
        background: var(--rw-warn);
      }
      .mark.wet,
      .key.wet {
        background: var(--rw-water);
      }
      .track .now {
        position: absolute;
        top: 1px;
        width: 12px;
        height: 12px;
        margin-left: -6px;
        border-radius: 50%;
        background: var(--rw-text);
        border: 2px solid var(--ha-card-background, var(--card-background-color, #fff));
      }
      .key {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 3px;
        margin-right: 6px;
      }
      .key.now {
        border-radius: 50%;
        background: var(--rw-text);
      }
      .ends {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
      }
      .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 16px;
        font-size: 13px;
      }
      .step-head {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .badge {
        align-self: flex-start;
        padding: 2px 10px;
        border-radius: 10px;
        font-size: 12px;
        background: var(--rw-accent-soft);
        color: var(--rw-accent);
      }
      .step.done .badge {
        background: var(--rw-accent);
        color: #fff;
      }
      .ok {
        color: var(--rw-accent);
        font-weight: 500;
      }
      .progress {
        height: 8px;
        border-radius: 4px;
        background: var(--rw-track);
        overflow: hidden;
      }
      .progress div {
        height: 100%;
        background: var(--rw-water);
        transition: width 0.4s;
      }
      .row {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        flex-wrap: wrap;
      }
      .row button {
        min-height: 44px;
        padding: 0 18px;
        border-radius: 22px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
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
        opacity: 0.55;
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
        font-variant-numeric: tabular-nums;
      }
      .result h3 ha-icon {
        color: var(--rw-accent);
      }
      .suggestion h3 ha-icon {
        color: var(--rw-warn);
      }
      .error,
      .warn {
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.4;
      }
      .error {
        background: var(--rw-prob-soft);
        color: var(--rw-prob);
      }
      .warn {
        background: var(--rw-warn-soft);
        color: var(--rw-warn);
      }
      .error-text {
        color: var(--rw-prob);
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "rootwise-calibration-page": RootwiseCalibrationPage;
  }
}
