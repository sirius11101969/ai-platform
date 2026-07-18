function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error)
  }

  const statusCode = error.statusCode || 500
  const message = statusCode >= 500 ? 'Internal server error' : error.message

  if (statusCode >= 500) {
    console.error(error)
  }

  const payload = { error: message }
  if (statusCode < 500 && error.code) payload.code = error.code
  if (statusCode < 500 && error.details) payload.details = error.details
  if (statusCode >= 500 && process.env.NODE_ENV !== 'production' && error.message && error.message !== message) {
    payload.details = error.message
  }

  return res.status(statusCode).json(payload)
}

module.exports = { errorHandler }
