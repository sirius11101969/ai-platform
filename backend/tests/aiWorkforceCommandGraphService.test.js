const assert = require('assert')
const { createCommandGraphService } = require('../src/services/aiWorkforce/commandGraphService')

function createDb({ columnsByTable = {}, rowsByTable = {} }) {
  const calls = []
  return {
    calls,
    query: async (sql, params) => {
      calls.push({ sql, params })
      if (sql.includes('information_schema.columns')) {
        const table = params[0]
        const column = params[1]
        const hasColumn = (columnsByTable[table] || []).includes(column)
        return { rows: hasColumn ? [{ exists: 1 }] : [] }
      }
      const tableMatch = sql.match(/FROM\s+([a-zA-Z0-9_]+)/)
      const table = tableMatch ? tableMatch[1] : null
      return { rows: rowsByTable[table] || [] }
    },
  }
}

async function run() {
  const columnsByTable = {
    crm_leads: ['id', 'status', 'updated_at', 'first_name', 'last_name', 'estimated_revenue', 'workspace_id'],
    ai_conversation_memory: ['id', 'workspace_id', 'payload', 'created_at'],
    ai_sdr_lead_states: ['id', 'workspace_id', 'crm_lead_id', 'lead_state', 'payload', 'created_at'],
    ai_next_best_actions: ['id', 'workspace_id', 'payload', 'created_at'],
    ai_approval_queue: ['id', 'workspace_id', 'originating_lead_id', 'approval_status', 'recommendation_type', 'updated_at', 'recommendation_payload'],
    ai_action_queue: ['id', 'workspace_id', 'status', 'action_type', 'payload', 'updated_at'],
    ai_workforce_tasks: ['id', 'workspace_id', 'task_type', 'status', 'payload', 'created_at', 'updated_at'],
    ai_workforce_assignments: ['id', 'workspace_id', 'task_id', 'agent_id', 'status', 'created_at'],
    ai_workforce_execution_plans: ['id', 'workspace_id', 'task_id', 'status', 'plan', 'updated_at'],
    ai_workforce_events: ['id', 'workspace_id', 'event_type', 'execution_plan_id', 'severity', 'payload', 'published_at'],
    ai_workforce_realtime_metrics: ['id', 'workspace_id', 'metrics', 'computed_at'],
  }

  const rowsByTable = {
    crm_leads: [{ id: 'lead-1', status: 'open', first_name: 'A', last_name: 'B', estimated_revenue: 1000, updated_at: '2026-01-01' }],
    ai_sdr_lead_states: [{ id: 'sdr-1', crm_lead_id: 'lead-1', lead_state: 'blocked', payload: null, created_at: '2026-01-01' }],
    ai_approval_queue: [{ id: 'app-1', originating_lead_id: 'lead-1', approval_status: 'pending_approval', recommendation_type: 'email', recommendation_payload: null, updated_at: '2026-01-01' }],
    ai_action_queue: [{ id: 'app-1', status: 'pending', action_type: 'followup', payload: { priority: 'normal' }, updated_at: '2026-01-01' }],
    ai_workforce_tasks: [{ id: 'task-1', task_type: 'followup', status: 'queued', payload: { crm_lead_id: 'lead-1' }, updated_at: '2026-01-01' }],
    ai_workforce_assignments: [{ id: 'as-1', task_id: 'task-1', agent_id: 'ag-1', status: 'assigned', created_at: '2026-01-01' }],
    ai_workforce_execution_plans: [{ id: 'plan-1', task_id: 'task-1', status: 'running', plan: null, updated_at: '2026-01-01' }],
    ai_workforce_events: [{ id: 'ev-1', event_type: 'workforce_bottleneck_detected', execution_plan_id: 'plan-1', severity: 'warn', payload: null, published_at: '2026-01-01' }],
    ai_workforce_realtime_metrics: [{ id: 'met-1', metrics: null, computed_at: '2026-01-01' }],
  }

  const db = createDb({ columnsByTable, rowsByTable })
  const service = createCommandGraphService({ db })

  const out = await service.buildGraph({ workspaceId: 'ws1', leadId: 'lead-1' })
  const leadNode = out.nodes.find((n) => n.type === 'lead')
  assert.ok(leadNode)
  assert.equal(leadNode.priority, 'high', 'lead priority should derive from blocked sdr state when no explicit priority column exists')
  assert.ok(out.nodes.some((n) => n.type === 'metric'))
  assert.ok(out.edges.some((e) => e.type === 'lead_to_sales_brain'))
  assert.ok(out.edges.some((e) => e.type === 'metric_to_bottleneck'))
  assert.ok(out.edges.some((e) => e.type === 'workspace_to_task'), 'tables without lead relation should still be linked to workspace')
  assert.ok(out.edges.some((e) => e.type === 'lead_to_task'), 'lead relationship should be extracted from payload fallback')

  const actionSql = db.calls.find((c) => c.sql.includes('FROM ai_action_queue')).sql
  assert.equal(actionSql.includes('priority'), false, 'query must not reference optional priority column')

  // sparse schema should not crash and should still build graph
  const sparseDb = createDb({
    columnsByTable: {
      crm_leads: ['id', 'workspace_id'],
      ai_approval_queue: ['id', 'workspace_id'],
      ai_action_queue: ['id', 'workspace_id'],
      ai_workforce_tasks: ['id', 'workspace_id'],
      ai_workforce_assignments: ['id', 'workspace_id'],
      ai_workforce_execution_plans: ['id', 'workspace_id'],
      ai_workforce_events: ['id', 'workspace_id'],
      ai_workforce_realtime_metrics: ['id', 'workspace_id'],
      ai_sdr_lead_states: ['id', 'workspace_id'],
      ai_next_best_actions: ['id', 'workspace_id'],
      ai_conversation_memory: ['id', 'workspace_id'],
    },
    rowsByTable: {
      crm_leads: [{ id: 'lead-sparse' }],
      ai_approval_queue: [{ id: 'approval-sparse' }],
      ai_action_queue: [{ id: 'approval-sparse' }],
      ai_workforce_tasks: [{ id: 'task-sparse' }],
    },
  })
  const sparseService = createCommandGraphService({ db: sparseDb })
  const sparse = await sparseService.buildGraph({ workspaceId: 'ws1' })
  assert.ok(Array.isArray(sparse.nodes))
  assert.ok(Array.isArray(sparse.edges))
  assert.ok(sparse.nodes.some((n) => n.id === 'workspace:ws1'))
  assert.ok(sparse.edges.some((e) => e.type === 'approval_to_execution'), 'synthetic pipeline edges should exist even with sparse schemas')

  // missing lead_id regressions: ensure lead filter is not applied when unsupported
  const approvalSql = db.calls.find((c) => c.sql.includes('FROM ai_approval_queue')).sql
  assert.equal(/\blead_id\s*=/.test(approvalSql), false)

  console.log('aiWorkforceCommandGraphService.test.js passed')
}

run().catch((error) => { console.error(error); process.exit(1) })
