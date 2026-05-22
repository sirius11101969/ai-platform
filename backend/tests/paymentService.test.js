const assert = require('assert')

const paymentServicePath = require.resolve('../src/services/paymentService')
const poolPath = require.resolve('../src/db/pool')
const revenueServicePath = require.resolve('../src/services/revenueService')

function loadWithMocks({ queryImpl }) {
  delete require.cache[paymentServicePath]
  const originalPool = require.cache[poolPath]
  const originalRevenue = require.cache[revenueServicePath]

  const fakePool = {
    query: queryImpl,
    connect: async () => ({ query: queryImpl, release() {} }),
  }

  require.cache[poolPath] = { id: poolPath, filename: poolPath, loaded: true, exports: fakePool }
  require.cache[revenueServicePath] = { id: revenueServicePath, filename: revenueServicePath, loaded: true, exports: { completePayment: async () => ({ ok: true }) } }
  const service = require('../src/services/paymentService')
  return { service, restore: () => { delete require.cache[paymentServicePath]; if (originalPool) require.cache[poolPath]=originalPool; else delete require.cache[poolPath]; if (originalRevenue) require.cache[revenueServicePath]=originalRevenue; else delete require.cache[revenueServicePath] } }
}

async function testProviderIsolation() {
  const { service, restore } = loadWithMocks({ queryImpl: async (sql) => {
    if (sql.includes('FROM payment_providers')) return { rows: [] }
    throw new Error('unexpected query')
  }})
  try {
    await assert.rejects(() => service.createPayment({ workspaceId: 'w', provider: 'stripe', amount: 10, currency: 'USD' }))
  } finally { restore() }
}

async function testDuplicateWebhook() {
  let updateCalled = 0
  const { service, restore } = loadWithMocks({ queryImpl: async (sql) => {
    if (sql.includes('FROM payment_providers')) return { rows: [{ provider: 'stripe', enabled: true, mode: 'mock', currency: 'USD' }] }
    if (sql.includes('FROM payment_transactions WHERE provider=')) return { rows: [{ id: '1', status: 'paid', amount: 10 }] }
    if (sql.includes('UPDATE payment_transactions')) { updateCalled += 1; return { rows: [] } }
    if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return { rows: [] }
    return { rows: [] }
  }})
  try {
    const result = await service.processWebhook({ workspaceId: 'w', provider: 'stripe', externalPaymentId: 'x', status: 'paid' })
    assert.strictEqual(result.deduped, true)
    assert.strictEqual(updateCalled, 0)
  } finally { restore() }
}

async function testLedgerConsistencySingleCreditGrant() {
  let creditUpdates = 0
  let txStatus = 'created'
  const { service, restore } = loadWithMocks({ queryImpl: async (sql) => {
    if (sql.includes('FROM payment_providers')) return { rows: [{ provider: 'stripe', enabled: true, mode: 'mock', currency: 'USD' }] }
    if (sql.includes('FROM payment_transactions WHERE provider=')) return { rows: [{ id: '1', status: txStatus, amount: 9 }] }
    if (sql.includes('UPDATE payment_transactions')) { txStatus = 'paid'; return { rows: [{ id: '1', status: 'paid', amount: 9 }] } }
    if (sql.includes('UPDATE workspaces SET credits_pool')) { creditUpdates += 1; return { rows: [] } }
    if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return { rows: [] }
    return { rows: [] }
  }})
  try {
    await service.processWebhook({ workspaceId: 'w', provider: 'stripe', externalPaymentId: 'x', status: 'paid' })
    await service.processWebhook({ workspaceId: 'w', provider: 'stripe', externalPaymentId: 'x', status: 'paid' })
    assert.strictEqual(creditUpdates, 1)
  } finally { restore() }
}



async function testStatusReturnsLatestCreatedTransaction() {
  const newest = {
    id: 'tx-2',
    provider: 'stripe',
    external_payment_id: 'mock_2',
    status: 'created',
    amount: 15,
    currency: 'USD',
    metadata: { source: 'checkout' },
    created_at: '2026-05-22T00:00:00.000Z',
  }

  let capturedSql = ''
  let capturedParams = []
  const { service, restore } = loadWithMocks({ queryImpl: async (sql, params = []) => {
    if (sql.includes('FROM payment_transactions') && sql.includes('ORDER BY created_at DESC') && sql.includes('LIMIT 1')) {
      capturedSql = sql
      capturedParams = params
      return { rows: [newest] }
    }
    throw new Error(`unexpected query: ${sql}`)
  }})

  try {
    const payment = await service.getPaymentStatus({ workspaceId: '00000000-0000-0000-0000-000000000123' })
    assert.deepStrictEqual(payment, newest)
    assert.deepStrictEqual(capturedParams, ['00000000-0000-0000-0000-000000000123'])
    assert.ok(capturedSql.includes('WHERE workspace_id = $1::uuid'))
  } finally { restore() }
}
Promise.resolve()
  .then(testProviderIsolation)
  .then(testDuplicateWebhook)
  .then(testLedgerConsistencySingleCreditGrant)
  .then(testStatusReturnsLatestCreatedTransaction)
  .then(() => console.log('paymentService tests passed'))
