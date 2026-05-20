const assert = require('assert')
const { createCommandGraphService } = require('../src/services/aiWorkforce/commandGraphService')

async function run() {
  const calls = []
  const db = {
    query: async (sql, params) => {
      calls.push({ sql, params })
      if (sql.includes('FROM crm_leads')) return { rows: [{ id: 'lead-1', status: 'open', priority: 'high', first_name: 'A', last_name: 'B', estimated_revenue: 1000, updated_at: '2026-01-01' }] }
      if (sql.includes('FROM ai_approval_queue')) return { rows: [{ id: 'app-1', lead_id: 'lead-1', approval_status: 'pending_approval', urgency: 'high', recommendation_type: 'email', recommendation_payload: { summary: 'approve' }, updated_at: '2026-01-01' }] }
      if (sql.includes('FROM ai_action_queue')) return { rows: [{ id: 'app-1', lead_id: 'lead-1', status: 'pending', action_type: 'followup', payload: { channel: 'email' }, updated_at: '2026-01-01' }] }
      if (sql.includes('FROM ai_workforce_tasks')) return { rows: [{ id: 'task-1', task_type: 'followup', status: 'queued', payload: {}, updated_at: '2026-01-01' }] }
      if (sql.includes('FROM ai_workforce_assignments')) return { rows: [{ id: 'as-1', task_id: 'task-1', agent_id: 'ag-1', status: 'assigned', created_at: '2026-01-01' }] }
      if (sql.includes('FROM ai_workforce_execution_plans')) return { rows: [{ id: 'plan-1', task_id: 'task-1', status: 'running', plan: {}, updated_at: '2026-01-01' }] }
      if (sql.includes('FROM ai_workforce_events')) return { rows: [{ id: 'ev-1', event_type: 'workforce_bottleneck_detected', execution_plan_id: 'plan-1', severity: 'warn', payload: { reason: 'delay' }, published_at: '2026-01-01' }] }
      if (sql.includes('FROM ai_workforce_realtime_metrics')) return { rows: [{ id: 'met-1', metrics: { throughput24h: 5 }, computed_at: '2026-01-01' }] }
      return { rows: [] }
    },
  }
  const service = createCommandGraphService({ db })
  const out = await service.buildGraph({ workspaceId: 'ws1', leadId: 'lead-1' })
  assert.ok(out.nodes.some((n) => n.type === 'lead'))
  assert.ok(out.nodes.some((n) => n.type === 'metric'))
  assert.ok(out.edges.some((e) => e.type === 'lead_to_sales_brain'))
  assert.ok(out.edges.some((e) => e.type === 'metric_to_bottleneck'))
  assert.ok(calls.some((c) => c.params.includes('ws1')))
  assert.ok(calls.some((c) => c.params.includes('lead-1')))
  console.log('aiWorkforceCommandGraphService.test.js passed')
}

run().catch((error) => { console.error(error); process.exit(1) })
