import { render } from "lit";
import { describe, expect, it } from "vitest";
import { avatar } from "../src/components/avatar";
import type { HomeAssistant } from "../src/types";
import { plant } from "./fixtures";

const hass = { language: "de" } as HomeAssistant;

function shown(template: ReturnType<typeof avatar>): HTMLElement {
  const host = document.createElement("div");
  render(template, host);
  return host;
}

describe("avatar", () => {
  it("shows the plant's own cover photo first", () => {
    const monstera = plant({
      photo: { id: "01JPHOTO", ts: "2026-10-01T10:00:00+00:00", width: 1200, height: 1600 },
      species: { ...plant().species, image_url: "https://example.org/monstera.jpg" },
    });
    const host = shown(avatar(hass, monstera));
    const image = host.querySelector("rootwise-auth-image");
    expect(image?.getAttribute("photoId")).toBe("01JPHOTO");
    expect(image?.getAttribute("size")).toBe("thumb");
    expect(host.querySelector("img")).toBeNull();
  });

  it("falls back to the species picture, then to the sprout", () => {
    const withSpecies = plant({ species: { ...plant().species, image_url: "https://example.org/monstera.jpg" } });
    expect(shown(avatar(hass, withSpecies)).querySelector("img")?.getAttribute("src")).toBe(
      "https://example.org/monstera.jpg",
    );
    const bare = shown(avatar(hass, plant()));
    expect(bare.querySelector("img, rootwise-auth-image")).toBeNull();
    expect(bare.querySelector("ha-icon")?.getAttribute("icon")).toBe("mdi:sprout");
  });
});
