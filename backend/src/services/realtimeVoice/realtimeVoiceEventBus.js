const { EventEmitter } = require('events')

const EVENT_TYPES = Object.freeze({
  SESSION_STARTED: 'session_start',
  STATE_CHANGED: 'state_changed',
  LISTENING: 'listening',
  AI_PROCESSING: 'ai_processing',
  SPEAKING: 'speaking',
  INTERRUPTION: 'interruption',
  RESUME: 'resume',
  TRANSCRIPT_PARTIAL: 'transcript_partial',
  TRANSCRIPT_FINAL: 'transcript_final',
  AI_RESPONSE_CHUNK: 'ai_response_chunk',
  LATENCY_METRIC: 'latency_metric',
  COMPLETED: 'completed',
  FAILED: 'failed',
})

function createRealtimeVoiceEventBus() {
  const emitter = new EventEmitter()
  emitter.setMaxListeners(200)

  function publish(eventType, payload = {}) {
    const event = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      eventType,
      sessionId: payload.sessionId || payload.session_id || null,
      payload,
      createdAt: new Date().toISOString(),
    }
    emitter.emit(eventType, event)
    emitter.emit('*', event)
    if (event.sessionId) emitter.emit(`session:${event.sessionId}`, event)
    return event
  }

  function subscribe(eventType, handler) {
    emitter.on(eventType, handler)
    return () => emitter.off(eventType, handler)
  }

  function subscribeToSession(sessionId, handler) {
    return subscribe(`session:${sessionId}`, handler)
  }

  return { publish, subscribe, subscribeToSession, EVENT_TYPES }
}

const realtimeVoiceEventBus = createRealtimeVoiceEventBus()

module.exports = { EVENT_TYPES, createRealtimeVoiceEventBus, realtimeVoiceEventBus }
