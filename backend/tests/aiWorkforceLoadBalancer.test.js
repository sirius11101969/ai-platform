const assert = require('assert')
const { pickLeastLoadedAgent } = require('../src/services/aiWorkforce/workforceLoadBalancer')

const agent = pickLeastLoadedAgent([{ id: 'a', type: 'sdr_worker', workload: 2 }, { id: 'b', type: 'sdr_worker', workload: 1 }], ['sdr_worker'])
assert.strictEqual(agent.id, 'b')
console.log('aiWorkforceLoadBalancer tests passed')
