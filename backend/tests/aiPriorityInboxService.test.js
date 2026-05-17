const assert = require('assert')
const { generateNextBestAction, _private } = require('../src/services/aiPriorityInboxService')
const { containsForbiddenCustomerCopy } = require('../src/services/customerCopyGuard')

function lead(overrides = {}) {
  return {
    id: overrides.id || 'lead',
    name: overrides.name || 'Lead',
    status: overrides.status || 'new',
    aiLeadScore: overrides.aiLeadScore ?? 51,
    aiPriority: overrides.aiPriority || 'high',
    aiRiskLevel: overrides.aiRiskLevel || 'low',
    aiTemperature: overrides.aiTemperature || 'hot',
    aiScoringReason: overrides.aiScoringReason || '',
    updatedAt: overrides.updatedAt || new Date().toISOString(),
    createdAt: overrides.createdAt || new Date().toISOString(),
    telegramChatId: overrides.telegramChatId || '',
    email: overrides.email || '',
    company: overrides.company || '',
    meetings: overrides.meetings || [],
    aiFollowupJobs: overrides.aiFollowupJobs || [],
    telegramMessages: overrides.telegramMessages || [],
    notes: overrides.notes || [],
    followUps: overrides.followUps || [],
  }
}

function item(overrides) {
  return _private.enrichInboxItem(_private.buildInboxItem(lead(overrides)))
}

function testFocusModeHidesGenericHighNoise() {
  const genericHigh = item({ id: 'generic-high', aiPriority: 'high', aiLeadScore: 59, aiRiskLevel: 'low', status: 'new' })
  const priority = item({ id: 'priority', aiPriority: 'priority', aiLeadScore: 61, aiRiskLevel: 'low', status: 'new' })
  const risk = item({ id: 'risk', aiPriority: 'high', aiLeadScore: 58, aiRiskLevel: 'medium', status: 'qualified' })
  const proposal = item({ id: 'proposal', aiPriority: 'medium', aiLeadScore: 65, aiRiskLevel: 'low', status: 'proposal' })

  const focusIds = _private.filterItemsByMode([genericHigh, priority, risk, proposal], 'focus').map((leadItem) => leadItem.leadId)

  assert.deepStrictEqual(focusIds.sort(), ['priority', 'proposal', 'risk'])
  assert.strictEqual(_private.filterItemsByMode([genericHigh], 'all').length, 1, 'generic high should remain available in All Leads')
  assert.strictEqual(_private.filterItemsByMode([genericHigh], 'followups').length, 0, 'generic high without risk should not leak into Follow-ups')
}


function testFocusMetricsDoNotCountGenericHighLeads() {
  const genericHigh = item({ id: 'generic-high', aiPriority: 'high', aiLeadScore: 59, aiRiskLevel: 'low', status: 'new' })
  const urgent = item({ id: 'urgent', aiPriority: 'urgent', aiLeadScore: 80, aiRiskLevel: 'low', status: 'qualified' })
  const risk = item({ id: 'risk', aiPriority: 'medium', aiLeadScore: 52, aiRiskLevel: 'high', status: 'proposal' })

  const metrics = _private.buildMetrics([genericHigh, urgent, risk])

  assert.strictEqual(metrics.focusLeads, 2)
  assert.strictEqual(metrics.urgentLeads, 1)
  assert.strictEqual(metrics.atRiskDeals, 1)
}

function testFocusSortGroupsExecutiveSignals() {
  const priority = item({ id: 'priority', aiPriority: 'priority', aiLeadScore: 80, status: 'qualified' })
  const meeting = item({ id: 'meeting', aiPriority: 'medium', aiLeadScore: 70, status: 'booked', meetings: [{ status: 'confirmed', startsAt: new Date().toISOString() }] })
  const riskProposal = item({ id: 'risk-proposal', aiPriority: 'medium', aiLeadScore: 68, aiRiskLevel: 'high', status: 'proposal' })
  const urgent = item({ id: 'urgent', aiPriority: 'urgent', aiLeadScore: 85, status: 'new' })

  const sortedIds = [priority, meeting, riskProposal, urgent].sort(_private.sortInboxItems).map((leadItem) => leadItem.leadId)

  assert.deepStrictEqual(sortedIds, ['urgent', 'risk-proposal', 'meeting', 'priority'])
}

function testBookedMeetingDoesNotSuggestSchedulingDemoAgain() {
  const action = generateNextBestAction(lead({
    id: 'booked',
    status: 'booked',
    aiLeadScore: 72,
    aiPriority: 'priority',
    meetings: [{ status: 'confirmed', calendarStatus: 'synced', startsAt: new Date().toISOString() }],
  }))

  assert.notStrictEqual(action.action, 'Назначить demo')
  assert.ok(['Подготовиться к встрече', 'Согласовать demo', 'Сделать follow-up после встречи'].includes(action.action), `unexpected booked action: ${action.action}`)
}

function testPriorityActionPayloads() {
  const telegramLead = lead({ id: 'telegram-lead', name: 'Telegram Connect Test', telegramChatId: '12345', aiScoringReason: 'Клиент ждёт ответ' })
  const telegramItem = item({ id: 'telegram-lead', name: 'Telegram Connect Test', telegramChatId: '12345', aiScoringReason: 'Клиент ждёт ответ' })
  const telegramPayload = _private.buildPriorityActionPayload(telegramLead, telegramItem, 'telegram')
  assert.strictEqual(telegramPayload.source, 'priority_inbox')
  assert.strictEqual(telegramPayload.channel, 'telegram')
  assert.strictEqual(telegramPayload.chatId, '12345')
  assert.ok(telegramPayload.customerText)
  assert.strictEqual(telegramPayload.draftText, telegramPayload.customerText)
  assert.strictEqual(containsForbiddenCustomerCopy(telegramPayload.customerText), false)
  assert.ok(telegramPayload.internalContext.ai_scoring_reason)
  assert.ok(telegramPayload.recommendation.includes('Менеджеру'))

  const emailLead = lead({ id: 'maria', name: 'Maria', email: 'maria@example.com', aiScoringReason: 'Нужно отправить предложение' })
  const emailItem = item({ id: 'maria', name: 'Maria', email: 'maria@example.com', aiScoringReason: 'Нужно отправить предложение' })
  const emailPayload = _private.buildPriorityActionPayload(emailLead, emailItem, 'email')
  assert.strictEqual(emailPayload.channel, 'email')
  assert.strictEqual(emailPayload.email, 'maria@example.com')
  assert.ok(emailPayload.subject)
  assert.strictEqual(emailPayload.body, emailPayload.customerText)
  assert.strictEqual(containsForbiddenCustomerCopy(emailPayload.customerText), false)

  const followupPayload = _private.buildPriorityActionPayload(emailLead, emailItem, 'followup')
  assert.strictEqual(followupPayload.sequenceStep, 'manual_priority_followup')
  assert.strictEqual(followupPayload.channel, 'email')
  assert.strictEqual(followupPayload.noAutoSend, true)

  assert.strictEqual(containsForbiddenCustomerCopy(followupPayload.customerText), false)

  const meetingPayload = _private.buildPriorityActionPayload(emailLead, emailItem, 'meeting')
  assert.strictEqual(meetingPayload.suggestedTime, null)
  assert.strictEqual(meetingPayload.source, 'priority_inbox')
  assert.strictEqual(meetingPayload.proposalType, 'demo_scheduling')
  assert.strictEqual(containsForbiddenCustomerCopy(meetingPayload.customerText), false)
}

function testPriorityTelegramDraftCopyExamplesStayClean() {
  const forbiddenReason = 'Плюсы: +8 недавний inbound, +18 цена + demo intent. Итог: 100/100 priority/urgent risk confidence score'
  const pricingLead = lead({ id: 'pricing', status: 'proposal', telegramChatId: '12345', aiLeadScore: 60, aiPriority: 'medium', aiScoringReason: forbiddenReason })
  const pricingItem = _private.enrichInboxItem(_private.buildInboxItem(pricingLead))
  const pricingPayload = _private.buildPriorityActionPayload(pricingLead, pricingItem, 'telegram')

  assert.strictEqual(pricingPayload.customerText, 'Здравствуйте! Могу отправить краткую информацию по тарифам и показать, какой вариант лучше подойдёт под вашу задачу.')
  assert.strictEqual(containsForbiddenCustomerCopy(pricingPayload.customerText), false)
  assert.ok(pricingPayload.internalContext.ai_scoring_reason.includes('Плюсы:'))

  const meetingLead = lead({ id: 'meeting-confirm', telegramChatId: '12345', meetings: [{ status: 'pending', startsAt: new Date().toISOString() }], aiScoringReason: forbiddenReason })
  const meetingItem = _private.enrichInboxItem(_private.buildInboxItem(meetingLead))
  const meetingPayload = _private.buildPriorityActionPayload(meetingLead, meetingItem, 'telegram')

  assert.strictEqual(meetingPayload.customerText, 'Здравствуйте! Подтверждаю встречу. Если время нужно изменить — просто напишите, я подстроюсь.')
  assert.strictEqual(containsForbiddenCustomerCopy(meetingPayload.customerText), false)
}

function run() {
  testFocusModeHidesGenericHighNoise()
  testFocusMetricsDoNotCountGenericHighLeads()
  testFocusSortGroupsExecutiveSignals()
  testBookedMeetingDoesNotSuggestSchedulingDemoAgain()
  testPriorityActionPayloads()
  testPriorityTelegramDraftCopyExamplesStayClean()
  console.log('aiPriorityInboxService tests passed')
}

run()
