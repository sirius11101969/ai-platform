const assert = require('assert')

const dbPoolPath = require.resolve('../src/db/pool')
const revenueServicePath = require.resolve('../src/services/revenueService')

function mockModule(modulePath, exports) {
  const original = require.cache[modulePath]
  require.cache[modulePath] = { id: modulePath, filename: modulePath, loaded: true, exports }
  return () => (original ? (require.cache[modulePath] = original) : delete require.cache[modulePath])
}

async function run() {
  const state = { orders: [], events: [] }
  const restore = mockModule(dbPoolPath, {
    query: async (sql, params) => {
      if (sql.includes('FROM revenue_orders') && sql.includes('checkout_id') && sql.includes("status = 'payment_pending'")) {
        return { rows: state.orders.filter((o) => o.workspace_id === params[0] && o.checkout_id === params[1] && o.status === 'payment_pending').slice(0, 1) }
      }
      if (sql.includes('FROM revenue_orders') && sql.includes('ORDER BY created_at DESC')) {
        return { rows: state.orders.filter((o) => o.workspace_id === params[0] && o.status === 'payment_pending') }
      }
      return { rows: [] }
    },
    connect: async () => ({
      query: async (sql, params) => {
        if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return { rows: [] }
        if (sql.includes('FROM revenue_orders') && sql.includes('checkout_id') && sql.includes("status = 'payment_pending'")) {
          return { rows: state.orders.filter((o) => o.workspace_id === params[0] && o.checkout_id === params[1] && o.status === 'payment_pending').slice(0, 1) }
        }
        if (sql.includes('FROM revenue_events')) {
          return { rows: [{ payload: { amount: 3900, currency: 'RUB' } }] }
        }
        if (sql.includes('INSERT INTO revenue_orders')) {
          const row = { id: `order-${state.orders.length + 1}`, workspace_id: params[0], checkout_id: params[1], plan: params[2], amount: params[3], currency: params[4], status: 'payment_pending', credits: params[5], provider: params[6], created_at: new Date().toISOString() }
          state.orders.push(row)
          return { rows: [row] }
        }
        if (sql.includes('INSERT INTO revenue_events')) {
          state.events.push({ workspace_id: params[0], event_type: params[1] })
          return { rows: [{ id: `evt-${state.events.length}` }] }
        }
        return { rows: [] }
      },
      release: () => {},
    }),
  })

  delete require.cache[revenueServicePath]
  const service = require('../src/services/revenueService')

  try {
    const first = await service.createPendingOrder({ workspaceId: 'ws-1', checkoutId: 'chk-1', plan: 'starter' })
    assert.equal(first.deduped, false)
    const second = await service.createPendingOrder({ workspaceId: 'ws-1', checkoutId: 'chk-1', plan: 'starter' })
    assert.equal(second.deduped, true, 'duplicate pending prevented')

    const isolated = await service.createPendingOrder({ workspaceId: 'ws-2', checkoutId: 'chk-1', plan: 'pro' })
    assert.equal(isolated.deduped, false, 'workspace isolation for same checkoutId')

    const ws1Orders = await service.getPendingOrders({ workspaceId: 'ws-1' })
    assert.equal(ws1Orders.length, 1)
    assert.equal(state.events.filter((e) => e.event_type === 'payment_pending').length >= 2, true, 'payment_pending events created')
  } finally {
    restore()
    delete require.cache[revenueServicePath]
  }
}

run().then(() => console.log('revenuePaymentPendingFlow.test.js passed')).catch((error) => { console.error(error); process.exit(1) })
