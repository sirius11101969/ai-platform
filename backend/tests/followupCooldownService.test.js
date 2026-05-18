const assert = require('assert')
const pool = require('../src/db/pool')
const {
  COOLDOWN_SKIP_EVENT_BODY,
  COOLDOWN_SKIP_EVENT_TITLE,
  COOLDOWN_SKIP_EVENT_TYPE,
  FOLLOWUP_COOLDOWN_SKIP_REASON,
  shouldSkipFollowupForCooldown,
} = require('../src/services/followupCooldownService')

const workspaceId = '00000000-0000-4000-8000-000000000001'
const userId = '00000000-0000-4000-8000-000000000002'
const leadId = '00000000-0000-4000-8000-000000000003'

function compact(sql) {
  return String(sql).replace(/\s+/g, ' ').trim()
}

async function runCreatesTimelineAuditOncePerDayTest() {
  const insertedEvents = []
  const logs = []
  const originalQuery = pool.query.bind(pool)
  const originalInfo = console.info

  pool.query = async (sql, params = []) => {
    const query = compact(sql)

    if (query.startsWith('SELECT column_name FROM information_schema.columns')) {
      return {
        rows: ['lead_id', 'created_at', 'direction', 'sent_at'].map((column_name) => ({ column_name })),
        rowCount: 4,
      }
    }

    if (query.startsWith('SELECT MAX(outbound_at) AS last_outbound_at')) {
      return { rows: [{ last_outbound_at: new Date(Date.now() - 60 * 60 * 1000) }], rowCount: 1 }
    }

    if (query.startsWith('SELECT id FROM lead_timeline_events WHERE workspace_id = $1')) {
      assert.deepStrictEqual(params, [workspaceId, leadId, COOLDOWN_SKIP_EVENT_TYPE, 24])
      return insertedEvents.length
        ? { rows: [{ id: insertedEvents[0].id }], rowCount: 1 }
        : { rows: [], rowCount: 0 }
    }

    if (query.startsWith('INSERT INTO lead_timeline_events(')) {
      insertedEvents.push({
        id: `timeline-${insertedEvents.length + 1}`,
        workspace_id: params[0],
        lead_id: params[1],
        user_id: params[2],
        event_type: params[3],
        title: params[4],
        body: params[5],
        source: params[6],
        metadata: params[7],
        created_at: new Date(),
      })
      return { rows: [insertedEvents[insertedEvents.length - 1]], rowCount: 1 }
    }

    throw new Error(`Unexpected query in cooldown audit test: ${query}`)
  }
  console.info = (...args) => logs.push(args)

  try {
    const first = await shouldSkipFollowupForCooldown({ workspaceId, leadId, leadName: 'Telegram Connect Test', userId })
    const second = await shouldSkipFollowupForCooldown({ workspaceId, leadId, leadName: 'Telegram Connect Test', userId })

    assert.strictEqual(first.active, true)
    assert.strictEqual(second.active, true)
    assert.strictEqual(first.reason, FOLLOWUP_COOLDOWN_SKIP_REASON)
    assert.strictEqual(insertedEvents.length, 1, 'cooldown audit event should be inserted only once per lead per 24 hours')
    assert.strictEqual(insertedEvents[0].event_type, COOLDOWN_SKIP_EVENT_TYPE)
    assert.strictEqual(insertedEvents[0].title, COOLDOWN_SKIP_EVENT_TITLE)
    assert.strictEqual(insertedEvents[0].body, COOLDOWN_SKIP_EVENT_BODY)
    assert.strictEqual(insertedEvents[0].source, 'ai')
    assert.strictEqual(insertedEvents[0].metadata.reason, FOLLOWUP_COOLDOWN_SKIP_REASON)
    assert.ok(logs.some((entry) => entry[0] === '[followup-cooldown] timeline audit event created'))
    assert.ok(logs.some((entry) => entry[0] === '[followup-cooldown] timeline audit already exists'))
  } finally {
    pool.query = originalQuery
    console.info = originalInfo
  }
}

async function main() {
  try {
    await runCreatesTimelineAuditOncePerDayTest()
  } finally {
    await pool.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
