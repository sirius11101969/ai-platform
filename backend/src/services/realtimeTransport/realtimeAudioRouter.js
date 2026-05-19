function createPeerConnectionPlaceholder() {
  return {
    localSdp: 'v=0\no=- 0 0 IN IP4 127.0.0.1\ns=AI-Platform-Simulated\nt=0 0\na=setup:actpass',
    remoteSdp: 'v=0\no=- 0 0 IN IP4 127.0.0.1\ns=OpenAI-Simulated\nt=0 0\na=setup:active',
    iceCandidates: [
      { candidate: 'candidate:simulated-1 udp 2113937151 10.0.0.20 54545 typ host', sdpMid: 'audio', sdpMLineIndex: 0 },
      { candidate: 'candidate:simulated-2 udp 2113937151 10.0.0.21 54546 typ srflx', sdpMid: 'audio', sdpMLineIndex: 0 },
    ],
  }
}
function simulateNegotiation(sessionId) { const peer = createPeerConnectionPlaceholder(); return { sessionId, transport: 'webrtc', state: 'connected', negotiation: { sdpOffer: peer.localSdp, sdpAnswer: peer.remoteSdp, iceCandidates: peer.iceCandidates, simulated: true } } }
module.exports = { createPeerConnectionPlaceholder, simulateNegotiation }
