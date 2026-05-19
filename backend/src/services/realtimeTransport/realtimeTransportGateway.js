const pool = require('../../db/pool')
const adapter = require('./openaiRealtimeAdapter')
const audioRouter = require('./realtimeAudioRouter')
const registry = require('./realtimeSessionRegistry')
const { publish, subscribe } = require('./webRtcSessionManager')
const aiRevenueIntelligenceService = require('../aiRevenueIntelligenceService')
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
  publish(`session:${session.id}`, { eventType: 'session_created', session })
  const negotiation = audioRouter.simulateNegotiation(session.id)
  registry.updateSession(session.id, { state: negotiation.state, sessionMetadata: { ...session.sessionMetadata, negotiation: negotiation.negotiation } })
  await persistEvent(session.id, 'transport_negotiated', negotiation)
  publish(`session:${session.id}`, { eventType: 'transport_negotiated', payload: negotiation })
  return registry.getSession(session.id)
}

async function completeSimulation(sessionId) {
  const session = registry.getSession(sessionId)
  if (!session) return null
  const closed = await adapter.closeSession(session)
  registry.updateSession(sessionId, { state: closed.state })
  publish(`session:${sessionId}`, { eventType: 'session_completed', payload: { state: 'closed' } })
  await aiRevenueIntelligenceService.analyzeLeadRevenueIntelligence({ workspaceId: session.workspaceId, leadId: session.leadId }).catch(() => null)
  return registry.getSession(sessionId)
}
module.exports = { startSimulation, completeSimulation, subscribe }
