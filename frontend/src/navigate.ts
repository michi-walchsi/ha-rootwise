// Navigation inside Home Assistant's frontend: change the URL without a
// reload and tell the app, as its own links do.

export const PANEL_PATH = "/rootwise";

export function plantPath(plantId: string): string {
  return `${PANEL_PATH}/plant/${encodeURIComponent(plantId)}`;
}

export function navigate(path: string, replace = false): void {
  if (replace) history.replaceState(null, "", path);
  else history.pushState(null, "", path);
  window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace } }));
}
