const express = require('express')
const { requireAiControlGateway } = require('../middleware/aiControlGateway')
const controller = require('../controllers/aiSystemHealthController')

const router = express.Router()
router.use(requireAiControlGateway({ missingWorkspaceError: 'workspaceId is required for admin key system health access' }))
router.get('/system-health', controller.getSystemHealth)

module.exports = router
