const express = require('express')
const { requireAiExecutionWorkspaceAuth } = require('../middleware/aiExecutionWorkspaceAuthMiddleware')
const controller = require('../controllers/liveRealtimeController')

const router = express.Router()
router.use(requireAiExecutionWorkspaceAuth({
  missingWorkspaceError: 'workspaceId is required for admin key live stream access',
  acceptedLogEvent: 'live_stream_admin_key_accepted',
}))

router.post('/live-stream/session', controller.createSession)
router.get('/live-stream/sessions', controller.listSessions)
router.get('/live-stream/sessions/:id', controller.getSession)
router.get('/live-stream/sessions/:id/events', controller.getSessionEvents)
router.get('/live-stream/sessions/:id/stream', controller.streamSession)

module.exports = router
