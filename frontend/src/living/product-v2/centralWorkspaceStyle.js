const STORAGE_PREFIX = "as6-central-workspace-style-v1";

export const CENTRAL_STYLE_NODE_IDS = Object.freeze([
  "sales",
  "relations",
  "marketing",
  "finance",
  "documents",
  "team",
]);

export const CENTRAL_STYLE_COLORS = Object.freeze([
  "#6b91ad",
  "#2f709f",
  "#2f8e79",
  "#8a6aa8",
  "#b06a72",
  "#8a7756",
]);

export const CENTRAL_STYLE_GLYPHS = Object.freeze(["original", "ring", "diamond"]);

const DEFAULT_NODE_STYLE = Object.freeze({
  color: CENTRAL_STYLE_COLORS[0],
  iconScale: 1,
  labelScale: 1,
  glyph: "original",
});

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function storageKey(workspaceId) {
  return `${STORAGE_PREFIX}:${String(workspaceId || "default")}`;
}

function normalizeScale(value, fallback, minimum, maximum) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.round(clamp(number, minimum, maximum) * 100) / 100;
}

function normalizeNodeStyle(value) {
  return {
    color: CENTRAL_STYLE_COLORS.includes(value?.color) ? value.color : DEFAULT_NODE_STYLE.color,
    iconScale: normalizeScale(value?.iconScale, DEFAULT_NODE_STYLE.iconScale, 0.8, 1.4),
    labelScale: normalizeScale(value?.labelScale, DEFAULT_NODE_STYLE.labelScale, 0.85, 1.25),
    glyph: CENTRAL_STYLE_GLYPHS.includes(value?.glyph) ? value.glyph : DEFAULT_NODE_STYLE.glyph,
  };
}

export function createDefaultCentralStyle() {
  return Object.fromEntries(CENTRAL_STYLE_NODE_IDS.map((id) => [id, { ...DEFAULT_NODE_STYLE }]));
}

export function normalizeCentralStyle(value) {
  const defaults = createDefaultCentralStyle();
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaults;
  CENTRAL_STYLE_NODE_IDS.forEach((id) => {
    defaults[id] = normalizeNodeStyle(value[id]);
  });
  return defaults;
}

export function readCentralStyle(workspaceId) {
  if (typeof window === "undefined") return createDefaultCentralStyle();
  try {
    return normalizeCentralStyle(JSON.parse(window.localStorage.getItem(storageKey(workspaceId)) || "null"));
  } catch {
    return createDefaultCentralStyle();
  }
}

export function persistCentralStyle(workspaceId, style) {
  const normalized = normalizeCentralStyle(style);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey(workspaceId), JSON.stringify({ version: 1, ...normalized }));
  }
  return normalized;
}

export function updateCentralStyleItem(style, id, patch) {
  if (!CENTRAL_STYLE_NODE_IDS.includes(id)) return normalizeCentralStyle(style);
  return normalizeCentralStyle({
    ...style,
    [id]: { ...(style?.[id] || DEFAULT_NODE_STYLE), ...patch },
  });
}

export function resetCentralStyleItem(style, id) {
  if (!CENTRAL_STYLE_NODE_IDS.includes(id)) return normalizeCentralStyle(style);
  return normalizeCentralStyle({ ...style, [id]: DEFAULT_NODE_STYLE });
}
