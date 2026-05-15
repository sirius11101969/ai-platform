const express = require('express')
const { requireAuth } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/profile', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

module.exports = router
