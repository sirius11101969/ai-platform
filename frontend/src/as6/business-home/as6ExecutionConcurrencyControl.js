export const executiveConcurrencyLocks = [
  {
    lockId: 'executive-finance-write-lock',
    ownerScenarioId: 'executive.automation.launchApproved',
    status: 'active',
    conflictsWith: ['executive.unsafe.chain'],
    reason: 'Automation launch owns a runtime lock because it may trigger a state-changing execution path.'
  },
  {
    lockId: 'executive-readonly-lock',
    ownerScenarioId: 'executive.summary.refresh',
    status: 'shared',
    conflictsWith: [],
    reason: 'Read-only summary refresh can run safely with non-mutating scenarios.'
  }
];

export function getExecutiveScenarioConcurrencyDecision(scenario = {}, locks = executiveConcurrencyLocks) {
  const scenarioId = scenario.scenarioId || scenario.actionId;
  const conflicts = locks.filter((lock) => lock.status === 'active' && (lock.conflictsWith || []).includes(scenarioId));
  const canRun = conflicts.length === 0;
  return {
    scenarioId,
    canRun,
    status: canRun ? 'ready' : 'blocked',
    conflicts,
    conflictReason: canRun
      ? 'No active runtime lock conflicts with this scenario.'
      : 'Scenario is blocked by active runtime lock: ' + conflicts.map((lock) => lock.lockId).join(', '),
    waitDecision: canRun
      ? 'Run now after orchestrator selection.'
      : 'Wait until conflicting runtime lock is released or show fallback to the user.',
    fallback: canRun
      ? 'No fallback required.'
      : 'Do not start the conflicting scenario. Show conflict explanation and safe wait decision.'
  };
}

export function evaluateExecutiveConcurrency(scenarios = [], locks = executiveConcurrencyLocks) {
  return scenarios.map((scenario) => getExecutiveScenarioConcurrencyDecision(scenario, locks));
}
