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

async function getKpi({ workspaceId }) {
  const [executive, healthCenter, actions] = await Promise.all([
    getExecutiveOverview({ workspaceId }),
    getSystemHealth({ workspaceId }),
    getActions({ workspaceId, limit: 200 }),
  ])

  const actionRows = actions?.actions || []
  const kpis = {
    systemHealth: {
      READY: healthCenter?.summary?.readyCount || 0,
      DEGRADED: healthCenter?.summary?.degradedCount || 0,
      MISSING: healthCenter?.summary?.missingCount || 0,
    },
    organizationalHealthScore: executive?.cards?.organizationalHealthScore || 0,
    workforceUtilization: executive?.cards?.workforceUtilization || 0,
    approvalQueueOpen: executive?.approvals?.openQueue || 0,
    commandCenterActionsRequested: actionRows.filter((item) => item.status === 'requested').length,
    commandCenterActionsApproved: actionRows.filter((item) => item.status === 'approved').length,
    strategicRiskCount: (executive?.governance?.strategicRisks || []).length,
  }
  console.info('command_center_kpi_loaded', { workspaceId, generatedAt: new Date().toISOString() })
  return { generatedAt: new Date().toISOString(), reportType: 'kpi', kpis, governance: GOVERNANCE_GUARDRAILS }
}

async function getReport({ workspaceId, reportType = 'daily' }) {
  const generatedAt = new Date().toISOString()
  const [executive, healthCenter, actions, operations] = await Promise.all([
    getExecutiveOverview({ workspaceId }),
    getSystemHealth({ workspaceId }),
    getActions({ workspaceId, limit: 200 }),
    getOperationsHub({ workspaceId }),
  ])
  const actionRows = actions?.actions || []
  const strategicRisks = executive?.governance?.strategicRisks || []
  const kpis = {
    organizationalHealthScore: executive?.cards?.organizationalHealthScore || 0,
    workforceUtilization: executive?.cards?.workforceUtilization || 0,
    approvalQueueOpen: executive?.approvals?.openQueue || 0,
    pendingApprovals: operations?.executiveBrief?.pendingApprovals || 0,
    healthySystems: healthCenter?.summary?.readyCount || 0,
    degradedSystems: healthCenter?.summary?.degradedCount || 0,
  }
  const decisions = (executive?.strategy?.latestPlan?.decisions || []).slice(0, 8).map((d, idx) => ({ id: d.id || `decision-${idx + 1}`, summary: d.summary || d.title || String(d), source: 'strategic_planning' }))
  const risks = strategicRisks.slice(0, 8).map((risk, idx) => ({ id: risk.id || `risk-${idx + 1}`, title: risk.title || risk.risk_type || 'Strategic risk', severity: risk.severity || 'high' }))
  const bottlenecks = [
    { area: 'approval_queue', value: executive?.cards?.approvalBottlenecks || 0 },
    { area: 'cross_team_sync', value: executive?.coordination?.crossTeamSync?.openConflicts || 0 },
  ].filter((item) => item.value > 0)

  const summary = `${reportType === 'weekly' ? 'Weekly' : 'Daily'} governance review: READY ${healthCenter?.summary?.readyCount || 0}, DEGRADED ${healthCenter?.summary?.degradedCount || 0}, requested actions ${actionRows.filter((item) => item.status === 'requested').length}.`
  const recommendedNextActions = [
    operations?.executiveBrief?.topRecommendation || 'Maintain governance-only mode.',
    'Prioritize approval queue triage before additional strategic requests.',
    'Review workforce and organizational memory signals with human approval checkpoints.',
  ]
  const payload = { generatedAt, reportType, kpis, summary, decisions, risks, bottlenecks, recommendedNextActions, governance: GOVERNANCE_GUARDRAILS }
  console.info(reportType === 'weekly' ? 'command_center_weekly_report_loaded' : 'command_center_daily_report_loaded', { workspaceId, generatedAt })
  return payload
}



function buildPlanningPayload({ dailyReport, weeklyReport, kpi, focusQueue, actions, executive }) {
  const generatedAt = new Date().toISOString()
  const weeklyPriorities = (focusQueue || []).slice(0, 6).map((item, idx) => ({
    id: item.id || `priority-${idx + 1}`,
    title: item.title || 'Executive follow-up',
    priority: item.priority || 'medium',
    source: item.source || 'focus_queue',
    state: item.state || 'requested',
    requestedAt: item.requestedAt || generatedAt,
  }))

  const monthlyObjectives = [
    { objective: 'Stabilize operational health', metric: 'degraded_systems', target: 0, current: dailyReport?.kpis?.degradedSystems || 0 },
    { objective: 'Maintain governance throughput', metric: 'approval_queue_open', target: 0, current: kpi?.kpis?.approvalQueueOpen || 0 },
    { objective: 'Improve organizational health score', metric: 'organizational_health_score', target: Math.max(Number(kpi?.kpis?.organizationalHealthScore || 0), 85), current: kpi?.kpis?.organizationalHealthScore || 0 },
  ]

  const kpiReviewPlan = [
    { metric: 'system_health_ready', cadence: 'weekly', owner: 'executive_ops', current: kpi?.kpis?.systemHealth?.READY || 0 },
    { metric: 'approval_queue_open', cadence: 'daily', owner: 'governance_review', current: kpi?.kpis?.approvalQueueOpen || 0 },
    { metric: 'strategic_risk_count', cadence: 'weekly', owner: 'strategic_planning', current: kpi?.kpis?.strategicRiskCount || 0 },
  ]

  const decisionFollowups = (actions?.actions || []).filter((a) => a.status === 'requested').slice(0, 10).map((a) => ({
    actionId: a.id,
    actionType: a.action_type,
    status: a.status,
    reason: a.reason,
    requiredDecision: 'human_approval',
    governance: a.governance || GOVERNANCE_GUARDRAILS,
  }))

  const recommendations = [
    ...(dailyReport?.recommendedNextActions || []),
    ...(weeklyReport?.recommendedNextActions || []),
    'Review strategic planning and organizational memory before approving new actions.',
  ].slice(0, 8)

  return {
    generatedAt,
    planningHorizon: 'weekly_monthly',
    weeklyPriorities,
    monthlyObjectives,
    kpiReviewPlan,
    decisionFollowups,
    recommendations,
    governance: {
      ...GOVERNANCE_GUARDRAILS,
      planningOnly: true,
      humanApprovalRequired: true,
      sourceSystems: ['daily_report', 'weekly_report', 'kpi', 'focus_queue', 'approval_actions', 'strategic_planning', 'organizational_memory'],
      noAutonomousExecution: true,
      noCustomerActions: true,
      noPricingChanges: true,
    },
  }
}

async function getPlanning({ workspaceId }) {
  const [dailyReport, weeklyReport, kpi, operations, actions, executive] = await Promise.all([
    getReport({ workspaceId, reportType: 'daily' }),
    getReport({ workspaceId, reportType: 'weekly' }),
    getKpi({ workspaceId }),
    getOperationsHub({ workspaceId }),
    getActions({ workspaceId, limit: 200 }),
    getExecutiveOverview({ workspaceId }),
  ])
  const payload = buildPlanningPayload({ dailyReport, weeklyReport, kpi, focusQueue: operations?.focusQueue || [], actions, executive })
  console.info('command_center_planning_loaded', { workspaceId, generatedAt: payload.generatedAt })
  return payload
}

async function getPlanningWeekly({ workspaceId }) {
  const payload = await getPlanning({ workspaceId })
  console.info('command_center_weekly_planning_loaded', { workspaceId, generatedAt: payload.generatedAt, priorities: payload.weeklyPriorities.length })
  return { ...payload, planningHorizon: 'weekly' }
}

async function getPlanningMonthly({ workspaceId }) {
  const payload = await getPlanning({ workspaceId })
  console.info('command_center_monthly_planning_loaded', { workspaceId, generatedAt: payload.generatedAt, objectives: payload.monthlyObjectives.length })
  return { ...payload, planningHorizon: 'monthly' }
}


function countDuplicates(values = []) {
  const map = new Map()
  values.forEach((value) => {
    const normalized = String(value || '').trim().toLowerCase()
    if (!normalized) return
    map.set(normalized, (map.get(normalized) || 0) + 1)
  })
  let duplicated = 0
  for (const count of map.values()) if (count > 1) duplicated += (count - 1)
  return duplicated
}

function hasEmptySections(payload = {}) {
  const keys = ['weeklyPriorities', 'monthlyObjectives', 'kpiReviewPlan', 'decisionFollowups', 'recommendations']
  return keys.some((key) => Array.isArray(payload[key]) && payload[key].length === 0)
}

async function getReview({ workspaceId }) {
  const generatedAt = new Date().toISOString()
  const [actions, planning] = await Promise.all([
    getActions({ workspaceId, limit: 200 }),
    getPlanning({ workspaceId }),
  ])
  const rows = actions?.actions || []
  const now = Date.now()
  const isToday = (iso) => {
    if (!iso) return false
    const d = new Date(iso)
    const n = new Date(now)
    return d.getUTCFullYear() === n.getUTCFullYear() && d.getUTCMonth() === n.getUTCMonth() && d.getUTCDate() === n.getUTCDate()
  }
  const review = {
    totalOpenDecisions: rows.filter((a) => a.status === 'requested').length,
    approvedToday: rows.filter((a) => a.status === 'approved' && isToday(a.approved_at || a.updated_at)).length,
    rejectedToday: rows.filter((a) => a.status === 'rejected' && isToday(a.rejected_at || a.updated_at)).length,
    unresolvedFollowups: (planning?.decisionFollowups || []).filter((f) => f.status !== 'approved' && f.status !== 'rejected').length,
  }
  console.info('command_center_review_loaded', { workspaceId, generatedAt, open: review.totalOpenDecisions })
  return { generatedAt, review, governance: GOVERNANCE_GUARDRAILS }
}

async function getStability({ workspaceId }) {
  const generatedAt = new Date().toISOString()
  const [dailyReport, weeklyReport, planning, actions] = await Promise.all([
    getReport({ workspaceId, reportType: 'daily' }),
    getReport({ workspaceId, reportType: 'weekly' }),
    getPlanning({ workspaceId }),
    getActions({ workspaceId, limit: 200 }),
  ])
  const now = Date.now()
  const rows = actions?.actions || []
  const duplicatedRecommendations = countDuplicates([...(dailyReport?.recommendedNextActions || []), ...(weeklyReport?.recommendedNextActions || []), ...(planning?.recommendations || [])])
  const emptyReports = [dailyReport, weeklyReport].filter((report) => !report?.summary || (report?.decisions || []).length === 0).length
  const staleApprovals = rows.filter((a) => a.status === 'requested' && (now - Date.parse(a.created_at || generatedAt)) > 24*60*60*1000).length
  const orphanPlanningEntries = (planning?.decisionFollowups || []).filter((f) => !rows.find((a) => a.id === f.actionId)).length
  const emptySections = hasEmptySections(planning) ? 1 : 0
  const stability = { duplicatedRecommendations, emptyReports, staleApprovals, orphanPlanningEntries, emptySections }
  console.info('command_center_stability_loaded', { workspaceId, generatedAt, stability })
  return { generatedAt, stability, governance: GOVERNANCE_GUARDRAILS }
}

async function getReadiness({ workspaceId }) {
  const generatedAt = new Date().toISOString()
  const [healthCenter, dailyReport, planning, reviewData, stabilityData, kpi] = await Promise.all([
    getSystemHealth({ workspaceId }),
    getReport({ workspaceId, reportType: 'daily' }),
    getPlanning({ workspaceId }),
    getReview({ workspaceId }),
    getStability({ workspaceId }),
    getKpi({ workspaceId }),
  ])
  const readiness = {
    healthOk: (healthCenter?.summary?.degradedCount || 0) === 0 && (healthCenter?.summary?.missingCount || 0) === 0,
    reportsOk: Boolean(dailyReport?.summary),
    planningOk: !hasEmptySections(planning),
    approvalQueueOk: (reviewData?.review?.totalOpenDecisions || 0) === 0 || (stabilityData?.stability?.staleApprovals || 0) === 0,
    governanceOk: Boolean(kpi?.kpis?.organizationalHealthScore || 0) >= 70,
  }
  const governance = {
    governanceScore: Number(kpi?.kpis?.organizationalHealthScore || 0),
    approvalSla: `${Math.max(0, 100 - ((stabilityData?.stability?.staleApprovals || 0) * 10))}%`,
    reviewCoverage: `${Math.max(0, 100 - ((reviewData?.review?.unresolvedFollowups || 0) * 5))}%`,
  }
  console.info('command_center_readiness_loaded', { workspaceId, generatedAt, readiness })
  return { generatedAt, review: reviewData.review, stability: stabilityData.stability, readiness, governance }
}

module.exports = { getOverview, getTimeline, getBrief, getOperations, getFocus, getReport, getKpi, getPlanning, getPlanningWeekly, getPlanningMonthly, getReview, getStability, getReadiness, requestAction, getActions, reviewAction, getActionAudit, buildReviewer }
