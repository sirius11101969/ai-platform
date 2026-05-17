const assert = require('assert')
const { generateNextBestAction, _private } = require('../src/services/aiPriorityInboxService')

function lead(overrides = {}) {
  return {
    id: overrides.id || 'lead',
    name: overrides.name || 'Lead',
    status: overrides.status || 'new',
    aiLeadScore: overrides.aiLeadScore ?? 51,
    aiPriority: overrides.aiPriority || 'high',
    aiRiskLevel: overrides.aiRiskLevel || 'low',
    aiTemperature: overrides.aiTemperature || 'hot',
    updatedAt: overrides.updatedAt || new Date().toISOString(),
    createdAt: overrides.createdAt || new Date().toISOString(),
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

function run() {
  testFocusModeHidesGenericHighNoise()
  testFocusMetricsDoNotCountGenericHighLeads()
  testFocusSortGroupsExecutiveSignals()
  testBookedMeetingDoesNotSuggestSchedulingDemoAgain()
  console.log('aiPriorityInboxService tests passed')
}

run()
