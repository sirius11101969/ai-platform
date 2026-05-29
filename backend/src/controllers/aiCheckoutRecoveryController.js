const { runCheckoutRecoveryOnce } = require('../services/aiCheckoutRecoveryService')

async function runOnce(req, res, next) {
  try {
    const workspaceId = String(req.body?.workspaceId || req.query.workspaceId || '').trim() || null
    const limit = Number(req.body?.limit || req.query.limit || 20)

    const result = await runCheckoutRecoveryOnce({ workspaceId, limit })

    return res.json({
      ok: true,
      result
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  runOnce
}
