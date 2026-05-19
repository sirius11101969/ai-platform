const assert = require('assert')
const path = require('path')

function install() {
  const servicePath = path.resolve(__dirname, '../src/services/approvalCenter/approvalCenterService.js')
  const poolPath = path.resolve(__dirname, '../src/db/pool.js')
  delete require.cache[servicePath]
  delete require.cache[poolPath]
  const state = { item: { id: 'a1', workspace_id: 'w1', approval_status: 'pending_approval', recommendation_type: 'next_best_action', recommendation_payload: { suggestedAction: 'Send follow-up' }, confidence_score: 86, urgency: 'high', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, audits: 0, lastListQuery: null }
  const client = { query: async (sql, params=[]) => { if (['BEGIN','COMMIT','ROLLBACK'].includes(sql)) return { rows: [] }; if (sql.startsWith('INSERT INTO ai_approval_queue')) return { rows: [state.item] }; if (sql.startsWith('SELECT q.*, l.name')) { state.lastListQuery = { sql, params }; return { rows: [state.item] } }; if (sql.startsWith('SELECT * FROM ai_approval_queue')) return { rows: [state.item] }; if (sql.startsWith('INSERT INTO ai_approval_decisions')) return { rows: [{ id: 'd1' }] }; if (sql.startsWith('UPDATE ai_approval_queue')) { state.item = { ...state.item, approval_status: params[2], updated_at: new Date().toISOString() }; return { rows: [state.item] } } if (sql.startsWith('INSERT INTO ai_approval_audit_log')) { state.audits += 1; return { rows: [{ id: 'log1' }] } } throw new Error(`Unexpected query ${sql}`) }, release(){} }
  const pool = { query: client.query, connect: async () => client }
  require.cache[poolPath] = { id: poolPath, filename: poolPath, loaded: true, exports: pool }
  return { service: require(servicePath), state }
}

async function main() {
  const { service, state } = install()
  const created = await service.createApprovalItem({ workspaceId: 'w1', recommendationType: 'next_best_action', recommendationPayload: { suggestedAction: 'Send follow-up' }, confidenceScore: 91, urgency: 'high' })
  assert.strictEqual(created.status, 'pending_approval')
  const list = await service.listQueue('w1', { status: 'pending_approval' })
  assert.strictEqual(list.items.length, 1)
  assert.ok(state.lastListQuery)
  assert.ok(state.lastListQuery.sql.includes('WHERE q.workspace_id = $1 AND q.approval_status = $2'))
  assert.deepStrictEqual(state.lastListQuery.params, ['w1', 'pending_approval'])
  await service.updateDecision({ userId: 'u1', workspaceId: 'w1', id: 'a1', action: 'snooze', snoozeUntil: new Date().toISOString() })
  assert.strictEqual(state.item.approval_status, 'snoozed')
  await service.updateDecision({ userId: 'u1', workspaceId: 'w1', id: 'a1', action: 'escalate' })
  assert.strictEqual(state.item.approval_status, 'escalated')
  await service.updateDecision({ userId: 'u1', workspaceId: 'w1', id: 'a1', action: 'approve' })
  assert.strictEqual(state.item.approval_status, 'approved')
  assert.ok(state.audits >= 3)
  console.log('approvalCenterService tests passed')
}

main().catch((error) => { console.error(error); process.exit(1) })
