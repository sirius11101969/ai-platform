const assert = require('assert')
const { createWorkforceCoordinator } = require('../src/services/aiWorkforce/workforceCoordinator')

const coordinator = createWorkforceCoordinator({})
const result = coordinator.coordinate({ task: { id: 't2', workspaceId: 'w1', taskType: 'crm_hygiene' }, agents: [{ id: 'a1', type: 'revops_worker', workload: 0 }] })
assert.strictEqual(result.executionPlan.noAutonomousExecutionChains, true)
console.log('aiWorkforceWorkspaceIsolation tests passed')
