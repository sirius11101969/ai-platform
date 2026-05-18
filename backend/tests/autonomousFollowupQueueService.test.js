const assert = require('assert')
const { createFollowupSequenceDrafts } = require('../src/services/autonomousFollowupQueueService')

function createMockClient({ duplicate = null } = {}) {
  const calls = []
  const staleDate = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
  return {
    calls,
    async query(sql, params) {
      calls.push({ sql, params })
      if (sql.includes('FROM crm_leads l') && sql.includes('JOIN latest_touch')) {
        return { rows: [{ id: 'lead-1', name: 'Владимир Иванов', email: 'v@example.com', telegram_chat_id: '123', status: 'qualified', last_message_at: staleDate, last_message_text: 'Спасибо, посмотрю', last_message_channel: 'telegram', last_message_direction: 'inbound' }] }
      }
      if (sql.includes('FROM information_schema.columns') && sql.includes("table_name = 'email_messages'")) return { rows: ['lead_id', 'created_at', 'direction', 'sent_at'].map((column_name) => ({ column_name })) }
      if (sql.includes('FROM information_schema.columns') && sql.includes("table_name = 'lead_timeline_events'")) return { rows: ['id', 'workspace_id', 'lead_id', 'event_type', 'title', 'created_at'].map((column_name) => ({ column_name })) }
      if (sql.includes('SELECT MAX(outbound_at) AS last_outbound_at')) return { rows: [{ last_outbound_at: null }] }
      if (sql.includes('SELECT id, lead_id, event_type, title, created_at FROM lead_timeline_events')) return { rows: [] }
      if (sql.includes('FROM ai_worker_queue') && sql.includes("payload->>'sequenceStep'")) return { rows: duplicate ? [duplicate] : [] }
      if (sql.includes('INSERT INTO ai_worker_queue')) return { rows: [{ id: 'queue-1', worker_id: params[0], workspace_id: params[1], run_id: params[2], lead_id: params[3], action_type: params[4], status: 'pending_approval', title: params[5], recommendation: params[6], payload: params[7] }] }
      if (sql.includes('INSERT INTO lead_timeline_events')) return { rows: [{ id: 'event-1', workspace_id: params[0], lead_id: params[1], user_id: params[2], event_type: params[3], title: params[4], body: params[5], source: params[6], metadata: params[7], created_at: new Date().toISOString() }] }
      throw new Error(`Unexpected query: ${sql}`)
    },
  }
}

async function run() {
  const client = createMockClient()
  const result = await createFollowupSequenceDrafts({ client, userId: 'user-1', workspaceId: 'workspace-1', workerId: 'worker-1', runId: 'run-1' })
  assert.strictEqual(result.createdCount, 1)
  assert.strictEqual(result.created[0].action_type, 'followup_sequence_draft')
  assert.strictEqual(result.created[0].status, 'pending_approval')
  assert.strictEqual(result.created[0].payload.sequenceStep, 'followup_24h')
  assert.strictEqual(result.created[0].payload.channel, 'telegram')
  assert.match(result.created[0].payload.suggestedText, /Владимир, добрый день!/) 
  assert.strictEqual(result.created[0].payload.noAutoSend, true)

  const duplicateClient = createMockClient({ duplicate: { id: 'existing', status: 'pending_approval' } })
  const duplicateResult = await createFollowupSequenceDrafts({ client: duplicateClient, userId: 'user-1', workspaceId: 'workspace-1', workerId: 'worker-1', runId: 'run-2' })
  assert.strictEqual(duplicateResult.createdCount, 0)
  assert.strictEqual(duplicateResult.skippedCount, 1)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
