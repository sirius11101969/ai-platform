const assert = require('assert')
const {
  sanitizeManagerReason,
  isFocusLead,
  isActionableApproval,
  filterUnresolvedFailedActions,
} = require('../src/services/aiPipelineCopilotService')

function testSanitizeManagerReason() {
  const unsafe = 'Плюсы: +8 недавний inbound, +18 цена + demo intent. Минусы: нет. Итог: 100/100 priority/urgent risk confidence score'
  const result = sanitizeManagerReason(unsafe)
  assert.ok(!/Плюсы|Минусы|Итог|\+18|score|priority\/urgent/i.test(result), result)
  assert.strictEqual(result, 'Сделка требует follow-up сегодня')
}

function testFocusLeadRules() {
  assert.strictEqual(isFocusLead({ aiPriority: 'urgent', aiRiskLevel: 'low', stage: 'new', aiScore: 51 }), true)
  assert.strictEqual(isFocusLead({ aiPriority: 'priority', aiRiskLevel: 'low', stage: 'new', aiScore: 51 }), true)
  assert.strictEqual(isFocusLead({ aiPriority: 'high', aiRiskLevel: 'low', stage: 'new', aiScore: 69 }), false)
  assert.strictEqual(isFocusLead({ aiPriority: 'high', aiRiskLevel: 'medium', stage: 'new', aiScore: 55 }), true)
  assert.strictEqual(isFocusLead({ aiPriority: 'medium', aiRiskLevel: 'low', stage: 'proposal', aiScore: 65 }), true)
}

function testActionableApprovalRules() {
  assert.strictEqual(isActionableApproval({ status: 'pending_approval', actionType: 'lead_scoring_update' }), false)
  assert.strictEqual(isActionableApproval({ status: 'pending_approval', actionType: 'lead_priority_recommendation', priority: 'high', riskLevel: 'low', payloadScore: 69 }), false)
  assert.strictEqual(isActionableApproval({ status: 'pending_approval', actionType: 'lead_priority_recommendation', priority: 'priority', riskLevel: 'low', payloadScore: 61 }), true)
  assert.strictEqual(isActionableApproval({ status: 'approved', actionType: 'email_followup_draft', priority: 'medium', riskLevel: 'low', payloadScore: 0 }), true)
  assert.strictEqual(isActionableApproval({ status: 'completed', actionType: 'email_followup_draft', priority: 'medium', riskLevel: 'low', payloadScore: 0 }), false)
}

function testUnresolvedFailedFilter() {
  const items = [
    { id: 'old-telegram-failed', leadId: 'dmitry', leadName: 'Дмитрий', actionType: 'telegram_reply_draft', status: 'failed', updatedAt: '2026-05-16T09:00:00.000Z', createdAt: '2026-05-16T09:00:00.000Z' },
    { id: 'email-fallback', leadId: 'dmitry', leadName: 'Дмитрий', actionType: 'email_followup_draft', status: 'completed', updatedAt: '2026-05-16T10:00:00.000Z', executedAt: '2026-05-16T10:00:00.000Z' },
    { id: 'still-failed', leadId: 'maria', leadName: 'Мария', actionType: 'telegram_reply_draft', status: 'failed', updatedAt: '2026-05-16T11:00:00.000Z', createdAt: '2026-05-16T11:00:00.000Z' },
    { id: 'copy-guard-test', leadId: 'test', leadName: 'Unsafe copy guard test', actionType: 'telegram_reply_draft', status: 'failed', title: 'Unsafe copy guard test', errorMessage: 'Blocked by copy guard: internal context leak', updatedAt: '2026-05-16T12:00:00.000Z', createdAt: '2026-05-16T12:00:00.000Z' },
  ]
  const result = filterUnresolvedFailedActions(items)
  assert.deepStrictEqual(result.map((item) => item.id), ['still-failed'])
}

function run() {
  testSanitizeManagerReason()
  testFocusLeadRules()
  testActionableApprovalRules()
  testUnresolvedFailedFilter()
  console.log('aiPipelineCopilotService tests passed')
}

run()
