const express = require('express')
const controller = require('../controllers/aiCommandCenterController')
const { requireAiControlGateway } = require('../middleware/aiControlGateway')

const router = express.Router()

router.use(requireAiControlGateway({ missingWorkspaceError: 'workspaceId is required for command center' }))
router.get('/command-center/overview', controller.getOverview)
router.get('/command-center/timeline', controller.getTimeline)
router.get('/command-center/actions', controller.getActions)
router.post('/command-center/actions/request', controller.requestAction)

module.exports = router
