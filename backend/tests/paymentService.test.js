const assert = require('assert')

const paymentServicePath = require.resolve('../src/services/paymentService')
const poolPath = require.resolve('../src/db/pool')
const revenueServicePath = require.resolve('../src/services/revenueService')
const creditLedgerServicePath = require.resolve('../src/services/execution/creditLedgerService')
const yookassaProviderPath = require.resolve('../src/services/providers/yookassaProvider')

function loadWithMocks({ queryImpl, issuePaymentCreditsImpl, providerImpl }) {
  delete require.cache[paymentServicePath]
  const originalPool = require.cache[poolPath]
  const originalRevenue = require.cache[revenueServicePath]
  const originalCreditLedger = require.cache[creditLedgerServicePath]
  const originalProvider = require.cache[yookassaProviderPath]

  const fakePool = {
    query: queryImpl,
    connect: async () => ({ query: queryImpl, release() {} }),
  }

  require.cache[poolPath] = { id: poolPath, filename: poolPath, loaded: true, exports: fakePool }
  require.cache[revenueServicePath] = { id: revenueServicePath, filename: revenueServicePath, loaded: true, exports: { completePayment: async () => ({ ok: true }) } }
  require.cache[creditLedgerServicePath] = {
    id: creditLedgerServicePath,
    filename: creditLedgerServicePath,
    loaded: true,
    exports: { issuePaymentCredits: issuePaymentCreditsImpl || (async () => ({ duplicated: false, id: 'ledger-1', balance_after: 9 })) },
  }
  require.cache[yookassaProviderPath] = {
    id: yookassaProviderPath,
    filename: yookassaProviderPath,
    loaded: true,
    exports: providerImpl || {
      createMockPayment: async ({ provider }) => ({ paymentId: `mock_${provider}_1`, status: 'created', confirmationUrl: null, providerMetadata: { mode: 'mock' } }),
      createSandboxPayment: async () => ({ paymentId: 'sandbox_1', status: 'pending', confirmationUrl: 'https://sandbox.yookassa/confirm', providerMetadata: { mode: 'test' } }),
    },
  }
  const service = require('../src/services/paymentService')
  return {
    service,
    restore: () => {
      delete require.cache[paymentServicePath]
      if (originalPool) require.cache[poolPath] = originalPool; else delete require.cache[poolPath]
      if (originalRevenue) require.cache[revenueServicePath] = originalRevenue; else delete require.cache[revenueServicePath]
      if (originalCreditLedger) require.cache[creditLedgerServicePath] = originalCreditLedger; else delete require.cache[creditLedgerServicePath]
      if (originalProvider) require.cache[yookassaProviderPath] = originalProvider; else delete require.cache[yookassaProviderPath]
    },
  }
}

async function testCreatePaymentMockModeUnchanged() {
  process.env.YOOKASSA_MODE = 'mock'
  let insertParams = null
  const { service, restore } = loadWithMocks({ queryImpl: async (sql, params = []) => {
    if (sql.includes('FROM payment_providers')) return { rows: [{ provider: 'yookassa', enabled: true, mode: 'mock', currency: 'RUB' }] }
    if (sql.includes('INSERT INTO payment_transactions')) { insertParams = params; return { rows: [{ id: 'tx-1', external_payment_id: params[2], status: 'created', checkout_url: params[8] }] } }
    return { rows: [] }
  } })
  try {
    const result = await service.createPayment({ workspaceId: '00000000-0000-0000-0000-000000000123', provider: 'yookassa', amount: 10, currency: 'rub' })
    assert.strictEqual(result.status, 'created')
    assert.strictEqual(result.confirmationUrl, null)
    assert.strictEqual(insertParams[2], 'mock_yookassa_1')
  } finally { restore(); delete process.env.YOOKASSA_MODE }
}

async function testCreatePaymentSandboxReturnsConfirmationUrlAndPersists() {
  process.env.YOOKASSA_MODE = 'test'
  let insertParams = null
  const { service, restore } = loadWithMocks({ queryImpl: async (sql, params = []) => {
    if (sql.includes('FROM payment_providers')) return { rows: [{ provider: 'yookassa', enabled: true, mode: 'mock', currency: 'RUB' }] }
    if (sql.includes('INSERT INTO payment_transactions')) { insertParams = params; return { rows: [{ id: 'tx-2', external_payment_id: params[2], checkout_url: params[8], provider_metadata: params[7] }] } }
    return { rows: [] }
  } })
  try {
    const result = await service.createPayment({ workspaceId: '00000000-0000-0000-0000-000000000123', provider: 'yookassa', amount: 15, currency: 'RUB', metadata: { orderId: 'ord-1' } })
    assert.strictEqual(result.paymentId, 'sandbox_1')
    assert.strictEqual(result.confirmationUrl, 'https://sandbox.yookassa/confirm')
    assert.strictEqual(insertParams[2], 'sandbox_1')
    assert.strictEqual(insertParams[8], 'https://sandbox.yookassa/confirm')
  } finally { restore(); delete process.env.YOOKASSA_MODE }
}

async function testProviderIsolation() { /* unchanged */
  const { service, restore } = loadWithMocks({ queryImpl: async (sql) => {
    if (sql.includes('FROM payment_providers')) return { rows: [] }
    throw new Error('unexpected query')
  }})
  try { await assert.rejects(() => service.createPayment({ workspaceId: 'w', provider: 'stripe', amount: 10, currency: 'USD' })) } finally { restore() }
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
    assert.strictEqual(result.transaction.status, 'paid')
    assert.strictEqual(updateCalled, 0)
  } finally { restore() }
}

async function testLedgerConsistencySingleCreditGrant() {
  let issueCalls = 0
  let txStatus = 'created'
  const { service, restore } = loadWithMocks({
    queryImpl: async (sql) => {
      if (sql.includes('FROM payment_providers')) return { rows: [{ provider: 'stripe', enabled: true, mode: 'mock', currency: 'USD' }] }
      if (sql.includes('FROM payment_transactions WHERE provider=')) return { rows: [{ id: '1', status: txStatus, amount: 9, currency: 'USD', workspace_id: 'w' }] }
      if (sql.includes('UPDATE payment_transactions')) { txStatus = 'paid'; return { rows: [{ id: '1', status: 'paid', amount: 9 }] } }
      if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return { rows: [] }
      return { rows: [] }
    },
    issuePaymentCreditsImpl: async () => { issueCalls += 1; return { duplicated: false, id: 'ledger-1', balance_after: 9 } },
  })
  try {
    await service.processWebhook({ workspaceId: 'w', provider: 'stripe', externalPaymentId: 'x', status: 'paid', currency: 'USD' })
    await service.processWebhook({ workspaceId: 'w', provider: 'stripe', externalPaymentId: 'x', status: 'paid', currency: 'USD' })
    assert.strictEqual(issueCalls, 1)
  } finally { restore() }
}


async function testWebhookIssuesGrantMetadata() {
  const creditCalls = []
  const { service, restore } = loadWithMocks({
    queryImpl: async (sql) => {
      if (sql.includes('FROM payment_providers')) return { rows: [{ provider: 'stripe', enabled: true, mode: 'mock', currency: 'USD' }] }
      if (sql.includes('FROM payment_transactions WHERE provider=')) return { rows: [{ id: '1', status: 'created', amount: 12, currency: 'USD', workspace_id: 'w' }] }
      if (sql.includes('UPDATE payment_transactions')) return { rows: [{ id: '1', status: 'paid', amount: 12 }] }
      if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return { rows: [] }
      return { rows: [] }
    },
    issuePaymentCreditsImpl: async (payload) => { creditCalls.push(payload); return { duplicated: false, id: 'ledger-1', balance_after: 12 } },
  })

  try {
    await service.processWebhook({ workspaceId: 'w', provider: 'stripe', externalPaymentId: 'ext-1', status: 'paid', amount: 12, currency: 'usd' })
    assert.strictEqual(creditCalls.length, 1)
    assert.strictEqual(creditCalls[0].provider, 'stripe')
    assert.strictEqual(creditCalls[0].externalPaymentId, 'ext-1')
    assert.strictEqual(creditCalls[0].amount, 12)
    assert.strictEqual(creditCalls[0].currency, 'usd')
  } finally { restore() }
}

async function testIssuePaymentCreditsUsesGrantAndDedupes() {
  delete require.cache[creditLedgerServicePath]
  const originalPool = require.cache[poolPath]
  require.cache[poolPath] = { id: poolPath, filename: poolPath, loaded: true, exports: {} }
  const { issuePaymentCredits } = require('../src/services/execution/creditLedgerService')
  const state = { credits_pool: 3, inserted: false }
  const sqlLog = []
  const fakeClient = {
    query: async (sql, params=[]) => {
      sqlLog.push({ sql, params })
      if (sql.startsWith('SELECT id, balance_after FROM credit_ledger_entries')) {
        return state.inserted ? { rows: [{ id: 'ledger-1', balance_after: 8 }] } : { rows: [] }
      }
      if (sql.startsWith('SELECT id FROM workspaces')) return { rows: [{ id: 'w' }] }
      if (sql.startsWith('UPDATE workspaces SET credits_pool = credits_pool +')) {
        state.credits_pool += params[0]
        return { rows: [{ credits_pool: state.credits_pool }] }
      }
      if (sql.includes('INSERT INTO credit_ledger_entries')) {
        state.inserted = true
        return { rows: [{ id: 'ledger-1', balance_after: state.credits_pool }] }
      }
      throw new Error(`unexpected sql ${sql}`)
    },
  }

  try {
    const first = await issuePaymentCredits({ workspaceId: 'w', provider: 'stripe', externalPaymentId: 'ext-2', amount: 5, currency: 'usd' }, fakeClient)
  const second = await issuePaymentCredits({ workspaceId: 'w', provider: 'stripe', externalPaymentId: 'ext-2', amount: 5, currency: 'usd' }, fakeClient)

  assert.strictEqual(first.duplicated, false)
  assert.strictEqual(second.duplicated, true)
  assert.strictEqual(state.credits_pool, 8)

  const insertStmt = sqlLog.find((entry) => entry.sql.includes('INSERT INTO credit_ledger_entries'))
  assert.ok(insertStmt)
  assert.ok(insertStmt.sql.includes("'grant'"))

  const metadata = insertStmt.params[4]
  assert.deepStrictEqual(metadata, { reason: 'payment_credit', provider: 'stripe', externalPaymentId: 'ext-2', amount: 5, currency: 'USD' })

  const existingCheckParams = sqlLog[0].params
  assert.deepStrictEqual(existingCheckParams, ['w', 'payment:stripe:ext-2'])
  } finally {
    if (originalPool) require.cache[poolPath] = originalPool; else delete require.cache[poolPath]
    delete require.cache[creditLedgerServicePath]
  }
}

async function testStatusReturnsLatestCreatedTransaction() {
  const newest = { id: 'tx-2', provider: 'stripe', external_payment_id: 'mock_2', status: 'created', amount: 15, currency: 'USD', metadata: { source: 'checkout' }, created_at: '2026-05-22T00:00:00.000Z' }
  let capturedSql = ''
  let capturedParams = []
  const { service, restore } = loadWithMocks({ queryImpl: async (sql, params = []) => {
    if (sql.includes('FROM payment_transactions') && sql.includes('ORDER BY created_at DESC') && sql.includes('LIMIT 1')) { capturedSql = sql; capturedParams = params; return { rows: [newest] } }
    throw new Error(`unexpected query: ${sql}`)
  }})

  try { const payment = await service.getPaymentStatus({ workspaceId: '00000000-0000-0000-0000-000000000123' }); assert.deepStrictEqual(payment, newest); assert.deepStrictEqual(capturedParams, ['00000000-0000-0000-0000-000000000123']); assert.ok(capturedSql.includes('WHERE workspace_id = $1::uuid')) } finally { restore() }
}

Promise.resolve()
  .then(testProviderIsolation)
  .then(testCreatePaymentMockModeUnchanged)
  .then(testCreatePaymentSandboxReturnsConfirmationUrlAndPersists)
  .then(testDuplicateWebhook)
  .then(testLedgerConsistencySingleCreditGrant)
  .then(testWebhookIssuesGrantMetadata)
  .then(testIssuePaymentCreditsUsesGrantAndDedupes)
  .then(testStatusReturnsLatestCreatedTransaction)
  .then(() => console.log('paymentService tests passed'))
