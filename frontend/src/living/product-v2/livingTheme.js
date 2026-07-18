export const LIVING_THEMES = ["light", "dark"];

const STORAGE_KEY = "as6-living-theme";

export function normalizeLivingTheme(value) {
  return LIVING_THEMES.includes(value) ? value : "light";
}
export function getStoredLivingTheme() {
  if (typeof window === "undefined") return "light";
  try {
    return normalizeLivingTheme(window.localStorage.getItem(STORAGE_KEY));
  } catch (_error) {
    return "light";
  }
}

export function persistLivingTheme(theme) {
  const normalized = normalizeLivingTheme(theme);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, normalized);
    } catch (_error) {
      // Theme remains active for the current session when storage is unavailable.
    }
    document.documentElement.dataset.as6Theme = normalized;
    document.documentElement.style.colorScheme = normalized;
  }
  return normalized;
}
