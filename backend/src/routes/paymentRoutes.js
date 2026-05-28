const express = require('express')
const { requireAiControlGateway } = require('../middleware/aiControlGateway')
const controller = require('../controllers/paymentController')
const { requirePaymentWebhookSecret } = require('../middleware/paymentWebhookAuthMiddleware')
const publicCheckout = require('../controllers/publicCheckoutController')

const publicPaymentRoutes = express.Router()
const paymentRoutes = express.Router()
const paymentsGateway = requireAiControlGateway({ missingWorkspaceError: 'workspaceId is required for payment routes' })

publicPaymentRoutes.post('/payments/webhook', requirePaymentWebhookSecret, controller.webhook)

// Public YooKassa webhook endpoint.
// YooKassa does not send our x-payment-webhook-secret header.
// Security is handled by matching YooKassa payment id with existing payment_transactions
// and processing only known payment ids.
publicPaymentRoutes.post('/payments/yookassa/webhook', controller.webhook)

publicPaymentRoutes.post(
  '/payments/test/mark-paid/:paymentId',
  requirePaymentWebhookSecret,
  controller.testMarkPaymentPaid
)

publicPaymentRoutes.post('/public/checkout', publicCheckout.createCheckout)

paymentRoutes.post('/payments/create', paymentsGateway, controller.create)
paymentRoutes.get('/payments/status', paymentsGateway, controller.status)
paymentRoutes.get('/payments/dashboard', paymentsGateway, controller.dashboard)

module.exports = { publicPaymentRoutes, paymentRoutes }
