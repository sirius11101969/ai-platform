const express = require('express')
const { requireAiExecutionWorkspaceAuth } = require('../middleware/aiExecutionWorkspaceAuthMiddleware')
const controller = require('../controllers/openaiRealtimeController')

const router = express.Router()
router.use(requireAiExecutionWorkspaceAuth({ missingWorkspaceError: 'workspaceId is required for openai realtime access', acceptedLogEvent: 'openai_realtime_workspace_access_accepted' }))
router.post('/openai-realtime/ephemeral-session', controller.createEphemeralSession)
router.get('/openai-realtime/session/:id', controller.getEphemeralSession)
router.post('/openai-realtime/session/:id/refresh', controller.refreshEphemeralSession)

module.exports = router
