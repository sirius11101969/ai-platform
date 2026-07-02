import { sortAS6ExecutiveScenariosByPriority } from './as6ExecutiveScenarioPriorities.js';
import { validateExecutiveScenarioDependencies } from './as6ExecutiveScenarioDependencies.js';
import { getExecutiveAutomationPolicyExplanation } from './as6ExecutiveAutomationPolicyExplanations.js';

export const executiveOrchestratorFallback = {
  status: 'fallback',
  scenarioId: null,
  reason: 'No scenario can be selected because all candidates are waiting, blocked or not allowed by governance.',
  safeNextStep: 'Show wait/block reasons and ask the user to resolve dependencies or review governance policy before execution.'
};

export function selectNextExecutiveScenario({
  scenarios = [],
  completedScenarioIds = []
} = {}) {
  const prioritized = sortAS6ExecutiveScenariosByPriority(scenarios);
  const dependencyRows = validateExecutiveScenarioDependencies(completedScenarioIds);
  const dependencyById = new Map(dependencyRows.map((item) => [item.scenarioId, item]));
  const evaluated = prioritized.map((scenario) => {
    const dependency = dependencyById.get(scenario.scenarioId) || { canRun: true, dependencyStatus: 'ready', missingDependencies: [], waitReason: 'No dependency rule found. Runtime treats scenario as ready for governance evaluation.' };
    const governance = getExecutiveAutomationPolicyExplanation(scenario.actionId || scenario.scenarioId);
    const governanceAllowed = governance && governance.status === 'allowed';
    const canSelect = Boolean(dependency.canRun && governanceAllowed);
    return {
      ...scenario,
      dependencyStatus: dependency.dependencyStatus,
      missingDependencies: dependency.missingDependencies || [],
      governanceStatus: governanceAllowed ? 'allowed' : 'blocked',
      governanceReason: governance ? governance.reason : 'No governance explanation found.',
      canSelect,
      selectionReason: canSelect
        ? 'Selected because priority is highest among ready scenarios, dependencies are complete and governance allows execution.'
        : dependency.canRun
          ? 'Scenario passed dependencies but is blocked by governance: ' + (governance ? governance.reason : 'No governance reason available.')
          : dependency.waitReason
    };
  });
  const selected = evaluated.find((item) => item.canSelect) || null;
  return {
    status: selected ? 'selected' : 'fallback',
    selectedScenario: selected,
    evaluatedScenarios: evaluated,
    fallback: selected ? null : executiveOrchestratorFallback
  };
}
