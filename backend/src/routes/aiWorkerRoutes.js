const express = require('express')
const { commandCenter, createWorker, listRuns, listWorkers, runWorker, runWorkerByType, updateWorker } = require('../controllers/aiWorkerController')
const { requireAuth } = require('../middleware/authMiddleware')
const { requireWorkspace } = require('../middleware/workspaceMiddleware')

const router = express.Router()
router.use(requireAuth)
router.use(requireWorkspace)

router.get('/workers', listWorkers)
router.post('/workers', createWorker)
router.patch('/workers/:id', updateWorker)
router.get('/workers/:id/runs', listRuns)
router.post('/workers/:id/run', runWorker)
router.post('/ai-workers/run/:type', runWorkerByType)
router.get('/command-center', commandCenter)

module.exports = router
