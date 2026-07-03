import { createPanelRegion, createPanelSlot, createPanel } from "./panelContract.js";

export function createPanelRegistry(initialRegions = [], initialPanels = []) {
  const regions = new Map();
  const slots = new Map();
  const panels = new Map();

  const registerRegion = (region) => {
    const normalized = createPanelRegion(region);
    regions.set(normalized.id, { ...normalized, slots: [] });
    normalized.slots.forEach(registerSlot);
    return normalized;
  };

  const registerSlot = (slot) => {
    const normalized = createPanelSlot(slot);
    slots.set(normalized.id, normalized);
    if (!regions.has(normalized.region)) {
      regions.set(normalized.region, { id: normalized.region, label: normalized.region, order: 100, slots: [], meta: {} });
    }
    return normalized;
  };

  const registerPanel = (panel) => {
    const normalized = createPanel(panel);
    panels.set(normalized.id, normalized);
    if (!regions.has(normalized.region)) {
      registerRegion({ id: normalized.region, label: normalized.region, order: 100 });
    }
    if (!slots.has(normalized.slot)) {
      registerSlot({ id: normalized.slot, label: normalized.slot, region: normalized.region, order: normalized.order });
    }
    return normalized;
  };

  const listRegions = () => Array.from(regions.values()).sort((a, b) => a.order - b.order);
  const listSlots = () => Array.from(slots.values()).sort((a, b) => a.order - b.order);
  const listPanels = () => Array.from(panels.values()).sort((a, b) => a.order - b.order);
  const getPanel = (id) => panels.get(id) || null;

  initialRegions.forEach(registerRegion);
  initialPanels.forEach(registerPanel);

  return { registerRegion, registerSlot, registerPanel, listRegions, listSlots, listPanels, getPanel };
}
