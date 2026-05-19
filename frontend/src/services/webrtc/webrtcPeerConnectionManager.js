function safeEmit(onEvent, eventType, payload = {}) {
  if (typeof onEvent === 'function') onEvent({ eventType, payload, createdAt: new Date().toISOString() })
}

export function createWebrtcPeerConnectionManager({ onEvent, RTCPeerConnectionImpl } = {}) {
  const PeerImpl = RTCPeerConnectionImpl || globalThis.RTCPeerConnection
  let peer = null

  function requirePeer() {
    if (!peer) throw new Error('WebRTC peer connection is not created')
    return peer
  }

  return {
    create(configuration = {}) {
      if (!PeerImpl) throw new Error('RTCPeerConnection is not supported in this browser')
      if (peer) return peer
      peer = new PeerImpl(configuration)
      safeEmit(onEvent, 'webrtc_peer_created', { configuration })
      return peer
    },
    getPeer() { return peer },
    async createOffer(options) {
      const pc = requirePeer()
      const offer = await pc.createOffer(options)
      await pc.setLocalDescription(offer)
      safeEmit(onEvent, 'sdp_offer_created', { type: offer.type })
      return offer
    },
    async applyAnswer(answer) {
      const pc = requirePeer()
      await pc.setRemoteDescription(answer)
      return answer
    },
    close() {
      if (!peer) return
      peer.close()
      safeEmit(onEvent, 'webrtc_connection_closed')
      peer = null
    },
  }
}
