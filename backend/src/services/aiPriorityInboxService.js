const crmModel = require('../models/crmModel')
const { addTimelineEvent } = require('./timelineService')

const ACTIVE_STATUSES = new Set(['new', 'qualified', 'proposal', 'booked'])
const STAGE_WEIGHT = { booked: 2, proposal: 1, qualified: 0, new: 0, won: -2, lost: -3 }
const PRIORITY_WEIGHT = { urgent: 3, high: 2, priority: 2, medium: 1, low: 0 }
const RISK_WEIGHT = { high: 2, medium: 1, low: 0 }

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
  return { hasMeetings: meetings.length > 0, pending, confirmed }
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
  const { hasMeetings, pending } = getMeetingSignal(lead)
  const pricingInterest = hasPricingInterest(lead)

  let action = 'Сделать follow-up'
  let reason = 'Базовая рекомендация для активного лида без более сильного сигнала.'
  let code = 'follow_up'

  if (status === 'booked' && pending) {
    action = 'Подтвердить встречу'
    reason = 'Лид находится на этапе встречи, но подтверждение или календарная синхронизация ещё ожидается.'
    code = 'confirm_meeting'
  } else if (temperature === 'hot' && (inactiveDays ?? 0) >= 3) {
    action = 'Сделать срочный follow-up'
    reason = 'Горячий лид не получал свежего касания больше 3 дней.'
    code = 'urgent_follow_up'
  } else if (status === 'proposal' && ['medium', 'high'].includes(risk)) {
    action = 'Риск потери сделки'
    reason = 'Сделка на этапе предложения имеет средний или высокий AI risk.'
    code = 'deal_loss_risk'
  } else if (pricingInterest && !hasMeetings) {
    action = 'Назначить demo'
    reason = 'Есть интерес к цене или тарифам, но demo ещё не назначено.'
    code = 'schedule_demo'
  } else if (temperature === 'warm' && lastInboundAt && (inboundDays ?? 99) <= 1) {
    action = 'Ответить сегодня'
    reason = 'Тёплый лид недавно проявил входящую активность.'
    code = 'reply_today'
  } else if (priority === 'urgent') {
    action = 'Связаться сегодня'
    reason = 'AI priority помечен как urgent.'
    code = 'contact_today'
  } else if (status === 'proposal') {
    action = 'Отправить pricing'
    reason = 'Лид находится на этапе предложения — следующий шаг коммерческие условия.'
    code = 'send_pricing'
  } else if (score >= 75 || priority === 'high') {
    action = 'Связаться сегодня'
    reason = 'Высокий AI score или высокий приоритет требуют быстрого контакта.'
    code = 'contact_today'
  } else if ((inactiveDays ?? 0) >= 3) {
    action = 'Сделать follow-up'
    reason = 'Нет свежего ответа или активности больше 3 дней.'
    code = 'needs_follow_up'
  }

  console.log('[priority-inbox] action generated', { leadId: lead.id, action, code })
  return { action, reason, code }
}

function isUrgent(item) {
  return item.aiPriority === 'urgent' || item.nextBestActionCode === 'urgent_follow_up' || item.nextBestActionCode === 'contact_today'
}

function buildInboxItem(lead) {
  const lastActivityAt = getLastActivityAt(lead)
  const generated = generateNextBestAction(lead)
  const lastActivitySummary = getLatestActivitySummary(lead, lastActivityAt)
  const lastContactAt = getLastContactAt(lead) || lastActivityAt
  const noResponseDays = daysSince(lastContactAt)
  const pendingMeeting = getMeetingSignal(lead).pending
  const latestFollowupJob = (lead.aiFollowupJobs || []).find((job) => ['suggested', 'pending', 'approved'].includes(job.status))
  const aiScore = Number(lead.aiLeadScore || lead.aiScore?.score || 0)

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
    aiPriority: lead.aiPriority || 'medium',
    ai_priority: lead.aiPriority || 'medium',
    aiTemperature: lead.aiTemperature || lead.aiScore?.temperature || 'warm',
    ai_temperature: lead.aiTemperature || lead.aiScore?.temperature || 'warm',
    aiRiskLevel: lead.aiRiskLevel || lead.aiScore?.riskLevel || 'low',
    ai_risk_level: lead.aiRiskLevel || lead.aiScore?.riskLevel || 'low',
    aiScoringReason: lead.aiScoringReason || lead.aiScore?.scoringReason || lead.aiScore?.aiReasoning || lead.aiScore?.aiSummary || 'AI причина ещё не рассчитана',
    ai_scoring_reason: lead.aiScoringReason || lead.aiScore?.scoringReason || lead.aiScore?.aiReasoning || lead.aiScore?.aiSummary || 'AI причина ещё не рассчитана',
    lastActivityAt,
    lastActivitySummary,
    noResponseDays,
    nextBestAction: generated.action,
    next_best_action: generated.action,
    nextBestActionReason: generated.reason,
    nextBestActionCode: generated.code,
    needsFollowUp: generated.code.includes('follow') || Boolean(latestFollowupJob),
    pendingMeeting: Boolean(pendingMeeting),
    isAtRisk: ['medium', 'high'].includes(lead.aiRiskLevel || lead.aiScore?.riskLevel) || generated.code === 'deal_loss_risk',
    isUrgent: false,
    crmUrl: `/crm?leadId=${encodeURIComponent(lead.id)}`,
    actionUrls: {
      telegram: `/crm?leadId=${encodeURIComponent(lead.id)}&focus=telegram`,
      email: `/crm?leadId=${encodeURIComponent(lead.id)}&focus=email`,
      followup: `/crm?leadId=${encodeURIComponent(lead.id)}&focus=followup`,
      demo: `/crm?leadId=${encodeURIComponent(lead.id)}&focus=meeting`,
      lead: `/crm?leadId=${encodeURIComponent(lead.id)}`,
    },
  }
}

function sortInboxItems(a, b) {
  const urgentDelta = Number(b.isUrgent) - Number(a.isUrgent)
  if (urgentDelta) return urgentDelta
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
    priorityLeads: items.filter((item) => ['urgent', 'high', 'priority'].includes(item.aiPriority) || item.aiScore >= 70).length,
    atRiskDeals: items.filter((item) => item.isAtRisk).length,
    meetingsPending: items.filter((item) => item.pendingMeeting).length,
    followUpsNeeded: items.filter((item) => item.needsFollowUp || (item.noResponseDays ?? 0) >= 3).length,
  }
}

async function listPriorityInbox(userId, workspaceId) {
  console.log('[priority-inbox] inbox requested', { userId, workspaceId })
  const leads = await crmModel.listLeads(userId, workspaceId)
  const items = leads
    .filter((lead) => ACTIVE_STATUSES.has(lead.status))
    .map(buildInboxItem)
    .map((item) => ({ ...item, isUrgent: isUrgent(item) }))
    .sort(sortInboxItems)

  await Promise.all(items.slice(0, 50).map(async (item) => {
    try {
      await addTimelineEvent(null, {
        workspaceId,
        leadId: item.leadId,
        userId,
        eventType: 'ai_priority_inbox_viewed',
        title: 'AI Priority Inbox viewed',
        body: `Лид показан в Priority Inbox. Рекомендация: ${item.nextBestAction}.`,
        source: 'ai',
        metadata: { aiScore: item.aiScore, aiPriority: item.aiPriority, nextBestActionCode: item.nextBestActionCode },
      })
      await addTimelineEvent(null, {
        workspaceId,
        leadId: item.leadId,
        userId,
        eventType: 'ai_next_action_generated',
        title: 'AI next action generated',
        body: item.nextBestAction,
        source: 'ai',
        metadata: { nextBestActionCode: item.nextBestActionCode, reason: item.nextBestActionReason, source: 'priority_inbox_v1' },
      })
    } catch (error) {
      console.error('[priority-inbox] timeline event failed', { leadId: item.leadId, error: error.message || error })
    }
  }))

  return { leads: items, metrics: buildMetrics(items), generatedAt: new Date().toISOString() }
}

module.exports = { generateNextBestAction, listPriorityInbox }
