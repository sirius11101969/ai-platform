import { resolveIntegrationHealth } from "./integrationResolver.js";

export function createIntegrationHealthSnapshot(registry) {
  const health = resolveIntegrationHealth(registry);
  return {
    status: health.missingLayers.length === 0 && !health.duplicateUnits ? "OK" : "WARN",
    ...health,
    checkedAt: new Date().toISOString(),
  };
}
