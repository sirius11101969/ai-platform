import { createPanelController } from "./panelController.js";

export const AS6_DEFAULT_PANEL_REGIONS = [
  {
    id: "rightRail",
    label: "Right Rail",
    order: 20,
    slots: [
      { id: "default", label: "Default", region: "rightRail", order: 10, accepts: ["diagnostics", "assistant", "notifications", "activity", "insights", "tools"] },
    ],
  },
];

export const AS6_DEFAULT_PANELS = [
  {
    id: "workspace.panel.diagnostics",
    label: "Diagnostics",
    region: "rightRail",
    slot: "default",
    order: 10,
    capabilities: ["diagnostics"],
  },
];

export function createWorkspacePanelRuntime(options = {}) {
  const controller = createPanelController(options.regions || AS6_DEFAULT_PANEL_REGIONS, options.panels || AS6_DEFAULT_PANELS);
  let started = false;

  const start = () => {
    started = true;
    return controller.health();
  };

  const stop = () => {
    started = false;
    return { status: "STOPPED", stoppedAt: new Date().toISOString() };
  };

  const snapshot = () => ({
    started,
    tree: controller.resolve(),
    health: controller.health(),
    trace: controller.getTrace(),
  });

  return { controller, start, stop, snapshot };
}
