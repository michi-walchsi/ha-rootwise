import { css, html, nothing, type TemplateResult } from "lit";
import type { HomeAssistant, Plant } from "../types";

function hide(e: Event): void {
  (e.target as HTMLElement).hidden = true;
}

/**
 * The round picture of a plant: its own cover photo, else the species
 * picture, else a sprout. The sprout stays underneath, so a picture that
 * can't load leaves the sprout visible. Style it with `avatarStyles`.
 */
export function avatar(hass: HomeAssistant | undefined, plant: Plant, extraClass = ""): TemplateResult {
  return html`<div class="avatar ${extraClass}">
    <ha-icon icon="mdi:sprout"></ha-icon>
    ${plant.photo
      ? html`<rootwise-auth-image
          .hass=${hass}
          plantId=${plant.id}
          photoId=${plant.photo.id}
          size="thumb"
        ></rootwise-auth-image>`
      : plant.species.image_url
        ? html`<img src=${plant.species.image_url} alt="" loading="lazy" @error=${hide} />`
        : nothing}
  </div>`;
}

export const avatarStyles = css`
  .avatar {
    position: relative;
    flex-shrink: 0;
    border-radius: 50%;
    overflow: hidden;
    background: var(--rw-accent-soft);
    color: var(--rw-accent);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .avatar img,
  .avatar rootwise-auth-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
