const { verifyToken } = require('../services/authService')

async function requireAuth(req, res, next) {
  try {
    const header = req.get('authorization') || ''
    const [scheme, token] = header.split(' ')

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Не найден токен авторизации' })
    }

    req.user = await verifyToken(token)
    return next()
  } catch (error) {
    return res.status(error.statusCode || 401).json({ error: 'Токен недействителен или истёк' })
  }
}

module.exports = { requireAuth }
