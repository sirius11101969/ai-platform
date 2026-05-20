const assert = require('assert')

const poolPath = require.resolve('../src/db/pool')
const queryCalls = []

require.cache[poolPath] = {
  id: poolPath,
  filename: poolPath,
  loaded: true,
  exports: {
    query: async (sql, params) => {
      queryCalls.push({ sql, params })

      if (sql.includes('FROM ai_strategic_plans')) {
        return {
          rows: [
            { id: 2, workspace_id: params[0], created_at: '2026-05-20T00:00:00.000Z' },
            { id: 1, workspace_id: params[0], created_at: '2026-05-19T00:00:00.000Z' }
          ]
        }
      }

      if (sql.includes('FROM ai_strategic_memory')) {
        return {
          rows: [
            { id: 7, workspace_id: params[0], memory_key: 'latest_strategic_plan', created_at: '2026-05-20T00:00:00.000Z' }
          ]
        }
      }

      throw new Error(`Unexpected query in test: ${sql}`)
    }
  }
}

const engine = require('../src/services/aiStrategicPlanning/strategicPlanningEngine')

async function run() {
  const workspaceId = 'ws_test'
  const plans = await engine.listPlans({ workspaceId })
  const strategicMemory = await engine.listStrategicMemory({ workspaceId })

  assert.strictEqual(plans.length, 2, 'returns latest strategic plans rows')
  assert.strictEqual(plans[0].id, 2, 'latest plan is first row')
  assert.strictEqual(strategicMemory.length, 1, 'strategic memory rows returned')
  assert.strictEqual(queryCalls.length, 2, 'uses shared pool query for both plans and strategic memory')
  assert.ok(queryCalls.every((c) => c.params[0] === workspaceId), 'workspace id is passed to every query for isolation')

  console.log('ai strategic planning plans endpoint db injection test passed')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
