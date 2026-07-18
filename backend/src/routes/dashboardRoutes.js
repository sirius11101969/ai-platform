const express = require('express')
const { requireAuth } = require('../middleware/authMiddleware')
const { updateUserProfile } = require('../models/userModel')

const router = express.Router()

router.get('/profile', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

router.patch('/profile', requireAuth, async (req, res, next) => {
  try {
    const user = await updateUserProfile(req.user.id, req.body || {})
    res.json({ user })
  } catch (error) {
    next(error)
  }
})

module.exports = router
