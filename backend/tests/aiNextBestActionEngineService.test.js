const assert = require('assert')
const { containsForbiddenCustomerCopy } = require('../src/services/customerCopyGuard')
const { SOURCE, getCustomerText, hasDuplicateAction, selectNextBestAction } = require('../src/services/aiNextBestActionEngineService')

const now = new Date('2026-05-17T10:00:00.000Z')
const futureSoon = new Date('2026-05-18T10:00:00.000Z').toISOString()
const stale = new Date('2026-05-15T08:00:00.000Z').toISOString()
const fresh = new Date('2026-05-17T09:00:00.000Z').toISOString()

function assertSafe(action) {
  assert.ok(action.customerText, 'customerText should exist')
  assert.strictEqual(containsForbiddenCustomerCopy(action.customerText), false, `${action.actionType} customerText must be safe`)
  assert.ok(action.internalContext, 'internalContext should keep manager-only context')
  assert.strictEqual(action.internalContext.ai_score !== undefined, true)
}

function testBookedLeadGetsMeetingPrep() {
  const action = selectNextBestAction({ id: 'booked-prep', name: 'Booked', status: 'booked', stage: 'booked', ai_score: 72, updated_at: fresh, meetings: [{ status: 'scheduled', starts_at: futureSoon }] }, now)
  assert.strictEqual(action.actionType, 'meeting_prep_recommendation')
  assert.strictEqual(action.title, 'Подготовиться к demo')
  assertSafe(action)
}

function testBookedLeadWithoutConfirmationGetsConfirmationDraft() {
  const action = selectNextBestAction({ id: 'booked-confirm', name: 'Booked', status: 'booked', stage: 'booked', ai_score: 65, updated_at: fresh, meetings: [] }, now)
  assert.strictEqual(action.actionType, 'telegram_meeting_confirmation_draft')
  assertSafe(action)
}

function testHighRiskLeadGetsRiskFollowup() {
  const action = selectNextBestAction({ id: 'risk', name: 'Risk', status: 'proposal', stage: 'qualified', ai_risk_level: 'high', ai_score: 55, updated_at: fresh, meetings: [] }, now)
  assert.strictEqual(action.actionType, 'risk_followup_recommendation')
  assert.strictEqual(action.title, 'Риск потери сделки')
  assertSafe(action)
}

function testHighScoreNoMeetingGetsMeetingProposal() {
  const action = selectNextBestAction({ id: 'score', name: 'Score', status: 'qualified', stage: 'qualified', ai_score: 74, ai_risk_level: 'low', updated_at: fresh, meetings: [] }, now)
  assert.strictEqual(action.actionType, 'meeting_schedule_proposal')
  assertSafe(action)
}

function testStaleLeadGetsFollowupDraft() {
  const action = selectNextBestAction({ id: 'stale', name: 'Stale', status: 'qualified', stage: 'qualified', ai_score: 30, ai_risk_level: 'low', last_message_at: stale, updated_at: stale, meetings: [] }, now)
  assert.strictEqual(action.actionType, 'followup_sequence_draft')
  assertSafe(action)
}

function testProposalStageFallback() {
  const action = selectNextBestAction({ id: 'proposal', name: 'Proposal', status: 'proposal', stage: 'proposal', ai_score: 40, ai_risk_level: 'low', updated_at: fresh, meetings: [{ status: 'scheduled', starts_at: '2026-06-01T10:00:00.000Z' }] }, now)
  assert.strictEqual(action.actionType, 'proposal_followup_recommendation')
  assertSafe(action)
}

function testSkipAndSourceConstant() {
  assert.strictEqual(SOURCE, 'next_best_action_engine')
  assert.strictEqual(selectNextBestAction({ id: 'won', status: 'won', stage: 'won' }, now), null)
  assert.strictEqual(selectNextBestAction({ id: 'fresh', status: 'new', stage: 'new', updated_at: fresh, ai_score: 20, ai_risk_level: 'low', meetings: [] }, now), null)
}

function testAllTemplatesAreSafe() {
  for (const type of ['meeting_prep_recommendation', 'telegram_meeting_confirmation_draft', 'risk_followup_recommendation', 'meeting_schedule_proposal', 'followup_sequence_draft', 'proposal_followup_recommendation']) {
    assert.strictEqual(containsForbiddenCustomerCopy(getCustomerText(type)), false, `${type} template should pass copy guard`)
  }
}


async function testDuplicateLookupUsesPendingApprovedSource() {
  let captured = null
  const duplicate = await hasDuplicateAction({
    async query(query, params) {
      captured = { query, params }
      return { rows: [{ id: 'duplicate-action' }] }
    },
  }, { workspaceId: 'workspace-1', leadId: 'lead-1', actionType: 'meeting_schedule_proposal' })
  assert.strictEqual(duplicate.id, 'duplicate-action')
  assert.deepStrictEqual(captured.params, ['workspace-1', 'lead-1', 'meeting_schedule_proposal', ['pending_approval', 'approved'], 'next_best_action_engine'])
  assert.ok(captured.query.includes("payload->>'source'"), 'deduplication must scope by source')
}

async function main() {
  testBookedLeadGetsMeetingPrep()
  testBookedLeadWithoutConfirmationGetsConfirmationDraft()
  testHighRiskLeadGetsRiskFollowup()
  testHighScoreNoMeetingGetsMeetingProposal()
  testStaleLeadGetsFollowupDraft()
  testProposalStageFallback()
  testSkipAndSourceConstant()
  testAllTemplatesAreSafe()
  await testDuplicateLookupUsesPendingApprovedSource()
  console.log('aiNextBestActionEngineService tests passed')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
