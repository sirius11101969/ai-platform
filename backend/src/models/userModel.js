const pool = require('../db/pool')

function toPublicUser(row) {
  if (!row) return null
  return {
    id: row.id,
    email: row.email,
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
  const result = await pool.query('SELECT id, email, credits, plan, created_at FROM users WHERE id = $1', [id])
  return result.rows[0] || null
}

async function createUser({ email, passwordHash }) {
  const result = await pool.query(
    `INSERT INTO users(email, password_hash, credits, plan)
     VALUES($1, $2, 100, 'free')
     RETURNING id, email, credits, plan, created_at`,
    [email, passwordHash]
  )

  return result.rows[0]
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  toPublicUser,
}
