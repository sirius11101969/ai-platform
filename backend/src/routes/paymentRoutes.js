const express = require('express')
const { requireAiControlGateway } = require('../middleware/aiControlGateway')
const controller = require('../controllers/paymentController')

const router = express.Router()
router.use(requireAiControlGateway({ missingWorkspaceError: 'workspaceId is required for payment routes' }))
router.post('/payments/create', controller.create)
router.post('/payments/webhook', controller.webhook)
router.get('/payments/status', controller.status)
router.get('/payments/dashboard', controller.dashboard)

module.exports = router
