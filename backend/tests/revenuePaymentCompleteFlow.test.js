const assert = require('assert')

const dbPoolPath = require.resolve('../src/db/pool')
const revenueServicePath = require.resolve('../src/services/revenueService')

function mockModule(modulePath, exports) {
  const original = require.cache[modulePath]
  require.cache[modulePath] = { id: modulePath, filename: modulePath, loaded: true, exports }
  return () => (original ? (require.cache[modulePath] = original) : delete require.cache[modulePath])
}

async function run() {
  const state = { orders: [], events: [], creditsByWorkspace: {} }
  const restore = mockModule(dbPoolPath, {
    query: async (sql, params) => {
      if (sql.includes('FROM revenue_orders') && sql.includes("status IN ('payment_pending', 'paid')")) {
        return { rows: state.orders.filter((o) => o.workspace_id === params[0] && ['payment_pending', 'paid'].includes(o.status)) }
      }
      if (sql.includes('SELECT event_type, COUNT(*)::int AS total FROM revenue_events')) {
        const counts = {}
        for (const e of state.events.filter((x) => x.workspace_id === params[0])) counts[e.event_type] = (counts[e.event_type] || 0) + 1
        return { rows: Object.entries(counts).map(([event_type,total]) => ({ event_type, total })) }
      }
      return { rows: [] }
    },
    connect: async () => ({
      query: async (sql, params) => {
        if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return { rows: [] }
        if (sql.includes('SELECT * FROM revenue_orders WHERE workspace_id')) {
          return { rows: state.orders.filter((o) => o.workspace_id === params[0] && o.id === params[1]).slice(0,1) }
        }
        if (sql.includes("UPDATE revenue_orders SET status = 'paid'")) {
          const order = state.orders.find((o) => o.workspace_id === params[1] && o.id === params[2]); order.status='paid'; order.credits=params[0]; return { rows:[order] }
        }
        if (sql.includes('UPDATE workspaces SET credits_pool = credits_pool +')) { state.creditsByWorkspace[params[1]] = (state.creditsByWorkspace[params[1]] || 0) + Number(params[0]); return { rows: [] } }
        if (sql.includes('INSERT INTO revenue_events')) { state.events.push({ workspace_id: params[0], event_type: params[1], payload: JSON.parse(params[2]) }); return { rows: [{ id: `evt-${state.events.length}` }] } }
        return { rows: [] }
      },
      release: () => {},
    }),
  })

  delete require.cache[revenueServicePath]
  const service = require('../src/services/revenueService')

  try {
    state.orders.push({ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', workspace_id: '11111111-1111-4111-8111-111111111111', plan: 'pro', status: 'payment_pending', credits: 0, amount: 4900, currency: 'USD' })
    state.orders.push({ id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', workspace_id: '22222222-2222-4222-8222-222222222222', plan: 'starter', status: 'payment_pending', credits: 0, amount: 3900, currency: 'USD' })

    const first = await service.completePayment({ workspaceId: '11111111-1111-4111-8111-111111111111', orderId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' })
    assert.equal(first.status, 'paid', 'pending→paid')
    assert.equal(first.creditsIssued, 500, 'plan default credits applied')

    const deduped = await service.completePayment({ workspaceId: '11111111-1111-4111-8111-111111111111', orderId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' })
    assert.equal(deduped.deduped, true, 'duplicate complete does not double grant')

    const funnel = await service.getFunnel({ workspaceId: '11111111-1111-4111-8111-111111111111' })
    const byStage = Object.fromEntries(funnel.map((x) => [x.stage, x.total]))
    assert.equal(byStage.payment_completed, 1, 'funnel increments payment_completed')
    assert.equal(byStage.credits_issued, 1, 'credits_issued increments')
    assert.equal(byStage.activation_completed, 1, 'activation_completed increments')

    assert.equal(state.creditsByWorkspace['11111111-1111-4111-8111-111111111111'], 500, 'credits granted once')
    assert.equal(state.creditsByWorkspace['22222222-2222-4222-8222-222222222222'] || 0, 0, 'workspace isolation')
  } finally {
    restore()
    delete require.cache[revenueServicePath]
  }
}

run().then(() => console.log('revenuePaymentCompleteFlow.test.js passed')).catch((error) => { console.error(error); process.exit(1) })
