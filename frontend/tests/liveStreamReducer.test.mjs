import assert from 'node:assert/strict'
import { LIVE_STREAM_INITIAL_STATE, reduceLiveStreamState } from '../src/utils/liveStreamUiState.js'

const base = LIVE_STREAM_INITIAL_STATE
const types = ['session_started','user_audio_chunk_simulated','partial_transcript','ai_thinking','ai_response_chunk','interruption_detected','resume_listening','final_transcript','completed']

let state = base
for (const type of types) {
  state = reduceLiveStreamState(state, { id:type, eventType:type, payload:{ text:type } })
}

assert.equal(state.events.length, types.length)
assert.equal(state.interruptionDetected, true)
assert.equal(state.resumed, true)
assert.equal(state.completed, true)
assert.match(state.transcript, /partial_transcript/)
assert.match(state.transcript, /final_transcript/)
console.log('live stream reducer tests passed')
