const assert = require('assert')
const {
  isStagingPaymentSimulationEnabled,
  getStagingPaymentSimulationDescriptor,
  assertStagingPaymentSimulationEnabled,
} = require('../src/services/stagingPaymentSimulationPolicy')

const safeStaging = {
  AS6_ENVIRONMENT: 'staging',
  AS6_STAGING_PAYMENT_SIMULATION: 'true',
  YOOKASSA_MODE: 'disabled',
  YOOKASSA_SHOP_ID: '',
  YOOKASSA_SECRET_KEY: '',
}

assert.strictEqual(isStagingPaymentSimulationEnabled(safeStaging), true)
assert.deepStrictEqual(getStagingPaymentSimulationDescriptor(safeStaging), {
  mode: 'staging_simulation',
  simulationOnly: true,
  realPayments: false,
})
assert.doesNotThrow(() => assertStagingPaymentSimulationEnabled(safeStaging))

for (const unsafe of [
  { ...safeStaging, AS6_ENVIRONMENT: 'production' },
  { ...safeStaging, AS6_STAGING_PAYMENT_SIMULATION: 'false' },
  { ...safeStaging, YOOKASSA_MODE: 'test' },
  { ...safeStaging, YOOKASSA_SHOP_ID: 'configured' },
  { ...safeStaging, YOOKASSA_SECRET_KEY: 'configured' },
]) {
  assert.strictEqual(isStagingPaymentSimulationEnabled(unsafe), false)
  assert.throws(() => assertStagingPaymentSimulationEnabled(unsafe), (error) => {
    return error.code === 'STAGING_PAYMENT_SIMULATION_FORBIDDEN'
  })
}

console.log('AS6_STAGING_PAYMENT_SIMULATION_POLICY=PASS')
