const assert = require('assert')
const { createPeerConnectionPlaceholder, simulateNegotiation } = require('../src/services/realtimeTransport/realtimeAudioRouter')
const adapter = require('../src/services/realtimeTransport/openaiRealtimeAdapter')
const registry = require('../src/services/realtimeTransport/realtimeSessionRegistry')
const { publish, subscribe } = require('../src/services/realtimeTransport/webRtcSessionManager')

function testNegotiation() {
  const peer = createPeerConnectionPlaceholder()
  assert(peer.localSdp.includes('v=0'))
  assert(peer.iceCandidates.length > 0)
  const negotiated = simulateNegotiation('session-1')
  assert.strictEqual(negotiated.state, 'connected')
}

async function testAdapterLifecycle() {
  const session = await adapter.createSession({ workspaceId: 'workspace-1', leadId: 'lead-1' })
  assert.strictEqual(session.state, 'negotiating')
  const updated = await adapter.updateSession(session, { state: 'connected' })
  assert.strictEqual(updated.state, 'connected')
  const chunk = await adapter.mockAudioChunk({ id: 'session-1' }, { frame: 1 })
  assert.strictEqual(chunk.type, 'audio_chunk')
  const transcript = await adapter.mockTranscriptEvent({ id: 'session-1' }, 'hello', true)
  assert.strictEqual(transcript.type, 'transcript_partial')
  const closed = await adapter.closeSession(updated)
  assert.strictEqual(closed.state, 'closed')
}

function testEventStreamingAndRegistry() {
  registry.clearSessions()
  const session = registry.registerSession({ id: 'session-1', state: 'negotiating' })
  assert.strictEqual(registry.getSession('session-1').state, 'negotiating')
  registry.updateSession('session-1', { state: 'connected' })
  assert.strictEqual(registry.getSession('session-1').state, 'connected')
  const events = []
  const unsub = subscribe('session:session-1', (event) => events.push(event))
  publish('session:session-1', { eventType: 'interruption' })
  unsub()
  assert.strictEqual(events[0].eventType, 'interruption')
  registry.removeSession(session.id)
  assert.strictEqual(registry.getSession('session-1'), null)
}

async function main() {
  testNegotiation()
  await testAdapterLifecycle()
  testEventStreamingAndRegistry()
  console.log('realtimeTransportFoundation tests passed')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
