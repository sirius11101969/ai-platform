const assert = require('assert')
const { createCommandGraphService } = require('../src/services/aiWorkforce/commandGraphService')

async function run() {
  const calls = []
  const db = {
    query: async (sql, params) => {
      calls.push({ sql, params })
      if (sql.includes('FROM crm_leads')) return { rows: [{ id: 'lead-1', status: 'open', first_name: 'A', last_name: 'B', estimated_revenue: 1000, updated_at: '2026-01-01' }] }
      if (sql.includes('FROM ai_sdr_lead_states')) return { rows: [{ id: 'sdr-1', lead_id: 'lead-1', lead_state: 'blocked', payload: null, created_at: '2026-01-01' }] }
      if (sql.includes('FROM ai_approval_queue')) return { rows: [{ id: 'app-1', lead_id: 'lead-1', approval_status: 'pending_approval', urgency: null, recommendation_type: 'email', recommendation_payload: null, updated_at: '2026-01-01' }] }
      if (sql.includes('FROM ai_action_queue')) return { rows: [{ id: 'app-1', lead_id: 'lead-1', status: 'pending', action_type: 'followup', payload: null, updated_at: '2026-01-01' }] }
      if (sql.includes('FROM ai_workforce_tasks')) return { rows: [{ id: 'task-1', task_type: 'followup', status: 'queued', payload: null, updated_at: '2026-01-01' }] }
      if (sql.includes('FROM ai_workforce_assignments')) return { rows: [{ id: 'as-1', task_id: 'task-1', agent_id: 'ag-1', status: 'assigned', created_at: '2026-01-01' }] }
      if (sql.includes('FROM ai_workforce_execution_plans')) return { rows: [{ id: 'plan-1', task_id: 'task-1', status: 'running', plan: null, updated_at: '2026-01-01' }] }
      if (sql.includes('FROM ai_workforce_events')) return { rows: [{ id: 'ev-1', event_type: 'workforce_bottleneck_detected', execution_plan_id: 'plan-1', severity: 'warn', payload: null, published_at: '2026-01-01' }] }
      if (sql.includes('FROM ai_workforce_realtime_metrics')) return { rows: [{ id: 'met-1', metrics: null, computed_at: '2026-01-01' }] }
      return { rows: [] }
    },
  }
  const service = createCommandGraphService({ db })
  const out = await service.buildGraph({ workspaceId: 'ws1', leadId: 'lead-1' })

  const leadNode = out.nodes.find((n) => n.type === 'lead')
  assert.ok(leadNode)
  assert.equal(leadNode.priority, 'high', 'lead priority should derive from blocked sdr state when no explicit priority column exists')
  assert.ok(out.nodes.some((n) => n.type === 'metric'))
  assert.ok(out.edges.some((e) => e.type === 'lead_to_sales_brain'))
  assert.ok(out.edges.some((e) => e.type === 'metric_to_bottleneck'))
  assert.ok(calls.some((c) => c.params.includes('ws1')))
  assert.ok(calls.some((c) => c.params.includes('lead-1')))

  const leadSql = calls.find((c) => c.sql.includes('FROM crm_leads')).sql
  assert.equal(leadSql.includes('l.priority'), false, 'crm_leads query must not reference l.priority')

  // Sparse schema / missing optional values must still generate a non-empty graph.
  const sparse = await service.buildGraph({ workspaceId: 'ws1' })
  assert.ok(Array.isArray(sparse.nodes))
  assert.ok(Array.isArray(sparse.edges))
  assert.ok(sparse.nodes.length > 0)
  assert.ok(sparse.edges.some((edge) => edge.type === 'approval_to_execution'), 'path generation from approval -> execution must be present')

  console.log('aiWorkforceCommandGraphService.test.js passed')
}

run().catch((error) => { console.error(error); process.exit(1) })
