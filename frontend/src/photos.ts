// Plant photos in the browser: shrink before upload, upload with the user's
// token, load as blobs (an <img src> can't send the token, and the photos
// are only served to logged-in users), list and choose the cover.

import type { HomeAssistant, JournalEntry, PhotoEntry } from "./types";

export type PhotoSize = "full" | "thumb";

/** Long side of an uploaded photo; the server keeps the same. */
export const MAX_SIDE = 1600;
const QUALITY = 0.82;

export function scaledSize(width: number, height: number, max: number): { width: number; height: number } {
  const factor = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * factor), height: Math.round(height * factor) };
}

/** iPhones and some Androids save HEIC, which Chrome can't decode. */
export function isHeic(file: File): boolean {
  return /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

export function photoPath(plantId: string, photoId: string, size: PhotoSize): string {
  const path = `/api/rootwise/photos/${encodeURIComponent(plantId)}/${encodeURIComponent(photoId)}`;
  return size === "thumb" ? `${path}?size=thumb` : path;
}

/**
 * The live camera needs HTTPS. On Android, a link that opens the HTTPS
 * address of Home Assistant in Chrome; null where that doesn't apply.
 */
export function chromeLink(externalUrl: string | null | undefined, path: string, userAgent: string): string | null {
  if (!externalUrl?.startsWith("https://") || !/Android/i.test(userAgent)) return null;
  const host = externalUrl.slice("https://".length).replace(/\/+$/, "");
  return `intent://${host}${path}#Intent;scheme=https;package=com.android.chrome;end`;
}

/** Turn the picture upright, shrink it to MAX_SIDE and encode JPEG; EXIF stays behind. */
export async function shrinkPhoto(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" });
  const { width, height } = scaledSize(bitmap.width, bitmap.height, MAX_SIDE);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No canvas");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob((result) => (result ? resolve(result) : reject(new Error("JPEG"))), "image/jpeg", QUALITY);
  });
}

async function failure(response: Response): Promise<Error> {
  try {
    const body = (await response.json()) as { message?: string };
    if (body.message) return new Error(body.message);
  } catch {
    // not JSON
  }
  return new Error(`HTTP ${response.status}`);
}

export async function uploadPhoto(
  hass: HomeAssistant,
  plantId: string,
  photo: Blob,
  note?: string,
): Promise<JournalEntry> {
  const form = new FormData();
  form.append("file", photo, "photo.jpg");
  if (note?.trim()) form.append("note", note.trim());
  const response = await hass.fetchWithAuth(`/api/rootwise/photos/${encodeURIComponent(plantId)}`, {
    method: "POST",
    body: form,
  });
  if (!response.ok) throw await failure(response);
  return ((await response.json()) as { entry: JournalEntry }).entry;
}

// Object URLs of photos already loaded: a photo never changes under its id.
const loaded = new Map<string, Promise<string>>();

export function loadPhoto(hass: HomeAssistant, plantId: string, photoId: string, size: PhotoSize): Promise<string> {
  const path = photoPath(plantId, photoId, size);
  let url = loaded.get(path);
  if (!url) {
    url = hass.fetchWithAuth(path).then(async (response) => {
      if (!response.ok) throw await failure(response);
      return URL.createObjectURL(await response.blob());
    });
    // A failed load (offline, deleted) may be tried again later.
    url.catch(() => loaded.delete(path));
    loaded.set(path, url);
  }
  return url;
}

export async function listPhotos(
  hass: HomeAssistant,
  plantId: string,
): Promise<{ photos: PhotoEntry[]; cover: string | null }> {
  return hass.callWS({ type: "rootwise/photos/list", plant_id: plantId });
}

export async function setCover(hass: HomeAssistant, plantId: string, photoId: string | null): Promise<void> {
  await hass.callWS({ type: "rootwise/photos/cover", plant_id: plantId, photo_id: photoId });
}
