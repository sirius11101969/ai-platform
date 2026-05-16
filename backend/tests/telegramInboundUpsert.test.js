const assert = require('assert')
const pool = require('../src/db/pool')
const telegramService = require('../src/services/telegramService')

function compact(sql) {
  return String(sql).replace(/\s+/g, ' ').trim()
}

const lead = {
  id: 'lead-existing-1',
  user_id: 'user-1',
  workspace_id: 'workspace-1',
  name: 'Telegram Connect Test',
  email: null,
  phone: null,
  telegram: '@connect_test',
  telegram_id: '499557786',
  telegram_chat_id: '499557786',
  telegram_username: '@connect_test',
  telegram_first_name: 'Telegram',
  telegram_last_name: 'Test',
  first_name: 'Telegram',
  last_name: 'Test',
  first_message: 'original',
  last_message_at: new Date('2026-05-16T10:00:00.000Z'),
  last_seen_at: new Date('2026-05-16T10:00:00.000Z'),
  company: null,
  status: 'new',
  value: 0,
  source: 'crm',
  notes: null,
  metadata: {},
  created_at: new Date('2026-05-16T09:00:00.000Z'),
  updated_at: new Date('2026-05-16T10:00:00.000Z'),
}

async function runExistingChatIdTest() {
  const originalConnect = pool.connect.bind(pool)
  const queries = []
  const client = {
    query: async (sql, params = []) => {
      const query = compact(sql)
      queries.push({ query, params })

      if (query === 'BEGIN' || query === 'COMMIT' || query === 'ROLLBACK') return { rows: [], rowCount: 0 }
      if (query.startsWith('SELECT id, user_id, workspace_id') && query.includes('WHERE telegram_chat_id = $1') && query.includes('ORDER BY updated_at DESC')) {
        assert.strictEqual(params[0], '499557786')
        return { rows: [lead], rowCount: 1 }
      }
      if (query.startsWith('UPDATE crm_leads') && query.includes('SET last_message_at = $3::timestamptz')) {
        assert.strictEqual(params[1], lead.id)
        assert.strictEqual(params[4], lead.workspace_id)
        return { rows: [{ ...lead, last_message_at: params[2], metadata: params[3] }], rowCount: 1 }
      }
      if (query.startsWith('INSERT INTO crm_activity(')) return { rows: [], rowCount: 1 }
      if (query.startsWith('INSERT INTO crm_notes(')) return { rows: [{ id: 'note-1', lead_id: params[0], user_id: params[1], body: params[2], created_at: new Date() }], rowCount: 1 }
      if (query.startsWith('INSERT INTO telegram_messages(')) {
        assert.strictEqual(params[0], lead.id)
        assert.strictEqual(params[1], lead.user_id)
        assert.strictEqual(params[7], lead.workspace_id)
        assert.strictEqual(params[4], '499557786')
        return { rows: [{ id: 'telegram-message-1', lead_id: params[0], user_id: params[1], role: params[2], direction: 'inbound', message: params[3], telegram_chat_id: params[4], telegram_message_id: params[5], created_at: params[6] }], rowCount: 1 }
      }
      if (query.startsWith('INSERT INTO lead_timeline_events(')) return { rows: [{ id: 'timeline-1', workspace_id: params[0], lead_id: params[1], user_id: params[2], event_type: params[3], title: params[4], body: params[5], source: params[6], metadata: params[7], created_at: new Date() }], rowCount: 1 }
      if (query.startsWith('INSERT INTO ai_workers(')) return { rows: [{ id: 'worker-1' }], rowCount: 1 }
      if (query.startsWith('UPDATE ai_followup_jobs')) return { rows: [], rowCount: 0 }
      if (query.startsWith('SELECT id FROM ai_worker_queue') && query.includes("action_type = 'telegram_reply_analysis'")) return { rows: [], rowCount: 0 }
      if (query.startsWith('INSERT INTO ai_worker_queue') && query.includes("'telegram_reply_analysis'")) return { rows: [{ id: 'queue-analysis-1' }], rowCount: 1 }
      if (query.startsWith('SELECT id FROM ai_worker_queue') && query.includes("action_type = 'telegram_draft'")) return { rows: [{ id: 'queue-draft-existing' }], rowCount: 1 }
      if (query.startsWith('SELECT id FROM ai_worker_queue') && query.includes("action_type = 'stage_change_recommendation'")) return { rows: [], rowCount: 0 }

      throw new Error(`Unexpected query: ${query}`)
    },
    release: () => {},
  }

  pool.connect = async () => client
  try {
    const result = await telegramService._private.upsertLeadWithIncomingMessage({
      chatId: 499557786,
      userId: 499557786,
      username: 'connect_test',
      firstName: 'Telegram',
      lastName: 'Test',
      name: 'Telegram Test',
      text: 'Здравствуйте',
      messageId: 42,
      date: new Date('2026-05-16T12:00:00.000Z'),
    })

    assert.strictEqual(result.lead.id, lead.id)
    assert.strictEqual(result.isNew, false)
    assert.ok(queries.some(({ query }) => query.startsWith('INSERT INTO telegram_messages(')), 'inbound message should be inserted')
    assert.ok(queries.some(({ query }) => query.includes("'telegram_reply_analysis'")), 'telegram_reply_analysis queue item should be created')
    assert.ok(!queries.some(({ query }) => query.startsWith('INSERT INTO crm_leads(')), 'must not insert a lead when telegram_chat_id already exists')
    assert.ok(!queries.some(({ query }) => query.includes('telegram_chat_id = $12')), 'must not assign the same telegram_chat_id to another lead')
  } finally {
    pool.connect = originalConnect
  }
}

runExistingChatIdTest()
  .then(() => console.log('telegram inbound upsert tests passed'))
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
