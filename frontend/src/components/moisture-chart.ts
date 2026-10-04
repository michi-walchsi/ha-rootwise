import { LitElement, css, html, nothing, svg, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import { calibrateHistory } from "../calibration";
import { chartModel, nearestPoint, type ChartModel } from "../chart-model";
import { timeRange } from "../format";
import { localize } from "../i18n";
import { theme } from "../theme";
import type { ChartPoint, HistoryPayload, HomeAssistant } from "../types";

// A water drop, centred on its body, about 7 px wide.
const DROP = "M0 -5C2.5 -1.6 3.6 0.4 3.6 1.9A3.6 3.6 0 0 1 -3.6 1.9C-3.6 0.4 -2.5 -1.6 0 -5Z";

/**
 * Soil moisture over the last days: mean line with its min–max band, the
 * plant's target band, care markers and the forecast to the dry threshold.
 * Takes the language instead of hass so that state changes elsewhere in
 * Home Assistant don't redraw it.
 */
export class RootwiseMoistureChart extends LitElement {
  @property({ attribute: false }) data?: HistoryPayload;
  @property() language = "en";
  @property({ type: Boolean }) compact = false;
  @property({ type: Number }) height = 180;
  /** Colours follow the dashboard theme, as in the cards. */
  @property({ type: Boolean, reflect: true }) dark = false;
  @state() private width = 0;
  @state() private hover: number | null = null;

  private model?: ChartModel;
  /** The data as drawn: on the calibrated scale if the probe is calibrated. */
  private shown?: HistoryPayload;
  private observer?: ResizeObserver;

  override connectedCallback(): void {
    super.connectedCallback();
    this.observer = new ResizeObserver((entries) => {
      const width = Math.round(entries[0]?.contentRect.width ?? 0);
      if (width !== this.width) this.width = width;
    });
    this.observer.observe(this);
    // A hidden page (background tab, app in the background) gets no resize
    // notifications until it is shown; measure now so the first render has a width.
    this.width ||= Math.round(this.getBoundingClientRect().width);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.observer?.disconnect();
    this.observer = undefined;
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("data")) {
      this.hover = null;
      this.shown = this.data ? calibrateHistory(this.data) : undefined;
    }
    // `width` is private, so PropertyValues<this> doesn't know it.
    const keys: PropertyKey[] = ["data", "width", "height", "compact", "language"];
    if (keys.some((key) => (changed as Map<PropertyKey, unknown>).has(key))) {
      this.model =
        this.shown && this.width
          ? chartModel(this.shown, this.width, this.height, this.language, { compact: this.compact })
          : undefined;
    }
  }

  private t(key: string, vars?: Record<string, unknown>): string {
    return localize({ language: this.language } as HomeAssistant, key, vars);
  }

  protected override render() {
    const data = this.shown;
    const style = `height:${this.height}px`;
    if (!data) return html`<div class="frame" style=${style} aria-busy="true"></div>`;
    if (!data.points.length) {
      const key = data.thresholds ? "chart.empty" : "chart.no_sensor";
      return html`<div class="frame empty muted" style=${style}>${this.t(key)}</div>`;
    }
    const model = this.model;
    const point = this.hover === null ? undefined : data.points[this.hover];
    return html`
      <div
        class="frame"
        style=${style}
        tabindex="0"
        role="img"
        aria-label=${this.summary(data)}
        @keydown=${this.onKey}
      >
        ${model
          ? html`<svg
              width=${model.width}
              height=${model.height}
              viewBox="0 0 ${model.width} ${model.height}"
              aria-hidden="true"
              @pointermove=${this.onPointer}
              @pointerdown=${this.onPointer}
              @pointerleave=${this.onLeave}
            >
              ${this.back(model)} ${this.series(model)} ${this.markers(model)}
              ${point ? this.crosshair(model, point, data.step) : nothing}
            </svg>`
          : nothing}
        ${model && point ? this.tooltip(model, point, data.step) : nothing}
      </div>
    `;
  }

  private back(model: ChartModel) {
    const { plot } = model;
    return svg`
      ${model.band
        ? svg`<rect class="band" x=${plot.left} y=${model.band.top}
            width=${plot.right - plot.left} height=${model.band.bottom - model.band.top}></rect>`
        : nothing}
      ${model.forecast
        ? svg`<rect class="future" x=${model.nowX} y=${plot.top}
            width=${plot.right - model.nowX} height=${plot.bottom - plot.top}></rect>`
        : nothing}
      ${model.forecast && model.forecast.to > model.forecast.from
        ? svg`<rect class="window" x=${model.forecast.from} y=${plot.top}
            width=${model.forecast.to - model.forecast.from} height=${plot.bottom - plot.top}></rect>`
        : nothing}
      ${model.yTicks.map(
        (tick) => svg`
          <line class="grid" x1=${plot.left} x2=${plot.right} y1=${tick.y} y2=${tick.y}></line>
          <text class="label" x=${plot.left - 6} y=${tick.y} text-anchor="end"
            dominant-baseline="middle">${tick.value}</text>`,
      )}
      <line class="axis" x1=${plot.left} x2=${plot.right} y1=${plot.bottom} y2=${plot.bottom}></line>
      ${model.xTicks
        .filter((tick) => tick.x >= plot.left && tick.x <= plot.right)
        .map(
          (tick) => svg`
            <line class="axis" x1=${tick.x} x2=${tick.x} y1=${plot.bottom} y2=${plot.bottom + 3}></line>
            <text class="label" x=${tick.x} y=${model.height - 4}
              text-anchor="middle">${tick.label}</text>`,
        )}
    `;
  }

  private series(model: ChartModel) {
    const forecast = model.forecast;
    return svg`
      <path class="envelope" d=${model.envelope}></path>
      <path class="line" d=${model.line}></path>
      ${model.dots.map((dot) => svg`<circle class="dot" cx=${dot.x} cy=${dot.y} r="2"></circle>`)}
      ${forecast
        ? svg`
          <line class="now" x1=${model.nowX} x2=${model.nowX}
            y1=${model.plot.top} y2=${model.plot.bottom}></line>
          <line class="forecast" x1=${forecast.x1} y1=${forecast.y1}
            x2=${forecast.x2} y2=${forecast.y2}></line>`
        : nothing}
    `;
  }

  private markers(model: ChartModel) {
    const top = model.plot.top + 6;
    return model.events.map((event) => {
      if (event.type === "watered") {
        const detected = event.source === "auto";
        return svg`
          <line class="watered-guide" x1=${event.x} x2=${event.x}
            y1=${top} y2=${model.plot.bottom}></line>
          <path class=${detected ? "drop detected" : "drop"} d=${DROP}
            transform="translate(${event.x} ${top})"></path>`;
      }
      const kind = event.type === "fertilized" ? "fertilized" : "other";
      return svg`<rect class=${kind} x=${event.x - 3} y=${top - 3} width="6" height="6"
        transform="rotate(45 ${event.x} ${top})"></rect>`;
    });
  }

  private crosshair(model: ChartModel, point: ChartPoint, step: number) {
    const x = model.x(point[0] + step * 500);
    return svg`
      <line class="cross" x1=${x} x2=${x} y1=${model.plot.top} y2=${model.plot.bottom}></line>
      <circle class="focus" cx=${x} cy=${model.y(point[1])} r="3.5"></circle>`;
  }

  private tooltip(model: ChartModel, point: ChartPoint, step: number) {
    const x = model.x(point[0] + step * 500);
    // Inside the plot, where it doesn't cover the point it describes; near
    // an edge it hangs inward instead of being cut off.
    const top = model.y(point[1]) > model.plot.top + 48 ? model.plot.top : model.plot.bottom - 40;
    const side =
      x < model.width / 3
        ? `left:${Math.max(0, x - 16)}px`
        : x > (model.width * 2) / 3
          ? `right:${Math.max(0, model.width - x - 16)}px`
          : `left:${x}px;transform:translateX(-50%)`;
    return html`<div class="tip" style="top:${top}px;${side}">
      <span class="muted"
        >${timeRange(new Date(point[0]), new Date(point[0] + step * 1000), this.language)}</span
      >
      <span class="num"
        >${this.t("chart.point", {
          value: Math.round(point[1]),
          min: Math.round(point[2]),
          max: Math.round(point[3]),
        })}</span
      >
    </div>`;
  }

  private summary(data: HistoryPayload): string {
    const days = Math.round((Date.parse(data.end) - Date.parse(data.start)) / 86_400_000);
    const last = data.points.at(-1);
    const vars = {
      days,
      value: last ? Math.round(last[1]) : "–",
      count: data.events.filter((event) => event.type === "watered").length,
      low: data.thresholds?.low,
      high: data.thresholds?.high,
    };
    return this.t(data.thresholds ? "chart.summary" : "chart.summary_plain", vars);
  }

  private onPointer = (event: PointerEvent): void => {
    if (!this.shown || !this.model) return;
    const box = (event.currentTarget as SVGSVGElement).getBoundingClientRect();
    const hit = nearestPoint(this.shown, this.model, event.clientX - box.left);
    this.hover = hit ? this.shown.points.indexOf(hit.point) : null;
  };

  private onLeave = (): void => {
    this.hover = null;
  };

  private onKey = (event: KeyboardEvent): void => {
    const count = this.shown?.points.length ?? 0;
    if (!count) return;
    const current = this.hover ?? count;
    const next = new Map<string, number>([
      ["ArrowLeft", Math.max(0, current - 1)],
      ["ArrowRight", Math.min(count - 1, this.hover === null ? count - 1 : current + 1)],
      ["Home", 0],
      ["End", count - 1],
    ]);
    const index = next.get(event.key);
    if (event.key === "Escape") {
      this.hover = null;
    } else if (index !== undefined) {
      event.preventDefault();
      this.hover = index;
    }
  };

  static override styles = [
    theme,
    css`
    :host {
      position: relative;
    }
    .frame {
      position: relative;
      width: 100%;
      border-radius: 8px;
      touch-action: pan-y;
    }
    .frame:focus-visible {
      outline: 2px solid var(--rw-accent);
      outline-offset: 2px;
    }
    .empty {
      display: grid;
      place-items: center;
      background: var(--rw-track);
      font-size: 13px;
    }
    .muted {
      color: var(--rw-text2);
    }
    svg {
      display: block;
      overflow: visible;
    }
    .band {
      fill: var(--rw-accent-soft);
    }
    .future {
      fill: var(--rw-track);
      opacity: 0.5;
    }
    .window {
      fill: var(--rw-water-soft);
    }
    .grid {
      stroke: var(--rw-line);
      stroke-width: 1;
    }
    .axis {
      stroke: var(--rw-line);
    }
    .label {
      fill: var(--rw-text2);
      font-size: 11px;
      font-variant-numeric: tabular-nums;
    }
    .envelope {
      fill: var(--rw-water-soft);
    }
    .line {
      fill: none;
      stroke: var(--rw-water);
      stroke-width: 2;
      stroke-linejoin: round;
      stroke-linecap: round;
    }
    .dot,
    .focus {
      fill: var(--rw-water);
    }
    .focus {
      stroke: var(--ha-card-background, var(--card-background-color, #fff));
      stroke-width: 2;
    }
    .now {
      stroke: var(--rw-text2);
      stroke-dasharray: 2 3;
    }
    .forecast {
      stroke: var(--rw-water);
      stroke-width: 2;
      stroke-dasharray: 5 4;
      stroke-linecap: round;
      opacity: 0.8;
    }
    .watered-guide {
      stroke: var(--rw-water);
      opacity: 0.25;
    }
    .drop {
      fill: var(--rw-water);
    }
    .drop.detected {
      fill: var(--ha-card-background, var(--card-background-color, #fff));
      stroke: var(--rw-water);
      stroke-width: 1.5;
    }
    .fertilized {
      fill: var(--rw-accent);
    }
    .other {
      fill: var(--rw-text2);
    }
    .cross {
      stroke: var(--rw-text2);
      opacity: 0.6;
    }
    .tip {
      position: absolute;
      display: grid;
      gap: 1px;
      padding: 4px 8px;
      border-radius: 8px;
      border: 1px solid var(--rw-line);
      background: var(--ha-card-background, var(--card-background-color, #fff));
      color: var(--rw-text);
      font-size: 12px;
      line-height: 1.35;
      white-space: nowrap;
      pointer-events: none;
      text-align: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
    }
    .num {
      font-variant-numeric: tabular-nums;
      font-weight: 600;
    }
  `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "rootwise-moisture-chart": RootwiseMoistureChart;
  }
}
