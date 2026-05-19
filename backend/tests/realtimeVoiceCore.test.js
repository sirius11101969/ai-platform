const assert = require('assert')
const { createRealtimeVoiceStateMachine, STATES } = require('../src/services/realtimeVoice/realtimeVoiceStateMachine')
const { createRealtimeVoiceEventBus, EVENT_TYPES } = require('../src/services/realtimeVoice/realtimeVoiceEventBus')
const { runMockRealtimeStream } = require('../src/services/realtimeVoice/realtimeVoiceStreamingService')
const realtimeVoiceSessionManager = require('../src/services/realtimeVoice/realtimeVoiceSessionManager')

function testStateMachineTransitions() {
  const machine = createRealtimeVoiceStateMachine()
  assert.strictEqual(machine.state, STATES.IDLE)
  machine.transition(STATES.LISTENING)
  machine.transition(STATES.PROCESSING)
  machine.transition(STATES.SPEAKING)
  machine.transition(STATES.INTERRUPTED)
  machine.transition(STATES.LISTENING)
  machine.transition(STATES.PROCESSING)
  machine.transition(STATES.SPEAKING)
  machine.transition(STATES.COMPLETED)
  assert.strictEqual(machine.state, STATES.COMPLETED)
  assert.throws(() => machine.transition(STATES.LISTENING), /Invalid realtime voice transition/)
}

function testEventBusPublishSubscribe() {
  const bus = createRealtimeVoiceEventBus()
  const received = []
  const unsubscribeAll = bus.subscribe('*', (event) => received.push(event))
  const unsubscribeSession = bus.subscribeToSession('session-1', (event) => received.push({ ...event, scoped: true }))
  bus.publish(EVENT_TYPES.TRANSCRIPT_PARTIAL, { sessionId: 'session-1', text: 'partial' })
  unsubscribeAll()
  unsubscribeSession()
  assert(received.some((event) => event.eventType === EVENT_TYPES.TRANSCRIPT_PARTIAL))
  assert(received.some((event) => event.scoped === true))
}

async function testStreamingTranscriptAndInterruptionFlow() {
  const machine = createRealtimeVoiceStateMachine()
  const persisted = []
  const updates = []
  const result = await runMockRealtimeStream({
    session: { id: 'session-1', transport: 'mock_stream', provider: 'mock_realtime_provider' },
    stateMachine: machine,
    eventBus: createRealtimeVoiceEventBus(),
    persistEvent: async (event) => persisted.push(event),
    updateSessionState: async (patch) => updates.push(patch),
  })
  assert.strictEqual(machine.state, STATES.COMPLETED)
  assert(result.transcript.includes('AI:'))
  assert(persisted.some((event) => event.eventType === EVENT_TYPES.TRANSCRIPT_PARTIAL))
  assert(persisted.some((event) => event.eventType === EVENT_TYPES.TRANSCRIPT_FINAL))
  assert(persisted.some((event) => event.eventType === EVENT_TYPES.AI_RESPONSE_CHUNK))
  assert(persisted.some((event) => event.eventType === EVENT_TYPES.INTERRUPTION))
  assert(updates.some((update) => update.status === 'interrupted'))
  assert(updates.at(-1).status === 'completed')
}

function createRealtimeClient() {
  const state = {
    sessions: [],
    events: [],
    timeline: [],
    scores: [],
    lead: { id: '11111111-1111-4111-8111-111111111111', workspace_id: '22222222-2222-4222-8222-222222222222', user_id: '33333333-3333-4333-8333-333333333333', name: 'Realtime Buyer', contact: '+15551234567', status: 'qualified', value: 90000 },
  }
  return {
    state,
    async query(sql, params = []) {
      if (sql.includes('FROM crm_leads') && sql.includes('LIMIT 1')) return { rows: [state.lead], rowCount: 1 }
      if (sql.includes('SELECT * FROM crm_leads')) return { rows: [state.lead], rowCount: 1 }
      if (sql.includes('INSERT INTO ai_realtime_voice_sessions')) {
        const row = { id: '44444444-4444-4444-8444-444444444444', workspace_id: params[0], lead_id: params[1], call_id: params[2], status: 'initializing', transport: params[3], provider: params[4], session_metadata: JSON.parse(params[5]), started_at: new Date().toISOString(), completed_at: null, created_at: new Date().toISOString() }
        state.sessions.push(row)
        return { rows: [row], rowCount: 1 }
      }
      if (sql.includes('INSERT INTO ai_realtime_voice_events')) {
        const row = { id: `event-${state.events.length + 1}`, session_id: params[0], event_type: params[1], payload: JSON.parse(params[2]), created_at: new Date().toISOString() }
        state.events.push(row)
        return { rows: [row], rowCount: 1 }
      }
      if (sql.includes('UPDATE ai_realtime_voice_sessions')) {
        const session = state.sessions.find((item) => item.id === params[0])
        session.status = params[1]
        session.latency_ms = params[2] ?? session.latency_ms
        session.completed_at = params[3] || session.completed_at
        session.session_metadata = { ...session.session_metadata, ...JSON.parse(params[4]) }
        return { rows: [session], rowCount: 1 }
      }
      if (sql.includes('SELECT * FROM ai_realtime_voice_sessions')) return { rows: state.sessions, rowCount: state.sessions.length }
      if (sql.includes('SELECT s.*, l.name AS lead_name') && sql.includes('s.id = $2')) return { rows: [{ ...state.sessions[0], lead_name: state.lead.name }], rowCount: 1 }
      if (sql.includes('SELECT s.*, l.name AS lead_name')) return { rows: state.sessions.map((session) => ({ ...session, lead_name: state.lead.name })), rowCount: state.sessions.length }
      if (sql.includes('SELECT * FROM ai_realtime_voice_events')) return { rows: state.events, rowCount: state.events.length }
      if (sql.includes('INSERT INTO lead_timeline_events')) {
        const row = { id: `timeline-${state.timeline.length + 1}`, workspace_id: params[0], lead_id: params[1], user_id: params[2], event_type: params[3], title: params[4], body: params[5], source: params[6], metadata: params[7], created_at: new Date().toISOString() }
        state.timeline.push(row)
        return { rows: [row], rowCount: 1 }
      }
      if (sql.includes('SELECT * FROM telegram_messages')) return { rows: [], rowCount: 0 }
      if (sql.includes('SELECT * FROM email_messages')) return { rows: [], rowCount: 0 }
      if (sql.includes('SELECT * FROM crm_meetings')) return { rows: [], rowCount: 0 }
      if (sql.includes('SELECT * FROM ai_lead_sequences')) return { rows: [], rowCount: 0 }
      if (sql.includes('SELECT * FROM lead_timeline_events')) return { rows: state.timeline, rowCount: state.timeline.length }
      if (sql.includes('SELECT * FROM crm_followups')) return { rows: [], rowCount: 0 }
      if (sql.includes('SELECT * FROM ai_voice_calls')) return { rows: [], rowCount: 0 }
      if (sql.includes('SELECT * FROM ai_realtime_voice_sessions WHERE workspace_id')) return { rows: state.sessions, rowCount: state.sessions.length }
      if (sql.includes('INSERT INTO ai_workers')) return { rows: [{ id: 'worker-1' }], rowCount: 1 }
      if (sql.includes('INSERT INTO ai_lead_scores')) {
        const row = { id: 'score-1', workspace_id: params[0], lead_id: params[1], priority_score: params[2], close_probability: params[3], engagement_score: params[4], churn_risk: params[5], pipeline_health: params[6], recommended_action: params[7], recommended_channel: params[8], reasoning_summary: params[9], model: params[10], created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        state.scores.push(row)
        return { rows: [row], rowCount: 1 }
      }
      if (sql.includes('UPDATE crm_leads')) return { rows: [], rowCount: 1 }
      if (sql.includes('INSERT INTO ai_worker_queue')) return { rows: [], rowCount: 1 }
      throw new Error(`Unhandled SQL: ${sql}`)
    },
  }
}

async function testSessionPersistenceAndRevenueBrainTimeline() {
  const client = createRealtimeClient()
  const session = await realtimeVoiceSessionManager.createRealtimeVoiceSession({ workspaceId: '22222222-2222-4222-8222-222222222222', userId: '33333333-3333-4333-8333-333333333333', leadId: '11111111-1111-4111-8111-111111111111', client })
  assert.strictEqual(session.status, 'completed')
  assert(client.state.events.some((event) => event.event_type === 'session_start'))
  assert(client.state.events.some((event) => event.event_type === 'interruption'))
  assert(client.state.events.some((event) => event.event_type === 'completed'))
  assert(client.state.timeline.some((event) => event.event_type === 'realtime_voice_started'))
  assert(client.state.timeline.some((event) => event.event_type === 'realtime_voice_interrupted'))
  assert(client.state.timeline.some((event) => event.event_type === 'realtime_voice_completed'))
  assert(client.state.scores[0].engagement_score >= 38, 'realtime session should lift Revenue Brain engagement')
}

async function main() {
  testStateMachineTransitions()
  testEventBusPublishSubscribe()
  await testStreamingTranscriptAndInterruptionFlow()
  await testSessionPersistenceAndRevenueBrainTimeline()
  console.log('realtimeVoiceCore tests passed')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
