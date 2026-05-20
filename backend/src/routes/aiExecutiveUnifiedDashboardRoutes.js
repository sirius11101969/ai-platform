const express = require('express')
const controller = require('../controllers/aiExecutiveUnifiedDashboardController')
const { requireAiControlGateway } = require('../middleware/aiControlGateway')
const router = express.Router()
router.use(requireAiControlGateway({ missingWorkspaceError: 'workspaceId is required for executive unified dashboard' }))
router.get('/executive-dashboard/overview', controller.getOverview)
module.exports = router
