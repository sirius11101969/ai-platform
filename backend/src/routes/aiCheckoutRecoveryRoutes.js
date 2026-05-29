const express = require('express')
const controller = require('../controllers/aiCheckoutRecoveryController')

const router = express.Router()

router.post('/run-once', controller.runOnce)

module.exports = router
