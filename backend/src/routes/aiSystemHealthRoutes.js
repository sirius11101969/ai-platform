const express = require('express')
const { requireAiControlGateway } = require('../middleware/aiControlGateway')
const controller = require('../controllers/aiSystemHealthController')

const router = express.Router()
router.use(requireAiControlGateway({
  requireWorkspaceForAdminKey: true,
  missingWorkspaceError: 'workspaceId is required for system health',
}))
router.get('/system-health', controller.getSystemHealth)

module.exports = router
