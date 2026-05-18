const pool = require('../db/pool')
const crmModel = require('../models/crmModel')
const { addTimelineEvent } = require('./timelineService')
const { assertSafeCustomerCopy, getPriorityInboxCustomerText } = require('./customerCopyGuard')
const { sanitizeAiCopy, sanitizeAiActionPayload } = require('../utils/aiCopySanitizer')
const { FOLLOWUP_COOLDOWN_MANAGER_REASON, getFollowupCooldownState, shouldSkipFollowupForCooldown } = require('./followupCooldownService')

const ACTIVE_STATUSES = new Set(['new', 'qualified', 'proposal', 'booked'])
const STAGE_WEIGHT = { booked: 2, proposal: 1, qualified: 0, new: 0, won: -2, lost: -3 }
const PRIORITY_WEIGHT = { urgent: 3, priority: 2, high: 1, medium: 0, low: 0 }
const RISK_WEIGHT = { high: 2, medium: 1, low: 0 }
const VALID_MODES = new Set(['focus', 'all', 'urgent', 'risk', 'meetings', 'followups'])

const ACTION_TYPES = new Set(['telegram', 'email', 'followup', 'meeting'])
const ACTION_CONFIG = {
  telegram: { queueActionType: 'telegram_reply_draft', workerType: 'ai_telegram_assistant', workerName: 'AI Telegram Reply Assistant' },
  email: { queueActionType: 'email_followup_draft', workerType: 'ai_email_assistant', workerName: 'AI Email Assistant' },
  followup: { queueActionType: 'followup_sequence_draft', workerType: 'ai_crm_assistant', workerName: 'AI CRM Assistant' },
  meeting: { queueActionType: 'meeting_schedule_proposal', workerType: 'ai_meeting_scheduler', workerName: 'AI Meeting Scheduler' },
}

function russianError(message, statusCode = 400) {
  return Object.assign(new Error(message), { statusCode })
}

function hasBookedMeeting(lead) {
  return (lead.meetings || []).some((meeting) => ['booked', 'confirmed', 'scheduled', 'synced'].includes(normalizeText(meeting.status)) || normalizeText(meeting.calendarStatus) === 'synced')
}

function buildInternalContext(lead, inboxItem) {
  return {
    ai_score: inboxItem.aiScore,
    ai_priority: inboxItem.aiPriority,
    ai_risk_level: inboxItem.aiRiskLevel,
    ai_scoring_reason: inboxItem.aiScoringReason || lead.aiScoringReason || '',
    nextBestAction: inboxItem.nextBestAction,
    nextBestActionCode: inboxItem.nextBestActionCode,
    nextBestActionReason: inboxItem.nextBestActionReason,
    currentStage: lead.status || '',
  }
}

function buildPriorityActionText(lead, inboxItem, actionType) {
  const customerText = assertSafeCustomerCopy(getPriorityInboxCustomerText({ nextBestActionCode: inboxItem.nextBestActionCode, nextBestAction: inboxItem.nextBestAction }), { source: 'priority_inbox', leadId: lead.id, actionType })
  const subject = actionType === 'email'
    ? `Следующий шаг по ${lead.company || 'вашему запросу'}`
    : actionType === 'meeting'
      ? (hasBookedMeeting(lead) ? 'Подготовка к встрече' : 'Предложение встречи')
      : 'Priority Inbox follow-up'
  const recommendation = `Менеджеру: ${inboxItem.nextBestAction || 'согласовать следующий шаг'}. Внутренний AI контекст доступен отдельно и не отправляется клиенту.`
  return { subject, body: customerText, customerText, recommendation }
}

function buildPriorityActionPayload(lead, inboxItem, actionType) {
  const text = buildPriorityActionText(lead, inboxItem, actionType)
  const internalContext = buildInternalContext(lead, inboxItem)
  const base = {
    source: 'priority_inbox',
    leadId: lead.id,
    leadName: lead.name,
    company: lead.company || '',
    currentStage: lead.status || '',
    nextBestAction: inboxItem.nextBestAction,
    nextBestActionCode: inboxItem.nextBestActionCode,
    customerText: text.customerText,
    recommendation: text.recommendation,
    internalContext,
    // Backward-compatible metadata for manager UI only. Outbound send paths must use customerText.
    aiScoringReason: inboxItem.aiScoringReason,
    aiScore: inboxItem.aiScore,
    aiPriority: inboxItem.aiPriority,
    riskLevel: inboxItem.aiRiskLevel,
    body: text.customerText,
    text: text.customerText,
    message: text.customerText,
    noAutoSend: true,
  }

  if (actionType === 'telegram') return { ...base, channel: 'telegram', chatId: String(lead.telegramChatId || ''), draftText: text.customerText }
  if (actionType === 'email') return { ...base, channel: 'email', email: lead.email, subject: text.subject, body: text.customerText, draftText: text.customerText }
  if (actionType === 'followup') {
    const channel = lead.telegramChatId ? 'telegram' : (lead.email ? 'email' : 'crm')
    return { ...base, channel, sequenceStep: 'manual_priority_followup', draftText: text.customerText, subject: channel === 'email' ? text.subject : undefined }
  }
  if (actionType === 'meeting') {
    const booked = hasBookedMeeting(lead)
    return {
      ...base,
      channel: lead.telegramChatId ? 'telegram' : (lead.email ? 'email' : 'crm'),
      leadId: lead.id,
      suggestedTime: null,
      source: 'priority_inbox',
      meetingAlreadyBooked: booked,
      proposalType: booked ? 'meeting_confirmation_prep' : 'demo_scheduling',
      title: text.subject,
      draftText: text.customerText,
    }
  }
  return base
}

async function ensurePriorityActionWorker(client, workspaceId, actionType) {
  const config = ACTION_CONFIG[actionType]
  const result = await client.query(
    `INSERT INTO ai_workers(workspace_id, name, type, status, mode, description)
     VALUES($1, $2, $3, 'active', 'approval_required', 'Создаёт approval-действия из AI Priority Inbox. Отправка только после проверки менеджера.')
     ON CONFLICT (workspace_id, type) DO UPDATE SET updated_at = NOW()
     RETURNING id`,
    [workspaceId, config.workerName, config.workerType]
  )
  return result.rows[0]
}

async function findDuplicatePriorityAction(client, workspaceId, leadId, queueActionType) {
  const result = await client.query(
    `SELECT id FROM ai_worker_queue
      WHERE workspace_id = $1 AND lead_id = $2 AND action_type = $3
        AND status IN ('pending_approval','approved')
        AND payload->>'source' = 'priority_inbox'
      ORDER BY created_at DESC LIMIT 1`,
    [workspaceId, leadId, queueActionType]
  )
  return result.rows[0] || null
}

async function createPriorityInboxAction(userId, workspaceId, { leadId, actionType }) {
  const normalizedActionType = normalizeText(actionType)
  console.log('[priority-inbox] action button clicked', { userId, workspaceId, leadId, actionType: normalizedActionType })
  if (!leadId) throw russianError('leadId is required')
  if (!ACTION_TYPES.has(normalizedActionType)) throw russianError('Invalid priority inbox action type')

  const lead = await crmModel.findLead(userId, workspaceId, leadId)
  if (!lead) throw russianError('Lead not found', 404)
  if (normalizedActionType === 'telegram' && !lead.telegramChatId) throw russianError('Telegram не подключён для этого лида')
  if (normalizedActionType === 'email' && !lead.email) throw russianError('Email не найден')

  const inboxItem = enrichInboxItem(buildInboxItem(lead))
  const config = ACTION_CONFIG[normalizedActionType]
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    if (['telegram', 'email', 'followup'].includes(normalizedActionType)) {
      const cooldownState = await shouldSkipFollowupForCooldown({ client, workspaceId, leadId: lead.id, leadName: lead.name, userId })
      if (cooldownState.active) {
        await client.query('COMMIT')
        return {
          success: false,
          skipped: true,
          reason: cooldownState.reason,
          message: FOLLOWUP_COOLDOWN_MANAGER_REASON,
          cooldown: { lastOutboundAt: cooldownState.lastOutboundAt, cooldownHours: cooldownState.cooldownHours },
        }
      }
    }

    const duplicate = await findDuplicatePriorityAction(client, workspaceId, lead.id, config.queueActionType)
    if (duplicate) {
      console.log('[priority-inbox] duplicate action reused', { workspaceId, leadId: lead.id, actionType: normalizedActionType, queueItemId: duplicate.id })
      await client.query('COMMIT')
      return { success: true, queueItemId: duplicate.id, redirectTo: '/ai-workers', duplicate: true }
    }

    const worker = await ensurePriorityActionWorker(client, workspaceId, normalizedActionType)
    const payload = buildPriorityActionPayload(lead, inboxItem, normalizedActionType)
    const text = buildPriorityActionText(lead, inboxItem, normalizedActionType)
    const result = await client.query(
      `INSERT INTO ai_worker_queue(worker_id, workspace_id, lead_id, action_type, status, title, recommendation, payload)
       VALUES($1, $2, $3, $4, 'pending_approval', $5, $6, $7)
       RETURNING id`,
      [worker.id, workspaceId, lead.id, config.queueActionType, text.subject, sanitizeAiCopy(text.recommendation), sanitizeAiActionPayload(payload)]
    )
    await addTimelineEvent(client, {
      workspaceId,
      leadId: lead.id,
      userId,
      eventType: 'priority_inbox_action_created',
      title: 'AI Priority Inbox создал действие',
      body: `Создано действие: ${normalizedActionType}`,
      source: 'ai',
      metadata: { queueItemId: result.rows[0].id, actionType: normalizedActionType, queueActionType: config.queueActionType, source: 'priority_inbox' },
    })
    await client.query('COMMIT')
    console.log('[priority-inbox] queue action created', { workspaceId, leadId: lead.id, actionType: normalizedActionType, queueItemId: result.rows[0].id })
    return { success: true, queueItemId: result.rows[0].id, redirectTo: '/ai-workers' }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

function toTime(value) {
  if (!value) return 0
  const time = new Date(value).getTime()
  return Number.isFinite(time) ? time : 0
}

function daysSince(value) {
  const time = toTime(value)
  if (!time) return null
  return Math.max(0, Math.floor((Date.now() - time) / (24 * 60 * 60 * 1000)))
}

function latestDate(values) {
  const latest = values.map(toTime).filter(Boolean).sort((a, b) => b - a)[0]
  return latest ? new Date(latest).toISOString() : null
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase()
}

function isToday(value) {
  const time = toTime(value)
  if (!time) return false
  const date = new Date(time)
  const now = new Date()
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
}

function hasPricingInterest(lead) {
  const haystack = [lead.notesText, lead.firstMessage, lead.aiScoringReason, lead.aiScore?.intentSummary, lead.aiScore?.aiSummary, lead.aiScore?.aiReasoning]
    .map(normalizeText)
    .join(' ')
  return /pricing|price|цена|стоим|прайс|тариф|budget|бюджет/.test(haystack)
}

function getLastInboundAt(lead) {
  const inbound = (lead.telegramMessages || [])
    .filter((message) => message.direction === 'inbound' || message.role === 'user')
    .map((message) => message.createdAt)
  return latestDate([lead.lastMessageAt, ...inbound])
}

function getLastActivityAt(lead) {
  return latestDate([
    lead.updatedAt,
    lead.createdAt,
    lead.lastMessageAt,
    ...(lead.notes || []).map((note) => note.createdAt),
    ...(lead.followUps || []).map((followUp) => followUp.createdAt),
    ...(lead.aiFollowupJobs || []).map((job) => job.updatedAt || job.createdAt),
    ...(lead.meetings || []).map((meeting) => meeting.updatedAt || meeting.createdAt || meeting.startsAt),
  ])
}

function getLastContactAt(lead) {
  return latestDate([
    lead.lastMessageAt,
    getLastInboundAt(lead),
    ...(lead.followUps || []).map((followUp) => followUp.createdAt),
    ...(lead.aiFollowupJobs || []).map((job) => job.sentAt || job.approvedAt || job.scheduledFor || job.updatedAt || job.createdAt),
  ])
}

function getLatestActivitySummary(lead, lastActivityAt) {
  const latestMessageAt = getLastInboundAt(lead)
  const latestNote = (lead.notes || [])[0]
  const latestFollowUp = (lead.followUps || [])[0]
  const latestMeeting = (lead.meetings || [])[0]

  if (latestMessageAt && toTime(latestMessageAt) === toTime(lastActivityAt)) return 'Последний входящий контакт в Telegram'
  if (latestMeeting && [latestMeeting.updatedAt, latestMeeting.createdAt, latestMeeting.startsAt].some((value) => toTime(value) === toTime(lastActivityAt))) return `Встреча: ${latestMeeting.title || 'demo'}`
  if (latestFollowUp && toTime(latestFollowUp.createdAt) === toTime(lastActivityAt)) return 'AI follow-up создан'
  if (latestNote && toTime(latestNote.createdAt) === toTime(lastActivityAt)) return 'Добавлена заметка менеджера'
  if (lead.updatedAt && toTime(lead.updatedAt) === toTime(lastActivityAt)) return 'Карточка лида обновлена'
  return 'Нет свежих действий'
}

function getMeetingSignal(lead) {
  const meetings = lead.meetings || []
  const pending = meetings.find((meeting) => ['pending', 'scheduled', 'proposed'].includes(meeting.status) || meeting.calendarStatus === 'pending')
  const confirmed = meetings.find((meeting) => ['confirmed', 'synced'].includes(meeting.status) || meeting.calendarStatus === 'synced')
  const today = meetings.find((meeting) => isToday(meeting.startsAt))
  const upcoming = meetings.find((meeting) => toTime(meeting.startsAt) >= Date.now())
  return { hasMeetings: meetings.length > 0, pending, confirmed, today, upcoming }
}

function generateNextBestAction(lead) {
  const score = Number(lead.aiLeadScore || lead.aiScore?.score || 0)
  const priority = normalizeText(lead.aiPriority)
  const temperature = normalizeText(lead.aiTemperature || lead.aiScore?.temperature)
  const risk = normalizeText(lead.aiRiskLevel || lead.aiScore?.riskLevel)
  const status = normalizeText(lead.status)
  const lastActivityAt = getLastActivityAt(lead)
  const lastContactAt = getLastContactAt(lead) || lastActivityAt
  const inactiveDays = daysSince(lastContactAt)
  const lastInboundAt = getLastInboundAt(lead)
  const inboundDays = daysSince(lastInboundAt)
  const { hasMeetings, pending, confirmed, today, upcoming } = getMeetingSignal(lead)
  const pricingInterest = hasPricingInterest(lead)

  let action = 'Оставить в nurture'
  let reason = 'Нет urgent, priority, risk или meeting-сигнала; лид не должен создавать шум в Focus Mode.'
  let code = 'nurture'

  if (pending) {
    action = 'Подтвердить встречу'
    reason = 'Встреча уже создана, но ещё требует подтверждения или календарной синхронизации.'
    code = 'confirm_meeting'
  } else if (today || (status === 'booked' && confirmed)) {
    action = 'Подготовиться к встрече'
    reason = 'Встреча уже назначена — следующий шаг подготовить контекст, вопросы и материалы.'
    code = 'prepare_meeting'
  } else if (hasMeetings && (inactiveDays ?? 0) >= 1) {
    action = 'Сделать follow-up после встречи'
    reason = 'У лида есть встреча в истории; актуальнее закрепить договорённости, а не назначать demo заново.'
    code = 'meeting_follow_up'
  } else if (status === 'proposal' && ['medium', 'high'].includes(risk)) {
    action = 'Риск потери сделки'
    reason = 'Сделка на этапе предложения имеет средний или высокий AI risk.'
    code = 'deal_loss_risk'
  } else if (['medium', 'high'].includes(risk)) {
    action = 'Сделать follow-up сегодня'
    reason = 'AI risk указывает на вероятность потери контакта или сделки.'
    code = 'risk_follow_up'
  } else if (priority === 'urgent' || (temperature === 'hot' && (inactiveDays ?? 0) >= 3)) {
    action = 'Сделать срочный follow-up'
    reason = priority === 'urgent' ? 'AI priority помечен как urgent.' : 'Горячий лид не получал свежего касания больше 3 дней.'
    code = 'urgent_follow_up'
  } else if (status === 'proposal' || pricingInterest) {
    action = 'Отправить pricing'
    reason = status === 'proposal' ? 'Лид находится на этапе предложения — следующий шаг коммерческие условия.' : 'Лид проявил интерес к цене или тарифам.'
    code = 'send_pricing'
  } else if (status === 'booked' || upcoming) {
    action = 'Согласовать demo'
    reason = 'Встреча находится в работе — нужно согласовать формат demo и ожидания клиента.'
    code = 'align_demo'
  } else if (temperature === 'warm' && lastInboundAt && (inboundDays ?? 99) <= 1) {
    action = 'Ответить сегодня'
    reason = 'Тёплый лид недавно проявил входящую активность.'
    code = 'reply_today'
  } else if (priority === 'priority' || score >= 75) {
    action = 'Связаться сегодня'
    reason = 'AI score или priority-сигнал требуют быстрого контакта.'
    code = 'contact_today'
  } else if ((inactiveDays ?? 0) >= 3) {
    action = 'Сделать follow-up сегодня'
    reason = 'Нет свежего ответа или активности больше 3 дней.'
    code = 'needs_follow_up'
  }

  console.log('[priority-inbox] action generated', { leadId: lead.id, action, code })
  return { action, reason, code }
}

function isFollowupRecommendation(code) {
  return String(code || '').includes('follow') || ['contact_today', 'reply_today', 'deal_loss_risk'].includes(String(code || ''))
}

function isUrgent(item) {
  return item.aiPriority === 'urgent' || item.nextBestActionCode === 'urgent_follow_up'
}

function isAtRisk(item) {
  return ['medium', 'high'].includes(item.aiRiskLevel) || item.nextBestActionCode === 'deal_loss_risk' || item.nextBestActionCode === 'risk_follow_up'
}

function isFocusLead(item) {
  const executiveStage = ['proposal', 'booked'].includes(item.status) && Number(item.aiScore || 0) >= 65
  return ['urgent', 'priority'].includes(item.aiPriority) || isAtRisk(item) || executiveStage
}

function buildInboxItem(lead) {
  const lastActivityAt = getLastActivityAt(lead)
  const generated = generateNextBestAction(lead)
  if (lead.followupCooldownActive && isFollowupRecommendation(generated.code)) {
    generated.action = 'Оставить в nurture'
    generated.reason = FOLLOWUP_COOLDOWN_MANAGER_REASON
    generated.code = 'followup_cooldown'
  }
  const lastActivitySummary = getLatestActivitySummary(lead, lastActivityAt)
  const lastContactAt = getLastContactAt(lead) || lastActivityAt
  const noResponseDays = daysSince(lastContactAt)
  const meetingSignal = getMeetingSignal(lead)
  const latestFollowupJob = (lead.aiFollowupJobs || []).find((job) => ['suggested', 'pending', 'approved'].includes(job.status))
  const aiScore = Number(lead.aiLeadScore || lead.aiScore?.score || 0)
  const aiPriority = lead.aiPriority || lead.aiScore?.priority || 'medium'
  const aiRiskLevel = lead.aiRiskLevel || lead.aiScore?.riskLevel || 'low'

  return {
    id: lead.id,
    leadId: lead.id,
    name: lead.name,
    company: lead.company || '',
    email: lead.email || '',
    telegram: lead.telegram || lead.telegramUsername || '',
    hasTelegramChatId: Boolean(lead.hasTelegramChatId || lead.telegramChatId),
    status: lead.status,
    stage: lead.statusLabel || lead.status,
    aiScore,
    ai_score: aiScore,
    aiPriority,
    ai_priority: aiPriority,
    aiTemperature: lead.aiTemperature || lead.aiScore?.temperature || 'warm',
    ai_temperature: lead.aiTemperature || lead.aiScore?.temperature || 'warm',
    aiRiskLevel,
    ai_risk_level: aiRiskLevel,
    aiScoringReason: lead.aiScoringReason || lead.aiScore?.scoringReason || lead.aiScore?.aiReasoning || lead.aiScore?.aiSummary || 'AI причина ещё не рассчитана',
    ai_scoring_reason: lead.aiScoringReason || lead.aiScore?.scoringReason || lead.aiScore?.aiReasoning || lead.aiScore?.aiSummary || 'AI причина ещё не рассчитана',
    lastActivityAt,
    lastActivitySummary,
    noResponseDays,
    nextBestAction: generated.action,
    next_best_action: generated.action,
    nextBestActionReason: generated.reason,
    nextBestActionCode: generated.code,
    followupCooldownActive: Boolean(lead.followupCooldownActive),
    followupCooldownReason: lead.followupCooldownActive ? FOLLOWUP_COOLDOWN_MANAGER_REASON : '',
    followupCooldownLastOutboundAt: lead.followupCooldownLastOutboundAt || null,
    followupCooldownHours: lead.followupCooldownHours || null,
    needsFollowUp: lead.followupCooldownActive ? false : (generated.code.includes('follow') || Boolean(latestFollowupJob)),
    pendingMeeting: Boolean(meetingSignal.pending),
    meetingToday: Boolean(meetingSignal.today),
    hasMeeting: meetingSignal.hasMeetings,
    isAtRisk: false,
    isUrgent: false,
    isFocusLead: false,
    crmUrl: `/crm?leadId=${encodeURIComponent(lead.id)}`,
    actionDisabledReasons: lead.followupCooldownActive ? { telegram: FOLLOWUP_COOLDOWN_MANAGER_REASON, email: FOLLOWUP_COOLDOWN_MANAGER_REASON, followup: FOLLOWUP_COOLDOWN_MANAGER_REASON } : {},
    actionUrls: {
      telegram: `/crm?leadId=${encodeURIComponent(lead.id)}&focus=telegram`,
      email: `/crm?leadId=${encodeURIComponent(lead.id)}&focus=email`,
      followup: `/crm?leadId=${encodeURIComponent(lead.id)}&focus=followup`,
      demo: `/crm?leadId=${encodeURIComponent(lead.id)}&focus=meeting`,
      lead: `/crm?leadId=${encodeURIComponent(lead.id)}`,
    },
  }
}

function enrichInboxItem(item) {
  const enriched = { ...item }
  enriched.isUrgent = isUrgent(enriched)
  enriched.isAtRisk = isAtRisk(enriched)
  enriched.isFocusLead = isFocusLead(enriched)
  return enriched
}

function focusSortGroup(item) {
  if (item.isUrgent) return 0
  if (item.isAtRisk && ['proposal', 'booked'].includes(item.status)) return 1
  if (item.pendingMeeting || item.meetingToday || item.status === 'booked') return 2
  if (item.aiPriority === 'priority') return 3
  if (item.isAtRisk) return 4
  return 5
}

function sortInboxItems(a, b) {
  const focusDelta = focusSortGroup(a) - focusSortGroup(b)
  if (focusDelta) return focusDelta
  const priorityDelta = (PRIORITY_WEIGHT[b.aiPriority] || 0) - (PRIORITY_WEIGHT[a.aiPriority] || 0)
  if (priorityDelta) return priorityDelta
  const riskDelta = (RISK_WEIGHT[b.aiRiskLevel] || 0) - (RISK_WEIGHT[a.aiRiskLevel] || 0)
  if (riskDelta) return riskDelta
  const stageDelta = (STAGE_WEIGHT[b.status] || 0) - (STAGE_WEIGHT[a.status] || 0)
  if (stageDelta) return stageDelta
  const scoreDelta = Number(b.aiScore || 0) - Number(a.aiScore || 0)
  if (scoreDelta) return scoreDelta
  return toTime(b.lastActivityAt) - toTime(a.lastActivityAt)
}

function buildMetrics(items) {
  return {
    urgentLeads: items.filter((item) => item.isUrgent).length,
    focusLeads: items.filter((item) => item.isFocusLead).length,
    atRiskDeals: items.filter((item) => item.isAtRisk).length,
    meetingsToday: items.filter((item) => item.meetingToday).length,
    followUpsNeeded: items.filter((item) => item.needsFollowUp || (item.noResponseDays ?? 0) >= 3).length,
  }
}

function normalizeMode(mode) {
  const normalized = normalizeText(mode || 'focus')
  return VALID_MODES.has(normalized) ? normalized : 'focus'
}

function filterItemsByMode(items, mode) {
  if (mode === 'all') return items
  if (mode === 'urgent') return items.filter((item) => item.isUrgent)
  if (mode === 'risk') return items.filter((item) => item.isAtRisk)
  if (mode === 'meetings') return items.filter((item) => item.pendingMeeting || item.meetingToday || item.status === 'booked' || item.hasMeeting)
  if (mode === 'followups') return items.filter((item) => item.needsFollowUp || (item.noResponseDays ?? 0) >= 3)
  return items.filter((item) => item.isFocusLead)
}

async function listPriorityInbox(userId, workspaceId, options = {}) {
  const mode = normalizeMode(options.mode)
  console.log('[priority-inbox] inbox requested', { userId, workspaceId, mode })
  if (mode === 'focus') console.log('[priority-inbox] focus mode applied', { userId, workspaceId })

  const leads = await crmModel.listLeads(userId, workspaceId)
  const leadsWithCooldown = await Promise.all(leads.map(async (lead) => {
    const cooldownState = await getFollowupCooldownState({ workspaceId, leadId: lead.id })
    if (!cooldownState.active) return lead
    return {
      ...lead,
      followupCooldownActive: true,
      followupCooldownLastOutboundAt: cooldownState.lastOutboundAt,
      followupCooldownHours: cooldownState.cooldownHours,
    }
  }))
  const allItems = leadsWithCooldown
    .filter((lead) => ACTIVE_STATUSES.has(lead.status))
    .map(buildInboxItem)
    .map(enrichInboxItem)
    .sort(sortInboxItems)
  const items = filterItemsByMode(allItems, mode).sort(sortInboxItems)

  await Promise.all(items.slice(0, 50).map(async (item) => {
    try {
      await addTimelineEvent(null, {
        workspaceId,
        leadId: item.leadId,
        userId,
        eventType: 'ai_priority_inbox_viewed',
        title: 'AI Priority Inbox viewed',
        body: `Лид показан в Priority Inbox (${mode}). Рекомендация: ${item.nextBestAction}.`,
        source: 'ai',
        metadata: { aiScore: item.aiScore, aiPriority: item.aiPriority, nextBestActionCode: item.nextBestActionCode, mode },
      })
      await addTimelineEvent(null, {
        workspaceId,
        leadId: item.leadId,
        userId,
        eventType: 'ai_next_action_generated',
        title: 'AI next action generated',
        body: item.nextBestAction,
        source: 'ai',
        metadata: { nextBestActionCode: item.nextBestActionCode, reason: item.nextBestActionReason, source: 'priority_inbox_v2', mode },
      })
    } catch (error) {
      console.error('[priority-inbox] timeline event failed', { leadId: item.leadId, error: error.message || error })
    }
  }))

  return {
    mode,
    leads: items,
    metrics: buildMetrics(allItems),
    totalLeads: allItems.length,
    generatedAt: new Date().toISOString(),
  }
}

module.exports = {
  generateNextBestAction,
  listPriorityInbox,
  createPriorityInboxAction,
  _private: { buildInboxItem, buildPriorityActionPayload, enrichInboxItem, filterItemsByMode, isFocusLead, buildMetrics, sortInboxItems },
}
