const express = require('express')
const { getRevenueCommandCenter } = require('../controllers/revenueCommandController')

const router = express.Router()

router.get('/command-center', getRevenueCommandCenter)

module.exports = router
