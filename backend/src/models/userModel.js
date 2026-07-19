const pool = require('../db/pool')

function toPublicUser(row) {
  if (!row) return null
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name || '',
    avatarUrl: row.avatar_url || '',
    avatarScale: Number(row.avatar_scale || 100),
    locale: row.locale || 'ru',
    credits: row.credits,
    plan: row.plan,
    createdAt: row.created_at,
  }
}

async function findUserByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE lower(email) = lower($1)', [email])
  return result.rows[0] || null
}

async function findUserById(id) {
  const result = await pool.query('SELECT id, email, display_name, avatar_url, avatar_scale, locale, credits, plan, created_at FROM users WHERE id = $1', [id])
  return result.rows[0] || null
}

async function createUser({ email, passwordHash }) {
  const result = await pool.query(
    `INSERT INTO users(email, password_hash, credits, plan)
     VALUES($1, $2, 100, 'free')
     RETURNING id, email, display_name, avatar_url, avatar_scale, locale, credits, plan, created_at`,
    [email, passwordHash]
  )

  return result.rows[0]
}

function validationError(message) {
  return Object.assign(new Error(message), { statusCode: 400 })
}

function normalizeDisplayName(value) {
  const normalized = String(value || '').trim().replace(/\s+/g, ' ')
  if (!normalized || normalized.length > 120) throw validationError('Display name must contain 1 to 120 characters')
  return normalized
}

function normalizeLocale(value) {
  const normalized = String(value || 'ru').trim().toLowerCase()
  if (!['ru', 'en'].includes(normalized)) throw validationError('Locale must be ru or en')
  return normalized
}

function normalizeImageUrl(value) {
  const normalized = String(value || '').trim()
  if (!normalized) return null
  if (/^https:\/\/[^\s]{1,2040}$/i.test(normalized)) return normalized
  const match = normalized.match(/^data:image\/(png|jpe?g|webp);base64,([a-z0-9+/=]+)$/i)
  if (!match) throw validationError('Profile image must be an HTTPS URL or PNG, JPG, WebP data URL')
  if (Math.floor(match[2].length * 0.75) > 1024 * 1024) throw validationError('Profile image must be 1 MB or smaller')
  return normalized
}

function normalizeAvatarScale(value) {
  const normalized = Math.round(Number(value))
  if (!Number.isFinite(normalized) || normalized < 70 || normalized > 150) {
    throw validationError('Profile photo scale must be between 70 and 150')
  }
  return normalized
}

async function updateUserProfile(userId, payload = {}) {
  const updates = []
  const values = [userId]
  if (Object.prototype.hasOwnProperty.call(payload, 'displayName')) {
    values.push(normalizeDisplayName(payload.displayName)); updates.push(`display_name = $${values.length}`)
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'avatarUrl')) {
    values.push(normalizeImageUrl(payload.avatarUrl)); updates.push(`avatar_url = $${values.length}`)
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'avatarScale')) {
    values.push(normalizeAvatarScale(payload.avatarScale)); updates.push(`avatar_scale = $${values.length}`)
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'locale')) {
    values.push(normalizeLocale(payload.locale)); updates.push(`locale = $${values.length}`)
  }
  if (!updates.length) return toPublicUser(await findUserById(userId))
  const result = await pool.query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $1
     RETURNING id, email, display_name, avatar_url, avatar_scale, locale, credits, plan, created_at`,
    values
  )
  return toPublicUser(result.rows[0])
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  toPublicUser,
  updateUserProfile,
}
