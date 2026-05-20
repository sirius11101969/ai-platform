const express = require('express')
const controller = require('../controllers/aiRevenueEngineController')
const { requireAiControlGateway } = require('../middleware/aiControlGateway')

const router = express.Router()
router.use(requireAiControlGateway({ missingWorkspaceError: 'workspaceId is required for revenue engine access' }))
router.get('/revenue-engine/snapshot', controller.getSnapshot)
router.get('/revenue-engine/recommendations', controller.getRecommendations)
router.get('/revenue-engine/risks', controller.getRisks)
router.post('/revenue-engine/run-analysis', controller.runAnalysis)

module.exports = router
