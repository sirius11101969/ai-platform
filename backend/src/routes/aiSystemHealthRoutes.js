const express = require('express')
const { requireAiControlGateway } = require('../middleware/aiControlGateway')
const controller = require('../controllers/aiSystemHealthController')

const router = express.Router()
router.use(requireAiControlGateway({
  requireWorkspaceForAdminKey: true,
  missingWorkspaceError: 'workspaceId is required for system health',
}))
router.get('/system-health', (req, res, next) => {
  console.info('ai_system_health_request_received', {
    path: req.originalUrl,
    method: req.method,
  })
  return controller.getSystemHealth(req, res, next)
})

module.exports = router
