const authService = require('../services/authService')

async function signup(req, res, next) {
  try {
    const result = await authService.signup(req.body)
    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

async function profile(req, res) {
  res.json({ user: req.user })
}

module.exports = {
  login,
  profile,
  signup,
}
