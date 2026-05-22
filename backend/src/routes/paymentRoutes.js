const express = require('express')
const { requireAiControlGateway } = require('../middleware/aiControlGateway')
const controller = require('../controllers/paymentController')
const { requirePaymentWebhookSecret } = require('../middleware/paymentWebhookAuthMiddleware')

const router = express.Router()
const paymentsGateway = requireAiControlGateway({ missingWorkspaceError: 'workspaceId is required for payment routes' })

router.post('/payments/create', paymentsGateway, controller.create)
router.post('/payments/webhook', requirePaymentWebhookSecret, controller.webhook)
router.get('/payments/status', paymentsGateway, controller.status)
router.get('/payments/dashboard', paymentsGateway, controller.dashboard)

module.exports = router
