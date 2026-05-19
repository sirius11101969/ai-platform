import { createRealtimeAudioSafetyGuard } from './realtimeAudioSafetyGuard'
import { createRealtimeRemoteAudioPlayer } from './realtimeRemoteAudioPlayer'

export function createOpenAiRealtimeAudioBridge({ sandboxEnabled = false, confirmationRequired = true, onEvent } = {}) {
  const guard = createRealtimeAudioSafetyGuard({ sandboxEnabled, confirmationRequired })
  const remotePlayer = createRealtimeRemoteAudioPlayer()
  let active = false
  function emit(eventType, payload = {}) { if (typeof onEvent === 'function') onEvent({ eventType, payload, createdAt: new Date().toISOString() }) }
  return {
    prepareConnection() {
      if (!guard.canPrepare()) return { active: false, reason: 'sandbox_disabled' }
      remotePlayer.prepare(); active = true; emit('audio_bridge_prepared', { sandboxOnly: true }); return { active: true }
    },
    attachLocalTrack({ stream, confirmed }) {
      if (!active) return { attached: false, reason: 'bridge_inactive' }
      if (!guard.canAttachLocalTrack({ confirmed })) return { attached: false, reason: 'confirmation_required' }
      const track = typeof stream?.getAudioTracks === 'function' ? stream.getAudioTracks()[0] : null
      emit('audio_local_track_attached', { attached: !!track })
      return { attached: !!track, trackId: track?.id || null }
    },
    receiveRemoteAudioPlaceholder(chunk = {}) { return remotePlayer.handleRemoteAudioChunk(chunk) },
    stop() { active = false; remotePlayer.stop(); emit('audio_bridge_stopped', { sandboxOnly: true }) },
  }
}
