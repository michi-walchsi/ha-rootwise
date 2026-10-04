import { afterEach, describe, expect, it, vi } from "vitest";
import { chromeLink, isHeic, loadPhoto, photoPath, scaledSize, uploadPhoto } from "../src/photos";
import type { HomeAssistant } from "../src/types";

const ANDROID_APP =
  "Mozilla/5.0 (Linux; Android 14; 22101316UG Build/UP1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Version/4.0 Chrome/141.0.0.0 Mobile Safari/537.36 Home Assistant/2026.6.5-full (Android 14; 22101316UG)";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("scaledSize", () => {
  it("shrinks the long side to the limit", () => {
    expect(scaledSize(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(scaledSize(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 });
  });

  it("leaves small pictures as they are", () => {
    expect(scaledSize(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });
});

describe("isHeic", () => {
  it("knows HEIC by type or file name", () => {
    expect(isHeic(new File([], "IMG_0042.HEIC", { type: "" }))).toBe(true);
    expect(isHeic(new File([], "photo.jpg", { type: "image/heic" }))).toBe(true);
    expect(isHeic(new File([], "photo.jpg", { type: "image/jpeg" }))).toBe(false);
  });
});

describe("photoPath", () => {
  it("points to the photo view", () => {
    expect(photoPath("p1", "PH1", "full")).toBe("/api/rootwise/photos/p1/PH1");
    expect(photoPath("p1", "PH1", "thumb")).toBe("/api/rootwise/photos/p1/PH1?size=thumb");
  });
});

describe("chromeLink", () => {
  it("opens the HTTPS address in Chrome on Android", () => {
    expect(chromeLink("https://home.example.ts.net/", "/rootwise/plant/p1", ANDROID_APP)).toBe(
      "intent://home.example.ts.net/rootwise/plant/p1#Intent;scheme=https;package=com.android.chrome;end",
    );
  });

  it("is not offered without an HTTPS address or outside Android", () => {
    expect(chromeLink("http://192.168.1.5:8123", "/rootwise", ANDROID_APP)).toBeNull();
    expect(chromeLink(null, "/rootwise", ANDROID_APP)).toBeNull();
    expect(chromeLink("https://home.example.ts.net", "/rootwise", "Mozilla/5.0 (iPhone)")).toBeNull();
  });
});

describe("uploadPhoto", () => {
  it("posts the picture and the note with the user's token", async () => {
    const fetchWithAuth = vi.fn<(path: string, init?: RequestInit) => Promise<Response>>(
      async () => new Response(JSON.stringify({ entry: { id: "e1" } }), { status: 200 }),
    );
    const hass = { fetchWithAuth } as unknown as HomeAssistant;
    const entry = await uploadPhoto(hass, "p1", new Blob(["x"], { type: "image/jpeg" }), "Neues Blatt");
    expect(entry.id).toBe("e1");
    const [path, init] = fetchWithAuth.mock.calls[0] ?? [];
    expect(path).toBe("/api/rootwise/photos/p1");
    expect(init?.method).toBe("POST");
    const form = init?.body as FormData;
    expect(form.get("note")).toBe("Neues Blatt");
    expect(form.get("file")).toBeInstanceOf(Blob);
  });

  it("passes on what the server says", async () => {
    const fetchWithAuth = vi.fn(
      async () => new Response(JSON.stringify({ message: "Use JPEG, PNG or WebP" }), { status: 415 }),
    );
    const hass = { fetchWithAuth } as unknown as HomeAssistant;
    await expect(uploadPhoto(hass, "p1", new Blob(["x"]))).rejects.toThrow("Use JPEG, PNG or WebP");
  });
});

describe("loadPhoto", () => {
  it("fetches a photo once and hands out an object URL", async () => {
    const fetchWithAuth = vi.fn(async () => new Response(new Blob(["img"], { type: "image/jpeg" })));
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:photo-1");
    const hass = { fetchWithAuth } as unknown as HomeAssistant;
    expect(await loadPhoto(hass, "p1", "PH-ONCE", "thumb")).toBe("blob:photo-1");
    expect(await loadPhoto(hass, "p1", "PH-ONCE", "thumb")).toBe("blob:photo-1");
    expect(fetchWithAuth).toHaveBeenCalledTimes(1);
  });

  it("tries again after a failure", async () => {
    const fetchWithAuth = vi
      .fn()
      .mockResolvedValueOnce(new Response("", { status: 404 }))
      .mockResolvedValueOnce(new Response(new Blob(["img"])));
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:photo-2");
    const hass = { fetchWithAuth } as unknown as HomeAssistant;
    await expect(loadPhoto(hass, "p1", "PH-RETRY", "full")).rejects.toThrow();
    expect(await loadPhoto(hass, "p1", "PH-RETRY", "full")).toBe("blob:photo-2");
  });
});
