function normalize(value) {
  return String(value || '').trim().toLowerCase()
}

function isStagingPaymentSimulationEnabled(env = process.env) {
  return normalize(env.AS6_ENVIRONMENT) === 'staging' &&
    normalize(env.AS6_STAGING_PAYMENT_SIMULATION) === 'true' &&
    normalize(env.YOOKASSA_MODE) === 'disabled' &&
    !String(env.YOOKASSA_SHOP_ID || '').trim() &&
    !String(env.YOOKASSA_SECRET_KEY || '').trim()
}

function getStagingPaymentSimulationDescriptor(env = process.env) {
  const enabled = isStagingPaymentSimulationEnabled(env)
  return {
    mode: enabled ? 'staging_simulation' : 'provider',
    simulationOnly: enabled,
    realPayments: !enabled,
  }
}

function assertStagingPaymentSimulationEnabled(env = process.env) {
  if (!isStagingPaymentSimulationEnabled(env)) {
    throw Object.assign(new Error('Тестовая активация тарифа доступна только в изолированном staging'), {
      statusCode: 403,
      code: 'STAGING_PAYMENT_SIMULATION_FORBIDDEN',
    })
  }
}

module.exports = {
  isStagingPaymentSimulationEnabled,
  getStagingPaymentSimulationDescriptor,
  assertStagingPaymentSimulationEnabled,
}
