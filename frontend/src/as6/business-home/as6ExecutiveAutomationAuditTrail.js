export const executiveAutomationAuditTrail = [
  {
    scenarioId: 'executive.summary.refresh',
    executionId: 'runtime-demo-001',
    startedAt: 'runtime',
    endedAt: 'runtime',
    duration: 'runtime-only',
    finalStatus: 'Success',
    stopReason: 'No stop reason. Governance allowed the scenario.',
    fallbackUsed: 'None',
    governanceExplanation: 'ActionId is known and does not mutate persistent storage.',
    steps: [
      { order: 1, actionId: 'executive.summary.refresh', label: 'Policy check', status: 'Success', detail: 'Governance policy passed.' },
      { order: 2, actionId: 'executive.summary.refresh', label: 'Pipeline execution', status: 'Success', detail: 'Scenario executed through approved pipeline.' },
      { order: 3, actionId: 'executive.summary.refresh', label: 'Monitoring check', status: 'Success', detail: 'Execution finished without recovery.' }
    ]
  },
  {
    scenarioId: 'executive.unsafe.chain',
    executionId: 'runtime-demo-002',
    startedAt: 'runtime',
    endedAt: 'runtime',
    duration: 'runtime-only',
    finalStatus: 'Blocked',
    stopReason: 'Unsafe action chain was detected before execution.',
    fallbackUsed: 'Manual review recommended before scenario launch.',
    governanceExplanation: 'Scenario blocked because a chain step can mutate state without enough governance evidence.',
    steps: [
      { order: 1, actionId: 'executive.unsafe.chain', label: 'Policy check', status: 'Blocked', detail: 'Unsafe chain detected.' },
      { order: 2, actionId: 'executive.unsafe.chain', label: 'Execution', status: 'Cancelled', detail: 'Execution was not started.' },
      { order: 3, actionId: 'executive.unsafe.chain', label: 'Fallback', status: 'Success', detail: 'Safe fallback was shown to the user.' }
    ]
  }
];
