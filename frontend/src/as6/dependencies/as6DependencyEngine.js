import {
  getAS6ServiceDependencyGraph,
  getAS6ServiceDependencies,
  getAS6ServiceDependents,
  resolveAS6ServiceDependencyNode,
  validateAS6ServiceDependencyGraphPolicy,
} from "./as6ServiceDependencyGraph";

export function getAS6DependencyEngineState() {
  return {
    graph: getAS6ServiceDependencyGraph(),
    validation: validateAS6ServiceDependencyGraphPolicy(),
  };
}

export function getAS6DependencyChain(serviceId, visited = new Set()) {
  if (!serviceId || visited.has(serviceId)) {
    return [];
  }

  visited.add(serviceId);

  const directDependencies = getAS6ServiceDependencies(serviceId);

  return directDependencies.flatMap((dependency) => [
    dependency,
    ...getAS6DependencyChain(dependency, visited),
  ]);
}

export function getAS6ImpactMap(serviceId) {
  return {
    serviceId,
    dependencies: getAS6ServiceDependencies(serviceId),
    deepDependencies: [...new Set(getAS6DependencyChain(serviceId))],
    dependents: getAS6ServiceDependents(serviceId),
    node: resolveAS6ServiceDependencyNode(serviceId),
  };
}

export function validateAS6DependencyEnginePolicy() {
  const graphValidation = validateAS6ServiceDependencyGraphPolicy();
  const failures = [...graphValidation.failures];

  if (typeof getAS6ImpactMap !== "function") failures.push("impact_map_missing");
  if (typeof getAS6DependencyChain !== "function") failures.push("dependency_chain_missing");

  return {
    ok: failures.length === 0,
    failures,
    graphNodeCount: graphValidation.nodeCount,
  };
}
