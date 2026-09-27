import { LitElement, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import { subscribePlants } from "../api";
import { localize } from "../i18n";
import type { HassConnection, HomeAssistant, PlantsPayload } from "../types";

/** Shared plumbing: the plant subscription, texts, theme and more-info. */
export class RootwiseCardBase extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() protected payload?: PlantsPayload;

  private unsubscribe?: () => void;
  private connection?: HassConnection;

  override connectedCallback(): void {
    super.connectedCallback();
    this.subscribe();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.connection = undefined;
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("hass")) {
      this.subscribe();
      this.toggleAttribute("dark", Boolean(this.hass?.themes?.darkMode));
    }
  }

  private subscribe(): void {
    const hass = this.hass;
    if (!hass || !this.isConnected || hass.connection === this.connection) return;
    this.unsubscribe?.();
    this.connection = hass.connection;
    this.unsubscribe = subscribePlants(hass, (payload) => {
      this.payload = payload;
    });
  }

  protected t(key: string, vars?: Record<string, unknown>): string {
    return localize(this.hass, key, vars);
  }

  protected moreInfo(entityId: string | undefined): void {
    if (!entityId) return;
    this.dispatchEvent(
      new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }),
    );
  }
}

export function errorText(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) return String(err.message);
  return String(err);
}

/** Labels for the built-in card editor, in the page's language. */
export function editorLabel(schema: { name: string }): string {
  const hass = { language: document.documentElement.lang || "en" } as HomeAssistant;
  return localize(hass, `editor.${schema.name}`);
}
