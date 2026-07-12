import { getLivingSpaceDefinition } from "../framework/spaceRegistry.js";
import { getLivingSpaceBlueprint } from "./spaceBlueprints.js";

const REQUIRED_BLUEPRINT_FIELDS = [
  "id",
  "geometry",
  "context",
  "recommendation",
  "motion",
  "nodes",
  "connections",
  "lighting",
];

export function validateLivingSpaceBlueprint(blueprint) {
  for (const field of REQUIRED_BLUEPRINT_FIELDS) {
    if (!(field in blueprint)) {
      throw new Error(`AS6_LIVING_ENGINE_BLUEPRINT_FIELD_MISSING: ${field}`);
    }
  }

  if (!Array.isArray(blueprint.nodes) || blueprint.nodes.length === 0) {
    throw new Error("AS6_LIVING_ENGINE_BLUEPRINT_NODES_INVALID");
  }

  return true;
}

export function compileLivingState(spaceId, overrides = {}) {
  const definition = getLivingSpaceDefinition(spaceId);
  const blueprint = getLivingSpaceBlueprint(spaceId);
  validateLivingSpaceBlueprint(blueprint);

  if (definition.geometry !== blueprint.geometry) {
    throw new Error(`AS6_LIVING_ENGINE_GEOMETRY_DRIFT: ${spaceId}`);
  }

  return Object.freeze({
    definition,
    blueprint,
    runtime: Object.freeze({
      spaceId,
      geometry: blueprint.geometry,
      context: blueprint.context,
      recommendation: blueprint.recommendation,
      motion: blueprint.motion,
      lighting: blueprint.lighting,
      nodes: [...blueprint.nodes],
      connections: blueprint.connections,
      ...overrides,
    }),
  });
}

export default compileLivingState;
