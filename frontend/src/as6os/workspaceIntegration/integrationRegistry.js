import { createIntegrationUnit } from "./integrationContract.js";

export function createIntegrationRegistry(initialUnits = []) {
  const units = new Map();
  const registerUnit = (unit) => {
    const normalized = createIntegrationUnit(unit);
    units.set(normalized.id, normalized);
    return normalized;
  };
  const listUnits = () => Array.from(units.values()).sort((a, b) => a.order - b.order);
  const getUnit = (id) => units.get(id) || null;
  initialUnits.forEach(registerUnit);
  return { registerUnit, listUnits, getUnit };
}
