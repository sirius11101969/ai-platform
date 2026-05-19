const assert = require('assert')
const controller = require('../src/controllers/liveRealtimeController')
const gateway = require('../src/services/liveRealtime/liveRealtimeGateway')

async function testStreamSendsUnifiedEventAndClosesOnCompleted() {
  const writes = []
  let ended = false
  const sessionId = 'session-1'
  gateway.getSession = async () => ({ id: sessionId, status: 'running', events: [{ id: 'e1', eventType: 'session_started', payload: {} }] })
  let subscriber
  gateway.liveRealtimeStreamBus.subscribe = (_id, cb) => { subscriber = cb; return () => {} }

  const req = { params: { id: sessionId }, workspace: { id: 'workspace-1' }, query: {}, on: () => {} }
  const res = { setHeader: () => {}, flushHeaders: () => {}, write: (chunk) => writes.push(chunk), end: () => { ended = true } }

  await controller.streamSession(req, res, (error) => { throw error })
  subscriber({ id: 'e2', eventType: 'completed', payload: {} })

  assert(writes.some((line) => line.includes('event: live_stream_event')))
  assert(writes.some((line) => line.includes('"eventType":"completed"')))
  assert.equal(ended, true)
}

testStreamSendsUnifiedEventAndClosesOnCompleted().then(() => console.log('live stream sse controller tests passed')).catch((error) => {
  console.error(error)
  process.exit(1)
})
