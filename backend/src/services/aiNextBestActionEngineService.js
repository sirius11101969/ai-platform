const pool = require('../db/pool')
const { assertCustomerSafeText } = require('./customerCopyGuard')
const { addTimelineEvent } = require('./timelineService')
const { sanitizeAiCopy, sanitizeAiActionPayload } = require('../utils/aiCopySanitizer')
const { shouldSkipFollowupForCooldown } = require('./followupCooldownService')

const AI_NEXT_BEST_ACTION_WORKER_TYPE = 'ai_next_best_action_engine'
const SOURCE = 'next_best_action_engine'
const ACTIVE_QUEUE_STATUSES = ['pending_approval', 'approved']
const SOON_MEETING_HOURS = 48
const TELEGRAM_MEETING_CONFIRMATION_DRAFT = 'telegram_meeting_confirmation_draft'
const EMAIL_FOLLOWUP_DRAFT = 'email_followup_draft'
const TELEGRAM_FOLLOWUP_DRAFT = 'telegram_followup'
const INTERNAL_REMINDER = 'create_reminder'
const EMAIL_MEETING_CONFIRMATION_SUBJECT = 'Подтверждение demo-созвона'
const EMAIL_MEETING_CONFIRMATION_TEXT = 'Здравствуйте! Подтверждаю demo-созвон. Если время нужно изменить — просто напишите, я подстроюсь.'
const COOLDOWN_GUARDED_NEXT_BEST_ACTIONS = new Set(['risk_followup_recommendation', 'followup_sequence_draft', 'proposal_followup_recommendation'])

function getBestContactChannel(lead = {}) {
  if (String(lead.telegram_chat_id || lead.telegramChatId || '').trim()) return { preferredChannel: 'telegram', fallbackReason: '' }
  if (String(lead.email || '').trim()) return { preferredChannel: 'email', fallbackReason: 'telegram_missing' }
  return { preferredChannel: 'internal', fallbackReason: 'telegram_missing_no_outbound_channel' }
}

function normalizeStage(lead = {}) {
  return String(lead.stage || lead.status || '').trim().toLowerCase()
}

function isActiveLead(lead = {}) {
  const status = String(lead.status || '').trim().toLowerCase()
  const stage = normalizeStage(lead)
  return !['won', 'lost', 'archived', 'deleted'].includes(status) && !['won', 'lost'].includes(stage)
}

function hoursSince(value, now = new Date()) {
  if (!value) return 999999
  const time = new Date(value).getTime()
  if (!Number.isFinite(time)) return 999999
  return Math.floor((now.getTime() - time) / 3600000)
}

function hasMeetingSoon(lead = {}, now = new Date()) {
  return (lead.meetings || []).some((meeting) => {
    const startsAt = new Date(meeting.starts_at || meeting.startsAt || 0).getTime()
    if (!Number.isFinite(startsAt)) return false
    const hoursUntil = (startsAt - now.getTime()) / 3600000
    const status = String(meeting.status || 'scheduled').toLowerCase()
    return hoursUntil >= 0 && hoursUntil <= SOON_MEETING_HOURS && !['cancelled', 'canceled', 'completed'].includes(status)
  })
}

function hasAnyMeeting(lead = {}) {
  return (lead.meetings || []).some((meeting) => !['cancelled', 'canceled'].includes(String(meeting.status || 'scheduled').toLowerCase()))
}

function hasMeetingConfirmation(lead = {}) {
  if (lead.meeting_confirmation_sent || lead.meetingConfirmationSent) return true
  return (lead.queueItems || []).some((item) => {
    if (!['pending_approval', 'approved', 'completed', 'executed'].includes(item.status)) return false
    if (item.action_type === TELEGRAM_MEETING_CONFIRMATION_DRAFT) return true
    return item.action_type === EMAIL_FOLLOWUP_DRAFT && item.payload?.nextBestAction === TELEGRAM_MEETING_CONFIRMATION_DRAFT
  })
}

function leadName(lead = {}) {
  return String(lead.name || lead.company || 'лид').trim()
}

function getCustomerText(actionType) {
  const texts = {
    meeting_prep_recommendation: 'Здравствуйте! Подтверждаю встречу. Если время нужно изменить — просто напишите, я подстроюсь.',
    telegram_meeting_confirmation_draft: EMAIL_MEETING_CONFIRMATION_TEXT,
    email_followup_draft: EMAIL_MEETING_CONFIRMATION_TEXT,
    risk_followup_recommendation: 'Здравствуйте! Возвращаюсь к нашему диалогу по AS6 AI CRM. Удобно обсудить следующие шаги?',
    meeting_schedule_proposal: 'Здравствуйте! Удобно провести короткий demo-созвон и показать, как AS6 AI CRM поможет вашей команде продаж?',
    followup_sequence_draft: 'Здравствуйте! Возвращаюсь к вашему запросу по AS6 AI CRM. Актуально ещё обсудить автоматизацию продаж?',
    proposal_followup_recommendation: 'Здравствуйте! Хотел(а) уточнить, удалось ли посмотреть предложение по AS6 AI CRM? Готов(а) ответить на вопросы.',
  }
  return texts[actionType] || texts.followup_sequence_draft
}

function buildReason(actionType, lead, now = new Date()) {
  const name = leadName(lead)
  const staleHours = hoursSince(lead.last_message_at || lead.updated_at || lead.created_at, now)
  const reasons = {
    meeting_prep_recommendation: `${name}: встреча запланирована в ближайшие ${SOON_MEETING_HOURS} часов, менеджеру стоит подготовить agenda, боли клиента и материалы для demo.`,
    telegram_meeting_confirmation_draft: `${name}: лид на этапе booked, но подтверждение встречи ещё не найдено в очереди или истории действий.`,
    email_followup_draft: `${name}: лид на этапе booked, Telegram не подключён; подтверждение demo нужно отправить по email.`,
    telegram_followup: `${name}: выбран Telegram как доступный канал для безопасного follow-up.`,
    create_reminder: `${name}: нет подключённого outbound-канала; создано внутреннее напоминание для менеджера.`,
    risk_followup_recommendation: `${name}: AI обнаружил повышенный риск сделки; нужен аккуратный контакт менеджера без раскрытия scoring.`,
    meeting_schedule_proposal: `${name}: высокий интерес без запланированной встречи; безопасный следующий шаг — предложить demo.`,
    followup_sequence_draft: `${name}: нет ответа больше ${Math.max(24, staleHours)} часов; нужен короткий follow-up с одним CTA.`,
    proposal_followup_recommendation: `${name}: предложение уже отправлено или обсуждается, стоит проверить вопросы и следующий шаг.`,
  }
  return reasons[actionType] || `${name}: AI предложил безопасное следующее действие.`
}

function buildTitle(actionType, lead) {
  const titles = {
    meeting_prep_recommendation: 'Подготовиться к demo',
    telegram_meeting_confirmation_draft: 'Подтвердить demo в Telegram',
    email_followup_draft: 'Подтвердить demo по email',
    telegram_followup: 'Подготовить follow-up в Telegram',
    create_reminder: 'Связаться с лидом вручную',
    risk_followup_recommendation: 'Риск потери сделки',
    meeting_schedule_proposal: 'Предложить demo-созвон',
    followup_sequence_draft: 'Подготовить follow-up',
    proposal_followup_recommendation: 'Проверить статус предложения',
  }
  return titles[actionType] || `Следующее действие — ${leadName(lead)}`
}

function selectNextBestAction(lead, now = new Date()) {
  if (!isActiveLead(lead)) return null
  const stage = normalizeStage(lead)
  const riskLevel = String(lead.ai_risk_level || lead.aiRiskLevel || 'low').toLowerCase()
  const score = Number(lead.ai_score || lead.aiScore || 0)
  const staleHours = hoursSince(lead.last_message_at || lead.updated_at || lead.created_at, now)

  let actionType = ''
  if (stage === 'booked' && hasMeetingSoon(lead, now)) actionType = 'meeting_prep_recommendation'
  else if (stage === 'booked' && !hasMeetingConfirmation(lead)) actionType = 'telegram_meeting_confirmation_draft'
  else if (['medium', 'high'].includes(riskLevel)) actionType = 'risk_followup_recommendation'
  else if (score >= 70 && !hasAnyMeeting(lead)) actionType = 'meeting_schedule_proposal'
  else if (staleHours > 24) actionType = 'followup_sequence_draft'
  else if (stage === 'proposal') actionType = 'proposal_followup_recommendation'
  else return null

  const channel = getBestContactChannel(lead)
  const resolvedAction = resolveChannelAction({ actionType, lead, channel })
  const customerText = assertCustomerSafeText(resolvedAction.customerText || getCustomerText(resolvedAction.actionType), { leadId: lead.id, actionType: resolvedAction.actionType, source: SOURCE })
  const action = {
    actionType: resolvedAction.actionType,
    title: resolvedAction.title || buildTitle(resolvedAction.actionType, lead),
    nextBestAction: resolvedAction.nextBestAction || resolvedAction.actionType,
    reason: resolvedAction.reason || buildReason(resolvedAction.actionType, lead, now),
    customerText,
    preferredChannel: channel.preferredChannel,
    channel: channel.preferredChannel,
    fallbackReason: channel.fallbackReason,
    subject: resolvedAction.subject || '',
    internalContext: {
      stage,
      ai_score: Number.isFinite(score) ? score : 0,
      ai_risk_level: riskLevel,
      ai_priority: lead.ai_priority || lead.aiPriority || null,
      ai_scoring_reason: lead.ai_scoring_reason || lead.aiScoringReason || null,
      staleHours,
      hasMeeting: hasAnyMeeting(lead),
      hasMeetingSoon: hasMeetingSoon(lead, now),
      hasMeetingConfirmation: hasMeetingConfirmation(lead),
      channelFallbackReason: channel.fallbackReason || null,
      originalActionType: actionType,
    },
    cooldownGuarded: COOLDOWN_GUARDED_NEXT_BEST_ACTIONS.has(actionType),
    confidence: confidenceFor(actionType, lead, staleHours),
  }
  console.info('[next-best-action] channel selected', { leadId: lead.id, actionType: action.actionType, preferredChannel: action.preferredChannel })
  if (action.preferredChannel === 'email' && action.fallbackReason) console.info('[next-best-action] fallback to email', { leadId: lead.id, originalActionType: actionType, actionType: action.actionType, fallbackReason: action.fallbackReason })
  if (action.actionType === INTERNAL_REMINDER) console.info('[next-best-action] internal reminder created', { leadId: lead.id, originalActionType: actionType, actionType: action.actionType, fallbackReason: action.fallbackReason })
  return action
}

function resolveChannelAction({ actionType, lead, channel }) {
  const preferredChannel = channel.preferredChannel
  if (preferredChannel === 'telegram') {
    if (actionType === TELEGRAM_MEETING_CONFIRMATION_DRAFT) return { actionType: TELEGRAM_MEETING_CONFIRMATION_DRAFT }
    if (isOutboundActionType(actionType)) return { actionType: TELEGRAM_FOLLOWUP_DRAFT, nextBestAction: actionType, title: buildTitle(TELEGRAM_FOLLOWUP_DRAFT, lead), reason: buildReason(actionType, lead), customerText: getCustomerText(actionType) }
    return { actionType }
  }

  if (preferredChannel === 'email') {
    if (actionType === TELEGRAM_MEETING_CONFIRMATION_DRAFT) {
      return { actionType: EMAIL_FOLLOWUP_DRAFT, title: 'Подтвердить demo по email', nextBestAction: actionType, reason: buildReason(EMAIL_FOLLOWUP_DRAFT, lead), customerText: EMAIL_MEETING_CONFIRMATION_TEXT, subject: EMAIL_MEETING_CONFIRMATION_SUBJECT }
    }
    if (isOutboundActionType(actionType)) return { actionType: EMAIL_FOLLOWUP_DRAFT, nextBestAction: actionType, title: buildTitle(actionType, lead), reason: buildReason(actionType, lead), customerText: getCustomerText(actionType), subject: 'Follow-up по AS6 AI CRM' }
    return { actionType }
  }

  if (isOutboundActionType(actionType)) {
    return { actionType: INTERNAL_REMINDER, nextBestAction: actionType, title: buildTitle(INTERNAL_REMINDER, lead), reason: buildReason(INTERNAL_REMINDER, lead), customerText: getCustomerText(actionType) }
  }
  return { actionType }
}

function isOutboundActionType(actionType) {
  return [TELEGRAM_MEETING_CONFIRMATION_DRAFT, 'risk_followup_recommendation', 'meeting_schedule_proposal', 'followup_sequence_draft', 'proposal_followup_recommendation'].includes(actionType)
}

function confidenceFor(actionType, lead, staleHours) {
  if (actionType === 'meeting_prep_recommendation') return 92
  if (actionType === TELEGRAM_MEETING_CONFIRMATION_DRAFT || actionType === EMAIL_FOLLOWUP_DRAFT) return 88
  if (actionType === 'risk_followup_recommendation') return String(lead.ai_risk_level || '').toLowerCase() === 'high' ? 86 : 76
  if (actionType === 'meeting_schedule_proposal') return Number(lead.ai_score || 0) >= 85 ? 88 : 78
  if (actionType === 'followup_sequence_draft') return staleHours >= 72 ? 82 : 72
  if (actionType === 'proposal_followup_recommendation') return 70
  return 65
}

async function fetchActiveLeadSnapshots(client, workspaceId) {
  const result = await client.query(
    `SELECT l.id, l.user_id, l.workspace_id, l.name, l.company, l.status, l.stage, l.source, l.email, l.telegram,
            l.telegram_chat_id, l.value, l.updated_at, l.created_at, l.last_message_at, l.notes,
            COALESCE(l.ai_score, 0) AS ai_score,
            COALESCE(l.ai_priority, 'medium') AS ai_priority,
            COALESCE(l.ai_risk_level, 'low') AS ai_risk_level,
            COALESCE(l.ai_scoring_reason, '') AS ai_scoring_reason,
            COALESCE((SELECT json_agg(m ORDER BY m.starts_at ASC NULLS LAST)
                        FROM crm_meetings m
                       WHERE m.workspace_id = l.workspace_id AND m.lead_id = l.id), '[]'::json) AS meetings,
            COALESCE((SELECT json_agg(json_build_object('id', q.id, 'action_type', q.action_type, 'status', q.status, 'payload', q.payload) ORDER BY q.created_at DESC)
                        FROM ai_worker_queue q
                       WHERE q.workspace_id = l.workspace_id AND q.lead_id = l.id
                         AND q.action_type IN ('telegram_meeting_confirmation_draft', 'email_followup_draft')), '[]'::json) AS queue_items
       FROM crm_leads l
      WHERE l.workspace_id = $1
        AND COALESCE(l.status, '') NOT IN ('won', 'lost')
        AND COALESCE(l.stage, COALESCE(l.status, '')) NOT IN ('won', 'lost')
      ORDER BY l.updated_at DESC NULLS LAST, l.created_at DESC
      LIMIT 500`,
    [workspaceId]
  )
  return result.rows.map((row) => ({ ...row, meetings: row.meetings || [], queueItems: row.queue_items || [] }))
}

async function hasDuplicateAction(client, { workspaceId, leadId, actionType, preferredChannel }) {
  const result = await client.query(
    `SELECT id FROM ai_worker_queue
      WHERE workspace_id = $1
        AND lead_id = $2
        AND action_type = $3
        AND status = ANY($4::text[])
        AND payload->>'source' = $5
        AND COALESCE(payload->>'preferredChannel', payload->>'channel', '') = $6
      LIMIT 1`,
    [workspaceId, leadId, actionType, ACTIVE_QUEUE_STATUSES, SOURCE, preferredChannel || '']
  )
  return result.rows[0] || null
}

async function createNextBestAction(client, { userId, workspaceId, workerId, runId, lead, action }) {
  const payload = {
    source: SOURCE,
    leadId: lead.id,
    nextBestAction: action.nextBestAction,
    reason: action.reason,
    preferredChannel: action.preferredChannel,
    channel: action.channel || action.preferredChannel,
    fallbackReason: action.fallbackReason || '',
    customerText: assertCustomerSafeText(action.customerText, { leadId: lead.id, actionType: action.actionType, source: SOURCE, phase: 'before_insert', preferredChannel: action.preferredChannel }),
    subject: action.subject || undefined,
    email: action.preferredChannel === 'email' ? lead.email : undefined,
    to: action.preferredChannel === 'email' ? lead.email : undefined,
    reminderText: action.preferredChannel === 'internal' ? action.reason : undefined,
    internalContext: action.internalContext,
    confidence: action.confidence,
  }
  const inserted = await client.query(
    `INSERT INTO ai_worker_queue(worker_id, workspace_id, run_id, lead_id, action_type, status, title, recommendation, payload)
     VALUES($1, $2, $3, $4, $5, 'pending_approval', $6, $7, $8)
     RETURNING *`,
    [workerId, workspaceId, runId, lead.id, action.actionType, action.title, sanitizeAiCopy(action.reason), sanitizeAiActionPayload(payload)]
  )
  await addTimelineEvent(client, {
    workspaceId,
    leadId: lead.id,
    userId,
    eventType: 'next_best_action_generated',
    title: 'AI предложил следующее действие',
    body: action.reason,
    source: 'ai',
    metadata: { queueId: inserted.rows[0].id, actionType: action.actionType, source: SOURCE, confidence: action.confidence },
  })
  console.info('[next-best-action] action created', { workspaceId, leadId: lead.id, actionType: action.actionType, queueId: inserted.rows[0].id })
  return inserted.rows[0]
}

async function runNextBestActionEngine({ userId, workspaceId, worker, workerId }) {
  console.info('[next-best-action] engine started', { workspaceId, workerId: worker?.id || workerId })
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const resolvedWorker = worker || (await client.query('SELECT * FROM ai_workers WHERE workspace_id = $1 AND id = $2', [workspaceId, workerId])).rows[0]
    if (!resolvedWorker) throw Object.assign(new Error('AI Next Best Action worker not found'), { statusCode: 404 })
    const leads = await fetchActiveLeadSnapshots(client, workspaceId)
    const runResult = await client.query(
      `INSERT INTO ai_worker_runs(worker_id, workspace_id, input_context, output_summary, status, credits_spent)
       VALUES($1, $2, $3, $4, 'running', 1)
       RETURNING *`,
      [resolvedWorker.id, workspaceId, { workerType: AI_NEXT_BEST_ACTION_WORKER_TYPE, mode: resolvedWorker.mode, generatedBy: 'ai_next_best_action_engine_v1', source: SOURCE, leadCount: leads.length }, { summary: 'AI Next Best Action Engine запущен' }]
    )
    const run = runResult.rows[0]
    const created = []
    const skipped = []
    const duplicates = []
    const now = new Date()

    for (const lead of leads) {
      const action = selectNextBestAction(lead, now)
      if (!action) {
        console.info('[next-best-action] lead skipped', { workspaceId, leadId: lead.id, reason: 'no_matching_rule' })
        skipped.push({ leadId: lead.id, reason: 'no_matching_rule' })
        continue
      }
      if (action.cooldownGuarded) {
        const cooldownState = await shouldSkipFollowupForCooldown({ client, workspaceId, leadId: lead.id, leadName: lead.name, userId })
        if (cooldownState.active) {
          skipped.push({ leadId: lead.id, actionType: action.actionType, reason: cooldownState.reason, lastOutboundAt: cooldownState.lastOutboundAt, cooldownHours: cooldownState.cooldownHours })
          continue
        }
      }

      const duplicate = await hasDuplicateAction(client, { workspaceId, leadId: lead.id, actionType: action.actionType, preferredChannel: action.preferredChannel })
      if (duplicate) {
        console.info('[next-best-action] duplicate skipped', { workspaceId, leadId: lead.id, actionType: action.actionType, preferredChannel: action.preferredChannel, duplicateId: duplicate.id })
        duplicates.push({ leadId: lead.id, actionType: action.actionType, preferredChannel: action.preferredChannel, duplicateId: duplicate.id })
        continue
      }
      created.push(await createNextBestAction(client, { userId, workspaceId, workerId: resolvedWorker.id, runId: run.id, lead, action }))
    }

    const outputSummary = {
      summary: `AI Next Best Action Engine проверил ${leads.length} активных лидов и создал ${created.length} действий`,
      scannedLeads: leads.length,
      createdActions: created.length,
      skippedLeads: skipped.length,
      duplicateSkipped: duplicates.length,
      source: SOURCE,
    }
    const updatedRun = await client.query(
      `UPDATE ai_worker_runs
          SET lead_id = $3, output_summary = $4, status = 'completed', credits_spent = $5
        WHERE workspace_id = $1 AND id = $2
        RETURNING *`,
      [workspaceId, run.id, created[0]?.lead_id || null, outputSummary, Math.max(1, leads.length || 1)]
    )
    await client.query('UPDATE ai_workers SET last_run_at = NOW(), status = $3, updated_at = NOW() WHERE workspace_id = $1 AND id = $2', [workspaceId, resolvedWorker.id, 'active'])
    await client.query(
      `INSERT INTO crm_activity(workspace_id, user_id, type, title, body, metadata)
       VALUES($1, $2, 'ai_worker_run_completed', $3, $4, $5)`,
      [workspaceId, userId, 'AI Next Best Action Engine завершил запуск', outputSummary.summary, { workerId: resolvedWorker.id, runId: run.id, createdActions: created.length, duplicateSkipped: duplicates.length }]
    )
    await client.query('COMMIT')
    console.info('[next-best-action] engine completed', { workspaceId, workerId: resolvedWorker.id, scanned: leads.length, created: created.length, duplicates: duplicates.length, skipped: skipped.length })
    return { run: updatedRun.rows[0], queueItems: created, createdCount: created.length, skipped, duplicates }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

module.exports = {
  AI_NEXT_BEST_ACTION_WORKER_TYPE,
  SOURCE,
  buildReason,
  getBestContactChannel,
  getCustomerText,
  hasDuplicateAction,
  isActiveLead,
  runNextBestActionEngine,
  selectNextBestAction,
}
