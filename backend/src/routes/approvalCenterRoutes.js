const express = require('express')
const { requireAiExecutionWorkspaceAuth } = require('../middleware/aiExecutionWorkspaceAuthMiddleware')
const controller = require('../controllers/approvalCenterController')
const router = express.Router()
router.use(requireAiExecutionWorkspaceAuth({
  missingWorkspaceError: 'workspaceId is required for admin key approval center access',
  acceptedLogEvent: 'approval_center_admin_key_auth_success',
}))
router.get('/approval-center/queue', controller.list)
router.post('/approval-center/:id/approve', controller.approve)
router.post('/approval-center/:id/reject', controller.reject)
router.post('/approval-center/:id/snooze', controller.snooze)
router.post('/approval-center/:id/escalate', controller.escalate)
module.exports = router
