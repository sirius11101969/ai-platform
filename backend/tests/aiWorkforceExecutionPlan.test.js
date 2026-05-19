const assert = require('assert')
const { createExecutionPlan } = require('../src/services/aiWorkforce/workforceExecutionPlanner')

const plan = createExecutionPlan({ task: { id: 't1', steps: [{ name: 'one' }] }, assignment: { agentId: 'a1' }, approvalRequired: true })
assert.strictEqual(plan.status, 'waiting_approval')
assert.strictEqual(plan.steps[0].mode, 'sequential')
console.log('aiWorkforceExecutionPlan tests passed')
