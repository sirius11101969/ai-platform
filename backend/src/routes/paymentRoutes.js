const express = require('express')
const { requireAiControlGateway } = require('../middleware/aiControlGateway')
const controller = require('../controllers/paymentController')
const { requirePaymentWebhookSecret } = require('../middleware/paymentWebhookAuthMiddleware')

const publicPaymentRoutes = express.Router()
const paymentRoutes = express.Router()
const paymentsGateway = requireAiControlGateway({ missingWorkspaceError: 'workspaceId is required for payment routes' })

publicPaymentRoutes.post('/payments/webhook', requirePaymentWebhookSecret, controller.webhook)

paymentRoutes.post('/payments/create', paymentsGateway, controller.create)
paymentRoutes.get('/payments/status', paymentsGateway, controller.status)
paymentRoutes.get('/payments/dashboard', paymentsGateway, controller.dashboard)

module.exports = { publicPaymentRoutes, paymentRoutes }
