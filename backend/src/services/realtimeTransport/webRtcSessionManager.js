const { EventEmitter } = require('events')
const emitter = new EventEmitter()
emitter.setMaxListeners(300)
function publish(channel, event = {}) { const payload = { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, channel, createdAt: new Date().toISOString(), ...event }; emitter.emit(channel, payload); emitter.emit('*', payload); return payload }
function subscribe(channel, handler) { emitter.on(channel, handler); return () => emitter.off(channel, handler) }
module.exports = { publish, subscribe }
