import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { property, query, state } from "lit/decorators.js";
import { canDelete, deleteCare } from "../api";
import { errorText } from "../cards/base";
import { language, localize } from "../i18n";
import { listPhotos, setCover } from "../photos";
import { theme } from "../theme";
import type { HomeAssistant, JournalEntry, PhotoEntry, Plant } from "../types";

const SWIPE = 50;

/** The plant page's photos: grid, viewer, cover choice, delete, add. */
export class RootwisePhotoGallery extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) plant?: Plant;
  @property({ type: Boolean, reflect: true }) dark = false;
  @state() private photos: PhotoEntry[] = [];
  @state() private cover: string | null = null;
  @state() private viewing: number | null = null;
  @state() private capturing = false;
  @state() private confirmDelete = false;
  @state() private message?: string;

  @query("dialog.viewer") private viewer?: HTMLDialogElement;

  private listKey = "";
  private swipeFrom: number | null = null;

  private t(key: string, vars?: Record<string, unknown>): string {
    return localize(this.hass, key, vars);
  }

  /** Open the camera / gallery dialog (also used by the page's quick action). */
  capture(): void {
    this.capturing = true;
  }

  protected override updated(): void {
    const plant = this.plant;
    if (!plant || !this.hass) return;
    // A new journal entry or another cover means the list may have changed.
    const key = [plant.id, plant.photo?.id, plant.recent[0]?.id].join("|");
    if (key !== this.listKey) {
      this.listKey = key;
      void this.reload();
    }
    if (this.viewing !== null && this.viewer && !this.viewer.open) this.viewer.showModal();
  }

  private async reload(): Promise<void> {
    const plant = this.plant;
    if (!plant || !this.hass) return;
    try {
      const result = await listPhotos(this.hass, plant.id);
      if (this.plant?.id !== plant.id) return;
      this.photos = result.photos;
      this.cover = result.cover;
      if (this.viewing !== null && this.viewing >= this.photos.length) {
        this.viewing = this.photos.length ? this.photos.length - 1 : null;
      }
    } catch {
      this.listKey = "";
    }
  }

  private date(iso: string): string {
    return new Intl.DateTimeFormat(language(this.hass), { dateStyle: "medium" }).format(new Date(iso));
  }

  // ---- viewer ---------------------------------------------------------------

  private view(index: number): void {
    this.confirmDelete = false;
    this.message = undefined;
    this.viewing = index;
  }

  private step(by: number): void {
    if (this.viewing === null || !this.photos.length) return;
    this.view((this.viewing + by + this.photos.length) % this.photos.length);
  }

  private closeViewer = (): void => {
    this.viewer?.close();
  };

  private onViewerClosed = (): void => {
    this.viewing = null;
    this.confirmDelete = false;
  };

  private onKey = (event: KeyboardEvent): void => {
    if (event.key === "ArrowLeft") this.step(-1);
    if (event.key === "ArrowRight") this.step(1);
  };

  private onPointerDown = (event: PointerEvent): void => {
    this.swipeFrom = event.clientX;
  };

  private onPointerUp = (event: PointerEvent): void => {
    if (this.swipeFrom === null) return;
    const moved = event.clientX - this.swipeFrom;
    this.swipeFrom = null;
    if (Math.abs(moved) >= SWIPE) this.step(moved > 0 ? -1 : 1);
  };

  private async useAsCover(photo: PhotoEntry): Promise<void> {
    if (!this.hass || !this.plant) return;
    try {
      await setCover(this.hass, this.plant.id, photo.photo_id);
      this.cover = photo.photo_id;
      this.message = this.t("photo.cover_set");
    } catch (err) {
      this.message = this.t("toast.failed", { error: errorText(err) });
    }
  }

  private async deletePhoto(photo: PhotoEntry): Promise<void> {
    if (!this.hass) return;
    if (!this.confirmDelete) {
      this.confirmDelete = true;
      return;
    }
    this.confirmDelete = false;
    try {
      await deleteCare(this.hass, photo.entry_id);
      this.photos = this.photos.filter((p) => p.entry_id !== photo.entry_id);
      if (!this.photos.length) this.closeViewer();
      else if (this.viewing !== null) this.viewing = Math.min(this.viewing, this.photos.length - 1);
    } catch (err) {
      this.message = this.t("toast.failed", { error: errorText(err) });
    }
  }

  private deletable(photo: PhotoEntry): boolean {
    if (!this.hass) return false;
    const entry = { id: photo.entry_id, source: "card", user_id: photo.user_id ?? undefined } as JournalEntry;
    return canDelete(this.hass, entry);
  }

  // ---- rendering --------------------------------------------------------------

  protected override render(): TemplateResult {
    const plant = this.plant;
    return html`
      <section class="surface">
        <div class="section-head">
          <h3>${this.t("section.photos")}</h3>
          <button class="add" @click=${() => this.capture()}>
            <ha-icon icon="mdi:camera-plus-outline"></ha-icon>${this.t("photo.add_short")}
          </button>
        </div>
        ${this.photos.length
          ? html`<div class="grid">${this.photos.map((photo, index) => this.renderThumb(photo, index))}</div>`
          : html`<p class="muted small">${this.t("photo.empty")}</p>`}
      </section>
      <rootwise-photo-capture
        .hass=${this.hass}
        plantId=${plant?.id ?? ""}
        ?open=${this.capturing}
        ?dark=${this.dark}
        @rootwise-photo-closed=${() => (this.capturing = false)}
        @rootwise-photo-added=${() => void this.reload()}
      ></rootwise-photo-capture>
      ${this.renderViewer()}
    `;
  }

  private renderThumb(photo: PhotoEntry, index: number): TemplateResult {
    const date = this.date(photo.ts);
    return html`<button class="thumb" aria-label=${date} @click=${() => this.view(index)}>
      <rootwise-auth-image
        .hass=${this.hass}
        plantId=${this.plant?.id ?? ""}
        photoId=${photo.photo_id}
        size="thumb"
        alt=${date}
      ></rootwise-auth-image>
      ${photo.photo_id === this.cover ? html`<span class="badge">${this.t("photo.is_cover")}</span>` : nothing}
    </button>`;
  }

  private renderViewer(): TemplateResult {
    const photo = this.viewing === null ? undefined : this.photos[this.viewing];
    return html`<dialog
      class="viewer"
      aria-label=${this.t("section.photos")}
      @close=${this.onViewerClosed}
      @keydown=${this.onKey}
    >
      ${photo
        ? html`
            <div class="bar">
              <span class="counter num">${(this.viewing ?? 0) + 1} / ${this.photos.length}</span>
              <span class="when">${this.date(photo.ts)}</span>
              <button class="round" aria-label=${this.t("photo.close")} @click=${this.closeViewer}>
                <ha-icon icon="mdi:close"></ha-icon>
              </button>
            </div>
            <div class="stage" @pointerdown=${this.onPointerDown} @pointerup=${this.onPointerUp}>
              <rootwise-auth-image
                .hass=${this.hass}
                plantId=${this.plant?.id ?? ""}
                photoId=${photo.photo_id}
                size="full"
                alt=${this.date(photo.ts)}
              ></rootwise-auth-image>
              ${this.photos.length > 1
                ? html`<button class="round side prev" aria-label=${this.t("photo.prev")} @click=${() => this.step(-1)}>
                      <ha-icon icon="mdi:chevron-left"></ha-icon>
                    </button>
                    <button class="round side next" aria-label=${this.t("photo.next")} @click=${() => this.step(1)}>
                      <ha-icon icon="mdi:chevron-right"></ha-icon>
                    </button>`
                : nothing}
            </div>
            <div class="bar bottom">
              <span class="note">${photo.note ?? ""}</span>
              <span class="actions">
                ${photo.photo_id === this.cover
                  ? html`<span class="pill">${this.t("photo.is_cover")}</span>`
                  : html`<button class="pill" @click=${() => void this.useAsCover(photo)}>
                      <ha-icon icon="mdi:star-outline"></ha-icon>${this.t("photo.cover")}
                    </button>`}
                ${this.deletable(photo)
                  ? html`<button class="pill danger" @click=${() => void this.deletePhoto(photo)}>
                      <ha-icon icon="mdi:delete-outline"></ha-icon>${this.confirmDelete
                        ? this.t("photo.delete_confirm")
                        : this.t("photo.delete")}
                    </button>`
                  : nothing}
              </span>
            </div>
            ${this.message ? html`<div class="message" role="status">${this.message}</div>` : nothing}
          `
        : nothing}
    </dialog>`;
  }

  static override styles = [
    theme,
    css`
      .surface {
        background: var(--ha-card-background, var(--card-background-color, #fff));
        border-radius: var(--rw-radius);
        border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--rw-line));
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }
      ha-icon {
        --mdc-icon-size: 20px;
        flex-shrink: 0;
      }
      .add {
        min-height: 36px;
        padding: 0 14px;
        border-radius: 18px;
        border: 0;
        background: var(--rw-accent-soft);
        color: var(--rw-accent);
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
        gap: 6px;
      }
      .thumb {
        position: relative;
        padding: 0;
        border: 0;
        border-radius: 10px;
        overflow: hidden;
        aspect-ratio: 1;
        background: none;
      }
      .thumb rootwise-auth-image {
        width: 100%;
        height: 100%;
      }
      .badge {
        position: absolute;
        left: 6px;
        bottom: 6px;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 11px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
      }
      .small {
        margin: 0;
        font-size: 13px;
        line-height: 1.45;
      }
      .viewer {
        width: 100vw;
        height: 100vh;
        max-width: 100vw;
        max-height: 100vh;
        margin: 0;
        padding: 0;
        border: 0;
        background: #000;
        color: #fff;
        display: none;
        flex-direction: column;
      }
      .viewer[open] {
        display: flex;
      }
      .viewer::backdrop {
        background: #000;
      }
      .bar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: calc(8px + env(safe-area-inset-top, 0px)) 12px 8px;
      }
      .bar.bottom {
        padding: 8px 12px calc(12px + env(safe-area-inset-bottom, 0px));
        flex-wrap: wrap;
      }
      .when {
        flex: 1;
        font-size: 15px;
      }
      .counter {
        font-size: 13px;
        opacity: 0.75;
      }
      .note {
        flex: 1;
        min-width: 140px;
        font-size: 14px;
        opacity: 0.9;
      }
      .actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .stage {
        position: relative;
        flex: 1;
        min-height: 0;
        touch-action: pan-y;
      }
      .stage rootwise-auth-image {
        width: 100%;
        height: 100%;
        background: none;
        --rw-image-fit: contain;
      }
      .round {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 0;
        background: rgba(255, 255, 255, 0.14);
        color: #fff;
        display: grid;
        place-items: center;
      }
      .side {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
      }
      .prev {
        left: 8px;
      }
      .next {
        right: 8px;
      }
      .pill {
        min-height: 40px;
        padding: 0 14px;
        border-radius: 20px;
        border: 0;
        background: rgba(255, 255, 255, 0.14);
        color: #fff;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
      }
      span.pill {
        background: rgba(72, 165, 102, 0.35);
      }
      .pill.danger {
        background: rgba(242, 184, 181, 0.2);
      }
      .message {
        position: absolute;
        left: 50%;
        bottom: 88px;
        transform: translateX(-50%);
        padding: 8px 14px;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.9);
        color: #111;
        font-size: 14px;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "rootwise-photo-gallery": RootwisePhotoGallery;
  }
}
