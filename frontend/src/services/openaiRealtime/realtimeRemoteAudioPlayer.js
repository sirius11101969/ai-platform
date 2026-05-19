export function createRealtimeRemoteAudioPlayer({ onEvent } = {}) {
  let active = false
  let stream = null
  let audio = null
  let sourceNode = null

  function emit(eventType, payload = {}) {
    if (typeof onEvent === 'function') onEvent({ eventType, payload, createdAt: new Date().toISOString() })
  }

  function cleanupAudioGraph() {
    try { if (sourceNode) sourceNode.disconnect() } catch (_) {}
    sourceNode = null
    if (audio) {
      audio.pause()
      audio.srcObject = null
    }
    audio = null
    stream = null
  }

  return {
    prepare() {
      active = true
      emit('remote_audio_prepared')
    },
    attachRemoteStream(remoteStream) {
      if (!active || !remoteStream) return { attached: false }
      stream = remoteStream
      if (typeof Audio !== 'undefined') {
        audio = new Audio()
        audio.autoplay = true
        audio.srcObject = remoteStream
        audio.play?.().catch(() => null)
      }
      emit('remote_audio_stream_attached')
      return { attached: true }
    },
    handleRemoteAudioChunk(chunk = {}) {
      if (!active) return null
      emit('remote_audio_chunk', { type: chunk?.type || 'unknown' })
      return { streamed: true }
    },
    interrupt() {
      cleanupAudioGraph()
      emit('remote_audio_interrupted')
      return { interrupted: true }
    },
    stop() {
      active = false
      cleanupAudioGraph()
      emit('remote_audio_stopped')
    },
  }
}
