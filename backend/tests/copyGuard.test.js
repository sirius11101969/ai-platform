const assert = require('assert')
const path = require('path')

const CLEAN_TEXT = 'Здравствуйте! Подтверждаю встречу. Если время нужно изменить — просто напишите, я подстроюсь.'
const UNSAFE_TEXT = 'Контекст: Плюсы: +18 demo intent. Минусы: нет. Итог: 100/100 ai_score ai_priority ai_risk_level score priority/urgent'
const BLOCK_MESSAGE = 'Blocked by copy guard: internal AI context leak'

function clearServiceCache() {
  for (const relativePath of [
    '../src/services/aiApprovalQueueService.js',
    '../src/db/pool.js',
    '../src/services/telegramService.js',
    '../src/services/emailService.js',
    '../src/models/crmModel.js',
    '../src/services/timelineService.js',
    '../src/services/attachmentService.js',
    '../src/services/googleCalendarService.js',
    '../src/services/aiLeadScoringService.js',
  ]) {
    delete require.cache[path.resolve(__dirname, relativePath)]
  }
}

function installQueueMocks({ actionType, text = UNSAFE_TEXT, channel = 'telegram', lead = {} } = {}) {
  clearServiceCache()

  const servicePath = path.resolve(__dirname, '../src/services/aiApprovalQueueService.js')
  const poolPath = path.resolve(__dirname, '../src/db/pool.js')
  const telegramPath = path.resolve(__dirname, '../src/services/telegramService.js')
  const emailPath = path.resolve(__dirname, '../src/services/emailService.js')
  const crmModelPath = path.resolve(__dirname, '../src/models/crmModel.js')
  const timelinePath = path.resolve(__dirname, '../src/services/timelineService.js')
  const attachmentPath = path.resolve(__dirname, '../src/services/attachmentService.js')
  const googleCalendarPath = path.resolve(__dirname, '../src/services/googleCalendarService.js')
  const leadScoringPath = path.resolve(__dirname, '../src/services/aiLeadScoringService.js')

  const calls = { telegram: [], email: [], queueUpdates: [], timeline: [], activity: [] }
  let queueStatus = 'approved'
  let errorMessage = null
  let executedAt = null
  const leadEmail = lead.email === undefined ? 'maria@example.com' : lead.email
  const leadTelegramChatId = lead.telegram_chat_id === undefined ? '12345' : lead.telegram_chat_id
  const payload = {
    leadId: 'lead-1',
    channel,
    email: leadEmail,
    subject: 'Следующий шаг',
    customerText: text,
    draftText: text,
    text,
    message: text,
    body: text,
    sequenceStep: 'followup_24h',
  }

  const queueRow = () => ({
    id: 'queue-1',
    workspace_id: 'workspace-1',
    lead_id: 'lead-1',
    worker_id: 'worker-1',
    worker_name: 'AI Worker',
    action_type: actionType,
    title: 'Customer-facing draft',
    recommendation: text,
    payload,
    status: queueStatus,
    approved_by: 'user-1',
    approved_at: new Date().toISOString(),
    executed_at: executedAt,
    error_message: errorMessage,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lead_name: 'Мария Кузнецова',
    lead_company: 'ACME',
    lead_email: leadEmail,
    lead_telegram: '',
    lead_telegram_chat_id: leadTelegramChatId,
    lead_status: 'qualified',
  })

  async function query(sql, params = []) {
    if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return { rows: [], rowCount: 0 }
    if (sql.includes('FROM ai_worker_queue q')) return { rows: [queueRow()], rowCount: 1 }
    if (sql.startsWith("UPDATE ai_worker_queue SET status = 'executing'")) {
      queueStatus = 'executing'
      errorMessage = null
      calls.queueUpdates.push({ status: queueStatus, error: null, params })
      return { rows: [], rowCount: 1 }
    }
    if (sql.startsWith('UPDATE ai_worker_queue SET status = $3')) {
      queueStatus = params[2]
      errorMessage = null
      executedAt = new Date().toISOString()
      calls.queueUpdates.push({ status: queueStatus, error: null, params })
      return { rows: [], rowCount: 1 }
    }
    if (sql.includes("UPDATE ai_worker_queue SET status = 'failed'")) {
      queueStatus = 'failed'
      errorMessage = params[2]
      calls.queueUpdates.push({ status: queueStatus, error: params[2], params })
      return { rows: [], rowCount: 1 }
    }
    if (sql.includes('FROM crm_leads') && sql.includes('telegram_chat_id')) {
      return { rows: [{ id: 'lead-1', user_id: 'owner-1', workspace_id: 'workspace-1', name: 'Мария Кузнецова', email: leadEmail, telegram_chat_id: leadTelegramChatId, metadata: {}, status: 'qualified' }], rowCount: 1 }
    }
    if (sql.includes('INSERT INTO lead_timeline_events')) {
      calls.timeline.push({ sql, params })
      return { rows: [{ id: `timeline-${calls.timeline.length}` }], rowCount: 1 }
    }
    if (sql.includes('INSERT INTO crm_activity')) {
      calls.activity.push({ sql, params })
      return { rows: [{ id: `activity-${calls.activity.length}` }], rowCount: 1 }
    }
    if (sql.includes('INSERT INTO ai_worker_queue(')) {
      calls.emailDraft = { sql, params }
      return { rows: [{ id: 'email-draft-1' }], rowCount: 1 }
    }
    throw new Error(`Unexpected query: ${sql}`)
  }

  require.cache[poolPath] = { id: poolPath, filename: poolPath, loaded: true, exports: { query, async connect() { return { query, release() {} } } } }
  require.cache[telegramPath] = { id: telegramPath, filename: telegramPath, loaded: true, exports: { sendTelegramMessageToLead: async (args) => { calls.telegram.push(args); return { telegramResponse: { ok: true, result: { message_id: 777, chat: { id: leadTelegramChatId } } }, chatId: leadTelegramChatId } } } }
  require.cache[emailPath] = { id: emailPath, filename: emailPath, loaded: true, exports: { sendEmailNow: async (userId, args) => { calls.email.push({ userId, args }); return { id: 'email-1', status: 'sent' } }, enqueueEmail: async () => { throw new Error('enqueueEmail should not be used in copy guard execution tests') } } }
  require.cache[crmModelPath] = { id: crmModelPath, filename: crmModelPath, loaded: true, exports: { createNote: async () => { throw new Error('createNote should not be used in copy guard execution tests') }, updateLead: async () => ({}) } }
  require.cache[timelinePath] = { id: timelinePath, filename: timelinePath, loaded: true, exports: { addTimelineEvent: async (_client, event) => { calls.timeline.push({ event }); return { id: `timeline-${calls.timeline.length}`, ...event } } } }
  require.cache[attachmentPath] = { id: attachmentPath, filename: attachmentPath, loaded: true, exports: { sendLeadAttachments: async () => { throw new Error('sendLeadAttachments should not be used in copy guard execution tests') } } }
  require.cache[googleCalendarPath] = { id: googleCalendarPath, filename: googleCalendarPath, loaded: true, exports: { createGoogleCalendarEvent: async () => ({ skipped: true }) } }
  require.cache[leadScoringPath] = { id: leadScoringPath, filename: leadScoringPath, loaded: true, exports: { scoreLead: async () => ({}) } }

  return { service: require(servicePath), calls, getStatus: () => queueStatus, getErrorMessage: () => errorMessage }
}

function testAssertCustomerSafeTextBlocksInternalTokens() {
  const { assertCustomerSafeText } = require('../src/services/customerCopyGuard')
  const unsafeCases = [
    'Контекст: лид просит цену',
    'Плюсы: быстрый ответ',
    'Минусы: нет бюджета',
    'Итог: 100/100',
    'ai_score: 100',
    'ai_priority: urgent',
    'ai_risk_level: high',
    'score is high',
    'intent is demo',
    'Добавить +8 за активность',
    'Добавить +18 за срочность',
  ]

  for (const value of unsafeCases) {
    assert.throws(() => assertCustomerSafeText(value), (error) => error.message === BLOCK_MESSAGE && error.code === 'COPY_GUARD_BLOCKED')
  }
  assert.strictEqual(assertCustomerSafeText(CLEAN_TEXT), CLEAN_TEXT)
}

async function assertUnsafeDraftIsBlocked(actionType, options = {}) {
  const { service, calls, getStatus, getErrorMessage } = installQueueMocks({ actionType, text: UNSAFE_TEXT, ...options })
  const result = await service.executeQueueItem('user-1', 'workspace-1', 'queue-1')

  assert.strictEqual(result.success, false, `${actionType} should fail`)
  assert.strictEqual(result.status, 'failed', `${actionType} result status`)
  assert.strictEqual(getStatus(), 'failed', `${actionType} queue status`)
  assert.strictEqual(result.error, BLOCK_MESSAGE, `${actionType} result error`)
  assert.strictEqual(getErrorMessage(), BLOCK_MESSAGE, `${actionType} stored error_message`)
  assert.strictEqual(calls.telegram.length, 0, `${actionType} must not send Telegram`)
  assert.strictEqual(calls.email.length, 0, `${actionType} must not send email`)
  assert.ok(calls.queueUpdates.some((update) => update.status === 'failed' && update.error === BLOCK_MESSAGE), `${actionType} failed update`)
}

async function testUnsafeCustomerFacingDraftsAreBlockedBeforeSend() {
  await assertUnsafeDraftIsBlocked('telegram_reply_draft')
  await assertUnsafeDraftIsBlocked('email_followup_draft', { channel: 'email' })
  await assertUnsafeDraftIsBlocked('followup_sequence_draft')
  await assertUnsafeDraftIsBlocked('telegram_meeting_confirmation_draft')
}

async function testCleanDraftCanBeSent() {
  const { service, calls, getStatus, getErrorMessage } = installQueueMocks({ actionType: 'telegram_reply_draft', text: CLEAN_TEXT })
  const result = await service.executeQueueItem('user-1', 'workspace-1', 'queue-1')

  assert.strictEqual(result.success, true)
  assert.strictEqual(result.status, 'completed')
  assert.strictEqual(getStatus(), 'completed')
  assert.strictEqual(getErrorMessage(), null)
  assert.strictEqual(calls.telegram.length, 1)
  assert.strictEqual(calls.telegram[0].text, CLEAN_TEXT)
  assert.strictEqual(calls.email.length, 0)
}

async function run() {
  testAssertCustomerSafeTextBlocksInternalTokens()
  await testUnsafeCustomerFacingDraftsAreBlockedBeforeSend()
  await testCleanDraftCanBeSent()
  console.log('copy guard tests passed')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
