const STORAGE_PREFIX = "as6-light-background-v1";

export const LIGHT_BACKGROUND_MODES = Object.freeze(["brand", "clean"]);
export const DEFAULT_LIGHT_BACKGROUND = "brand";

function storageKey(workspaceId) {
  return `${STORAGE_PREFIX}:${String(workspaceId || "default")}`;
}

export function normalizeLightBackground(value) {
  return LIGHT_BACKGROUND_MODES.includes(value) ? value : DEFAULT_LIGHT_BACKGROUND;
}

export function readLightBackground(workspaceId) {
  if (typeof window === "undefined") return DEFAULT_LIGHT_BACKGROUND;
  try {
    return normalizeLightBackground(window.localStorage.getItem(storageKey(workspaceId)));
  } catch {
    return DEFAULT_LIGHT_BACKGROUND;
  }
}

export function persistLightBackground(workspaceId, mode) {
  const normalized = normalizeLightBackground(mode);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(storageKey(workspaceId), normalized);
    } catch {
      // The selected background still applies in memory when storage is unavailable.
    }
  }
  return normalized;
}
