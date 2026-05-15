const crypto = require('crypto')

const KEY_LENGTH = 64
const HASH_PREFIX = '$ai-bcrypt-v1$'

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('base64url')
    crypto.scrypt(String(password), salt, KEY_LENGTH, (error, derivedKey) => {
      if (error) return reject(error)
      return resolve(`${HASH_PREFIX}${salt}$${derivedKey.toString('base64url')}`)
    })
  })
}

function comparePassword(password, passwordHash) {
  return new Promise((resolve, reject) => {
    const [salt, storedHash] = String(passwordHash || '').replace(HASH_PREFIX, '').split('$')

    if (!salt || !storedHash) {
      return resolve(false)
    }

    crypto.scrypt(String(password), salt, KEY_LENGTH, (error, derivedKey) => {
      if (error) return reject(error)
      const candidate = Buffer.from(derivedKey.toString('base64url'))
      const stored = Buffer.from(storedHash)
      if (candidate.length !== stored.length) return resolve(false)
      return resolve(crypto.timingSafeEqual(candidate, stored))
    })
  })
}

module.exports = { comparePassword, hashPassword }
