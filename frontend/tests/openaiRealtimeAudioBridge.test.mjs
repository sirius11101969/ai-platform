import assert from 'node:assert/strict'
import { createOpenAiRealtimeAudioBridge } from '../src/services/openaiRealtime/openaiRealtimeAudioBridge.js'

const events = []
const bridge = createOpenAiRealtimeAudioBridge({ sandboxEnabled: true, confirmationRequired: true, maxSessionSeconds: 1, onEvent: (e) => events.push(e) })

const prepared = bridge.prepareConnection({ ephemeralSession: { id: 'sess_1' } })
assert.equal(prepared.active, true)

const stream = { getAudioTracks: () => [{ id: 'track1' }], getTracks: () => [{ stop: () => null }] }
const attached = bridge.attachLocalTrack({ stream, confirmed: true })
assert.equal(attached.attached, true)

const interruption = bridge.handleInterruption({ userSpeaking: true })
assert.equal(interruption.interrupted, true)

await new Promise((r) => setTimeout(r, 1100))
assert.equal(bridge.getState(), 'pilot_disconnected')
assert.ok(events.some((e) => e.payload?.state === 'pilot_timeout'))

const bridge2 = createOpenAiRealtimeAudioBridge({ sandboxEnabled: false, onEvent: (e) => events.push(e) })
const denied = bridge2.prepareConnection()
assert.equal(denied.active, false)
assert.equal(bridge2.getState(), 'pilot_failed')

console.log('openaiRealtimeAudioBridge.test.mjs passed')
