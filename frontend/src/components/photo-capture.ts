import { LitElement, css, html, nothing, type PropertyValues } from "lit";
import { property, query, state } from "lit/decorators.js";
import { errorText } from "../cards/base";
import { localize } from "../i18n";
import { chromeLink, isHeic, shrinkPhoto, uploadPhoto } from "../photos";
import { theme } from "../theme";
import type { HomeAssistant } from "../types";

type Mode = "choose" | "camera" | "preview";

interface ImageCaptureLike {
  takePhoto(): Promise<Blob>;
}

/**
 * "Add photo": live camera where the browser allows it (HTTPS), gallery
 * always. The picture is shrunk and stripped of EXIF in the browser, then
 * uploaded; the server cleans it again.
 */
export class RootwisePhotoCapture extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property() plantId = "";
  @property({ type: Boolean }) open = false;
  @property({ type: Boolean, reflect: true }) dark = false;
  /** Hand the picture back instead of uploading it (the wizard: no plant yet). */
  @property({ type: Boolean }) local = false;
  @state() private mode: Mode = "choose";
  @state() private preview?: string;
  @state() private note = "";
  @state() private saving = false;
  @state() private error?: string;

  @query("dialog") private dialog?: HTMLDialogElement;
  @query("video") private video?: HTMLVideoElement;

  private photo?: Blob;
  private stream?: MediaStream;

  private t(key: string, vars?: Record<string, unknown>): string {
    return localize(this.hass, key, vars);
  }

  private get live(): boolean {
    return window.isSecureContext && typeof navigator.mediaDevices?.getUserMedia === "function";
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (!changed.has("open") || !this.dialog) return;
    if (this.open && !this.dialog.open) this.dialog.showModal();
    if (!this.open && this.dialog.open) this.dialog.close();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.reset();
  }

  private reset(): void {
    this.stopCamera();
    if (this.preview) URL.revokeObjectURL(this.preview);
    this.preview = undefined;
    this.photo = undefined;
    this.note = "";
    this.mode = "choose";
    this.error = undefined;
    this.saving = false;
  }

  private onClose = (): void => {
    this.reset();
    this.dispatchEvent(new CustomEvent("rootwise-photo-closed", { bubbles: true, composed: true }));
  };

  // ---- camera -------------------------------------------------------------

  private startCamera = async (): Promise<void> => {
    this.error = undefined;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1440 } },
        audio: false,
      });
    } catch {
      this.error = this.t("photo.camera_denied");
      return;
    }
    this.mode = "camera";
    await this.updateComplete;
    const video = this.video;
    if (!video) return;
    video.srcObject = this.stream;
    await video.play().catch(() => undefined);
    // Many phone WebViews start with a fixed focus; ask for continuous focus.
    const [track] = this.stream.getVideoTracks();
    await track
      ?.applyConstraints({ advanced: [{ focusMode: "continuous" } as MediaTrackConstraintSet] })
      .catch(() => undefined);
  };

  private stopCamera(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = undefined;
  }

  private shoot = async (): Promise<void> => {
    const track = this.stream?.getVideoTracks()[0];
    const Capture = (window as unknown as { ImageCapture?: new (track: MediaStreamTrack) => ImageCaptureLike })
      .ImageCapture;
    let shot: Blob | null = null;
    if (track && Capture) {
      // Full sensor resolution and the phone's own focus, where available.
      shot = await new Capture(track).takePhoto().catch(() => null);
    }
    if (!shot && this.video) shot = await this.frame(this.video);
    this.stopCamera();
    if (shot) await this.take(shot);
    else this.error = this.t("photo.failed", { error: "camera" });
  };

  private frame(video: HTMLVideoElement): Promise<Blob | null> {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
  }

  // ---- picture ------------------------------------------------------------

  private picked = async (event: Event): Promise<void> => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (file) await this.take(file);
  };

  private async take(picture: Blob): Promise<void> {
    this.error = undefined;
    let photo: Blob;
    try {
      photo = await shrinkPhoto(picture);
    } catch {
      if (picture instanceof File && isHeic(picture)) {
        this.error = this.t("photo.heic");
        return;
      }
      photo = picture; // let the server try
    }
    if (this.preview) URL.revokeObjectURL(this.preview);
    this.photo = photo;
    this.preview = URL.createObjectURL(photo);
    this.mode = "preview";
  }

  private again = (): void => {
    if (this.preview) URL.revokeObjectURL(this.preview);
    this.preview = undefined;
    this.photo = undefined;
    this.mode = "choose";
  };

  private save = async (): Promise<void> => {
    if (this.local && this.photo) {
      this.dispatchEvent(
        new CustomEvent("rootwise-photo-taken", { detail: { photo: this.photo }, bubbles: true, composed: true }),
      );
      this.dialog?.close();
      return;
    }
    if (!this.hass || !this.photo || this.saving) return;
    this.saving = true;
    this.error = undefined;
    try {
      const entry = await uploadPhoto(this.hass, this.plantId, this.photo, this.note);
      this.dispatchEvent(
        new CustomEvent("rootwise-photo-added", { detail: { entry }, bubbles: true, composed: true }),
      );
      this.dialog?.close();
    } catch (err) {
      this.error = this.t("photo.failed", { error: errorText(err) });
    } finally {
      this.saving = false;
    }
  };

  // ---- rendering ------------------------------------------------------------

  protected override render() {
    return html`
      <dialog aria-labelledby="title" @close=${this.onClose}>
        <header>
          <h2 id="title">${this.t("photo.add")}</h2>
          <button class="icon" aria-label=${this.t("photo.close")} @click=${() => this.dialog?.close()}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </header>
        ${this.mode === "camera" ? this.renderCamera() : this.mode === "preview" ? this.renderPreview() : this.renderChoose()}
        ${this.error ? html`<p class="error" role="alert">${this.error}</p>` : nothing}
      </dialog>
    `;
  }

  private renderChoose() {
    const live = this.live;
    const agent = navigator.userAgent;
    // The Android app ignores `capture` and opens the gallery anyway.
    const app = /Home Assistant\//.test(agent);
    const chrome = live ? null : chromeLink(this.hass?.config?.external_url, location.pathname, agent);
    return html`
      <div class="choices">
        ${live
          ? html`<button class="choice" @click=${this.startCamera}>
              <ha-icon icon="mdi:camera"></ha-icon>${this.t("photo.camera")}
            </button>`
          : app
            ? nothing
            : html`<label class="choice">
                <input type="file" accept="image/*" capture="environment" @change=${this.picked} />
                <ha-icon icon="mdi:camera"></ha-icon>${this.t("photo.camera")}
              </label>`}
        <label class="choice">
          <input type="file" accept="image/*" @change=${this.picked} />
          <ha-icon icon="mdi:image-multiple"></ha-icon>${this.t("photo.gallery")}
        </label>
      </div>
      ${live
        ? nothing
        : html`<p class="hint">
            ${this.t("photo.https_hint")}
            ${chrome ? html`<a href=${chrome}>${this.t("photo.chrome")}</a>` : nothing}
          </p>`}
    `;
  }

  private renderCamera() {
    return html`
      <div class="viewfinder"><video autoplay playsinline muted></video></div>
      <div class="row">
        <button class="secondary" @click=${this.again}>${this.t("action.cancel")}</button>
        <button class="primary" @click=${this.shoot}>
          <ha-icon icon="mdi:camera-iris"></ha-icon>${this.t("photo.shoot")}
        </button>
      </div>
    `;
  }

  private renderPreview() {
    return html`
      <img class="preview" src=${this.preview ?? ""} alt="" />
      <label class="note">
        <span class="muted">${this.t("photo.note")}</span>
        <input
          type="text"
          maxlength="500"
          .value=${this.note}
          @input=${(e: Event) => (this.note = (e.target as HTMLInputElement).value)}
        />
      </label>
      <div class="row">
        <button class="secondary" ?disabled=${this.saving} @click=${this.again}>${this.t("photo.retake")}</button>
        <button class="primary" ?disabled=${this.saving} @click=${this.save}>
          ${this.saving ? this.t("photo.saving") : this.t(this.local ? "photo.use" : "photo.save")}
        </button>
      </div>
    `;
  }

  static override styles = [
    theme,
    css`
      :host {
        display: contents;
      }
      dialog {
        width: min(480px, calc(100vw - 24px));
        max-height: calc(100vh - 24px);
        box-sizing: border-box;
        padding: 16px;
        border: 0;
        border-radius: 20px;
        background: var(--ha-card-background, var(--card-background-color, #fff));
        color: var(--rw-text);
        display: none;
        flex-direction: column;
        gap: 12px;
      }
      dialog[open] {
        display: flex;
      }
      dialog::backdrop {
        background: rgba(0, 0, 0, 0.55);
      }
      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
      }
      .icon {
        width: 40px;
        height: 40px;
        border: 0;
        border-radius: 50%;
        background: none;
        display: grid;
        place-items: center;
      }
      .choices {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 10px;
      }
      .choice {
        min-height: 96px;
        border-radius: 16px;
        border: 1px solid var(--rw-line);
        background: var(--rw-accent-soft);
        color: var(--rw-accent);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 15px;
        font-weight: 500;
        cursor: pointer;
      }
      .choice ha-icon {
        --mdc-icon-size: 32px;
      }
      .choice input {
        position: absolute;
        width: 1px;
        height: 1px;
        opacity: 0;
        pointer-events: none;
      }
      .choice:focus-within {
        outline: 2px solid var(--rw-accent);
        outline-offset: 2px;
      }
      .hint {
        margin: 0;
        font-size: 13px;
        line-height: 1.45;
        color: var(--rw-text2);
      }
      .hint a {
        color: var(--rw-accent);
        font-weight: 500;
      }
      .viewfinder {
        border-radius: 14px;
        overflow: hidden;
        background: #000;
        aspect-ratio: 3 / 4;
        max-height: 60vh;
      }
      video,
      .preview {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .preview {
        max-height: 55vh;
        object-fit: contain;
        border-radius: 14px;
        background: var(--rw-track);
      }
      .note {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 13px;
      }
      .note input {
        font: inherit;
        font-size: 15px;
        min-height: 40px;
        padding: 0 10px;
        border-radius: 10px;
        border: 1px solid var(--rw-line);
        background: transparent;
        color: var(--rw-text);
      }
      .row {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
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
        opacity: 0.6;
      }
      .error {
        margin: 0;
        color: var(--error-color, #b3261e);
        font-size: 14px;
      }
      .muted {
        color: var(--rw-text2);
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "rootwise-photo-capture": RootwisePhotoCapture;
  }
}
