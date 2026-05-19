import { createRealtimeAudioSafetyGuard } from './realtimeAudioSafetyGuard'
import { createRealtimeRemoteAudioPlayer } from './realtimeRemoteAudioPlayer'

export function createOpenAiRealtimeAudioBridge({ sandboxEnabled = false, confirmationRequired = true, maxSessionSeconds = 180, onEvent } = {}) {
  const guard = createRealtimeAudioSafetyGuard({ sandboxEnabled, confirmationRequired })
  const remotePlayer = createRealtimeRemoteAudioPlayer()
  let active = false
  let connectedAt = 0
  let timer = null
  let state = 'pilot_disconnected'

  function emit(eventType, payload = {}) {
    if (typeof onEvent === 'function') onEvent({ eventType, payload, createdAt: new Date().toISOString() })
  }

  function setState(next, payload = {}) {
    state = next
    emit('audio_session_state', { state: next, ...payload })
  }

  function cleanup(reason = 'cleanup') {
    if (timer) clearTimeout(timer)
    timer = null
    active = false
    connectedAt = 0
    remotePlayer.stop()
    setState('pilot_disconnected', { reason })
  }

  return {
    getState() { return state },
    prepareConnection() {
      setState('pilot_requested')
      if (!guard.canPrepare()) {
        setState('pilot_failed', { reason: 'sandbox_disabled' })
        return { active: false, reason: 'sandbox_disabled' }
      }
      setState('pilot_allowed')
      setState('pilot_connecting')
      remotePlayer.prepare()
      active = true
      connectedAt = Date.now()
      timer = setTimeout(() => {
        setState('pilot_timeout', { maxSessionSeconds })
        cleanup('timeout')
      }, Math.max(1, maxSessionSeconds) * 1000)
      setState('pilot_connected', { transport: 'webrtc', simulationFallback: true })
      return { active: true }
    },
    attachLocalTrack({ stream, confirmed }) {
      if (!active) return { attached: false, reason: 'bridge_inactive' }
      if (!guard.canAttachLocalTrack({ confirmed })) {
        setState('pilot_failed', { reason: 'confirmation_required' })
        return { attached: false, reason: 'confirmation_required' }
      }
      const track = typeof stream?.getAudioTracks === 'function' ? stream.getAudioTracks()[0] : null
      emit('audio_local_track_attached', { attached: !!track, elapsedMs: Date.now() - connectedAt })
      return { attached: !!track, trackId: track?.id || null }
    },
    receiveRemoteAudioPlaceholder(chunk = {}) { return remotePlayer.handleRemoteAudioChunk(chunk) },
    stop() { cleanup('manual_disconnect') },
  }
}
