import { createAudioLevelMonitor } from './audioLevelMonitor.js'
import { buildWaveformBins } from './waveformRenderer.js'
import { getMicrophoneSupportStatus, queryMicrophonePermission } from './microphonePermissionService.js'

export function createMicrophoneManager({ onEvent, analyserFactory } = {}) {
  const state = {
    permission: 'unknown',
    enabled: false,
    muted: false,
    speaking: false,
    level: 0,
    waveform: Array.from({ length: 32 }, () => 0),
    status: 'idle',
    error: null,
  }

  const monitor = createAudioLevelMonitor({
    onLevel: (level) => { state.level = level },
    onActivity: () => onEvent?.({ eventType: 'audio_activity_detected', payload: { localOnly: true } }),
    onSpeakingStart: () => {
      state.speaking = true
      onEvent?.({ eventType: 'user_speaking_started', payload: { localOnly: true } })
    },
    onSpeakingStop: () => {
      state.speaking = false
      onEvent?.({ eventType: 'user_speaking_stopped', payload: { localOnly: true } })
    },
  })

  async function refreshPermission() {
    state.permission = await queryMicrophonePermission()
    return state.permission
  }

  async function start() {
    const support = getMicrophoneSupportStatus()
    if (!support.supported) {
      state.status = 'unsupported'
      state.error = support.reason
      return state
    }
    try {
      await refreshPermission()
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      state.stream = stream
      state.enabled = true
      state.status = 'running'
      state.error = null
      onEvent?.({ eventType: 'microphone_enabled', payload: { localOnly: true } })
      if (analyserFactory) state.analyser = analyserFactory(stream)
    } catch (error) {
      state.status = 'error'
      state.error = error?.name || 'microphone_error'
      if (state.error === 'NotAllowedError') state.permission = 'denied'
    }
    return state
  }

  function stop() {
    state.stream?.getTracks?.().forEach((track) => track.stop())
    state.stream = null
    state.enabled = false
    state.speaking = false
    state.level = 0
    state.status = 'stopped'
    monitor.stop()
  }

  function setMuted(nextMuted) {
    state.muted = Boolean(nextMuted)
    if (state.stream?.getAudioTracks) {
      state.stream.getAudioTracks().forEach((track) => {
        track.enabled = !state.muted
      })
    }
    onEvent?.({ eventType: state.muted ? 'microphone_muted' : 'microphone_unmuted', payload: { localOnly: true } })
  }

  function processAudioFrame(samples = []) {
    if (!state.enabled || state.muted) return state
    monitor.process(samples)
    state.waveform = buildWaveformBins(samples, 32)
    return state
  }

  return { state, refreshPermission, start, stop, setMuted, processAudioFrame }
}

