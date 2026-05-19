const pool = require('../../db/pool')
const adapter = require('./openaiRealtimeAdapter')
const audioRouter = require('./realtimeAudioRouter')
const registry = require('./realtimeSessionRegistry')
const { publish, subscribe } = require('./webRtcSessionManager')
const aiRevenueIntelligenceService = require('../aiRevenueIntelligenceService')
const structuredLogger = require('../execution/structuredLogger')
const safeJson = (v) => JSON.stringify(v || {})

async function persistSession(session) {
  const result = await pool.query(`INSERT INTO ai_realtime_transport_sessions(workspace_id, lead_id, realtime_session_id, provider, transport, state, connection_quality, latency_ms, session_metadata)
    VALUES($1::uuid,$2::uuid,$3::text,$4::text,$5::text,$6::text,$7::text,$8::integer,$9::jsonb) RETURNING *`,
  [session.workspaceId, session.leadId, session.realtimeSessionId, session.provider, session.transport, session.state, session.connectionQuality, session.latencyMs, safeJson(session.sessionMetadata)])
  return result.rows[0]
}
async function persistEvent(transportSessionId, eventType, payload = {}) { await pool.query('INSERT INTO ai_realtime_transport_events(transport_session_id, event_type, payload) VALUES($1::uuid,$2::text,$3::jsonb)', [transportSessionId, eventType, safeJson(payload)]) }

async function startSimulation({ workspaceId, leadId }) {
  const base = await adapter.createSession({ workspaceId, leadId })
  const saved = await persistSession(base)
  const session = registry.registerSession({ ...base, id: saved.id })
  structuredLogger.info('realtime_transport_session_started', { workspaceId, leadId, sessionId: session.id, realtimeSessionId: session.realtimeSessionId, provider: session.provider, transport: session.transport, simulationMode: true })
  const flow = [
    { eventType: 'negotiation_started', payload: { state: 'negotiating', simulated: true } },
    { eventType: 'sdp_exchange', payload: { simulated: true } },
    { eventType: 'ice_candidates', payload: { simulated: true } },
    { eventType: 'transcript_chunk', payload: { text: 'Prospect: we need revenue visibility in real-time.', partial: true, simulated: true } },
    { eventType: 'ai_response_chunk', payload: { text: 'AI: understood, preparing real-time revenue summary now.', partial: true, simulated: true } },
    { eventType: 'interruption', payload: { reason: 'simulated_user_interrupt', simulated: true } },
    { eventType: 'resume', payload: { resumed: true, simulated: true } },
    { eventType: 'completed', payload: { state: 'connected', simulated: true } },
  ]
  const negotiation = audioRouter.simulateNegotiation(session.id)
  flow[1].payload = { ...flow[1].payload, offer: negotiation.negotiation.sdpOffer, answer: negotiation.negotiation.sdpAnswer }
  flow[2].payload = { ...flow[2].payload, candidates: negotiation.negotiation.iceCandidates }

  for (const item of flow) {
    await persistEvent(session.id, item.eventType, item.payload)
    publish(`session:${session.id}`, item)
  }
  registry.updateSession(session.id, { state: negotiation.state, sessionMetadata: { ...session.sessionMetadata, negotiation: negotiation.negotiation, lifecycle: flow.map((f) => f.eventType) } })
  structuredLogger.info('realtime_transport_negotiation', { workspaceId, leadId, sessionId: session.id, transport: negotiation.transport, state: negotiation.state, simulationMode: true })
  return registry.getSession(session.id)
}

async function completeSimulation(sessionId) {
  const session = registry.getSession(sessionId)
  if (!session) return null
  const closed = await adapter.closeSession(session)
  registry.updateSession(sessionId, { state: closed.state })
  publish(`session:${sessionId}`, { eventType: 'session_completed', payload: { state: 'closed' } })
  await persistEvent(sessionId, 'session_completed', { state: 'closed', simulated: true })
  structuredLogger.info('realtime_transport_completed', { workspaceId: session.workspaceId, leadId: session.leadId, sessionId, state: 'closed', simulationMode: true })
  await aiRevenueIntelligenceService.analyzeLeadRevenueIntelligence({ workspaceId: session.workspaceId, leadId: session.leadId }).catch(() => null)
  return registry.getSession(sessionId)
}

async function listSessions({ workspaceId }) {
  const result = await pool.query('SELECT * FROM ai_realtime_transport_sessions WHERE workspace_id = $1::uuid ORDER BY created_at DESC LIMIT 100', [workspaceId])
  return result.rows
}

async function getSession({ workspaceId, sessionId }) {
  const sessionResult = await pool.query('SELECT * FROM ai_realtime_transport_sessions WHERE workspace_id = $1::uuid AND id = $2::uuid LIMIT 1', [workspaceId, sessionId])
  const session = sessionResult.rows[0]
  if (!session) return null
  const eventsResult = await pool.query('SELECT id, event_type, payload, created_at FROM ai_realtime_transport_events WHERE transport_session_id = $1::uuid ORDER BY created_at ASC', [sessionId])
  return { ...session, events: eventsResult.rows }
}

module.exports = { startSimulation, completeSimulation, listSessions, getSession, subscribe }
