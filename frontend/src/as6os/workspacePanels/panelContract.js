export const AS6_PANEL_REGION = "workspace.panels";

export function createPanelSlot(slot = {}) {
  if (!slot.id || !slot.label) {
    throw new Error("AS6_PANEL_SLOT_CONTRACT_INVALID");
  }
  return {
    id: String(slot.id),
    label: String(slot.label),
    region: slot.region ? String(slot.region) : "rightRail",
    order: Number.isFinite(slot.order) ? slot.order : 100,
    accepts: Array.isArray(slot.accepts) ? slot.accepts.map(String) : [],
    meta: slot.meta && typeof slot.meta === "object" ? slot.meta : {},
  };
}

export function createPanelRegion(region = {}) {
  if (!region.id || !region.label) {
    throw new Error("AS6_PANEL_REGION_CONTRACT_INVALID");
  }
  return {
    id: String(region.id),
    label: String(region.label),
    order: Number.isFinite(region.order) ? region.order : 100,
    slots: Array.isArray(region.slots) ? region.slots.map(createPanelSlot) : [],
    meta: region.meta && typeof region.meta === "object" ? region.meta : {},
  };
}

export function createPanel(panel = {}) {
  if (!panel.id || !panel.label) {
    throw new Error("AS6_PANEL_CONTRACT_INVALID");
  }
  return {
    id: String(panel.id),
    label: String(panel.label),
    region: panel.region ? String(panel.region) : "rightRail",
    slot: panel.slot ? String(panel.slot) : "default",
    order: Number.isFinite(panel.order) ? panel.order : 100,
    capabilities: Array.isArray(panel.capabilities) ? panel.capabilities.map(String) : [],
    visible: panel.visible !== false,
    meta: panel.meta && typeof panel.meta === "object" ? panel.meta : {},
  };
}
