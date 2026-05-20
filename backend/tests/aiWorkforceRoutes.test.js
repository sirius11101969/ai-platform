const assert = require('assert')

const authServicePath = require.resolve('../src/services/authService')
const workspaceModelPath = require.resolve('../src/models/workspaceModel')
const dbPoolPath = require.resolve('../src/db/pool')
const indexPath = require.resolve('../src/index')

function installMockModule(modulePath, exports) {
  const original = require.cache[modulePath]
  require.cache[modulePath] = { id: modulePath, filename: modulePath, loaded: true, exports }
  return () => (original ? (require.cache[modulePath] = original) : delete require.cache[modulePath])
}

function clearModules() {
  for (const p of [indexPath, require.resolve('../src/routes/aiWorkforceRoutes'), require.resolve('../src/controllers/aiWorkforceController')]) delete require.cache[p]
}

async function request(baseUrl, path, headers) {
  const res = await fetch(`${baseUrl}${path}`, { headers })
  return { status: res.status, body: await res.json() }
}

async function run() {
  const restore = [
    installMockModule(authServicePath, { verifyToken: async () => ({ id: 'u1' }) }),
    installMockModule(workspaceModelPath, { getWorkspaceForUser: async (_u, wid) => (wid === 'ws-ok' ? { id: wid, userId: 'u1' } : null) }),
    installMockModule(dbPoolPath, {
      query: async (sql) => {
        if (sql.includes('FROM ai_workforce_agents')) return { rows: [{ id: 'a1', role: 'SDR', status: 'assigned', workload: 3, collaboration_state: 'active', metadata: {} }] }
        if (sql.includes('FROM ai_workforce_tasks')) return { rows: [{ id: 't1', task_type: 'lead_qualification', status: 'queued', execution_dependencies: ['approval_center'] }] }
        if (sql.includes('FROM ai_workforce_assignments')) return { rows: [{ id: 'as1', task_id: 't1', agent_id: 'a1', status: 'assigned' }] }
        if (sql.includes('FROM ai_workforce_execution_plans')) return { rows: [{ id: 'p1', task_type: 'lead_qualification', status: 'waiting_approval' }] }
        if (sql.includes('FROM ai_workforce_collaboration_events')) return { rows: [{ count: 2 }] }
        if (sql.includes('FROM ai_worker_queue')) return { rows: [{ count: 4 }] }
        return { rows: [] }
      },
    }),
  ]

  clearModules()
  const { app } = require('../src/index')
  const server = await new Promise((resolve) => { const s = app.listen(0, '127.0.0.1', () => resolve(s)) })
  const base = `http://127.0.0.1:${server.address().port}`
  const headers = { authorization: 'Bearer jwt', 'x-workspace-id': 'ws-ok' }

  const agents = await request(base, '/api/ai/workforce/agents', headers)
  const assignments = await request(base, '/api/ai/workforce/assignments', headers)
  const plans = await request(base, '/api/ai/workforce/execution-plans', headers)
  const metrics = await request(base, '/api/ai/workforce/metrics', headers)
  const isolation = await request(base, '/api/ai/workforce/agents', { authorization: 'Bearer jwt', 'x-workspace-id': 'bad' })

  assert.strictEqual(agents.status, 200)
  assert.strictEqual(assignments.status, 200)
  assert.strictEqual(plans.status, 200)
  assert.strictEqual(metrics.status, 200)
  assert.strictEqual(metrics.body.metrics.pendingApprovals, 4)
  assert.strictEqual(isolation.status, 403)

  await new Promise((resolve) => server.close(resolve))
  clearModules(); restore.reverse().forEach((r) => r())
  console.log('aiWorkforceRoutes.test.js passed')
}

run().catch((error) => { console.error(error); process.exit(1) })
