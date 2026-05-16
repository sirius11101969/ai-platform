const { processTelegramUpdate } = require('../services/telegramService')

function normalizeSecret(value) {
  return String(value || '').trim()
}

async function integrationWebhook(req, res, next) {
  try {
    const result = await processTelegramUpdate(req.body)
    res.json({ ok: true, ...result })
  } catch (error) {
    next(error)
  }
}

async function webhook(req, res, next) {
  try {
    const expectedSecret = normalizeSecret(process.env.TELEGRAM_WEBHOOK_SECRET)
    const actualSecret = normalizeSecret(req.params.secret)

    if (!expectedSecret) {
      return res.status(503).json({ error: 'TELEGRAM_WEBHOOK_SECRET is not configured' })
    }

    if (actualSecret !== expectedSecret) {
      return res.status(403).json({ error: 'Invalid Telegram webhook secret' })
    }

    const result = await processTelegramUpdate(req.body)
    res.json({ ok: true, ...result })
  } catch (error) {
    next(error)
  }
}

module.exports = { integrationWebhook, webhook }
