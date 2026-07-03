import { resolvePanelHealth } from "./panelResolver.js";

export function createPanelHealthSnapshot(registry) {
  const health = resolvePanelHealth(registry);
  return {
    status: health.hasDuplicatePanelPlacements ? "WARN" : "OK",
    ...health,
    checkedAt: new Date().toISOString(),
  };
}
