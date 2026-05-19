const { test } = require('node:test')
const assert = require('node:assert/strict')

const { createLiveRealtimeStreamBus } = require('../src/services/liveRealtime/liveRealtimeStreamBus')
const { appendTranscript, computeLatency } = require('../src/services/liveRealtime/liveRealtimeTranscriptService')

test('transcript chunks append in order', () => {
  let transcript = []
  transcript = appendTranscript(transcript, { role: 'user', text: 'hello' })
  transcript = appendTranscript(transcript, { role: 'assistant', text: 'hi there' })
  assert.equal(transcript.length, 2)
  assert.equal(transcript[0].text, 'hello')
  assert.equal(transcript[1].role, 'assistant')
})

test('computeLatency reads session lifecycle from started to completed', () => {
  const events = [
    { eventType: 'session_started', createdAt: '2026-01-01T00:00:00.000Z' },
    { eventType: 'completed', createdAt: '2026-01-01T00:00:01.200Z' },
  ]
  assert.equal(computeLatency(events), 1200)
})

test('stream bus publishes and subscribes', async () => {
  const bus = createLiveRealtimeStreamBus()
  const got = await new Promise((resolve) => {
    const off = bus.subscribe('s1', (event) => { off(); resolve(event) })
    bus.publish('s1', { eventType: 'partial_transcript' })
  })
  assert.equal(got.eventType, 'partial_transcript')
})
