import { createIntegrationController } from "./integrationController.js";

export const AS6_DEFAULT_INTEGRATION_UNITS = [
  { id: "workspace.foundation", label: "Workspace Foundation", layer: "foundation", order: 10 },
  { id: "workspace.layout", label: "Workspace Layout", layer: "layout", order: 20 },
  { id: "workspace.navigation", label: "Workspace Navigation", layer: "navigation", order: 30 },
  { id: "workspace.panels", label: "Workspace Panels", layer: "panels", order: 40 },
  { id: "workspace.commands", label: "Command Palette", layer: "commands", order: 50 },
  { id: "workspace.assistant", label: "Assistant Surface", layer: "assistant", order: 60 },
];

export function createWorkspaceIntegrationRuntime(options = {}) {
  const controller = createIntegrationController(options.units || AS6_DEFAULT_INTEGRATION_UNITS);
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
    integration: controller.resolve(),
    health: controller.health(),
    trace: controller.getTrace(),
  });
  return { controller, start, stop, snapshot };
}
