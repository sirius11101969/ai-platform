const { EVENT_TYPES, realtimeVoiceEventBus } = require('./realtimeVoiceEventBus')
const { STATES } = require('./realtimeVoiceStateMachine')

const DEFAULT_PARTIALS = [
  'Hi, this is a simulated buyer joining the realtime voice stream.',
  'We are evaluating AI sales automation this quarter.',
  'Can it connect CRM signals with live conversation context?',
]

const DEFAULT_AI_CHUNKS = [
  'Absolutely — this simulation keeps the CRM context live ',
  'while the AI voice agent listens, tracks interruption intent, ',
  'and updates Revenue Brain scoring without any telephony connection.',
]

function nowMs() { return Date.now() }
function latencySince(startedAt) { return Math.max(1, nowMs() - startedAt) }

function buildTranscript(partials = DEFAULT_PARTIALS) {
  return `${partials.join(' ')} AI: ${DEFAULT_AI_CHUNKS.join('')}`
}

async function runMockRealtimeStream({ session, stateMachine, persistEvent, updateSessionState, eventBus = realtimeVoiceEventBus, partials = DEFAULT_PARTIALS, aiChunks = DEFAULT_AI_CHUNKS } = {}) {
  if (!session?.id) throw Object.assign(new Error('session is required'), { statusCode: 400 })
  const streamStartedAt = nowMs()
  const transcript = []
  const aiResponse = []

  async function record(eventType, payload = {}) {
    const event = eventBus.publish(eventType, { sessionId: session.id, ...payload, mockMode: true, telephonyTrafficSent: false, microphoneStreaming: false })
    if (persistEvent) await persistEvent({ sessionId: session.id, eventType, payload: event.payload })
    return event
  }

  async function transition(nextState, reason) {
    const entry = stateMachine.transition(nextState, { reason })
    await updateSessionState({ sessionId: session.id, status: stateMachine.toPersistenceStatus(), state: nextState, latencyMs: latencySince(streamStartedAt), stateHistory: stateMachine.history })
    await record(EVENT_TYPES.STATE_CHANGED, { state: nextState, previousState: entry.previousState, reason, latencyMs: latencySince(streamStartedAt) })
    return entry
  }

  await record(EVENT_TYPES.SESSION_STARTED, { status: 'initializing', transport: session.transport, provider: session.provider })

  await transition(STATES.LISTENING, 'mock_session_listening')
  await record(EVENT_TYPES.LISTENING, { indicator: 'listening', latencyMs: latencySince(streamStartedAt) })
  for (const [index, text] of partials.entries()) {
    transcript.push(text)
    await record(EVENT_TYPES.TRANSCRIPT_PARTIAL, { index, text, partialTranscript: transcript.join(' '), latencyMs: latencySince(streamStartedAt) })
  }

  await transition(STATES.PROCESSING, 'mock_ai_processing')
  await record(EVENT_TYPES.AI_PROCESSING, { indicator: 'processing', latencyMs: latencySince(streamStartedAt) })
  await record(EVENT_TYPES.TRANSCRIPT_FINAL, { text: partials.join(' '), latencyMs: latencySince(streamStartedAt) })

  await transition(STATES.SPEAKING, 'mock_ai_speaking_first_turn')
  await record(EVENT_TYPES.SPEAKING, { indicator: 'speaking', chunkCount: aiChunks.length, latencyMs: latencySince(streamStartedAt) })
  await record(EVENT_TYPES.AI_RESPONSE_CHUNK, { index: 0, text: aiChunks[0], latencyMs: latencySince(streamStartedAt) })

  await transition(STATES.INTERRUPTED, 'mock_buyer_interrupts')
  await record(EVENT_TYPES.INTERRUPTION, { reason: 'buyer_interruption', text: 'Wait — can you summarize the CRM impact first?', latencyMs: latencySince(streamStartedAt) })

  await transition(STATES.LISTENING, 'mock_resume_listening_after_interrupt')
  await record(EVENT_TYPES.RESUME, { resumedState: STATES.LISTENING, latencyMs: latencySince(streamStartedAt) })

  await transition(STATES.PROCESSING, 'mock_process_interruption_context')
  await record(EVENT_TYPES.AI_PROCESSING, { indicator: 'processing_interruption_context', latencyMs: latencySince(streamStartedAt) })

  await transition(STATES.SPEAKING, 'mock_ai_speaking_final_turn')
  for (const [index, text] of aiChunks.entries()) {
    aiResponse.push(text)
    await record(EVENT_TYPES.AI_RESPONSE_CHUNK, { index: index + 1, text, accumulatedResponse: aiResponse.join(''), latencyMs: latencySince(streamStartedAt) })
  }
  await record(EVENT_TYPES.LATENCY_METRIC, { latencyMs: latencySince(streamStartedAt), metric: 'mock_end_to_end_stream' })

  await transition(STATES.COMPLETED, 'mock_session_completed')
  const finalTranscript = buildTranscript(partials)
  await record(EVENT_TYPES.COMPLETED, { transcript: finalTranscript, aiResponse: aiResponse.join(''), latencyMs: latencySince(streamStartedAt) })
  return { transcript: finalTranscript, aiResponse: aiResponse.join(''), latencyMs: latencySince(streamStartedAt), stateHistory: stateMachine.history }
}

module.exports = { DEFAULT_PARTIALS, DEFAULT_AI_CHUNKS, runMockRealtimeStream, buildTranscript }
