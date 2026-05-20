const express = require('express')
const controller = require('../controllers/aiRevenueEngineController')
const { requireAiControlGateway } = require('../middleware/aiControlGateway')

const router = express.Router()


console.info('ai_revenue_engine_gateway_middleware_active', {
  basePath: '/api/ai/revenue-engine',
  middleware: 'requireAiControlGateway',
})

router.use(requireAiControlGateway({
  missingWorkspaceError: 'workspaceId is required for admin key revenue engine access',
}))
router.use((req, _res, next) => {
  console.info('ai_revenue_engine_request_debug', {
    method: req.method,
    path: req.originalUrl || req.url,
    middlewareReached: 'ai_revenue_engine_router',
  })
  console.info('ai_revenue_engine_gateway_auth_success', {
    method: req.method,
    path: req.originalUrl || req.url,
    authMode: req.aiControl?.authMode || null,
    workspaceId: req.aiControl?.workspaceId || req.workspace?.id || null,
    userId: req.aiControl?.userId || req.user?.id || null,
  })
  console.info('ai_revenue_engine_auth_context_attached', {
    method: req.method,
    path: req.originalUrl || req.url,
    authContextAttached: Boolean(req.aiControl),
    authMode: req.aiControl?.authMode || null,
    userId: req.aiControl?.userId || req.user?.id || null,
  })
  console.info('ai_revenue_engine_workspace_resolved', {
    method: req.method,
    path: req.originalUrl || req.url,
    workspaceId: req.workspace?.id || req.aiControl?.workspaceId || null,
  })
  next()
})

router.get('/revenue-engine/snapshot', controller.getSnapshot)
router.get('/revenue-engine/recommendations', controller.getRecommendations)
router.get('/revenue-engine/risks', controller.getRisks)
router.post('/revenue-engine/run-analysis', controller.runAnalysis)

module.exports = router
