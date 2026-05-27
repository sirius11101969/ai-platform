const express = require('express')
const { createAiSecretaryLead } = require('../controllers/aiSecretaryController')

const router = express.Router()

router.post('/leads', createAiSecretaryLead)

module.exports = router
