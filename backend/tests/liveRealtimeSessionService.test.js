const { test } = require('node:test')
const assert = require('node:assert/strict')

const { createLiveRealtimeStreamBus } = require('../src/services/liveRealtime/liveRealtimeStreamBus')
const { appendTranscript, computeLatency } = require('../src/services/liveRealtime/liveRealtimeTranscriptService')

test('transcript chunks append in order', () => {
  let transcript = []
  transcript = appendTranscript(transcript, { role: 'user', text: 'hello' })
  transcript = appendTranscript(transcript, { role: 'assistant', text: 'hi there' })
  assert.equal(transcript.length, 2)
  assert.equal(transcript[0].text, 'hello')
  assert.equal(transcript[1].role, 'assistant')
})

test('computeLatency reads session lifecycle from started to completed', () => {
  const events = [
    { eventType: 'session_started', createdAt: '2026-01-01T00:00:00.000Z' },
    { eventType: 'completed', createdAt: '2026-01-01T00:00:01.200Z' },
  ]
  assert.equal(computeLatency(events), 1200)
})

test('stream bus publishes and subscribes', async () => {
  const bus = createLiveRealtimeStreamBus()
  const got = await new Promise((resolve) => {
    const off = bus.subscribe('s1', (event) => { off(); resolve(event) })
    bus.publish('s1', { eventType: 'partial_transcript' })
  })
  assert.equal(got.eventType, 'partial_transcript')
})

test('simulation persists objection, meeting, crm actions, and conversation memory', async () => {
  const poolPath = require.resolve('../src/db/pool')
  const calls = []
  const mockedPool = {
    query: async (sql, params = []) => {
    calls.push({ sql, params })
    if (sql.includes('INSERT INTO ai_live_stream_sessions')) {
      return { rows: [{ id: '00000000-0000-4000-8000-000000000001', workspace_id: params[0], lead_id: params[1], realtime_voice_session_id: null, status: 'starting', stream_mode: 'sse', simulation_safety: {}, metadata: {}, latency_ms: 0, created_at: new Date().toISOString(), started_at: new Date().toISOString(), completed_at: null }] }
    }
    if (sql.includes('INSERT INTO ai_live_stream_events')) {
      return { rows: [{ id: 'evt-1', session_id: params[0], event_type: params[1], payload: JSON.parse(params[2]), created_at: new Date().toISOString() }] }
    }
    if (sql.includes('INSERT INTO ai_objection_events') || sql.includes('INSERT INTO ai_meeting_intents') || sql.includes('INSERT INTO ai_crm_action_suggestions') || sql.includes('INSERT INTO ai_conversation_memory')) {
      return { rows: [{ id: 'persist-1' }] }
    }
    if (sql.includes('UPDATE ai_live_stream_sessions')) return { rows: [], rowCount: 1 }
    if (sql.includes('INSERT INTO lead_timeline_events')) return { rows: [{ id: 'timeline-1' }], rowCount: 1 }
    if (sql.includes('SELECT * FROM ai_revenue_intelligence')) return { rows: [], rowCount: 0 }
    if (sql.includes('INSERT INTO ai_revenue_intelligence')) return { rows: [{ id: 'rev-1' }], rowCount: 1 }
    if (sql.includes('INSERT INTO ai_worker_queue')) return { rows: [{ id: 'worker-1' }], rowCount: 1 }
    throw new Error(`Unhandled SQL in test: ${sql}`)
    },
  }
  const originalPoolModule = require.cache[poolPath]
  require.cache[poolPath] = { id: poolPath, filename: poolPath, loaded: true, exports: mockedPool }
  const servicePath = require.resolve('../src/services/liveRealtime/liveRealtimeSessionService')
  delete require.cache[servicePath]
  const service = require('../src/services/liveRealtime/liveRealtimeSessionService')

  try {
    await service.createSession({
      workspaceId: '00000000-0000-4000-8000-0000000000aa',
      leadId: '00000000-0000-4000-8000-0000000000bb',
      userId: '00000000-0000-4000-8000-0000000000cc',
    })
    await new Promise((r) => setTimeout(r, 50))
  } finally {
    if (originalPoolModule) require.cache[poolPath] = originalPoolModule
    else delete require.cache[poolPath]
    delete require.cache[servicePath]
  }

  assert.ok(calls.some((c) => c.sql.includes('INSERT INTO ai_objection_events')), 'objection should persist')
  assert.ok(calls.some((c) => c.sql.includes('INSERT INTO ai_meeting_intents')), 'meeting should persist')
  assert.ok(calls.some((c) => c.sql.includes('INSERT INTO ai_crm_action_suggestions')), 'crm action should persist')
  assert.ok(calls.some((c) => c.sql.includes('INSERT INTO ai_conversation_memory')), 'conversation memory should persist')
})
