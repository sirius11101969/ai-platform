const freeze = (value) => Object.freeze(value);

export const livingSpaceBlueprints = freeze({
  focus: freeze({
    id: "focus",
    geometry: "sphere",
    context: "focus",
    recommendation: "focus",
    motion: "calm-standard",
    nodes: ["goal", "people", "finances", "documents", "projects", "ideas"],
    connections: "radial-focus",
    lighting: "master-screen",
  }),
  crm: freeze({
    id: "crm",
    geometry: "relationship-network",
    context: "crm",
    recommendation: "crm",
    motion: "calm-standard",
    nodes: ["clients", "contacts", "deals", "communications", "payments", "follow-up"],
    connections: "relationship-web",
    lighting: "master-screen",
  }),
  finance: freeze({
    id: "finance",
    geometry: "stability-crystal",
    context: "finance",
    recommendation: "finance",
    motion: "calm-standard",
    nodes: ["income", "expenses", "cash-flow", "forecast", "reserve", "risk"],
    connections: "stability-lattice",
    lighting: "master-screen",
  }),
  documents: freeze({
    id: "documents",
    geometry: "knowledge-sphere",
    context: "documents",
    recommendation: "documents",
    motion: "calm-standard",
    nodes: ["contracts", "invoices", "reports", "presentations", "letters", "knowledge"],
    connections: "knowledge-mesh",
    lighting: "master-screen",
  }),
});

export function getLivingSpaceBlueprint(spaceId) {
  const blueprint = livingSpaceBlueprints[spaceId];
  if (!blueprint) throw new Error(`AS6_LIVING_ENGINE_UNKNOWN_SPACE: ${spaceId}`);
  return blueprint;
}

export default livingSpaceBlueprints;
