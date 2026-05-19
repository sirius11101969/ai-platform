const express = require('express')
const { requireAiControlGateway } = require('../middleware/aiControlGateway')
const controller = require('../controllers/approvalCenterController')
const router = express.Router()
router.use(requireAiControlGateway({
  requireWorkspaceForAdminKey: true,
  missingWorkspaceError: 'workspaceId is required for admin key approval center access',
}))
router.get('/approval-center/queue', controller.list)
router.post('/approval-center/:id/approve', controller.approve)
router.post('/approval-center/:id/reject', controller.reject)
router.post('/approval-center/:id/snooze', controller.snooze)
router.post('/approval-center/:id/escalate', controller.escalate)
module.exports = router
