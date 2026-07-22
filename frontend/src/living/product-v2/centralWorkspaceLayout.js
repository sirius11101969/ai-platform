const STORAGE_PREFIX = "as6-central-workspace-layout-v1";

export const CENTRAL_LAYOUT_DEFAULTS = Object.freeze({
  sales: Object.freeze({ x: 20, y: 20 }),
  relations: Object.freeze({ x: 50, y: 12 }),
  marketing: Object.freeze({ x: 77, y: 25 }),
  finance: Object.freeze({ x: 16, y: 58 }),
  documents: Object.freeze({ x: 10, y: 84 }),
  team: Object.freeze({ x: 83, y: 73 }),
  focus: Object.freeze({ x: 50, y: 50 }),
});

const LAYOUT_IDS = Object.keys(CENTRAL_LAYOUT_DEFAULTS);

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function storageKey(workspaceId) {
  return `${STORAGE_PREFIX}:${String(workspaceId || "default")}`;
}

export function createDefaultCentralLayout() {
  return Object.fromEntries(LAYOUT_IDS.map((id) => [id, { ...CENTRAL_LAYOUT_DEFAULTS[id] }]));
}

export function normalizeCentralLayout(value) {
  const defaults = createDefaultCentralLayout();
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaults;

  LAYOUT_IDS.forEach((id) => {
    const x = Number(value[id]?.x);
    const y = Number(value[id]?.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    defaults[id] = {
      x: Math.round(clamp(x, 6, 94) * 10) / 10,
      y: Math.round(clamp(y, 6, 92) * 10) / 10,
    };
  });
  return defaults;
}

export function readCentralLayout(workspaceId) {
  if (typeof window === "undefined") return createDefaultCentralLayout();
  try {
    return normalizeCentralLayout(JSON.parse(window.localStorage.getItem(storageKey(workspaceId)) || "null"));
  } catch {
    return createDefaultCentralLayout();
  }
}

export function persistCentralLayout(workspaceId, layout) {
  const normalized = normalizeCentralLayout(layout);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey(workspaceId), JSON.stringify({ version: 1, ...normalized }));
  }
  return normalized;
}

export function clearCentralLayout(workspaceId) {
  if (typeof window !== "undefined") window.localStorage.removeItem(storageKey(workspaceId));
  return createDefaultCentralLayout();
}

export function centralConnectionPath(connection, layout) {
  const from = layout[connection.from] || CENTRAL_LAYOUT_DEFAULTS[connection.from];
  const to = layout[connection.to] || CENTRAL_LAYOUT_DEFAULTS[connection.to];
  if (!from || !to) return connection.d || "";
  const sourceDx = to.x - from.x;
  const sourceDy = to.y - from.y;
  const distance = Math.hypot(sourceDx, sourceDy);
  const inset = Math.min(4, distance / 3);
  const unitX = distance ? sourceDx / distance : 0;
  const unitY = distance ? sourceDy / distance : 0;
  const start = { x: from.x + unitX * inset, y: from.y + unitY * inset };
  const end = { x: to.x - unitX * inset, y: to.y - unitY * inset };
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const bend = Math.max(-8, Math.min(8, dx * 0.08));
  const first = { x: start.x + dx * 0.36, y: start.y + dy * 0.22 - bend };
  const second = { x: start.x + dx * 0.68, y: start.y + dy * 0.78 - bend };
  return `M${start.x} ${start.y} C${first.x} ${first.y} ${second.x} ${second.y} ${end.x} ${end.y}`;
}

export function moveCentralLayoutItem(layout, id, x, y) {
  if (!LAYOUT_IDS.includes(id)) return normalizeCentralLayout(layout);
  return normalizeCentralLayout({ ...layout, [id]: { x, y } });
}
