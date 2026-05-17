const express = require('express')
const controller = require('../controllers/aiApprovalQueueController')
const { requireAuth } = require('../middleware/authMiddleware')
const { requireWorkspace } = require('../middleware/workspaceMiddleware')

const router = express.Router()
router.use(requireAuth)
router.use(requireWorkspace)

router.get('/focus-summary', controller.focusSummary)
router.get('/', controller.list)
router.post('/:id/approve', controller.approve)
router.post('/:id/reject', controller.reject)
router.patch('/:id', controller.update)
router.post('/:id/execute', controller.execute)
router.post('/:id/send', controller.send)

module.exports = router
