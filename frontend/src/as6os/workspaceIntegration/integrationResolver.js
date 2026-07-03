export function resolveWorkspaceIntegration(registry) {
  const units = registry.listUnits();
  const byLayer = units.reduce((acc, unit) => {
    acc[unit.layer] = acc[unit.layer] || [];
    acc[unit.layer].push(unit);
    return acc;
  }, {});
  return { units, byLayer };
}

export function resolveIntegrationHealth(registry) {
  const units = registry.listUnits();
  const required = ["foundation", "layout", "navigation", "panels", "commands", "assistant"];
  const available = new Set(units.map((unit) => unit.layer));
  return {
    units: units.length,
    requiredLayers: required.length,
    missingLayers: required.filter((layer) => !available.has(layer)),
    duplicateUnits: new Set(units.map((unit) => unit.id)).size !== units.length,
  };
}
