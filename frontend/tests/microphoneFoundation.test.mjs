import assert from 'node:assert/strict'
import { getMicrophoneSupportStatus } from '../src/services/microphone/microphonePermissionService.js'
import { createMicrophoneManager } from '../src/services/microphone/microphoneManager.js'
import { createAudioLevelMonitor } from '../src/services/microphone/audioLevelMonitor.js'
import { buildWaveformBins } from '../src/services/microphone/waveformRenderer.js'
import { LIVE_STREAM_INITIAL_STATE, reduceLiveStreamState } from '../src/utils/liveStreamUiState.js'

global.navigator = {
  mediaDevices: { getUserMedia: async () => ({ getTracks: () => [{ stop() {} }], getAudioTracks: () => [{ enabled: true }] }) },
  permissions: { query: async () => ({ state: 'granted' }) },
}

assert.equal(getMicrophoneSupportStatus().supported, true)

const events = []
const manager = createMicrophoneManager({ onEvent: (e) => events.push(e) })
await manager.start()
assert.equal(manager.state.enabled, true)
manager.setMuted(true)
assert.equal(manager.state.muted, true)
manager.setMuted(false)
assert.equal(manager.state.muted, false)

manager.processAudioFrame(Array.from({ length: 64 }, () => 0.2))
assert.ok(manager.state.level > 0)
assert.equal(manager.state.waveform.length, 32)

const bins = buildWaveformBins([0, 0.5, -0.5, 1, -1], 5)
assert.equal(bins.length, 5)

let speakingStarted = false
const monitor = createAudioLevelMonitor({ onSpeakingStart: () => { speakingStarted = true } })
monitor.process(Array.from({ length: 32 }, () => 0.4))
assert.equal(speakingStarted, true)

let stream = LIVE_STREAM_INITIAL_STATE
for (const ev of events) stream = reduceLiveStreamState(stream, { id: ev.eventType, ...ev })
assert.ok(stream.events.length >= 1)

console.log('microphone foundation tests passed')
