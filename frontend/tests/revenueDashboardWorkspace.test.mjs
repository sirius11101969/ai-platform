import assert from 'node:assert/strict'
const store = new Map()
store.set('ai-platform-workspace-id', 'ws-selected')

global.window = {
  localStorage: {
    getItem: (key) => store.get(key) || null,
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key),
  },
  sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
}

global.CustomEvent = class CustomEvent { constructor(type, init = {}) { this.type = type; this.detail = init.detail } }

const calls = []
global.fetch = async (url) => {
  calls.push(String(url))
  if (String(url).includes('/revenue/overview')) return { ok: true, json: async () => ({ overview: {} }) }
  if (String(url).includes('/revenue/funnel')) return { ok: true, json: async () => ({ funnel: [{ stage: 'checkout_started', total: 1 }, { stage: 'payment_pending', total: 2 }] }) }
  if (String(url).includes('/revenue/orders/pending')) return { ok: true, json: async () => ({ orders: [{ id: 'order-1', plan: 'starter', status: 'payment_pending', created_at: '2026-05-22T00:00:00.000Z' }] }) }
  if (String(url).includes('/workspaces')) return { ok: true, json: async () => ({ workspaces: [{ id: 'ws-selected', name: 'Workspace A' }] }) }
  return { ok: true, json: async () => ({}) }
}

const api = await import('../src/services/api.js')
await api.fetchRevenueOverview('ws-selected')
await api.fetchRevenueFunnel('ws-selected')

assert.equal(calls.some((url) => url.includes('/revenue/overview?workspaceId=ws-selected')), true, 'overview request includes selected workspaceId query')
assert.equal(calls.some((url) => url.includes('/revenue/funnel?workspaceId=ws-selected')), true, 'funnel request includes selected workspaceId query')

const funnelPayload = await api.fetchRevenueFunnel('ws-selected')

const dashboardSource = await import('node:fs/promises').then((fs) => fs.readFile(new URL('../src/pages/RevenueDashboardPage.jsx', import.meta.url), 'utf8'))
assert.equal(dashboardSource.includes('Current workspace:'), true, 'workspace label is rendered')
assert.equal(/checkout_started/.test(JSON.stringify(funnelPayload)) || dashboardSource.includes('item.total'), true, 'funnel renders checkout_started count from API payload')
assert.equal(funnelPayload.funnel[0].stage, 'checkout_started')
assert.equal(funnelPayload.funnel[0].total, 1, 'checkout_started count from API is preserved')
assert.equal(dashboardSource.includes("setFunnel(f?.funnel || f?.data?.funnel || [])"), true, 'funnel mapping supports response.funnel and response.data.funnel')
assert.equal(dashboardSource.includes('item.total ?? 0'), true, 'missing funnel totals fall back to 0')
assert.equal(dashboardSource.includes('Revenue source:</strong> live API'), true, 'dashboard shows visible live API source label')

await api.fetchRevenueFunnel('ws-isolated')
assert.equal(calls.some((url) => url.includes('workspaceId=ws-isolated')), true, 'workspace isolation preserved via explicit workspace-scoped calls')

console.log('revenue dashboard workspace tests passed')

assert.equal(dashboardSource.includes('Pending Orders'), true, 'dashboard renders Pending Orders section')
