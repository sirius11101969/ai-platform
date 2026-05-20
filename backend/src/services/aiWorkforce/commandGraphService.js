function createCommandGraphService({ db }) {
  const columnCache = new Map()

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
    if (!node || !node.id) return
    if (!nodes.some((item) => item.id === node.id)) nodes.push(node)
  }

  function pushEdge(edges, edge) {
    if (!edge || !edge.id || !edge.from || !edge.to) return
    if (!edges.some((item) => item.id === edge.id)) edges.push(edge)
  }

  function safeObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  }

  function derivePriority({ lead = null, sdrState = null, approval = null, execution = null, task = null, event = null } = {}) {
    if (approval?.urgency) return approval.urgency
    if (event?.event_type === 'workforce_bottleneck_detected') return 'high'
    if (event?.severity && ['critical', 'error', 'high'].includes(String(event.severity).toLowerCase())) return 'high'
    if (sdrState?.lead_state && ['blocked', 'at_risk', 'hot'].includes(String(sdrState.lead_state).toLowerCase())) return 'high'
    if (execution?.status && ['blocked', 'failed', 'error'].includes(String(execution.status).toLowerCase())) return 'high'
    if (task?.status && ['blocked', 'stalled'].includes(String(task.status).toLowerCase())) return 'high'
    if (lead?.status && ['blocked', 'at_risk'].includes(String(lead.status).toLowerCase())) return 'high'
    return 'normal'
  }

  async function safeColumnExists(table, column) {
    const cacheKey = `${table}.${column}`
    if (columnCache.has(cacheKey)) return columnCache.get(cacheKey)
    try {
      const result = await db.query(
        `SELECT 1
         FROM information_schema.columns
         WHERE table_schema = current_schema()
           AND table_name = $1
           AND column_name = $2
         LIMIT 1`,
        [table, column],
      )
      const exists = Boolean(result?.rows?.length)
      columnCache.set(cacheKey, exists)
      return exists
    } catch (error) {
      columnCache.set(cacheKey, false)
      return false
    }
  }

  function extractLeadReference(row) {
    if (!row || typeof row !== 'object') return null
    for (const key of ['lead_id', 'crm_lead_id', 'originating_lead_id']) {
      if (row[key]) return row[key]
    }
    const payload = safeObject(row.payload)
    const metadata = safeObject(row.metadata)
    for (const bag of [payload, metadata]) {
      for (const key of ['lead_id', 'crm_lead_id', 'originating_lead_id']) {
        if (bag[key]) return bag[key]
      }
    }
    return null
  }

  async function queryTable(table, columns, { workspaceId, leadId = null, orderBy = 'id', limit = 120, supportsLeadFilter = false } = {}) {
    const availableColumns = []
    for (const column of columns) {
      // eslint-disable-next-line no-await-in-loop
      if (await safeColumnExists(table, column)) availableColumns.push(column)
    }
    if (!availableColumns.includes('id')) availableColumns.unshift('id')
    const selectColumns = availableColumns.length ? availableColumns.join(', ') : 'id'

    const whereClauses = ['workspace_id = $1']
    const params = [workspaceId]

    if (leadId && supportsLeadFilter) {
      const leadColumns = ['lead_id', 'crm_lead_id', 'originating_lead_id'].filter((c) => availableColumns.includes(c))
      if (leadColumns.length) {
        const orClause = leadColumns.map((c, i) => `${c} = $${i + 2}`).join(' OR ')
        whereClauses.push(`(${orClause})`)
        for (let i = 0; i < leadColumns.length; i += 1) params.push(leadId)
      }
    }

    const orderColumn = availableColumns.includes(orderBy) ? orderBy : 'id'
    const sql = `SELECT ${selectColumns} FROM ${table} WHERE ${whereClauses.join(' AND ')} ORDER BY ${orderColumn} DESC LIMIT ${limit}`

    try {
      const result = await db.query(sql, params)
      return { rows: result?.rows || [], availableColumns }
    } catch (error) {
      return { rows: [], availableColumns }
    }
  }

  async function buildGraph({ workspaceId, leadId = null }) {
    const [leads, memory, sdrStates, nextActions, approvals, executionQueue, tasks, assignments, plans, events, realtimeMetrics] = await Promise.all([
      queryTable('crm_leads', ['id', 'status', 'updated_at', 'first_name', 'last_name', 'estimated_revenue'], { workspaceId, leadId, orderBy: 'updated_at', limit: 50 }),
      queryTable('ai_conversation_memory', ['id', 'lead_id', 'crm_lead_id', 'originating_lead_id', 'signal_type', 'payload', 'metadata', 'created_at'], { workspaceId, leadId, supportsLeadFilter: true, orderBy: 'created_at' }),
      queryTable('ai_sdr_lead_states', ['id', 'lead_id', 'crm_lead_id', 'originating_lead_id', 'lead_state', 'payload', 'metadata', 'created_at'], { workspaceId, leadId, supportsLeadFilter: true, orderBy: 'created_at' }),
      queryTable('ai_next_best_actions', ['id', 'lead_id', 'crm_lead_id', 'originating_lead_id', 'actions', 'payload', 'metadata', 'created_at'], { workspaceId, leadId, supportsLeadFilter: true, orderBy: 'created_at' }),
      queryTable('ai_approval_queue', ['id', 'lead_id', 'crm_lead_id', 'originating_lead_id', 'approval_status', 'urgency', 'recommendation_type', 'recommendation_payload', 'payload', 'metadata', 'updated_at'], { workspaceId, leadId, supportsLeadFilter: true, orderBy: 'updated_at' }),
      queryTable('ai_action_queue', ['id', 'lead_id', 'crm_lead_id', 'originating_lead_id', 'status', 'action_type', 'payload', 'metadata', 'updated_at'], { workspaceId, leadId, supportsLeadFilter: true, orderBy: 'updated_at' }),
      queryTable('ai_workforce_tasks', ['id', 'task_type', 'status', 'payload', 'metadata', 'created_at', 'updated_at', 'lead_id', 'crm_lead_id', 'originating_lead_id'], { workspaceId, leadId, supportsLeadFilter: true, orderBy: 'updated_at' }),
      queryTable('ai_workforce_assignments', ['id', 'task_id', 'agent_id', 'status', 'payload', 'metadata', 'created_at'], { workspaceId, orderBy: 'created_at' }),
      queryTable('ai_workforce_execution_plans', ['id', 'task_id', 'assignment_id', 'status', 'plan', 'payload', 'metadata', 'updated_at'], { workspaceId, orderBy: 'updated_at' }),
      queryTable('ai_workforce_events', ['id', 'event_type', 'worker_id', 'execution_plan_id', 'severity', 'payload', 'metadata', 'published_at'], { workspaceId, orderBy: 'published_at' }),
      queryTable('ai_workforce_realtime_metrics', ['id', 'metrics', 'payload', 'metadata', 'computed_at'], { workspaceId, orderBy: 'computed_at', limit: 20 }),
    ])

    const nodes = []
    const edges = []
    pushNode(nodes, { id: `workspace:${workspaceId}`, type: 'workspace', label: `Workspace ${workspaceId}`, status: 'active', priority: 'normal', timestamp: null, payloadSummary: 'AI Control Gateway', sourceTable: 'workspace' })

    const firstSdrStateByLeadId = new Map()
    for (const row of sdrStates.rows || []) {
      const key = extractLeadReference(row)
      if (!key || firstSdrStateByLeadId.has(key)) continue
      firstSdrStateByLeadId.set(key, row)
    }
    const firstApprovalByLeadId = new Map()
    for (const row of approvals.rows || []) {
      const key = extractLeadReference(row)
      if (!key || firstApprovalByLeadId.has(key)) continue
      firstApprovalByLeadId.set(key, row)
    }

    for (const lead of leads.rows || []) {
      const sdrState = firstSdrStateByLeadId.get(lead.id)
      const approval = firstApprovalByLeadId.get(lead.id)
      const priority = derivePriority({ lead, sdrState, approval })
      pushNode(nodes, { id: `lead:${lead.id}`, type: 'lead', label: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || `Lead ${lead.id}`, status: lead.status || 'active', priority, timestamp: lead.updated_at || null, payloadSummary: `revenue:${lead.estimated_revenue || 0}`, sourceTable: 'crm_leads' })
      pushNode(nodes, { id: `sales_brain:${lead.id}`, type: 'sales_brain', label: 'AI Sales Brain', status: 'active', priority, timestamp: lead.updated_at || null, payloadSummary: 'conversation memory enriched', sourceTable: 'ai_conversation_memory' })
      pushNode(nodes, { id: `sdr_loop:${lead.id}`, type: 'sdr_loop', label: 'Autonomous SDR Loop', status: sdrState?.lead_state || 'active', priority, timestamp: sdrState?.created_at || lead.updated_at || null, payloadSummary: summarizePayload(safeObject(sdrState?.payload)), sourceTable: 'ai_sdr_lead_states' })
      pushEdge(edges, { id: `edge:workspace-lead:${lead.id}`, type: 'workspace_to_lead', from: `workspace:${workspaceId}`, to: `lead:${lead.id}` })
      pushEdge(edges, { id: `edge:lead-sales:${lead.id}`, type: 'lead_to_sales_brain', from: `lead:${lead.id}`, to: `sales_brain:${lead.id}` })
      pushEdge(edges, { id: `edge:sales-sdr:${lead.id}`, type: 'sales_brain_to_sdr', from: `sales_brain:${lead.id}`, to: `sdr_loop:${lead.id}` })
    }

    for (const row of approvals.rows || []) {
      pushNode(nodes, { id: `approval:${row.id}`, type: 'approval', label: row.recommendation_type || 'Approval Gate', status: row.approval_status || 'pending_approval', priority: derivePriority({ approval: row }), timestamp: row.updated_at || null, payloadSummary: summarizePayload(safeObject(row.recommendation_payload || row.payload)), sourceTable: 'ai_approval_queue' })
      const leadRef = extractLeadReference(row)
      pushEdge(edges, { id: `edge:workspace-approval:${row.id}`, type: 'workspace_to_approval', from: `workspace:${workspaceId}`, to: `approval:${row.id}` })
      if (leadRef) pushEdge(edges, { id: `edge:sdr-approval:${row.id}`, type: 'sdr_to_approval', from: `sdr_loop:${leadRef}`, to: `approval:${row.id}` })
    }
    for (const row of executionQueue.rows || []) {
      const payload = safeObject(row.payload)
      pushNode(nodes, { id: `execution:${row.id}`, type: 'execution', label: row.action_type || 'Execution Item', status: row.status || 'draft', priority: payload.priority || derivePriority({ execution: row }), timestamp: row.updated_at || null, payloadSummary: summarizePayload(payload), sourceTable: 'ai_action_queue' })
      pushEdge(edges, { id: `edge:workspace-execution:${row.id}`, type: 'workspace_to_execution', from: `workspace:${workspaceId}`, to: `execution:${row.id}` })
      pushEdge(edges, { id: `edge:approval-execution:${row.id}`, type: 'approval_to_execution', from: `approval:${row.id}`, to: `execution:${row.id}` })
    }
    for (const row of tasks.rows || []) {
      const payload = safeObject(row.payload)
      pushNode(nodes, { id: `task:${row.id}`, type: 'workforce_task', label: row.task_type || 'Workforce Task', status: row.status || 'queued', priority: payload.priority || derivePriority({ task: row }), timestamp: row.updated_at || row.created_at || null, payloadSummary: summarizePayload(payload), sourceTable: 'ai_workforce_tasks' })
      pushEdge(edges, { id: `edge:workspace-task:${row.id}`, type: 'workspace_to_task', from: `workspace:${workspaceId}`, to: `task:${row.id}` })
      pushEdge(edges, { id: `edge:execution-workforce:${row.id}`, type: 'execution_to_workforce', from: `execution:${row.id}`, to: `task:${row.id}` })
      const leadRef = extractLeadReference(row)
      if (leadRef) pushEdge(edges, { id: `edge:lead-task:${row.id}`, type: 'lead_to_task', from: `lead:${leadRef}`, to: `task:${row.id}` })
    }
    for (const row of assignments.rows || []) {
      if (!row.task_id || !row.agent_id) continue
      pushNode(nodes, { id: `agent:${row.agent_id}`, type: 'workforce_agent', label: `Agent ${row.agent_id}`, status: row.status || 'assigned', priority: 'normal', timestamp: row.created_at || null, payloadSummary: `assignment:${row.id}`, sourceTable: 'ai_workforce_assignments' })
      pushEdge(edges, { id: `edge:task-agent:${row.id}`, type: 'task_to_agent', from: `task:${row.task_id}`, to: `agent:${row.agent_id}` })
    }
    for (const row of plans.rows || []) {
      const plan = safeObject(row.plan || row.payload)
      pushNode(nodes, { id: `plan:${row.id}`, type: 'execution_plan', label: 'Execution Plan', status: row.status || 'queued', priority: plan.priority || 'normal', timestamp: row.updated_at || null, payloadSummary: summarizePayload(plan), sourceTable: 'ai_workforce_execution_plans' })
      if (row.task_id) pushEdge(edges, { id: `edge:task-plan:${row.id}`, type: 'task_to_plan', from: `task:${row.task_id}`, to: `plan:${row.id}` })
    }
    for (const row of events.rows || []) {
      const priority = derivePriority({ event: row })
      pushNode(nodes, { id: `event:${row.id}`, type: 'realtime_event', label: row.event_type || 'Workforce Event', status: row.severity || 'info', priority, timestamp: row.published_at || null, payloadSummary: summarizePayload(safeObject(row.payload)), sourceTable: 'ai_workforce_events' })
      pushEdge(edges, { id: `edge:workspace-event:${row.id}`, type: 'workspace_to_event', from: `workspace:${workspaceId}`, to: `event:${row.id}` })
      if (row.execution_plan_id) pushEdge(edges, { id: `edge:plan-event:${row.id}`, type: 'plan_to_event', from: `plan:${row.execution_plan_id}`, to: `event:${row.id}` })
      if (row.event_type === 'workforce_bottleneck_detected') pushNode(nodes, { id: `bottleneck:${row.id}`, type: 'bottleneck', label: 'Bottleneck', status: row.severity || 'warning', priority: 'high', timestamp: row.published_at || null, payloadSummary: summarizePayload(safeObject(row.payload)), sourceTable: 'ai_workforce_events' })
    }
    for (const row of realtimeMetrics.rows || []) {
      pushNode(nodes, { id: `metric:${row.id}`, type: 'metric', label: 'Realtime Metrics Snapshot', status: 'active', priority: 'normal', timestamp: row.computed_at || null, payloadSummary: summarizePayload(safeObject(row.metrics || row.payload)), sourceTable: 'ai_workforce_realtime_metrics' })
      pushEdge(edges, { id: `edge:workspace-metric:${row.id}`, type: 'workspace_to_metric', from: `workspace:${workspaceId}`, to: `metric:${row.id}` })
    }

    const bottleneckNodeIds = nodes.filter((n) => n.type === 'bottleneck').map((n) => n.id)
    const metricNodeIds = nodes.filter((n) => n.type === 'metric').map((n) => n.id)
    metricNodeIds.forEach((metricId, index) => {
      const bottleneckId = bottleneckNodeIds[index]
      if (bottleneckId) pushEdge(edges, { id: `edge:metric-bottleneck:${metricId}:${bottleneckId}`, type: 'metric_to_bottleneck', from: metricId, to: bottleneckId })
    })

    return { nodes, edges }
  }

  return { buildGraph, safeColumnExists }
}

module.exports = { createCommandGraphService }
