const assert = require('assert')

const poolPath = require.resolve('../src/db/pool')
const enginePath = require.resolve('../src/services/aiRevenueEngine/autonomousRevenueEngine')

function installPoolMock(poolMock) {
  const original = require.cache[poolPath]
  require.cache[poolPath] = { id: poolPath, filename: poolPath, loaded: true, exports: poolMock }
  return () => {
    if (original) require.cache[poolPath] = original
    else delete require.cache[poolPath]
  }
}

function clearEngineCache() {
  delete require.cache[enginePath]
}

function createMockDb({ failRecommendationInsert = false } = {}) {
  const state = {
    snapshots: [],
    recommendations: [],
    risks: [],
    memory: [],
    released: 0,
    rollbacks: 0,
    begins: 0,
  }

  const pool = {
    async query(sql) {
      if (sql.includes('FROM crm_leads')) return { rows: [{ status: 'proposal', value: 1000, estimated_revenue: 1000 }] }
      if (sql.includes('FROM ai_approval_queue')) return { rows: [{ pending: 2 }] }
      if (sql.includes('AVG(queue_pressure)')) return { rows: [{ pressure: 31 }] }
      if (sql.includes('AVG(utilization_pct)')) return { rows: [{ utilization: 67 }] }
      if (sql.includes('SELECT * FROM ai_revenue_engine_snapshots')) return { rows: [...state.snapshots].reverse() }
      return { rows: [] }
    },
    async connect() {
      let busy = false
      let txAborted = false
      return {
        async query(sql, params = []) {
          if (busy) throw new Error('Calling client.query() when the client is already executing a query')
          busy = true
          try {
            await new Promise((resolve) => setTimeout(resolve, 1))
            if (txAborted && sql !== 'ROLLBACK') throw new Error('current transaction is aborted, commands ignored until end of transaction block')
            if (sql === 'BEGIN') {
              state.begins += 1
              return { rows: [] }
            }
            if (sql === 'COMMIT') return { rows: [] }
            if (sql === 'ROLLBACK') {
              txAborted = false
              state.rollbacks += 1
              return { rows: [] }
            }
            if (sql.includes('INSERT INTO ai_revenue_engine_snapshots')) {
              const row = { id: `snap-${state.snapshots.length + 1}`, workspace_id: params[0] }
              state.snapshots.push(row)
              return { rows: [row] }
            }
            if (sql.includes('INSERT INTO ai_revenue_strategy_recommendations')) {
              if (failRecommendationInsert) {
                txAborted = true
                throw new Error('forced recommendation insert failure')
              }
              state.recommendations.push({ workspace_id: params[0], snapshot_id: params[1] })
              return { rows: [] }
            }
            if (sql.includes('INSERT INTO ai_revenue_risk_events')) {
              state.risks.push({ workspace_id: params[0], snapshot_id: params[1] })
              return { rows: [] }
            }
            if (sql.includes('INSERT INTO ai_revenue_optimization_memory')) {
              state.memory.push({ workspace_id: params[0] })
              return { rows: [] }
            }
            return { rows: [] }
          } finally {
            busy = false
          }
        },
        release() { state.released += 1 },
      }
    },
  }

  return { pool, state }
}

async function testConcurrentAnalysisSafety() {
  const { pool, state } = createMockDb()
  const restore = installPoolMock(pool)
  clearEngineCache()
  const engine = require('../src/services/aiRevenueEngine/autonomousRevenueEngine')
  try {
    await Promise.all([
      engine.runAnalysis({ workspaceId: '11111111-1111-1111-1111-111111111111' }),
      engine.runAnalysis({ workspaceId: '11111111-1111-1111-1111-111111111111' }),
    ])
    assert.strictEqual(state.snapshots.length, 2)
    assert.ok(state.recommendations.length >= 2)
    assert.strictEqual(state.rollbacks, 0)
  } finally { restore(); clearEngineCache() }
}

async function testRollbackAndReleaseOnFailure() {
  const { pool, state } = createMockDb({ failRecommendationInsert: true })
  const restore = installPoolMock(pool)
  clearEngineCache()
  const engine = require('../src/services/aiRevenueEngine/autonomousRevenueEngine')
  try {
    await assert.rejects(
      () => engine.runAnalysis({ workspaceId: '11111111-1111-1111-1111-111111111111' }),
      /forced recommendation insert failure/
    )
    assert.strictEqual(state.rollbacks, 1)
    assert.strictEqual(state.released, 1)
  } finally { restore(); clearEngineCache() }
}

async function testSnapshotAndRecommendationsPersist() {
  const { pool, state } = createMockDb()
  const restore = installPoolMock(pool)
  clearEngineCache()
  const engine = require('../src/services/aiRevenueEngine/autonomousRevenueEngine')
  try {
    await engine.runAnalysis({ workspaceId: '11111111-1111-1111-1111-111111111111' })
    const snapshot = await engine.getLatestSnapshot({ workspaceId: '11111111-1111-1111-1111-111111111111' })
    assert.ok(snapshot)
    assert.ok(state.recommendations.length > 0)
    assert.ok(state.memory.length > 0)
  } finally { restore(); clearEngineCache() }
}

Promise.resolve()
  .then(testConcurrentAnalysisSafety)
  .then(testRollbackAndReleaseOnFailure)
  .then(testSnapshotAndRecommendationsPersist)
  .then(() => console.log('aiRevenueEngineTransactionConcurrency.test.js passed'))
  .catch((error) => { console.error(error); process.exit(1) })
