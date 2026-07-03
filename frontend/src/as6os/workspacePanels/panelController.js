import { createPanelRegistry } from "./panelRegistry.js";
import { resolvePanelTree } from "./panelResolver.js";
import { createPanelHealthSnapshot } from "./panelHealthSnapshot.js";
import { traceAS6WorkspacePanel } from "./panelTracer.js";

export function createPanelController(initialRegions = [], initialPanels = []) {
  const registry = createPanelRegistry(initialRegions, initialPanels);
  const events = [];

  const trace = (event, payload) => {
    const record = traceAS6WorkspacePanel(event, payload);
    events.push(record);
    return record;
  };

  const registerRegion = (region) => {
    const result = registry.registerRegion(region);
    trace("panel.region.registered", { id: result.id });
    return result;
  };

  const registerSlot = (slot) => {
    const result = registry.registerSlot(slot);
    trace("panel.slot.registered", { id: result.id, region: result.region });
    return result;
  };

  const registerPanel = (panel) => {
    const result = registry.registerPanel(panel);
    trace("panel.registered", { id: result.id, region: result.region, slot: result.slot });
    return result;
  };

  const resolve = () => resolvePanelTree(registry);
  const health = () => createPanelHealthSnapshot(registry);
  const getTrace = () => [...events];

  trace("panel.controller.initialized", { regions: registry.listRegions().length });

  return { registry, registerRegion, registerSlot, registerPanel, resolve, health, getTrace };
}
