const assert = require('assert')
const controller = require('../src/controllers/liveRealtimeController')
const gateway = require('../src/services/liveRealtime/liveRealtimeGateway')
const authService = require('../src/services/authService')
const workspaceModel = require('../src/models/workspaceModel')

function createResponseCapture() {
  const writes = []
  let ended = false
  let statusCode = 200
  let jsonBody = null
  return {
    writes,
    get ended() { return ended },
    get statusCode() { return statusCode },
    get jsonBody() { return jsonBody },
    res: {
      setHeader: () => {},
      flushHeaders: () => {},
      write: (chunk) => writes.push(chunk),
      end: () => { ended = true },
      status(code) { statusCode = code; return this },
      json(body) { jsonBody = body; return this },
    },
  }
}

async function testStreamSendsExistingEventsAndClosesOnCompletedLiveEvent() {
  const sessionId = 'session-1'
  gateway.getSession = async () => ({ id: sessionId, status: 'running', events: [{ id: 'e1', eventType: 'session_started', payload: {} }] })
  let subscriber
  gateway.liveRealtimeStreamBus.subscribe = (_id, cb) => { subscriber = cb; return () => {} }
  const req = { params: { id: sessionId }, workspace: { id: 'workspace-1' }, query: {}, on: () => {} }
  const capture = createResponseCapture()

  await controller.streamSession(req, capture.res, (error) => { throw error })
  subscriber({ id: 'e2', eventType: 'completed', payload: {} })

  assert(capture.writes.some((line) => line.includes('event: live_stream_event')))
  assert(capture.writes.some((line) => line.includes('"eventType":"session_started"')))
  assert(capture.writes.some((line) => line.includes('"eventType":"completed"')))
  assert.equal(capture.ended, true)
}

async function testStreamAcceptsQueryKeyAuthWithoutWorkspace() {
  const sessionId = 'session-2'
  const previousAdminKey = process.env.AI_EXECUTION_ADMIN_KEY
  process.env.AI_EXECUTION_ADMIN_KEY = 'admin-test-key'
  gateway.getSession = async () => { throw new Error('workspace scoped fetch should not be used for query key auth') }
  gateway.getSessionById = async () => ({ id: sessionId, status: 'completed', events: [{ id: 'e1', eventType: 'session_started', payload: {} }] })
  const req = { params: { id: sessionId }, query: { key: 'admin-test-key' }, get: () => null, on: () => {} }
  const capture = createResponseCapture()

  await controller.streamSession(req, capture.res, (error) => { throw error })

  process.env.AI_EXECUTION_ADMIN_KEY = previousAdminKey
  assert(capture.writes.some((line) => line.includes('event: live_stream_event')))
  assert.equal(capture.ended, true)
}

async function testStreamAcceptsJwtAuthAndResolvesWorkspaceFromSession() {
  const sessionId = 'session-3'
  authService.verifyToken = async () => ({ id: 'user-1' })
  workspaceModel.getWorkspaceForUser = async () => ({ id: 'workspace-3' })
  gateway.getSessionById = async () => ({ id: sessionId, workspaceId: 'workspace-3', status: 'completed', events: [{ id: 'e1', eventType: 'session_started', payload: {} }] })
  gateway.getSession = async ({ workspaceId, sessionId: requestedId }) => ({ id: requestedId, workspaceId, status: 'completed', events: [] })
  const req = { params: { id: sessionId }, query: {}, get: () => 'Bearer jwt-token', on: () => {} }
  const capture = createResponseCapture()

  await controller.streamSession(req, capture.res, (error) => { throw error })

  assert.equal(capture.ended, true)
}

async function testStreamHandlesMissingSession() {
  const sessionId = 'session-missing'
  const previousAdminKey = process.env.AI_EXECUTION_ADMIN_KEY
  process.env.AI_EXECUTION_ADMIN_KEY = 'admin-test-key'
  gateway.getSessionById = async () => null
  const req = { params: { id: sessionId }, query: { key: 'admin-test-key' }, get: () => null, on: () => {} }
  const capture = createResponseCapture()

  await controller.streamSession(req, capture.res, (error) => { throw error })

  process.env.AI_EXECUTION_ADMIN_KEY = previousAdminKey
  assert.equal(capture.statusCode, 404)
  assert.equal(capture.jsonBody.error, 'Live stream session not found')
}

async function run() {
  await testStreamSendsExistingEventsAndClosesOnCompletedLiveEvent()
  await testStreamAcceptsQueryKeyAuthWithoutWorkspace()
  await testStreamAcceptsJwtAuthAndResolvesWorkspaceFromSession()
  await testStreamHandlesMissingSession()
  console.log('live stream sse controller tests passed')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
