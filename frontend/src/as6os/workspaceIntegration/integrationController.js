import { createIntegrationRegistry } from "./integrationRegistry.js";
import { resolveWorkspaceIntegration } from "./integrationResolver.js";
import { createIntegrationHealthSnapshot } from "./integrationHealthSnapshot.js";
import { traceAS6WorkspaceIntegration } from "./integrationTracer.js";

export function createIntegrationController(initialUnits = []) {
  const registry = createIntegrationRegistry(initialUnits);
  const events = [];
  const trace = (event, payload) => {
    const record = traceAS6WorkspaceIntegration(event, payload);
    events.push(record);
    return record;
  };
  const registerUnit = (unit) => {
    const result = registry.registerUnit(unit);
    trace("integration.unit.registered", { id: result.id, layer: result.layer });
    return result;
  };
  const resolve = () => resolveWorkspaceIntegration(registry);
  const health = () => createIntegrationHealthSnapshot(registry);
  const getTrace = () => [...events];
  trace("integration.controller.initialized", { units: registry.listUnits().length });
  return { registry, registerUnit, resolve, health, getTrace };
}
