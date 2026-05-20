const { EventEmitter } = require('events')

const WORKFORCE_EVENT_TYPES = Object.freeze([
  'worker_activity_started',
  'worker_activity_completed',
  'worker_status_changed',
  'worker_collaboration_started',
  'worker_collaboration_completed',
  'execution_plan_updated',
  'workforce_escalation_detected',
  'workforce_bottleneck_detected',
])

function createWorkforceEventBus() {
  const emitter = new EventEmitter()

  function publish(event) {
    if (!event || !WORKFORCE_EVENT_TYPES.includes(event.eventType)) {
      throw new Error(`Unsupported workforce event type: ${event?.eventType || 'unknown'}`)
    }
    emitter.emit(event.eventType, event)
    emitter.emit('workforce_event', event)
    return event
  }

  function subscribe(eventType, listener) {
    emitter.on(eventType, listener)
    return () => emitter.off(eventType, listener)
  }

  return { publish, subscribe }
}

module.exports = { WORKFORCE_EVENT_TYPES, createWorkforceEventBus }
