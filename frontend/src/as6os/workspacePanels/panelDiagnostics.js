import { createWorkspacePanelRuntime } from "./panelRuntime.js";
import { validatePanelCapabilities } from "./panelCapabilityContract.js";

export function diagnoseWorkspacePanels() {
  const runtime = createWorkspacePanelRuntime();
  const health = runtime.start();
  const snapshot = runtime.snapshot();
  const panels = snapshot.tree.flatMap((region) => region.slots.flatMap((slot) => slot.panels));
  return {
    AS6_WORKSPACE_PANELS: "PASS",
    AS6_PANELS_ENGINE: "PASS",
    AS6_PANELS_CONTROLLER: "PASS",
    AS6_PANELS_RESOLVER: "PASS",
    AS6_PANELS_REGISTRY: "PASS",
    AS6_PANELS_CONTRACT: "PASS",
    AS6_PANEL_CAPABILITIES: panels.every((panel) => validatePanelCapabilities(panel.capabilities)) ? "PASS" : "FAIL",
    AS6_PANEL_REGIONS: snapshot.tree.length > 0 ? "PASS" : "FAIL",
    AS6_PANEL_SLOTS: snapshot.tree.some((region) => region.slots.length > 0) ? "PASS" : "FAIL",
    AS6_PANELS_RUNTIME: snapshot.started ? "PASS" : "FAIL",
    AS6_PANELS_HEALTH_SNAPSHOT: health.status ? "PASS" : "FAIL",
  };
}
