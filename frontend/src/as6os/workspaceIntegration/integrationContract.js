export const AS6_WORKSPACE_INTEGRATION_CONTRACT = "AS6_WORKSPACE_INTEGRATION_CONTRACT";

export function createIntegrationUnit(unit = {}) {
  if (!unit.id || !unit.label || !unit.layer) {
    throw new Error("AS6_WORKSPACE_INTEGRATION_UNIT_INVALID");
  }
  return {
    id: String(unit.id),
    label: String(unit.label),
    layer: String(unit.layer),
    order: Number.isFinite(unit.order) ? unit.order : 100,
    status: unit.status ? String(unit.status) : "READY",
    capabilities: Array.isArray(unit.capabilities) ? unit.capabilities.map(String) : [],
    meta: unit.meta && typeof unit.meta === "object" ? unit.meta : {},
  };
}
