const pool = require('../../db/pool')
const { addTimelineEvent } = require('../timelineService')
const aiRevenueIntelligenceService = require('../aiRevenueIntelligenceService')
const { createRealtimeVoiceStateMachine } = require('./realtimeVoiceStateMachine')
const { realtimeVoiceEventBus, EVENT_TYPES } = require('./realtimeVoiceEventBus')
const { runMockRealtimeStream } = require('./realtimeVoiceStreamingService')

const DEFAULT_TRANSPORT = 'mock_stream'
const DEFAULT_PROVIDER = 'mock_realtime_provider'

function safeJson(value) {
  return JSON.stringify(value || {})
}

function normalizeSession(row = {}) {
  if (!row) return null
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    leadId: row.lead_id,
    leadName: row.lead_name || null,
    callId: row.call_id,
    status: row.status,
    transport: row.transport,
    provider: row.provider,
    sessionMetadata: row.session_metadata || {},
    latencyMs: Number(row.latency_ms || 0),
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  }
}

function normalizeEvent(row = {}) {
  if (!row) return null
  return {
    id: row.id,
    sessionId: row.session_id,
    eventType: row.event_type,
    payload: row.payload || {},
    createdAt: row.created_at,
  }
}

async function loadLead(executor, workspaceId, leadId) {
  const result = await executor.query('SELECT id, name, contact, phone, phone_number, status, value FROM crm_leads WHERE workspace_id = $1::uuid AND id = $2::uuid LIMIT 1', [workspaceId, leadId])
  return result.rows[0] || null
}

async function persistEvent(executor, { sessionId, eventType, payload = {} }) {
  const result = await executor.query(
    `INSERT INTO ai_realtime_voice_events(session_id, event_type, payload)
     VALUES($1::uuid, $2::text, $3::jsonb)
     RETURNING *`,
    [sessionId, eventType, safeJson(payload)]
  )
  return normalizeEvent(result.rows[0])
}

async function updateSessionState(executor, { sessionId, status, latencyMs = null, state = null, stateHistory = null, completedAt = null, metadataPatch = {} }) {
  const metadata = { ...metadataPatch }
  if (state) metadata.currentState = state
  if (stateHistory) metadata.stateHistory = stateHistory
  const result = await executor.query(
    `UPDATE ai_realtime_voice_sessions
        SET status = $2::text,
            latency_ms = COALESCE($3::integer, latency_ms),
            completed_at = COALESCE($4::timestamptz, completed_at),
            session_metadata = session_metadata || $5::jsonb
      WHERE id = $1::uuid
      RETURNING *`,
    [sessionId, status, latencyMs, completedAt, safeJson(metadata)]
  )
  return normalizeSession(result.rows[0])
}

async function createSessionRecord(executor, { workspaceId, leadId, callId = null, transport = DEFAULT_TRANSPORT, provider = DEFAULT_PROVIDER, metadata = {} }) {
  const result = await executor.query(
    `INSERT INTO ai_realtime_voice_sessions(workspace_id, lead_id, call_id, status, transport, provider, session_metadata, started_at)
     VALUES($1::uuid, $2::uuid, $3::uuid, 'initializing', $4::text, $5::text, $6::jsonb, NOW())
     RETURNING *`,
    [workspaceId, leadId, callId, transport, provider, safeJson({ ...metadata, mockMode: true, telephonyTrafficSent: false, microphoneStreaming: false })]
  )
  return normalizeSession(result.rows[0])
}

async function createRealtimeVoiceSession({ workspaceId, userId = null, leadId, callId = null, transport = DEFAULT_TRANSPORT, provider = DEFAULT_PROVIDER, metadata = {}, autoRun = true, client = null } = {}) {
  if (!workspaceId) throw Object.assign(new Error('workspaceId is required'), { statusCode: 400 })
  if (!leadId) throw Object.assign(new Error('leadId is required'), { statusCode: 400 })
  const executor = client || pool
  const lead = await loadLead(executor, workspaceId, leadId)
  if (!lead) throw Object.assign(new Error('Lead not found'), { statusCode: 404 })

  const session = await createSessionRecord(executor, { workspaceId, leadId, callId, transport, provider, metadata })
  await addTimelineEvent(executor, { workspaceId, leadId, userId, eventType: 'realtime_voice_started', title: 'Realtime voice simulation started', body: 'Simulation Mode: no real telephony or microphone streaming was used.', source: 'ai', metadata: { sessionId: session.id, transport, provider, mockMode: true } }).catch(() => null)
  if (!autoRun) return session
  return runRealtimeVoiceSimulation({ workspaceId, userId, sessionId: session.id, client: executor })
}

async function runRealtimeVoiceSimulation({ workspaceId, userId = null, sessionId, client = null } = {}) {
  const executor = client || pool
  const existing = await executor.query('SELECT * FROM ai_realtime_voice_sessions WHERE workspace_id = $1::uuid AND id = $2::uuid LIMIT 1', [workspaceId, sessionId])
  const session = normalizeSession(existing.rows[0])
  if (!session) throw Object.assign(new Error('Realtime voice session not found'), { statusCode: 404 })

  const stateMachine = createRealtimeVoiceStateMachine()
  const result = await runMockRealtimeStream({
    session,
    stateMachine,
    eventBus: realtimeVoiceEventBus,
    persistEvent: (event) => persistEvent(executor, event),
    updateSessionState: (patch) => updateSessionState(executor, patch),
  })

  await updateSessionState(executor, {
    sessionId,
    status: 'completed',
    latencyMs: result.latencyMs,
    completedAt: new Date().toISOString(),
    metadataPatch: {
      transcript: result.transcript,
      aiResponse: result.aiResponse,
      revenueBrainSignals: { engagementLift: 18, hotLeadLift: 10, qualificationConfidenceLift: 14 },
    },
  })

  await addTimelineEvent(executor, { workspaceId, leadId: session.leadId, userId, eventType: 'realtime_voice_interrupted', title: 'Realtime voice interruption simulated', body: 'The mock buyer interrupted the AI response and the session resumed safely.', source: 'ai', metadata: { sessionId, mockMode: true } }).catch(() => null)
  await addTimelineEvent(executor, { workspaceId, leadId: session.leadId, userId, eventType: 'realtime_voice_completed', title: 'Realtime voice simulation completed', body: `Realtime simulation completed in ${result.latencyMs} ms and updated Revenue Brain signals.`, source: 'ai', metadata: { sessionId, latencyMs: result.latencyMs, mockMode: true } }).catch(() => null)
  await aiRevenueIntelligenceService.analyzeLeadRevenueIntelligence({ workspaceId, userId, leadId: session.leadId, client: executor }).catch(() => null)
  return getRealtimeVoiceSession({ workspaceId, sessionId, client: executor })
}

async function listRealtimeVoiceSessions({ workspaceId, status = null, limit = 100, client = null } = {}) {
  const executor = client || pool
  const result = await executor.query(
    `SELECT s.*, l.name AS lead_name
       FROM ai_realtime_voice_sessions s
       JOIN crm_leads l ON l.id = s.lead_id AND l.workspace_id = s.workspace_id
      WHERE s.workspace_id = $1::uuid AND ($2::text IS NULL OR s.status = $2::text)
      ORDER BY s.created_at DESC
      LIMIT $3::integer`,
    [workspaceId, status, Math.min(Math.max(Number(limit) || 100, 1), 250)]
  )
  return result.rows.map(normalizeSession)
}

async function getRealtimeVoiceSession({ workspaceId, sessionId, client = null } = {}) {
  const executor = client || pool
  const sessionResult = await executor.query(
    `SELECT s.*, l.name AS lead_name
       FROM ai_realtime_voice_sessions s
       JOIN crm_leads l ON l.id = s.lead_id AND l.workspace_id = s.workspace_id
      WHERE s.workspace_id = $1::uuid AND s.id = $2::uuid
      LIMIT 1`,
    [workspaceId, sessionId]
  )
  const session = normalizeSession(sessionResult.rows[0])
  if (!session) throw Object.assign(new Error('Realtime voice session not found'), { statusCode: 404 })
  const events = await executor.query('SELECT * FROM ai_realtime_voice_events WHERE session_id = $1::uuid ORDER BY created_at ASC', [sessionId])
  return { ...session, events: events.rows.map(normalizeEvent) }
}

module.exports = {
  DEFAULT_TRANSPORT,
  DEFAULT_PROVIDER,
  EVENT_TYPES,
  createRealtimeVoiceSession,
  runRealtimeVoiceSimulation,
  listRealtimeVoiceSessions,
  getRealtimeVoiceSession,
  _private: { normalizeSession, normalizeEvent, persistEvent, updateSessionState, createSessionRecord },
}
