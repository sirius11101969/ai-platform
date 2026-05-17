const assert = require('assert')
const path = require('path')

function installMocks({ lead, payload = {}, status = 'approved', telegramError = null } = {}) {
  const servicePath = path.resolve(__dirname, '../src/services/aiApprovalQueueService.js')
  const poolPath = path.resolve(__dirname, '../src/db/pool.js')
  const telegramPath = path.resolve(__dirname, '../src/services/telegramService.js')
  const crmModelPath = path.resolve(__dirname, '../src/models/crmModel.js')
  const timelinePath = path.resolve(__dirname, '../src/services/timelineService.js')
  const emailPath = path.resolve(__dirname, '../src/services/emailService.js')

  delete require.cache[servicePath]
  delete require.cache[poolPath]
  delete require.cache[telegramPath]
  delete require.cache[crmModelPath]
  delete require.cache[timelinePath]
  delete require.cache[emailPath]

  const calls = { telegram: [], email: [], queueUpdates: [], timeline: [], activity: [], telegramMessages: [], emailDrafts: [] }
  let queueStatus = status
  let executedAt = null
  const queuePayload = {
    leadId: 'lead-1',
    channel: 'telegram',
    suggestedText: 'Мария, добрый день! Возвращаюсь с follow-up.',
    sequenceStep: 'followup_24h',
    ...payload,
  }

  const queueRow = () => ({
    id: 'queue-1',
    workspace_id: 'workspace-1',
    lead_id: queuePayload.leadId,
    worker_id: 'worker-1',
    worker_name: 'AI Follow-up Engine',
    action_type: 'followup_sequence_draft',
    title: 'Follow-up followup_24h — Мария Кузнецова',
    recommendation: 'Fallback recommendation',
    payload: queuePayload,
    status: queueStatus,
    approved_by: 'user-1',
    approved_at: new Date().toISOString(),
    executed_at: executedAt,
    error_message: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lead_name: lead?.name || 'Мария Кузнецова',
    lead_company: 'ACME',
    lead_email: lead?.email || '',
    lead_telegram: '',
    lead_telegram_chat_id: lead?.telegram_chat_id || '',
    lead_status: 'qualified',
  })

  async function query(sql, params = []) {
    if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return { rows: [], rowCount: 0 }
    if (sql.includes('FROM ai_worker_queue q')) return { rows: [queueRow()], rowCount: 1 }
    if (sql.startsWith("UPDATE ai_worker_queue SET status = 'executing'")) {
      queueStatus = 'executing'
      calls.queueUpdates.push({ status: queueStatus, params })
      return { rows: [], rowCount: 1 }
    }
    if (sql.startsWith('UPDATE ai_worker_queue SET status = $3')) {
      queueStatus = params[2]
      executedAt = new Date().toISOString()
      calls.queueUpdates.push({ status: queueStatus, params })
      return { rows: [], rowCount: 1 }
    }
    if (sql.includes("UPDATE ai_worker_queue SET status = 'failed'")) {
      queueStatus = 'failed'
      calls.queueUpdates.push({ status: queueStatus, error: params[2], params })
      return { rows: [], rowCount: 1 }
    }
    if (sql.includes('FROM crm_leads') && sql.includes('telegram_chat_id')) {
      return { rows: lead ? [{ id: 'lead-1', user_id: 'owner-1', workspace_id: 'workspace-1', name: lead.name || 'Мария Кузнецова', email: lead.email || '', telegram_chat_id: lead.telegram_chat_id || '', metadata: lead.metadata || {}, status: 'qualified' }] : [], rowCount: lead ? 1 : 0 }
    }
    if (sql.includes('INSERT INTO ai_worker_queue(')) {
      calls.emailDrafts.push({ sql, params })
      return { rows: [{ id: `email-draft-${calls.emailDrafts.length}` }], rowCount: 1 }
    }
    if (sql.startsWith('INSERT INTO telegram_messages(')) {
      calls.telegramMessages.push({ sql, params })
      return { rows: [{
        id: `telegram-message-${calls.telegramMessages.length}`,
        lead_id: params[0],
        user_id: params[1],
        workspace_id: params[7],
        role: params[2],
        direction: params[2] === 'user' ? 'inbound' : 'outbound',
        message: params[3],
        telegram_chat_id: params[4],
        telegram_message_id: params[5],
        created_at: new Date().toISOString(),
      }], rowCount: 1 }
    }
    if (sql.includes('INSERT INTO lead_timeline_events')) {
      calls.timeline.push({ sql, params })
      return { rows: [{ id: `timeline-${calls.timeline.length}` }], rowCount: 1 }
    }
    if (sql.includes('INSERT INTO crm_activity')) {
      calls.activity.push({ sql, params })
      return { rows: [{ id: `activity-${calls.activity.length}` }], rowCount: 1 }
    }
    throw new Error(`Unexpected query: ${sql}`)
  }

  const fakePool = {
    query,
    async connect() {
      return { query, release() {} }
    },
  }

  require.cache[poolPath] = { id: poolPath, filename: poolPath, loaded: true, exports: fakePool }
  require.cache[telegramPath] = { id: telegramPath, filename: telegramPath, loaded: true, exports: {
    sendTelegramMessageToLead: async (args) => {
      calls.telegram.push(args)
      if (telegramError) throw telegramError
      return { telegramResponse: { ok: true, result: { message_id: 777, chat: { id: lead?.telegram_chat_id } } }, chatId: lead?.telegram_chat_id }
    },
  } }
  require.cache[emailPath] = { id: emailPath, filename: emailPath, loaded: true, exports: {
    enqueueEmail: async (userId, args) => {
      calls.email.push({ userId, args })
      return { id: 'email-1', status: 'queued' }
    },
    sendEmailNow: async () => { throw new Error('sendEmailNow should not be used for followup_sequence_draft') },
  } }
  require.cache[timelinePath] = { id: timelinePath, filename: timelinePath, loaded: true, exports: {
    addTimelineEvent: async (_client, event) => {
      calls.timeline.push({ event })
      return { id: `timeline-${calls.timeline.length}`, ...event }
    },
  } }

  return { service: require(servicePath), calls, getStatus: () => queueStatus }
}

async function testTelegramFollowupExecutesAndCompletes() {
  const { service, calls, getStatus } = installMocks({ lead: { telegram_chat_id: '12345', email: 'maria@example.com' } })
  const result = await service.executeQueueItem('user-1', 'workspace-1', 'queue-1')

  assert.strictEqual(result.success, true)
  assert.strictEqual(result.status, 'completed')
  assert.strictEqual(getStatus(), 'completed')
  assert.strictEqual(calls.telegram.length, 1)
  assert.strictEqual(calls.telegram[0].actionId, 'queue-1')
  assert.strictEqual(calls.telegram[0].leadId, 'lead-1')
  assert.match(calls.telegram[0].text, /Мария, добрый день/)
  assert.strictEqual(calls.telegramMessages.length, 1)
  assert.match(calls.telegramMessages[0].sql, /INSERT INTO telegram_messages/)
  assert.strictEqual(calls.telegramMessages[0].params[0], 'lead-1')
  assert.strictEqual(calls.telegramMessages[0].params[2], 'assistant')
  assert.strictEqual(calls.telegramMessages[0].params[3], 'Мария, добрый день! Возвращаюсь с follow-up.')
  assert.strictEqual(calls.telegramMessages[0].params[4], '12345')
  assert.strictEqual(calls.telegramMessages[0].params[5], '777')
  assert.ok(calls.timeline.some((call) => call.event?.eventType === 'followup_sent' && call.event.title === 'Follow-up отправлен'))
}


async function testTelegramSendFailureDoesNotCreateSuccessTimeline() {
  const { service, calls, getStatus } = installMocks({ lead: { telegram_chat_id: '12345', email: 'maria@example.com' }, telegramError: new Error('Telegram API unavailable') })
  const result = await service.executeQueueItem('user-1', 'workspace-1', 'queue-1')

  assert.strictEqual(result.success, false)
  assert.strictEqual(result.status, 'failed')
  assert.strictEqual(getStatus(), 'failed')
  assert.strictEqual(result.error, 'Telegram API unavailable')
  assert.strictEqual(calls.telegram.length, 1)
  assert.strictEqual(calls.telegramMessages.length, 0)
  assert.ok(!calls.timeline.some((call) => call.event?.eventType === 'followup_sent'))
  assert.ok(calls.queueUpdates.some((update) => update.status === 'failed' && update.error === 'Telegram API unavailable'))
}

async function testEmailFollowupCreatesDraftAndCompletes() {
  const { service, calls, getStatus } = installMocks({
    lead: { telegram_chat_id: '12345', email: 'maria@example.com' },
    payload: { channel: 'email', subject: 'Следующий шаг' },
  })
  const result = await service.executeQueueItem('user-1', 'workspace-1', 'queue-1')

  assert.strictEqual(result.success, true)
  assert.strictEqual(result.status, 'completed')
  assert.strictEqual(getStatus(), 'completed')
  assert.strictEqual(calls.telegram.length, 0)
  assert.strictEqual(calls.telegramMessages.length, 0)
  assert.strictEqual(calls.email.length, 0)
  assert.strictEqual(calls.emailDrafts.length, 1)
  assert.match(calls.emailDrafts[0].sql, /INSERT INTO ai_worker_queue/)
  assert.strictEqual(calls.emailDrafts[0].params[3], 'email_followup_draft')
  assert.strictEqual(calls.emailDrafts[0].params[4], 'Email follow-up — Мария Кузнецова')
  assert.strictEqual(calls.emailDrafts[0].params[5], 'Мария, добрый день! Возвращаюсь с follow-up.')
  assert.deepStrictEqual(calls.emailDrafts[0].params[6], {
    leadId: 'lead-1',
    email: 'maria@example.com',
    subject: 'Следующий шаг',
    body: 'Мария, добрый день! Возвращаюсь с follow-up.',
    customerText: 'Мария, добрый день! Возвращаюсь с follow-up.',
    draftText: 'Мария, добрый день! Возвращаюсь с follow-up.',
    text: 'Мария, добрый день! Возвращаюсь с follow-up.',
    message: 'Мария, добрый день! Возвращаюсь с follow-up.',
    channel: 'email',
    sourceFollowupActionId: 'queue-1',
    sequenceStep: 'followup_24h',
  })
  assert.ok(calls.timeline.some((call) => call.event?.eventType === 'followup_email_drafted' && call.event.title === 'Email follow-up подготовлен'))
}

async function testEmailFollowupWithoutEmailFailsClearly() {
  const { service, calls, getStatus } = installMocks({ lead: { telegram_chat_id: '', email: '' }, payload: { channel: 'email' } })
  const result = await service.executeQueueItem('user-1', 'workspace-1', 'queue-1')

  assert.strictEqual(result.success, false)
  assert.strictEqual(result.status, 'failed')
  assert.strictEqual(getStatus(), 'failed')
  assert.strictEqual(result.error, 'No email available for follow-up')
  assert.strictEqual(calls.telegram.length, 0)
  assert.strictEqual(calls.telegramMessages.length, 0)
  assert.strictEqual(calls.emailDrafts.length, 0)
  assert.ok(calls.queueUpdates.some((update) => update.status === 'failed' && update.error === 'No email available for follow-up'))
}

async function testPriorityInboxDirtyFollowupRegeneratesCleanCustomerText() {
  const { service, calls, getStatus } = installMocks({
    lead: { telegram_chat_id: '12345', email: 'maria@example.com' },
    payload: {
      source: 'priority_inbox',
      suggestedText: 'Контекст: Плюсы: +8 недавний inbound, +18 цена + demo intent. Итог: 100/100 priority/urgent risk confidence score',
      draftText: 'Контекст: Плюсы: +8 недавний inbound, +18 цена + demo intent. Итог: 100/100 priority/urgent risk confidence score',
      nextBestActionCode: 'send_pricing',
      nextBestAction: 'Отправить pricing',
    },
  })
  const result = await service.executeQueueItem('user-1', 'workspace-1', 'queue-1')

  assert.strictEqual(result.success, true)
  assert.strictEqual(getStatus(), 'completed')
  assert.strictEqual(calls.telegram.length, 1)
  assert.strictEqual(calls.telegram[0].text, 'Здравствуйте! Могу отправить краткую информацию по тарифам и показать, какой вариант лучше подойдёт под вашу задачу.')
  assert.ok(!/Плюсы:|Минусы:|Итог:|ai_score|score|intent|\+\d+/i.test(calls.telegram[0].text))
}

async function testNonPriorityDirtyFollowupIsBlockedBeforeSend() {
  const { service, calls, getStatus } = installMocks({
    lead: { telegram_chat_id: '12345', email: 'maria@example.com' },
    payload: { suggestedText: 'Контекст: Плюсы: +8 intent score' },
  })
  const result = await service.executeQueueItem('user-1', 'workspace-1', 'queue-1')

  assert.strictEqual(result.success, false)
  assert.strictEqual(getStatus(), 'failed')
  assert.strictEqual(result.error, 'Outbound text contains internal AI context and was blocked')
  assert.strictEqual(calls.telegram.length, 0)
  assert.ok(calls.queueUpdates.some((update) => update.status === 'failed' && update.error === 'Outbound text contains internal AI context and was blocked'))
}

async function run() {
  await testTelegramFollowupExecutesAndCompletes()
  await testTelegramSendFailureDoesNotCreateSuccessTimeline()
  await testEmailFollowupCreatesDraftAndCompletes()
  await testEmailFollowupWithoutEmailFailsClearly()
  await testPriorityInboxDirtyFollowupRegeneratesCleanCustomerText()
  await testNonPriorityDirtyFollowupIsBlockedBeforeSend()
  console.log('ai approval queue followup execute tests passed')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
