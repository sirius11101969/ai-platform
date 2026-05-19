const assert = require('assert')
const { createWorkforceAuditLogger } = require('../src/services/aiWorkforce/workforceAuditLogger')

async function main() {
  const items = []
  const logger = createWorkforceAuditLogger({ persist: async (event) => items.push(event) })
  await logger.log('ai_worker_collaboration_started', { taskId: 't1' })
  assert.strictEqual(items.length, 1)
  console.log('aiWorkforceCollaborationPersistence tests passed')
}
main().catch((e) => { console.error(e); process.exit(1) })
