const pool = require('../db/pool')

const HIGH_RISK = new Set(['high', 'medium'])
const FOCUS_PRIORITIES = new Set(['urgent', 'priority'])
const ACTION_PRIORITIES = new Set(['urgent', 'priority'])
const ACTIVE_LEAD_STATUSES = ['new', 'qualified', 'proposal', 'booked']
const PENDING_STATUSES = ['pending_approval', 'approved']
const HISTORY_STATUSES = ['failed', 'completed', 'executed']
const COMPLETED_STATUSES = new Set(['completed', 'executed'])
const CUSTOMER_ACTION_TYPES = new Set([
  'telegram_reply_draft',
  'telegram_meeting_confirmation_draft',
  'telegram_followup',
  'telegram_draft',
  'telegram_follow_up',
  'email_followup',
  'email_followup_draft',
  'email_draft',
  'email_follow_up',
  'followup_sequence_draft',
  'followup_24h',
  'followup_3d',
  'meeting_schedule_proposal',
  'meeting_request',
  'meeting_prep_recommendation',
  'demo_offer',
  'risk_followup_recommendation',
  'proposal_followup_recommendation',
])
const ACTIONABLE_APPROVAL_TYPES = new Set([
  ...CUSTOMER_ACTION_TYPES,
  'next_best_action',
  'next_best_action_recommendation',
  'lead_priority_recommendation',
  'crm_next_action',
])

function toNumber(value) {
  const numeric = Number(value || 0)
  return Number.isFinite(numeric) ? numeric : 0
}

function compact(value, fallback = '') {
  return String(value || fallback || '').trim()
}

function normalizeDate(value) {
  return value ? new Date(value).toISOString() : null
}

function dateMs(value) {
  const time = value ? new Date(value).getTime() : 0
  return Number.isFinite(time) ? time : 0
}

function isWithinHours(value, hours) {
  if (!value) return false
  const time = new Date(value).getTime()
  if (!Number.isFinite(time)) return false
  const now = Date.now()
  return time >= now && time <= now + hours * 60 * 60 * 1000
}

function leadRoute(leadId) {
  return leadId ? `/crm?leadId=${encodeURIComponent(leadId)}` : '/crm'
}

function queueRoute(itemId) {
  return itemId ? `/ai-workers?approvalId=${encodeURIComponent(itemId)}` : '/ai-workers'
}

function priorityRoute(leadId) {
  return leadId ? `/priority-inbox?leadId=${encodeURIComponent(leadId)}` : '/priority-inbox'
}

function buildCtas(leadId, queueId = '') {
  return {
    openLead: leadRoute(leadId),
    openAiWorkers: queueRoute(queueId),
    openPriorityInbox: priorityRoute(leadId),
    createFollowUp: leadId ? `/crm?leadId=${encodeURIComponent(leadId)}&action=followup` : '/crm',
    scheduleMeeting: leadId ? `/crm?leadId=${encodeURIComponent(leadId)}&action=meeting` : '/crm',
  }
}

function sanitizeManagerReason(text) {
  const original = compact(text)
  if (!original) return ''

  const cleaned = original
    .replace(/(?:Контекст|Плюсы|Минусы|Итог|Риск)\s*:[^.!?\n]*(?:[.!?\n]|$)/gi, ' ')
    .replace(/ai[_\s-]*(?:scoring[_\s-]*reason|score|priority|risk[_\s-]*level|temperature)/gi, ' ')
    .replace(/internalContext/gi, ' ')
    .replace(/\b(?:score|priority|urgent|risk|confidence|weight|weights)\b/gi, ' ')
    .replace(/\+\s*\d+(?:\.\d+)?/g, ' ')
    .replace(/\b\d{1,3}\s*\/\s*100\b/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()

  const unsafe = /(?:Плюсы|Минусы|Итог|ai[_\s-]*scoring|internalContext|\+\s*\d+|\bscore\b|\bpriority\/urgent\b)/i.test(cleaned)
  if (!cleaned || unsafe) {
    console.info('[pipeline-copilot] manager reason sanitized')
    return 'Сделка требует follow-up сегодня'
  }

  if (cleaned !== original) console.info('[pipeline-copilot] manager reason sanitized')
  return cleaned
}

function leadManagerReason(lead) {
  if (lead.aiRiskLevel === 'high') return 'Есть риск потери из-за паузы в коммуникации'
  if (lead.aiRiskLevel === 'medium') return 'Сделка требует follow-up сегодня'
  if (lead.stage === 'booked') return 'Встреча запланирована, нужно подготовить agenda'
  if (lead.stage === 'proposal') return 'Сделка требует follow-up сегодня'
  if (lead.aiPriority === 'urgent' || lead.aiPriority === 'priority') return 'Лид проявил высокий интерес к demo'
  return sanitizeManagerReason(lead.managerReason) || 'Лид проявил высокий интерес к demo'
}

function normalizeLead(row) {
  const riskLevel = compact(row.ai_risk_level, 'low').toLowerCase()
  const priority = compact(row.ai_priority, 'medium').toLowerCase()
  const lead = {
    id: row.id,
    name: row.name,
    company: row.company || '',
    email: row.email || '',
    telegram: row.telegram || '',
    stage: row.stage || row.status || 'new',
    status: row.status || row.stage || 'new',
    value: toNumber(row.value),
    aiScore: toNumber(row.ai_score),
    aiPriority: priority,
    aiRiskLevel: riskLevel,
    aiTemperature: compact(row.ai_temperature, 'warm').toLowerCase(),
    managerReason: sanitizeManagerReason(row.ai_scoring_reason || ''),
    nextStep: sanitizeManagerReason(row.next_step || ''),
    probabilityToClose: toNumber(row.probability_to_close),
    expectedCloseDate: row.expected_close_date || null,
    lastMessageAt: normalizeDate(row.last_message_at),
    updatedAt: normalizeDate(row.updated_at),
    createdAt: normalizeDate(row.created_at),
    ctas: buildCtas(row.id),
  }
  lead.managerReason = leadManagerReason(lead)
  return lead
}

function normalizeQueueItem(row) {
  const payload = row.payload || {}
  const leadId = row.lead_id || payload.leadId || null
  return {
    id: row.id,
    leadId,
    leadName: row.lead_name || payload.leadName || 'Без лида',
    leadCompany: row.lead_company || '',
    actionType: row.action_type,
    status: row.status,
    title: sanitizeManagerReason(row.title || payload.title || row.action_type),
    recommendation: sanitizeManagerReason(row.recommendation || payload.reason || payload.nextBestAction || ''),
    errorMessage: sanitizeManagerReason(row.error_message || payload.error || ''),
    priority: compact(payload.priority || payload.aiPriority, 'medium').toLowerCase(),
    riskLevel: compact(payload.riskLevel || payload.aiRiskLevel, '').toLowerCase(),
    source: compact(payload.source || row.source, '').toLowerCase(),
    payloadScore: toNumber(payload.score || payload.aiScore),
    createdAt: normalizeDate(row.created_at),
    updatedAt: normalizeDate(row.updated_at),
    executedAt: normalizeDate(row.executed_at),
    ctas: buildCtas(leadId, row.id),
  }
}

function normalizeMeeting(row) {
  return {
    id: row.id,
    leadId: row.lead_id,
    leadName: row.lead_name || 'Без лида',
    title: sanitizeManagerReason(row.title || 'Встреча'),
    startsAt: normalizeDate(row.starts_at),
    durationMinutes: toNumber(row.duration_minutes || 30),
    status: row.status || 'scheduled',
    calendarStatus: row.calendar_status || 'pending',
    channel: row.channel || 'meeting',
    meetingUrl: row.meeting_url || row.google_meet_url || '',
    needsPrep: isWithinHours(row.starts_at, 24),
    ctas: buildCtas(row.lead_id),
  }
}

function actionKey(type, id) {
  return `${type}:${id || 'workspace'}`
}

function pushAction(actions, seen, action) {
  const key = actionKey(action.type, action.sourceId || action.leadId || action.title)
  if (seen.has(key)) return
  seen.add(key)
  actions.push({
    id: key,
    leadId: action.leadId || null,
    leadName: action.leadName || 'Workspace',
    actionTitle: sanitizeManagerReason(action.actionTitle) || action.actionTitle,
    reason: sanitizeManagerReason(action.reason) || 'Сделка требует follow-up сегодня',
    priority: action.priority || 'medium',
    dueLabel: action.dueLabel || 'Сегодня',
    category: action.category || 'other',
    sortBucket: action.sortBucket || 90,
    ctaRoute: action.ctaRoute || '/crm',
    ctas: action.ctas || buildCtas(action.leadId),
  })
  console.info('[pipeline-copilot] action generated', { category: action.category || 'other', leadId: action.leadId || null, title: action.actionTitle })
}

function sortTodayActions(actions) {
  const priorityWeight = { urgent: 0, priority: 1, high: 2, medium: 3, low: 4 }
  return actions.sort((a, b) => {
    if (a.sortBucket !== b.sortBucket) return a.sortBucket - b.sortBucket
    const priorityDiff = (priorityWeight[a.priority] ?? 9) - (priorityWeight[b.priority] ?? 9)
    if (priorityDiff) return priorityDiff
    return String(a.leadName || '').localeCompare(String(b.leadName || ''), 'ru')
  })
}

async function recordViewedEvent(userId, workspaceId) {
  try {
    await pool.query(
      `INSERT INTO crm_activity(workspace_id, user_id, lead_id, type, title, body, metadata)
       VALUES($1, $2, NULL, 'pipeline_copilot_viewed', 'AI Pipeline Copilot viewed', 'Workspace-level command center opened', $3)`,
      [workspaceId, userId, { source: 'pipeline_copilot', workspaceLevel: true }]
    )
  } catch (error) {
    console.info('[pipeline-copilot] workspace event skipped', { workspaceId, error: error.message || error })
  }
}

async function fetchLeads(workspaceId) {
  const result = await pool.query(
    `SELECT id, name, company, email, telegram, status, stage, value, ai_score, ai_priority, ai_risk_level,
            ai_temperature, ai_scoring_reason, next_step, probability_to_close, expected_close_date,
            last_message_at, updated_at, created_at
       FROM crm_leads
      WHERE workspace_id = $1
        AND COALESCE(status, stage, 'new') = ANY($2::text[])
      ORDER BY
        CASE COALESCE(ai_priority, 'medium') WHEN 'urgent' THEN 0 WHEN 'priority' THEN 1 WHEN 'high' THEN 2 ELSE 3 END,
        CASE COALESCE(ai_risk_level, 'low') WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
        COALESCE(ai_score, 0) DESC,
        updated_at DESC
      LIMIT 200`,
    [workspaceId, ACTIVE_LEAD_STATUSES]
  )
  return result.rows.map(normalizeLead)
}

async function fetchQueue(workspaceId, statuses, limit = 100) {
  const result = await pool.query(
    `SELECT q.id, q.lead_id, q.action_type, q.status, q.title, q.recommendation, q.payload, q.error_message,
            q.executed_at, q.created_at, q.updated_at, l.name AS lead_name, l.company AS lead_company
       FROM ai_worker_queue q
       LEFT JOIN crm_leads l ON l.id = q.lead_id AND l.workspace_id = q.workspace_id
      WHERE q.workspace_id = $1 AND q.status = ANY($2::text[])
      ORDER BY q.updated_at DESC, q.created_at DESC
      LIMIT $3`,
    [workspaceId, statuses, limit]
  )
  return result.rows.map(normalizeQueueItem)
}

async function fetchMeetings(workspaceId) {
  const result = await pool.query(
    `SELECT m.id, m.lead_id, m.title, m.starts_at, m.duration_minutes, m.status, m.calendar_status,
            m.channel, m.meeting_url, m.google_meet_url, l.name AS lead_name
       FROM crm_meetings m
       LEFT JOIN crm_leads l ON l.id = m.lead_id AND l.workspace_id = m.workspace_id
      WHERE m.workspace_id = $1
        AND COALESCE(m.status, 'scheduled') NOT IN ('cancelled')
        AND m.starts_at >= NOW() - INTERVAL '2 hours'
        AND m.starts_at <= NOW() + INTERVAL '7 days'
      ORDER BY m.starts_at ASC
      LIMIT 100`,
    [workspaceId]
  )
  return result.rows.map(normalizeMeeting)
}

function isFocusLead(lead) {
  return FOCUS_PRIORITIES.has(lead.aiPriority)
    || HIGH_RISK.has(lead.aiRiskLevel)
    || (['booked', 'proposal'].includes(lead.stage) && lead.aiScore >= 65)
}

function isActionableApproval(item) {
  if (!PENDING_STATUSES.includes(item.status)) return false
  if (item.actionType === 'lead_scoring_update') return false
  if (item.actionType === 'lead_priority_recommendation') {
    return FOCUS_PRIORITIES.has(item.priority) || HIGH_RISK.has(item.riskLevel) || item.payloadScore >= 70
  }
  if (item.source === 'next_best_action_engine') return true
  return ACTIONABLE_APPROVAL_TYPES.has(item.actionType)
}

function failureResolutionKey(item) {
  return item.leadId || item.leadName || 'workspace'
}

function isCustomerAction(item) {
  return CUSTOMER_ACTION_TYPES.has(item.actionType)
}

function isSystemSafetyHistory(item) {
  const text = `${item.title || ''} ${item.recommendation || ''} ${item.errorMessage || ''}`
  return /unsafe copy guard|copy guard|internal context leak|blocked by copy guard/i.test(text)
}

function filterUnresolvedFailedActions(items) {
  const completedByLead = new Map()
  items.filter((item) => COMPLETED_STATUSES.has(item.status) && isCustomerAction(item)).forEach((item) => {
    const key = failureResolutionKey(item)
    completedByLead.set(key, Math.max(completedByLead.get(key) || 0, dateMs(item.executedAt || item.updatedAt || item.createdAt)))
  })

  const unresolved = items.filter((item) => {
    if (item.status !== 'failed') return false
    if (!isCustomerAction(item) || isSystemSafetyHistory(item)) return false
    const completedAt = completedByLead.get(failureResolutionKey(item)) || 0
    const failedAt = dateMs(item.updatedAt || item.createdAt)
    return completedAt <= failedAt
  })

  if (unresolved.length !== items.filter((item) => item.status === 'failed').length) {
    console.info('[pipeline-copilot] unresolved failed filtered')
  }
  return unresolved
}

function buildActions({ focusLeads, riskDeals, meetings, pendingApprovals, failedActions }) {
  const actions = []
  const seen = new Set()

  failedActions.slice(0, 5).forEach((item) => pushAction(actions, seen, {
    type: 'failed',
    sourceId: item.id,
    leadId: item.leadId,
    leadName: item.leadName,
    actionTitle: `Fix failed AI action: ${item.title}`,
    reason: item.errorMessage || item.recommendation || 'Customer-facing action needs a manual fix before it can proceed.',
    priority: 'urgent',
    dueLabel: 'Blocked now',
    category: 'failed',
    sortBucket: 10,
    ctaRoute: item.ctas.openAiWorkers,
    ctas: item.ctas,
  }))

  meetings.filter((meeting) => meeting.needsPrep).slice(0, 5).forEach((meeting) => pushAction(actions, seen, {
    type: 'meeting',
    sourceId: meeting.id,
    leadId: meeting.leadId,
    leadName: meeting.leadName,
    actionTitle: `Prepare for meeting: ${meeting.title}`,
    reason: 'Встреча запланирована, нужно подготовить agenda',
    priority: 'high',
    dueLabel: 'Next 24h',
    category: 'meeting',
    sortBucket: 20,
    ctaRoute: meeting.ctas.openLead,
    ctas: meeting.ctas,
  }))

  riskDeals.slice(0, 6).forEach((lead) => pushAction(actions, seen, {
    type: 'risk',
    sourceId: lead.id,
    leadId: lead.id,
    leadName: lead.name,
    actionTitle: lead.aiRiskLevel === 'high' ? 'Escalate high-risk deal' : 'Stabilize at-risk deal',
    reason: lead.managerReason,
    priority: lead.aiRiskLevel === 'high' ? 'urgent' : 'high',
    dueLabel: 'Сегодня',
    category: 'risk',
    sortBucket: 30,
    ctaRoute: lead.ctas.openLead,
    ctas: lead.ctas,
  }))

  focusLeads.filter((lead) => ACTION_PRIORITIES.has(lead.aiPriority)).slice(0, 6).forEach((lead) => pushAction(actions, seen, {
    type: 'urgent',
    sourceId: lead.id,
    leadId: lead.id,
    leadName: lead.name,
    actionTitle: lead.nextStep || 'Work focus lead',
    reason: lead.managerReason,
    priority: lead.aiPriority,
    dueLabel: 'Сегодня',
    category: 'urgent',
    sortBucket: 40,
    ctaRoute: lead.ctas.openPriorityInbox,
    ctas: lead.ctas,
  }))

  pendingApprovals.slice(0, 6).forEach((item) => pushAction(actions, seen, {
    type: 'approval',
    sourceId: item.id,
    leadId: item.leadId,
    leadName: item.leadName,
    actionTitle: `Review AI approval: ${item.title}`,
    reason: item.recommendation || 'AI action is waiting for manager approval. No customer-facing send happens from Pipeline Copilot.',
    priority: item.priority || 'medium',
    dueLabel: 'Approval',
    category: 'approval',
    sortBucket: 50,
    ctaRoute: item.ctas.openAiWorkers,
    ctas: item.ctas,
  }))

  return sortTodayActions(actions).slice(0, 20)
}

async function getPipelineCopilot(userId, workspaceId) {
  console.info('[pipeline-copilot] requested', { workspaceId, userId })
  const [leads, queueHistory, meetings] = await Promise.all([
    fetchLeads(workspaceId),
    fetchQueue(workspaceId, [...PENDING_STATUSES, ...HISTORY_STATUSES], 200),
    fetchMeetings(workspaceId),
  ])

  const pendingApprovals = queueHistory.filter(isActionableApproval).slice(0, 30)
  const failedActions = filterUnresolvedFailedActions(queueHistory).slice(0, 10)
  const focusLeads = leads.filter(isFocusLead).slice(0, 20)
  const riskDeals = leads.filter((lead) => HIGH_RISK.has(lead.aiRiskLevel)).slice(0, 12)
  const upcomingMeetings = meetings.slice(0, 30)
  const meetingsNext24h = upcomingMeetings.filter((meeting) => meeting.needsPrep)
  const todayActions = buildActions({ focusLeads, riskDeals, meetings: upcomingMeetings, pendingApprovals, failedActions })
  const defaultTodayActions = todayActions.slice(0, 10)

  console.info('[pipeline-copilot] focus mode applied', { focusLeads: focusLeads.length, todayActions: defaultTodayActions.length })

  const openPipeline = leads.filter((lead) => !['won', 'lost'].includes(lead.status))
  const revenueSnapshot = {
    openPipelineValue: openPipeline.reduce((sum, lead) => sum + lead.value, 0),
    riskPipelineValue: riskDeals.reduce((sum, lead) => sum + lead.value, 0),
    focusPipelineValue: focusLeads.reduce((sum, lead) => sum + lead.value, 0),
    weightedPipelineValue: openPipeline.reduce((sum, lead) => sum + lead.value * (lead.probabilityToClose || lead.aiScore || 0) / 100, 0),
    topRiskDealValue: riskDeals[0]?.value || 0,
    activeDeals: openPipeline.length,
  }

  const summary = {
    actionsToday: defaultTodayActions.length,
    focusLeads: focusLeads.length,
    riskDeals: riskDeals.length,
    meetingsNext24h: meetingsNext24h.length,
    pendingApprovals: pendingApprovals.length,
    failedActions: failedActions.length,
    headline: `Сегодня нужно сделать ${defaultTodayActions.length} действий`,
    riskText: `${riskDeals.length} сделок в риске`,
    meetingsText: `${meetingsNext24h.length} встреч требуют подготовки`,
    approvalsText: `${pendingApprovals.length} AI задач ждут approval`,
  }

  await recordViewedEvent(userId, workspaceId)

  console.info('[pipeline-copilot] summary generated', summary)
  return { summary, todayActions, focusLeads, riskDeals, upcomingMeetings, pendingApprovals, failedActions, revenueSnapshot }
}

module.exports = { getPipelineCopilot, sanitizeManagerReason, isFocusLead, isActionableApproval, filterUnresolvedFailedActions }
