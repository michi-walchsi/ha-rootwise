import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { loadPhoto, type PhotoSize } from "../photos";
import type { HomeAssistant } from "../types";

/** A plant photo, loaded with the user's token (see photos.ts). */
export class RootwiseAuthImage extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property() plantId = "";
  @property() photoId = "";
  @property() size: PhotoSize = "thumb";
  @property() alt = "";
  @state() private src?: string;
  @state() private failed = false;

  private key = "";

  // Before rendering: state set here joins this update instead of starting another.
  protected override willUpdate(): void {
    const key = `${this.plantId}/${this.photoId}/${this.size}`;
    if (!this.hass || !this.plantId || !this.photoId || key === this.key) return;
    this.key = key;
    this.src = undefined;
    this.failed = false;
    loadPhoto(this.hass, this.plantId, this.photoId, this.size).then(
      (url) => {
        if (this.key === key) this.src = url;
      },
      () => {
        if (this.key === key) this.failed = true;
      },
    );
  }

  protected override render() {
    if (this.src) return html`<img src=${this.src} alt=${this.alt} draggable="false" />`;
    return html`<div class="placeholder ${this.failed ? "failed" : ""}" role="img" aria-label=${this.alt}>
      ${this.failed ? html`<ha-icon icon="mdi:image-broken-variant"></ha-icon>` : nothing}
    </div>`;
  }

  static override styles = css`
    :host {
      display: block;
      overflow: hidden;
      background: var(--rw-track, rgba(127, 127, 127, 0.16));
    }
    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: var(--rw-image-fit, cover);
    }
    .placeholder {
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      color: var(--rw-text2, var(--secondary-text-color));
    }
    .placeholder:not(.failed) {
      animation: pulse 1.4s ease-in-out infinite;
    }
    @keyframes pulse {
      50% {
        opacity: 0.55;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .placeholder:not(.failed) {
        animation: none;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "rootwise-auth-image": RootwiseAuthImage;
  }
}
