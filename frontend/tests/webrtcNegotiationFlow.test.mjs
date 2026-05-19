import assert from 'node:assert/strict'
import { createWebrtcNegotiationService } from '../src/services/webrtc/webrtcNegotiationService.js'

class FakeRTCPeerConnection {
  constructor() {
    this.connectionState = 'new'
    this.iceGatheringState = 'new'
    this.signalingState = 'stable'
    this.localDescription = null
    this.remoteDescription = null
    this.senders = []
  }
  addTrack(track) { const sender = { track }; this.senders.push(sender); return sender }
  removeTrack(sender) { this.senders = this.senders.filter((s) => s !== sender) }
  async createOffer() { return { type: 'offer', sdp: 'fake-offer' } }
  async setLocalDescription(offer) { this.localDescription = offer }
  async setRemoteDescription(answer) { this.remoteDescription = answer }
  close() { this.connectionState = 'closed' }
}

function fakeStream() { return { getAudioTracks: () => [{ id: 'track-1', kind: 'audio' }] } }

async function run() {
  const events = []
  const service = createWebrtcNegotiationService({ providerMode: 'simulation', onEvent: (e) => events.push(e), RTCPeerConnectionImpl: FakeRTCPeerConnection })

  const peer = service.preparePeerConnection()
  assert.ok(peer)
  assert.equal(service.getState().peerConnectionState, 'new')

  await service.attachLocalAudioTrack(fakeStream(), { enabled: false })
  assert.equal(service.getState().localAudioTrackReady, false)

  await service.attachLocalAudioTrack(fakeStream(), { enabled: true })
  assert.equal(service.getState().localAudioTrackReady, true)

  const offer = await service.createLocalOffer()
  assert.equal(offer.type, 'offer')
  assert.equal(service.getState().offerCreated, true)
  assert.equal(service.getState().simulatedAnswerApplied, true)

  peer.onicecandidate?.({ candidate: { candidate: 'a=candidate:1' } })
  assert.equal(service.getState().iceCandidateCount, 1)

  service.close()
  assert.equal(service.getState().peerConnectionState, 'idle')
  assert.ok(events.find((e) => e.eventType === 'webrtc_peer_created'))
  assert.ok(events.find((e) => e.eventType === 'sdp_offer_created'))
  assert.ok(events.find((e) => e.eventType === 'simulated_sdp_answer_applied'))
  assert.ok(events.find((e) => e.eventType === 'ice_candidate_detected'))
  assert.ok(events.find((e) => e.eventType === 'webrtc_connection_closed'))
  console.log('webrtcNegotiationFlow.test.mjs passed')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
