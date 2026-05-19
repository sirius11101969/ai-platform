const assert = require('assert')
const { EventEmitter } = require('events')
const { createWorkforceCoordinator } = require('../src/services/aiWorkforce/workforceCoordinator')
const { createDefaultAgentRegistry } = require('../src/services/aiWorkforce/workforceAgentRegistry')

async function main() {
  const bus = new EventEmitter()
  const events = []
  bus.on('worker_assigned', (e) => events.push(e))
  const coordinator = createWorkforceCoordinator({ eventBus: bus, auditLogger: { log: async () => {} } })
  const result = coordinator.coordinate({ task: { id: 't1', taskType: 'lead_qualification', steps: [] }, agents: createDefaultAgentRegistry() })
  assert.strictEqual(result.assignment.status, 'assigned')
  assert.strictEqual(events.length, 1)
  console.log('aiWorkforceCoordinator tests passed')
}
main().catch((e) => { console.error(e); process.exit(1) })
