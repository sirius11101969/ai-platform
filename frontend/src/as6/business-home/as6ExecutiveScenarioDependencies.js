export const executiveScenarioDependencies = [
  {
    scenarioId: 'executive.summary.refresh',
    dependsOn: [],
    dependencyStatus: 'ready',
    waitReason: 'No dependencies. Scenario can be evaluated by priority and governance immediately.'
  },
  {
    scenarioId: 'executive.automation.launchApproved',
    dependsOn: ['executive.summary.refresh'],
    dependencyStatus: 'waiting',
    waitReason: 'Waiting for executive.summary.refresh to complete before launching approved automation.'
  },
  {
    scenarioId: 'executive.unsafe.chain',
    dependsOn: ['executive.automation.launchApproved'],
    dependencyStatus: 'blocked',
    waitReason: 'Dependency chain reaches a governance-blocked scenario. Execution must wait for safe review.'
  }
];

export function getExecutiveScenarioDependency(scenarioId) {
  return executiveScenarioDependencies.find((item) => item.scenarioId === scenarioId) || null;
}

export function hasExecutiveScenarioDependencyCycle(items = executiveScenarioDependencies) {
  const graph = new Map(items.map((item) => [item.scenarioId, item.dependsOn || []]));
  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    const deps = graph.get(id) || [];
    for (const dep of deps) {
      if (visit(dep)) return true;
    }
    visiting.delete(id);
    visited.add(id);
    return false;
  }
  for (const id of graph.keys()) {
    if (visit(id)) return true;
  }
  return false;
}

export function validateExecutiveScenarioDependencies(completedScenarioIds = [], items = executiveScenarioDependencies) {
  const completed = new Set(completedScenarioIds);
  const hasCycle = hasExecutiveScenarioDependencyCycle(items);
  return items.map((item) => {
    const missingDependencies = (item.dependsOn || []).filter((dependencyId) => !completed.has(dependencyId));
    const canRun = !hasCycle && missingDependencies.length === 0;
    return {
      ...item,
      canRun,
      missingDependencies,
      dependencyStatus: hasCycle ? 'blocked' : canRun ? 'ready' : 'waiting',
      waitReason: hasCycle
        ? 'Dependency cycle detected. Scenario launch is blocked until the cycle is removed.'
        : canRun
          ? 'All dependencies are complete. Scenario can continue to governance evaluation.'
          : 'Waiting for dependencies: ' + missingDependencies.join(', ')
    };
  });
}
