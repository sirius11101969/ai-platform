const { createUser, findUserByEmail, findUserById, toPublicUser } = require('../models/userModel')
const { ensureDefaultWorkspace } = require('../models/workspaceModel')
const { comparePassword, hashPassword } = require('./passwordService')
const tokenService = require('./tokenService')

function signToken(user) {
  return tokenService.sign({ sub: user.id, email: user.email })
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

async function signup({ email, password }) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail || !password || password.length < 8) {
    const error = new Error('Email and password with at least 8 characters are required')
    error.statusCode = 400
    throw error
  }

  const existingUser = await findUserByEmail(normalizedEmail)
  if (existingUser) {
    const error = new Error('User with this email already exists')
    error.statusCode = 409
    throw error
  }

  const hashedPassword = await hashPassword(password)
  const user = await createUser({ email: normalizedEmail, passwordHash: hashedPassword })
  const workspace = await ensureDefaultWorkspace(user.id)
  return { user: toPublicUser(user), token: signToken(user), workspace }
}

async function login({ email, password }) {
  const user = await findUserByEmail(normalizeEmail(email))
  const validPassword = user ? await comparePassword(String(password || ''), user.password_hash) : false

  if (!user || !validPassword) {
    const error = new Error('Invalid email or password')
    error.statusCode = 401
    throw error
  }

  const workspace = await ensureDefaultWorkspace(user.id)
  return { user: toPublicUser(user), token: signToken(user), workspace }
}

async function verifyToken(token) {
  const payload = tokenService.verify(token)
  const user = await findUserById(payload.sub)
  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 401
    throw error
  }
  return toPublicUser(user)
}

module.exports = {
  login,
  signup,
  verifyToken,
}
