const express = require('express')
const { requireAuth } = require('../middleware/authMiddleware')
const { requireWorkspace } = require('../middleware/workspaceMiddleware')
const controller = require('../controllers/realtimeTransportController')

const router = express.Router()

router.use(requireAuth)
router.use(requireWorkspace)

router.post('/live-realtime/session', controller.createSession)
router.get('/live-realtime/sessions', controller.listSessions)
router.get('/live-realtime/sessions/:id', controller.getSession)

module.exports = router
