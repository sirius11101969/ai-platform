const { requireAuth } = require('./authMiddleware')
const { _private: runnerAuthPrivate } = require('./aiExecutionRunnerAuthMiddleware')

function allowLiveStreamSseAuth(req, res, next) {
  if (runnerAuthPrivate.isInternalAdminKeyAccepted(req)) {
    return next()
  }
  return requireAuth(req, res, next)
}

module.exports = { allowLiveStreamSseAuth }
