import { createRealtimeAudioSafetyGuard } from './realtimeAudioSafetyGuard.js'
import { createRealtimeRemoteAudioPlayer } from './realtimeRemoteAudioPlayer.js'

export function createOpenAiRealtimeAudioBridge({ sandboxEnabled = false, confirmationRequired = true, maxSessionSeconds = 180, onEvent } = {}) {
  const guard = createRealtimeAudioSafetyGuard({ sandboxEnabled, confirmationRequired })
  const remotePlayer = createRealtimeRemoteAudioPlayer({ onEvent })
  let active = false
  let connectedAt = 0
  let timer = null
  let state = 'pilot_disconnected'
  let pc = null
  let localStream = null

  function emit(eventType, payload = {}) {
    if (typeof onEvent === 'function') onEvent({ eventType, payload, createdAt: new Date().toISOString() })
  }

  function setState(next, payload = {}) {
    state = next
    emit('openai_realtime_audio_connection_event', { state: next, ...payload })
  }

  function cleanup(reason = 'cleanup') {
    if (timer) clearTimeout(timer)
    timer = null
    active = false
    connectedAt = 0
    remotePlayer.stop()
    if (localStream?.getTracks) localStream.getTracks().forEach((t) => t.stop())
    localStream = null
    if (pc) pc.close()
    pc = null
    setState('pilot_disconnected', { reason })
  }

  return {
    getState() { return state },
    prepareConnection({ ephemeralSession } = {}) {
      setState('pilot_connecting')
      if (!guard.canPrepare()) {
        setState('pilot_failed', { reason: 'sandbox_disabled' })
        return { active: false, reason: 'sandbox_disabled' }
      }
      remotePlayer.prepare()
      active = true
      connectedAt = Date.now()
      timer = setTimeout(() => {
        setState('pilot_timeout', { maxSessionSeconds })
        cleanup('timeout')
      }, Math.max(1, maxSessionSeconds) * 1000)
      if (typeof RTCPeerConnection !== 'undefined') {
        pc = new RTCPeerConnection()
        pc.ontrack = (event) => {
          remotePlayer.attachRemoteStream(event.streams?.[0])
          setState('pilot_streaming', { transport: 'webrtc', simulationFallback: false, sessionId: ephemeralSession?.id || null })
        }
        pc.onconnectionstatechange = () => {
          const cs = pc.connectionState
          if (cs === 'connected') setState('pilot_connected', { simulationFallback: false })
          if (cs === 'disconnected') setState('pilot_interrupted', { reason: 'peer_disconnected' })
          if (cs === 'failed') setState('pilot_failed', { reason: 'peer_failed' })
        }
      }
      setState('pilot_connected', { transport: 'webrtc', simulationFallback: !pc, sessionId: ephemeralSession?.id || null })
      return { active: true, simulationFallback: !pc }
    },
    attachLocalTrack({ stream, confirmed }) {
      if (!active) return { attached: false, reason: 'bridge_inactive' }
      if (!guard.canAttachLocalTrack({ confirmed })) {
        setState('pilot_failed', { reason: 'confirmation_required' })
        return { attached: false, reason: 'confirmation_required' }
      }
      localStream = stream
      const track = typeof stream?.getAudioTracks === 'function' ? stream.getAudioTracks()[0] : null
      if (pc && track) pc.addTrack(track, stream)
      emit('audio_local_track_attached', { attached: !!track, elapsedMs: Date.now() - connectedAt })
      return { attached: !!track, trackId: track?.id || null }
    },
    handleInterruption({ userSpeaking }) {
      if (!active || !userSpeaking) return { interrupted: false }
      remotePlayer.interrupt()
      setState('pilot_interrupted', { reason: 'user_speaking' })
      return { interrupted: true }
    },
    receiveRemoteAudioPlaceholder(chunk = {}) { return remotePlayer.handleRemoteAudioChunk(chunk) },
    reconnect() { if (!active) return; setState('pilot_reconnecting'); setState('pilot_connected') },
    stop() { cleanup('manual_disconnect') },
  }
}
