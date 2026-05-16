const assert = require('assert')
const pool = require('../src/db/pool')
const publicLeadService = require('../src/services/publicLeadService')

const productionWorkspaceId = 'f34b6b06-0000-4000-8000-000000000001'
const testWorkspaceId = 'a31f12fd-0000-4000-8000-000000000001'
const ownerUserId = '00000000-0000-4000-8000-000000000101'
const leadId = '00000000-0000-4000-8000-000000000201'

function compact(sql) {
  return String(sql).replace(/\s+/g, ' ').trim()
}

function makeWorkspace(overrides = {}) {
  return {
    id: productionWorkspaceId,
    name: 'buylesson workspace',
    owner_user_id: ownerUserId,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  }
}

async function withEnv(value, fn) {
  const original = process.env.PUBLIC_LEADS_WORKSPACE_ID
  if (value === undefined) delete process.env.PUBLIC_LEADS_WORKSPACE_ID
  else process.env.PUBLIC_LEADS_WORKSPACE_ID = value
  try {
    return await fn()
  } finally {
    if (original === undefined) delete process.env.PUBLIC_LEADS_WORKSPACE_ID
    else process.env.PUBLIC_LEADS_WORKSPACE_ID = original
  }
}

async function runEnvWorkspaceTest() {
  const queries = []
  const client = {
    query: async (sql, params = []) => {
      queries.push({ query: compact(sql), params })
      assert.strictEqual(params[0], productionWorkspaceId)
      return { rows: [makeWorkspace({ name: 'Production' })], rowCount: 1 }
    },
  }

  await withEnv(productionWorkspaceId, async () => {
    const selected = await publicLeadService._private.resolveWorkspace(client)
    assert.strictEqual(selected.workspaceId, productionWorkspaceId)
    assert.strictEqual(selected.workspaceName, 'Production')
    assert.strictEqual(selected.userId, ownerUserId)
    assert.strictEqual(selected.reason, 'PUBLIC_LEADS_WORKSPACE_ID')
  })

  assert.strictEqual(queries.length, 1)
  assert.ok(queries[0].query.startsWith('SELECT * FROM workspaces WHERE id = $1'), 'env workspace should be validated by id')
}

async function runInvalidEnvWorkspaceTest() {
  const client = {
    query: async () => {
      throw new Error('invalid env workspace must not query database')
    },
  }

  await withEnv('not-a-uuid', async () => {
    await assert.rejects(
      () => publicLeadService._private.resolveWorkspace(client),
      (error) => error.statusCode === 503 && error.message.includes('valid workspace UUID')
    )
  })
}

async function runFallbackWorkspaceTest() {
  const queries = []
  const client = {
    query: async (sql) => {
      const query = compact(sql)
      queries.push(query)
      assert.ok(query.includes("LOWER(name) NOT LIKE '%test%'"), 'fallback must exclude test workspaces')
      assert.ok(query.includes("LOWER(name) NOT LIKE '%demo%'"), 'fallback must exclude demo workspaces')
      assert.ok(query.includes("LOWER(name) NOT LIKE '%sandbox%'"), 'fallback must exclude sandbox workspaces')
      assert.ok(query.includes("WHEN LOWER(name) = 'buylesson workspace' THEN 0"), 'fallback should prefer buylesson workspace')
      assert.ok(query.includes("WHEN LOWER(name) = 'production' THEN 2"), 'fallback should prefer production by name')
      assert.ok(query.includes("WHEN LOWER(name) = 'default' THEN 4"), 'fallback should prefer default by name')
      return { rows: [makeWorkspace()], rowCount: 1 }
    },
  }

  await withEnv(undefined, async () => {
    const selected = await publicLeadService._private.resolveWorkspace(client)
    assert.strictEqual(selected.workspaceId, productionWorkspaceId)
    assert.strictEqual(selected.workspaceName, 'buylesson workspace')
    assert.strictEqual(selected.userId, ownerUserId)
    assert.strictEqual(selected.reason, 'preferred_workspace_name')
  })

  assert.strictEqual(queries.length, 1)
}

async function runCreatePublicLeadWorkspaceConsistencyTest() {
  const originalConnect = pool.connect.bind(pool)
  const queries = []
  const workspaceUsages = {
    lead: null,
    activity: null,
    timeline: null,
    agent: null,
    action: null,
    worker: null,
    queue: null,
  }

  const client = {
    query: async (sql, params = []) => {
      const query = compact(sql)
      queries.push({ query, params })

      if (query === 'BEGIN' || query === 'COMMIT' || query === 'ROLLBACK') return { rows: [], rowCount: 0 }
      if (query.startsWith('SELECT * FROM workspaces')) return { rows: [makeWorkspace()], rowCount: 1 }
      if (query.startsWith('INSERT INTO crm_leads(')) {
        workspaceUsages.lead = params[1]
        assert.strictEqual(params[0], ownerUserId, 'lead user_id should be workspace owner_user_id')
        return {
          rows: [{
            id: leadId,
            user_id: params[0],
            workspace_id: params[1],
            name: params[2],
            email: params[3],
            phone: params[4],
            telegram: params[5],
            company: params[6],
            status: 'new',
            stage: 'new',
            value: 0,
            source: 'landing',
            notes: params[7],
            metadata: params[8],
            created_at: new Date(),
            updated_at: new Date(),
          }],
          rowCount: 1,
        }
      }
      if (query.startsWith('INSERT INTO crm_activity(')) {
        workspaceUsages.activity = params[1]
        return { rows: [], rowCount: 1 }
      }
      if (query.startsWith('INSERT INTO lead_timeline_events(')) {
        workspaceUsages.timeline = params[0]
        return { rows: [{ id: 'timeline-1', workspace_id: params[0], lead_id: params[1], user_id: params[2], event_type: params[3], title: params[4], body: params[5], source: params[6], metadata: params[7], created_at: new Date() }], rowCount: 1 }
      }
      if (query.startsWith('INSERT INTO ai_agents(')) {
        workspaceUsages.agent = params[0]
        return { rows: [{ id: 'agent-1' }], rowCount: 1 }
      }
      if (query.startsWith('INSERT INTO ai_agent_actions(')) {
        workspaceUsages.action = params[0]
        return { rows: [{ id: 'action-1' }], rowCount: 1 }
      }
      if (query.startsWith('INSERT INTO ai_workers(')) {
        workspaceUsages.worker = params[0]
        return { rows: [{ id: 'worker-1' }], rowCount: 1 }
      }
      if (query.startsWith('INSERT INTO ai_worker_queue(')) {
        workspaceUsages.queue = params[1]
        assert.strictEqual(params[3], 'Квалифицировать лида — Landing Lead')
        assert.strictEqual(params[4].includes('AI квалификация'), true)
        assert.strictEqual(params[5].leadId, leadId)
        return { rows: [{ id: 'queue-1' }], rowCount: 1 }
      }

      throw new Error(`Unexpected query in public lead service test: ${query}`)
    },
    release: () => {},
  }

  pool.connect = async () => client

  const originalQualificationWorker = process.env.AI_LEAD_QUALIFICATION_WORKER
  process.env.AI_LEAD_QUALIFICATION_WORKER = 'false'

  try {
    await withEnv(undefined, async () => {
      const result = await publicLeadService.createPublicLead({
        name: 'Landing Lead',
        email: 'lead@example.com',
        message: 'I want a lesson',
        source: 'landing-page',
        page_url: 'https://buylesson.example/landing',
      })
      assert.strictEqual(result.workspaceId, productionWorkspaceId)
      assert.strictEqual(result.actionId, 'action-1')
      assert.strictEqual(result.queueId, 'queue-1')
    })
  } finally {
    pool.connect = originalConnect
    if (originalQualificationWorker === undefined) delete process.env.AI_LEAD_QUALIFICATION_WORKER
    else process.env.AI_LEAD_QUALIFICATION_WORKER = originalQualificationWorker
  }

  for (const [table, workspaceId] of Object.entries(workspaceUsages)) {
    assert.strictEqual(workspaceId, productionWorkspaceId, `${table} should use selected workspace_id`)
  }
  assert.ok(!queries.some(({ params }) => params.includes(testWorkspaceId)), 'public lead creation should not use test workspace id')
}

async function main() {
  const originalInfo = console.info
  console.info = () => {}
  try {
    await runEnvWorkspaceTest()
    await runInvalidEnvWorkspaceTest()
    await runFallbackWorkspaceTest()
    await runCreatePublicLeadWorkspaceConsistencyTest()
  } finally {
    console.info = originalInfo
    await pool.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
