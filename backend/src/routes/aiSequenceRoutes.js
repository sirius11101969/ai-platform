const express = require('express')
const controller = require('../controllers/aiSequenceController')

const router = express.Router()

router.post('/leads/:leadId/execute-next', controller.executeNext)
router.post('/run-scheduler-once', controller.runSchedulerOnce)

module.exports = router
