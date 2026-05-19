const assert = require('assert')
const { routeTask } = require('../src/services/aiWorkforce/workforceTaskRouter')

const route = routeTask({ taskType: 'technical_objection_support' })
assert.strictEqual(route.candidateTypes[0], 'technical_consultant_worker')
assert.strictEqual(route.autonomousOutreachAllowed, false)
console.log('aiWorkforceTaskRouting tests passed')
