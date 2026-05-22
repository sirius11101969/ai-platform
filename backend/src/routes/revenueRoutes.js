const express = require('express')
const { requireAiControlGateway } = require('../middleware/aiControlGateway')
const controller = require('../controllers/revenueController')

const router = express.Router()
router.use(requireAiControlGateway({ missingWorkspaceError: 'workspaceId is required for revenue routes' }))
router.use((req, _res, next) => {
  console.info('revenue_gateway_auth_success', {
    method: req.method,
    path: req.originalUrl || req.url,
    workspaceId: req.workspace?.id || req.aiControl?.workspaceId || null,
    authMode: req.aiControl?.authMode || null,
  })
  next()
})
router.get('/revenue/overview', controller.overview)
router.get('/revenue/funnel', controller.funnel)
router.post('/revenue/activate', controller.activate)
router.post('/revenue/checkout/start', controller.startCheckout)
router.post('/revenue/payment/pending', controller.createPaymentPending)
router.post('/revenue/payment/complete', controller.completePayment)
router.get('/revenue/orders', controller.orders)
router.get('/revenue/orders/pending', controller.pendingOrders)

module.exports = router
