const pool = require('../db/pool')
const { getOverview: getExecutiveOverview } = require('./aiExecutiveUnifiedDashboardService')
const { getSystemHealth } = require('./aiSystemHealthService')

const ALLOWED_ACTION_TYPES = new Set([
  'strategic_planning_review',
  'revenue_review',
  'workforce_review',
  'coordination_review',
  'memory_review',
])

const GOVERNANCE_GUARDRAILS = {
  humanApprovalRequired: true,
  noAutonomousExecution: true,
  noCustomerActions: true,
  noPricingChanges: true,
}

function buildReviewer(reqCtx = {}) {
  return reqCtx.userId || reqCtx.actorId || 'unknown'
}

async function createAuditEvent({ workspaceId, actionId, eventType, payload }) {
  await pool.query(
    `INSERT INTO ai_command_center_action_audit_log(workspace_id, action_id, event_type, event_payload)
     VALUES($1::uuid, $2::uuid, $3, $4::jsonb)`,
    [workspaceId, actionId, eventType, JSON.stringify(payload || {})]
  )
}

async function getOverview({ workspaceId }) {
  const [executive, healthCenter] = await Promise.all([
    getExecutiveOverview({ workspaceId }),
    getSystemHealth({ workspaceId })
  ])

  const generatedAt = new Date().toISOString()
  const health = {
    READY: healthCenter?.summary?.readyCount || 0,
    DEGRADED: healthCenter?.summary?.degradedCount || 0,
    MISSING: healthCenter?.summary?.missingCount || 0,
  }

  const executiveFeed = {
    recentDecisions: (executive?.strategy?.latestPlan?.decisions || []).slice(0, 5),
    escalations: executive?.approvals?.openExecutiveEscalations || 0,
    bottlenecks: executive?.cards?.approvalBottlenecks || 0,
  }

  const liveMetrics = {
    workforceUtilization: executive?.cards?.workforceUtilization || 0,
    throughput: executive?.revenue?.forecast?.throughput || executive?.revenue?.throughput || 0,
    approvalQueue: executive?.approvals?.openQueue || 0,
  }

  const actions = [
    { label: 'Run Planning', status: 'disabled', note: 'Coming in v1.2' },
    { label: 'Run Simulation', status: 'disabled', note: 'Coming in v1.2' },
    { label: 'Run Revenue Review', status: 'disabled', note: 'Coming in v1.2' },
    { label: 'Run Coordination', status: 'disabled', note: 'Coming in v1.2' },
  ]

  const response = {
    commandCenterVersion: 'v1.1',
    generatedAt,
    overview: {
      organizationalHealthScore: executive?.cards?.organizationalHealthScore || 0,
      governanceMode: executive?.cards?.governanceMode || 'recommendation_only',
      generatedAt,
      recentStrategicActions: (executive?.governance?.strategicRisks || []).slice(0, 5),
    },
    health,
    executiveFeed,
    liveMetrics,
    actions,
    governance: executive?.governance || { mode: 'recommendation_only' },
  }

  console.info('command_center_loaded', { workspaceId, generatedAt })
  console.info('command_center_health_loaded', { workspaceId, health })
  console.info('command_center_feed_loaded', { workspaceId, feedSize: executiveFeed.recentDecisions.length })

  return response
}

async function getTimeline({ workspaceId }) { /* unchanged */
  const [executive, healthCenter] = await Promise.all([
    getExecutiveOverview({ workspaceId }),
    getSystemHealth({ workspaceId })
  ])
  const generatedAt = new Date().toISOString()
  const systemSeverity = (healthCenter?.summary?.degradedCount || 0) > 0 ? 'warning' : ((healthCenter?.summary?.missingCount || 0) > 0 ? 'warning' : 'info')
  const openQueue = executive?.approvals?.openQueue || 0
  const bottlenecks = executive?.cards?.approvalBottlenecks || 0
  const strategicRisks = executive?.governance?.strategicRisks || []
  const decisions = executive?.strategy?.latestPlan?.decisions || []
  const syncConflicts = executive?.coordination?.crossTeamSync?.openConflicts || 0

  const timeline = [
    { timestamp: generatedAt, event: `Executive dashboard refresh (health score ${executive?.cards?.organizationalHealthScore || 0})`, severity: 'info', source: 'Executive Dashboard' },
    { timestamp: generatedAt, event: `Approval queue open items: ${openQueue}; bottlenecks: ${bottlenecks}`, severity: openQueue > 0 ? 'warning' : 'info', source: 'Approval Queue' },
    { timestamp: generatedAt, event: `Strategy risks observed: ${strategicRisks.length}; latest decisions tracked: ${decisions.length}`, severity: strategicRisks.length > 0 ? 'warning' : 'info', source: 'Strategy' },
    { timestamp: generatedAt, event: `Coordination conflicts: ${syncConflicts}`, severity: syncConflicts > 0 ? 'critical' : 'info', source: 'Coordination' },
    { timestamp: generatedAt, event: `System health READY:${healthCenter?.summary?.readyCount || 0} DEGRADED:${healthCenter?.summary?.degradedCount || 0} MISSING:${healthCenter?.summary?.missingCount || 0}`, severity: systemSeverity, source: 'Executive Dashboard' },
  ]

  const recentEvents = [...timeline].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)).slice(0, 20)
  console.info('command_center_navigation_loaded', { workspaceId, generatedAt })
  console.info('command_center_timeline_loaded', { workspaceId, items: timeline.length })
  console.info('command_center_events_loaded', { workspaceId, items: recentEvents.length })
  return { version: 'v1.1', generatedAt, timeline, recentEvents }
}

function buildChecklist() {
  return [
    { id: 'review_health', label: 'Review health', completed: false },
    { id: 'review_approvals', label: 'Review approvals', completed: false },
    { id: 'review_revenue', label: 'Review revenue', completed: false },
    { id: 'review_workforce', label: 'Review workforce', completed: false },
    { id: 'review_strategy', label: 'Review strategy', completed: false },
  ]
}

function focusPriorityRank(priority) {
  return ({ critical: 0, high: 1, medium: 2 }[String(priority || '').toLowerCase()] ?? 3)
}

async function getOperationsHub({ workspaceId }) {
  const generatedAt = new Date().toISOString()
  const [executive, healthCenter, actions] = await Promise.all([
    getExecutiveOverview({ workspaceId }),
    getSystemHealth({ workspaceId }),
    getActions({ workspaceId, limit: 200 }),
  ])

  const pendingApprovals = (actions?.actions || []).filter((item) => item.status === 'requested').length
  const topBottleneck = pendingApprovals > 0 ? 'Approval Queue' : 'None'
  const topRecommendation = pendingApprovals > 0 ? 'Clear requested approvals to reduce execution drag.' : 'Maintain governance cadence and monitor degraded modules.'
  const executiveBrief = {
    healthSummary: {
      ready: healthCenter?.summary?.readyCount || 0,
      degraded: healthCenter?.summary?.degradedCount || 0,
      missing: healthCenter?.summary?.missingCount || 0,
    },
    pendingApprovals,
    topBottleneck,
    topRecommendation,
  }

  const operations = {
    healthy: executiveBrief.healthSummary.ready,
    needsAttention: (executiveBrief.healthSummary.degraded || 0) + (executive?.cards?.approvalBottlenecks || 0),
    blocked: executive?.coordination?.crossTeamSync?.openConflicts || 0,
    completedToday: (actions?.actions || []).filter((item) => item.status === 'approved' || item.status === 'rejected').length,
  }

  const focusCandidates = [
    ...((executive?.governance?.strategicRisks || []).map((risk) => ({
      id: `risk-${risk.riskKey || risk.id || Math.random()}`,
      source: 'strategy',
      title: risk.title || risk.summary || 'Strategic risk review',
      priority: String(risk.severity || 'high').toLowerCase() === 'critical' ? 'critical' : 'high',
      state: 'requested',
    }))),
    ...((actions?.actions || []).map((action) => ({
      id: `decision-${action.id}`,
      source: 'approval_queue',
      title: `${action.action_type} (${action.status})`,
      priority: action.status === 'requested' ? 'critical' : 'medium',
      state: action.status,
      requestedAt: action.created_at,
    }))),
  ]

  const focusQueue = focusCandidates
    .filter((item) => ['critical', 'high', 'medium'].includes(item.priority))
    .sort((a, b) => {
      const p = focusPriorityRank(a.priority) - focusPriorityRank(b.priority)
      if (p) return p
      return Date.parse(b.requestedAt || generatedAt) - Date.parse(a.requestedAt || generatedAt)
    })
    .slice(0, 20)

  const payload = {
    generatedAt,
    executiveBrief,
    operations,
    focusQueue,
    checklist: buildChecklist(),
  }
  return payload
}

async function getBrief(ctx) {
  const payload = await getOperationsHub(ctx)
  console.info('command_center_brief_loaded', { workspaceId: ctx.workspaceId, generatedAt: payload.generatedAt })
  return payload
}

async function getOperations(ctx) {
  const payload = await getOperationsHub(ctx)
  console.info('command_center_operations_loaded', { workspaceId: ctx.workspaceId, generatedAt: payload.generatedAt })
  return payload
}

async function getFocus(ctx) {
  const payload = await getOperationsHub(ctx)
  console.info('command_center_focus_loaded', { workspaceId: ctx.workspaceId, count: payload.focusQueue.length })
  return payload
}

async function requestAction({ workspaceId, actionType, reason }) {
  if (!ALLOWED_ACTION_TYPES.has(actionType)) { const e = new Error('Invalid actionType'); e.statusCode = 400; throw e }
  const result = await pool.query(
    `INSERT INTO ai_command_center_actions(workspace_id, action_type, reason, status, governance)
     VALUES($1::uuid, $2, $3, 'requested', $4::jsonb)
     RETURNING id, workspace_id, action_type, reason, status, governance, created_at, updated_at, approved_at, rejected_at, reviewed_by, review_note`,
    [workspaceId, actionType, reason || '', JSON.stringify(GOVERNANCE_GUARDRAILS)]
  )
  await createAuditEvent({ workspaceId, actionId: result.rows[0].id, eventType: 'requested', payload: { actionType, reason: reason || '' } })
  console.info('command_center_action_requested', { workspaceId, actionType, status: 'requested' })
  return { action: result.rows[0] }
}

async function getActions({ workspaceId, limit = 25, status = null }) {
  const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 100)
  const where = ['workspace_id = $1::uuid']
  const args = [workspaceId]
  if (status) { args.push(status); where.push(`status = $${args.length}`) }
  args.push(safeLimit)
  const result = await pool.query(
    `SELECT id, workspace_id, action_type, reason, status, governance, created_at, updated_at, approved_at, rejected_at, reviewed_by, review_note
       FROM ai_command_center_actions
      WHERE ${where.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT $${args.length}`,
    args
  )
  console.info('command_center_actions_loaded', { workspaceId, count: result.rows.length })
  return { actions: result.rows }
}

async function reviewAction({ workspaceId, actionId, decision, reviewNote, reviewer }) {
  const isApprove = decision === 'approve'
  const status = isApprove ? 'approved' : 'rejected'
  const timeCol = isApprove ? 'approved_at' : 'rejected_at'
  const result = await pool.query(
    `UPDATE ai_command_center_actions
        SET status = $3,
            ${timeCol} = now(),
            reviewed_by = $4,
            review_note = $5,
            updated_at = now()
      WHERE id = $1::uuid AND workspace_id = $2::uuid
      RETURNING id, workspace_id, action_type, reason, status, governance, created_at, updated_at, approved_at, rejected_at, reviewed_by, review_note`,
    [actionId, workspaceId, status, reviewer || 'unknown', reviewNote || '']
  )
  if (!result.rows.length) { const e = new Error('Action not found'); e.statusCode = 404; throw e }
  await createAuditEvent({ workspaceId, actionId, eventType: status, payload: { reviewNote: reviewNote || '', reviewer: reviewer || 'unknown' } })
  console.info(isApprove ? 'command_center_action_approved' : 'command_center_action_rejected', { workspaceId, actionId, status })
  return { action: result.rows[0] }
}

async function getActionAudit({ workspaceId, actionId, limit = 50 }) {
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200)
  const verify = await pool.query('SELECT id FROM ai_command_center_actions WHERE id = $1::uuid AND workspace_id = $2::uuid LIMIT 1', [actionId, workspaceId])
  if (!verify.rows.length) { const e = new Error('Action not found'); e.statusCode = 404; throw e }
  const result = await pool.query(
    `SELECT id, workspace_id, action_id, event_type, event_payload, created_at
       FROM ai_command_center_action_audit_log
      WHERE workspace_id = $1::uuid AND action_id = $2::uuid
      ORDER BY created_at DESC
      LIMIT $3`,
    [workspaceId, actionId, safeLimit]
  )
  console.info('command_center_action_audit_loaded', { workspaceId, actionId, count: result.rows.length })
  return { audit: result.rows }
}

module.exports = { getOverview, getTimeline, getBrief, getOperations, getFocus, requestAction, getActions, reviewAction, getActionAudit, buildReviewer }
