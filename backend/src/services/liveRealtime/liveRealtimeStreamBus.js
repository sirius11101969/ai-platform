const { EventEmitter } = require('events')

function createLiveRealtimeStreamBus() {
  const emitter = new EventEmitter()
  emitter.setMaxListeners(200)
  const publish = (sessionId, event) => { if (sessionId && event) emitter.emit(`session:${sessionId}`, event) }
  const subscribe = (sessionId, handler) => {
    const key = `session:${sessionId}`
    emitter.on(key, handler)
    return () => emitter.off(key, handler)
  }
  return { publish, subscribe }
}

const liveRealtimeStreamBus = createLiveRealtimeStreamBus()
module.exports = { createLiveRealtimeStreamBus, liveRealtimeStreamBus }
