function createCommandGraphService({ db }) {
  function summarizePayload(payload) {
    if (!payload || typeof payload !== 'object') return ''
    const parts = []
    for (const [key, value] of Object.entries(payload).slice(0, 4)) {
      if (value === null || value === undefined) continue
      if (typeof value === 'object') continue
      parts.push(`${key}:${String(value)}`)
    }
    return parts.join(' · ')
  }

  function pushNode(nodes, node) {
    if (!nodes.some((item) => item.id === node.id)) nodes.push(node)
  }

  async function buildGraph({ workspaceId, leadId = null }) {
    const params = leadId ? [workspaceId, leadId] : [workspaceId]
    const leadWhere = leadId ? 'AND l.id = $2' : ''

    const [leads, memory, sdrStates, nextActions, approvals, executionQueue, tasks, assignments, plans, events, realtimeMetrics] = await Promise.all([
      db.query(`SELECT l.id, l.status, l.priority, l.updated_at, l.first_name, l.last_name, l.estimated_revenue
        FROM crm_leads l WHERE l.workspace_id = $1 ${leadWhere} ORDER BY l.updated_at DESC LIMIT 50`, params),
      db.query(`SELECT id, lead_id, signal_type, payload, created_at FROM ai_conversation_memory WHERE workspace_id = $1 ${leadId ? 'AND lead_id = $2' : ''} ORDER BY created_at DESC LIMIT 120`, params),
      db.query(`SELECT id, lead_id, lead_state, payload, created_at FROM ai_sdr_lead_states WHERE workspace_id = $1 ${leadId ? 'AND lead_id = $2' : ''} ORDER BY created_at DESC LIMIT 120`, params),
      db.query(`SELECT id, lead_id, actions, payload, created_at FROM ai_next_best_actions WHERE workspace_id = $1 ${leadId ? 'AND lead_id = $2' : ''} ORDER BY created_at DESC LIMIT 120`, params),
      db.query(`SELECT id, lead_id, approval_status, urgency, recommendation_type, recommendation_payload, updated_at FROM ai_approval_queue WHERE workspace_id = $1 ${leadId ? 'AND lead_id = $2' : ''} ORDER BY updated_at DESC LIMIT 120`, params),
      db.query(`SELECT id, lead_id, status, action_type, payload, updated_at FROM ai_action_queue WHERE workspace_id = $1 ${leadId ? 'AND lead_id = $2' : ''} ORDER BY updated_at DESC LIMIT 120`, params),
      db.query(`SELECT id, task_type, status, payload, created_at, updated_at FROM ai_workforce_tasks WHERE workspace_id = $1 ORDER BY updated_at DESC LIMIT 120`, [workspaceId]),
      db.query(`SELECT id, task_id, agent_id, status, created_at FROM ai_workforce_assignments WHERE workspace_id = $1 ORDER BY created_at DESC LIMIT 120`, [workspaceId]),
      db.query(`SELECT id, task_id, assignment_id, status, plan, updated_at FROM ai_workforce_execution_plans WHERE workspace_id = $1 ORDER BY updated_at DESC LIMIT 120`, [workspaceId]),
      db.query(`SELECT id, event_type, worker_id, execution_plan_id, severity, payload, published_at FROM ai_workforce_events WHERE workspace_id = $1 ORDER BY published_at DESC LIMIT 120`, [workspaceId]),
      db.query(`SELECT id, metrics, computed_at FROM ai_workforce_realtime_metrics WHERE workspace_id = $1 ORDER BY computed_at DESC LIMIT 20`, [workspaceId]),
    ])

    const nodes = []
    const edges = []
    for (const lead of leads.rows) {
      pushNode(nodes, { id: `lead:${lead.id}`, type: 'lead', label: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || `Lead ${lead.id}`, status: lead.status || 'active', priority: lead.priority || 'medium', timestamp: lead.updated_at || null, payloadSummary: `revenue:${lead.estimated_revenue || 0}`, sourceTable: 'crm_leads' })
      pushNode(nodes, { id: `sales_brain:${lead.id}`, type: 'sales_brain', label: 'AI Sales Brain', status: 'active', priority: lead.priority || 'medium', timestamp: lead.updated_at || null, payloadSummary: 'conversation memory enriched', sourceTable: 'ai_conversation_memory' })
      pushNode(nodes, { id: `sdr_loop:${lead.id}`, type: 'sdr_loop', label: 'Autonomous SDR Loop', status: 'active', priority: lead.priority || 'medium', timestamp: lead.updated_at || null, payloadSummary: 'next best actions generated', sourceTable: 'ai_sdr_lead_states' })
      edges.push({ id: `edge:lead-sales:${lead.id}`, type: 'lead_to_sales_brain', from: `lead:${lead.id}`, to: `sales_brain:${lead.id}` })
      edges.push({ id: `edge:sales-sdr:${lead.id}`, type: 'sales_brain_to_sdr', from: `sales_brain:${lead.id}`, to: `sdr_loop:${lead.id}` })
    }

    for (const row of approvals.rows) {
      pushNode(nodes, { id: `approval:${row.id}`, type: 'approval', label: row.recommendation_type || 'Approval Gate', status: row.approval_status || 'pending_approval', priority: row.urgency || 'normal', timestamp: row.updated_at || null, payloadSummary: summarizePayload(row.recommendation_payload), sourceTable: 'ai_approval_queue' })
      if (row.lead_id) edges.push({ id: `edge:sdr-approval:${row.id}`, type: 'sdr_to_approval', from: `sdr_loop:${row.lead_id}`, to: `approval:${row.id}` })
    }
    for (const row of executionQueue.rows) {
      pushNode(nodes, { id: `execution:${row.id}`, type: 'execution', label: row.action_type || 'Execution Item', status: row.status || 'draft', priority: row.payload?.priority || 'normal', timestamp: row.updated_at || null, payloadSummary: summarizePayload(row.payload), sourceTable: 'ai_action_queue' })
      edges.push({ id: `edge:approval-execution:${row.id}`, type: 'approval_to_execution', from: `approval:${row.id}`, to: `execution:${row.id}` })
    }
    for (const row of tasks.rows) {
      pushNode(nodes, { id: `task:${row.id}`, type: 'workforce_task', label: row.task_type || 'Workforce Task', status: row.status || 'queued', priority: row.payload?.priority || 'normal', timestamp: row.updated_at || row.created_at || null, payloadSummary: summarizePayload(row.payload), sourceTable: 'ai_workforce_tasks' })
      edges.push({ id: `edge:execution-workforce:${row.id}`, type: 'execution_to_workforce', from: `execution:${row.id}`, to: `task:${row.id}` })
    }
    for (const row of assignments.rows) {
      pushNode(nodes, { id: `agent:${row.agent_id}`, type: 'workforce_agent', label: `Agent ${row.agent_id}`, status: row.status || 'assigned', priority: 'normal', timestamp: row.created_at || null, payloadSummary: `assignment:${row.id}`, sourceTable: 'ai_workforce_assignments' })
      edges.push({ id: `edge:task-agent:${row.id}`, type: 'task_to_agent', from: `task:${row.task_id}`, to: `agent:${row.agent_id}` })
    }
    for (const row of plans.rows) {
      pushNode(nodes, { id: `plan:${row.id}`, type: 'execution_plan', label: 'Execution Plan', status: row.status || 'queued', priority: row.plan?.priority || 'normal', timestamp: row.updated_at || null, payloadSummary: summarizePayload(row.plan), sourceTable: 'ai_workforce_execution_plans' })
      edges.push({ id: `edge:task-plan:${row.id}`, type: 'task_to_plan', from: `task:${row.task_id}`, to: `plan:${row.id}` })
    }
    for (const row of events.rows) {
      pushNode(nodes, { id: `event:${row.id}`, type: 'realtime_event', label: row.event_type || 'Workforce Event', status: row.severity || 'info', priority: row.severity || 'normal', timestamp: row.published_at || null, payloadSummary: summarizePayload(row.payload), sourceTable: 'ai_workforce_events' })
      if (row.execution_plan_id) edges.push({ id: `edge:plan-event:${row.id}`, type: 'plan_to_event', from: `plan:${row.execution_plan_id}`, to: `event:${row.id}` })
      if (row.event_type === 'workforce_bottleneck_detected') pushNode(nodes, { id: `bottleneck:${row.id}`, type: 'bottleneck', label: 'Bottleneck', status: row.severity || 'warning', priority: 'high', timestamp: row.published_at || null, payloadSummary: summarizePayload(row.payload), sourceTable: 'ai_workforce_events' })
    }
    for (const row of realtimeMetrics.rows) {
      pushNode(nodes, { id: `metric:${row.id}`, type: 'metric', label: 'Realtime Metrics Snapshot', status: 'active', priority: 'normal', timestamp: row.computed_at || null, payloadSummary: summarizePayload(row.metrics), sourceTable: 'ai_workforce_realtime_metrics' })
    }

    const bottleneckNodeIds = nodes.filter((n) => n.type === 'bottleneck').map((n) => n.id)
    const metricNodeIds = nodes.filter((n) => n.type === 'metric').map((n) => n.id)
    metricNodeIds.forEach((metricId, index) => {
      const bottleneckId = bottleneckNodeIds[index]
      if (bottleneckId) edges.push({ id: `edge:metric-bottleneck:${metricId}:${bottleneckId}`, type: 'metric_to_bottleneck', from: metricId, to: bottleneckId })
    })

    return { nodes, edges }
  }

  return { buildGraph }
}

module.exports = { createCommandGraphService }
