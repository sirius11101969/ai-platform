const assert = require('assert')
const { createWorkforceRealtimeOperationsService } = require('../src/services/aiWorkforce/workforceRealtimeOperationsService')

async function run() {
  const calls = []
  const db = {
    query: async (sql) => {
      calls.push(sql)
      if (sql.includes('INSERT INTO ai_workforce_events')) return { rows: [{ id: 'e1' }] }
      if (sql.includes('SELECT event_type')) return { rows: [{ event_type: 'workforce_bottleneck_detected' }, { event_type: 'worker_activity_completed' }] }
      if (sql.includes('SELECT status FROM ai_workforce_assignments')) return { rows: [{ status: 'assigned' }] }
      if (sql.includes('SELECT id, agent_id')) return { rows: [] }
      if (sql.includes('SELECT COUNT(*)::int AS started')) return { rows: [{ started: 1, completed: 0 }] }
      return { rows: [] }
    },
  }
  const service = createWorkforceRealtimeOperationsService({ db })
  await service.publishWorkforceEvent({ workspaceId: 'w1', eventType: 'worker_activity_started', payload: { summary: 's' } })
  const metrics = await service.computeRealtimeMetrics('w1')
  assert.strictEqual(metrics.bottlenecksDetected, 1)
  assert.ok(calls.some((sql) => sql.includes('ai_workforce_activity_stream')))
}

run().then(() => console.log('workforceRealtimeOperationsService.test.js passed')).catch((e) => { console.error(e); process.exit(1) })
