const DEFAULT_PROVIDER = 'openai_realtime_simulation'
const buildSessionId = () => `rt_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`
async function createSession({ workspaceId, leadId, transport = 'webrtc', metadata = {} } = {}) { return { realtimeSessionId: buildSessionId(), provider: DEFAULT_PROVIDER, transport, state: 'negotiating', workspaceId, leadId, connectionQuality: 'simulated_good', latencyMs: 42, sessionMetadata: { ...metadata, mode: 'simulation', microphoneStreaming: false, telephonyEnabled: false, openaiAudioStreaming: false } } }
async function updateSession(session, patch = {}) { return { ...session, ...patch, sessionMetadata: { ...(session.sessionMetadata || {}), ...(patch.sessionMetadata || {}) } } }
async function closeSession(session) { return { ...session, state: 'closed', closedAt: new Date().toISOString() } }
async function mockAudioChunk(session, chunk = {}) { return { type: 'audio_chunk', sessionId: session.id, payload: { ...chunk, simulated: true } } }
async function mockTranscriptEvent(session, text, partial = true) { return { type: partial ? 'transcript_partial' : 'transcript_final', sessionId: session.id, payload: { text, simulated: true } } }
module.exports = { DEFAULT_PROVIDER, createSession, updateSession, closeSession, mockAudioChunk, mockTranscriptEvent }
