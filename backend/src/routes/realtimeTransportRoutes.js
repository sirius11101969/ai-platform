const express = require('express')
const { requireAiExecutionWorkspaceAuth } = require('../middleware/aiExecutionWorkspaceAuthMiddleware')
const controller = require('../controllers/realtimeTransportController')

const router = express.Router()

router.use(requireAiExecutionWorkspaceAuth({
  missingWorkspaceError: 'workspaceId is required for admin key realtime transport access',
  acceptedLogEvent: 'realtime_transport_admin_key_accepted',
}))

router.post('/live-realtime/session', controller.createSession)
router.get('/live-realtime/sessions', controller.listSessions)
router.get('/live-realtime/sessions/:id', controller.getSession)

module.exports = router
