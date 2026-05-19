function toTrack(stream) {
  const tracks = typeof stream?.getAudioTracks === 'function' ? stream.getAudioTracks() : []
  return tracks?.[0] || null
}

export function createRealtimeAudioTrackManager({ onEvent } = {}) {
  let sender = null
  let localTrack = null
  return {
    async attachLocalTrack(peerConnection, mediaStream) {
      if (!peerConnection) throw new Error('peerConnection is required')
      const track = toTrack(mediaStream)
      if (!track) throw new Error('No local audio track available')
      localTrack = track
      sender = peerConnection.addTrack(track, mediaStream)
      if (typeof onEvent === 'function') onEvent({ eventType: 'local_audio_track_attached', payload: { trackId: track.id }, createdAt: new Date().toISOString() })
      return { track, sender }
    },
    getLocalTrack() { return localTrack },
    detach(peerConnection) {
      if (peerConnection && sender) peerConnection.removeTrack(sender)
      sender = null
      localTrack = null
    },
  }
}
