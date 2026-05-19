import { createWebrtcPeerConnectionManager } from './webrtcPeerConnectionManager.js'
import { createRealtimeAudioTrackManager } from './realtimeAudioTrackManager.js'
import { createRealtimeConnectionStateService } from './realtimeConnectionStateService.js'

function makeSimulatedAnswer() {
  return { type: 'answer', sdp: 'v=0\r\no=simulation 0 0 IN IP4 127.0.0.1\r\ns=AI Platform Simulation\r\nt=0 0\r\n' }
}

export function createWebrtcNegotiationService({ providerMode = 'simulation', onEvent, RTCPeerConnectionImpl } = {}) {
  const stateService = createRealtimeConnectionStateService({ simulationTransport: providerMode === 'simulation' })
  const peerManager = createWebrtcPeerConnectionManager({ onEvent, RTCPeerConnectionImpl })
  const audioManager = createRealtimeAudioTrackManager({ onEvent })

  function emit(eventType, payload = {}) { if (typeof onEvent === 'function') onEvent({ eventType, payload, createdAt: new Date().toISOString() }) }

  function bindPeerState(peer) {
    peer.onconnectionstatechange = () => stateService.update({ peerConnectionState: peer.connectionState })
    peer.onicegatheringstatechange = () => stateService.update({ iceGatheringState: peer.iceGatheringState })
    peer.onsignalingstatechange = () => stateService.update({ signalingState: peer.signalingState })
    peer.onicecandidate = (event) => {
      if (!event.candidate) return
      const nextCount = stateService.getState().iceCandidateCount + 1
      stateService.update({ iceCandidateCount: nextCount })
      emit('ice_candidate_detected', { candidate: event.candidate.candidate, index: nextCount })
    }
  }

  return {
    getState: stateService.getState,
    subscribe: stateService.subscribe,
    preparePeerConnection(configuration = {}) {
      const peer = peerManager.create(configuration)
      bindPeerState(peer)
      stateService.update({ peerConnectionState: peer.connectionState, iceGatheringState: peer.iceGatheringState, signalingState: peer.signalingState })
      return peer
    },
    async attachLocalAudioTrack(mediaStream, { enabled = false } = {}) {
      if (!enabled) return null
      const peer = peerManager.getPeer()
      if (!peer) throw new Error('Prepare peer connection before attaching track')
      const attached = await audioManager.attachLocalTrack(peer, mediaStream)
      stateService.update({ localAudioTrackReady: true, localAudioTrackId: attached.track.id })
      return attached
    },
    async createLocalOffer(options = { offerToReceiveAudio: false }) {
      const offer = await peerManager.createOffer(options)
      stateService.update({ offerCreated: true })
      if (providerMode === 'simulation') {
        const answer = makeSimulatedAnswer()
        await peerManager.applyAnswer(answer)
        stateService.update({ simulatedAnswerApplied: true })
        emit('simulated_sdp_answer_applied', { simulated: true })
      }
      return offer
    },
    close() {
      const peer = peerManager.getPeer()
      audioManager.detach(peer)
      peerManager.close()
      stateService.reset()
    },
  }
}
