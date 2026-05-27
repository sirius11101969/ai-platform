const express = require('express')
const { createAiSecretaryLead, applyAiSecretaryAction } = require('../controllers/aiSecretaryController')

const router = express.Router()

router.post('/leads', createAiSecretaryLead)
router.post('/leads/:leadId/actions/:action', applyAiSecretaryAction)

module.exports = router
