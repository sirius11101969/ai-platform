const assert = require('assert')
const pool = require('../src/db/pool')
const {
  COOLDOWN_SKIP_EVENT_BODY,
  COOLDOWN_SKIP_EVENT_TITLE,
  COOLDOWN_SKIP_EVENT_TYPE,
  FOLLOWUP_COOLDOWN_SKIP_REASON,
  auditFollowupCooldownEarlySkip,
  shouldSkipFollowupForCooldown,
} = require('../src/services/followupCooldownService')

const workspaceId = '00000000-0000-4000-8000-000000000001'
const userId = '00000000-0000-4000-8000-000000000002'
const leadId = '00000000-0000-4000-8000-000000000003'

function compact(sql) {
  return String(sql).replace(/\s+/g, ' ').trim()
}

async function runCreatesTimelineAuditOncePerDayTest() {
  const insertedEvents = [
    {
      id: 'unrelated-lead-timeline',
      workspace_id: workspaceId,
      lead_id: '00000000-0000-4000-8000-000000000099',
      event_type: COOLDOWN_SKIP_EVENT_TYPE,
      created_at: new Date(),
    },
    {
      id: 'unrelated-workspace-timeline',
      workspace_id: '00000000-0000-4000-8000-000000000098',
      lead_id: leadId,
      event_type: COOLDOWN_SKIP_EVENT_TYPE,
      created_at: new Date(),
    },
  ]
  const logs = []
  const originalQuery = pool.query.bind(pool)
  const originalInfo = console.info

  pool.query = async (sql, params = []) => {
    const query = compact(sql)

    if (query.startsWith('SELECT column_name FROM information_schema.columns') && query.includes("table_name = 'email_messages'")) {
      return {
        rows: ['lead_id', 'created_at', 'direction', 'sent_at'].map((column_name) => ({ column_name })),
        rowCount: 4,
      }
    }

    if (query.startsWith('SELECT column_name FROM information_schema.columns') && query.includes("table_name = 'lead_timeline_events'")) {
      return {
        rows: ['id', 'workspace_id', 'lead_id', 'event_type', 'title', 'created_at'].map((column_name) => ({ column_name })),
        rowCount: 6,
      }
    }

    if (query.startsWith('SELECT MAX(outbound_at) AS last_outbound_at')) {
      return { rows: [{ last_outbound_at: new Date(Date.now() - 60 * 60 * 1000) }], rowCount: 1 }
    }

    if (query.startsWith('SELECT id, lead_id, event_type, title, created_at FROM lead_timeline_events')) {
      assert.ok(query.includes('WHERE lead_id = $1'), 'audit lookup must be scoped by exact lead_id')
      assert.ok(query.includes(`AND event_type = '${COOLDOWN_SKIP_EVENT_TYPE}'`), 'audit lookup must be scoped by exact cooldown audit event_type')
      assert.ok(query.includes("AND created_at >= NOW() - INTERVAL '24 hours'"), 'audit lookup must be limited to the exact 24 hour interval')
      assert.ok(query.includes('AND workspace_id = $2'), 'audit lookup must be scoped by exact workspace_id when the column exists')
      assert.deepStrictEqual(params, [leadId, workspaceId])
      const rows = insertedEvents.filter((event) => (
        event.workspace_id === workspaceId &&
        event.lead_id === leadId &&
        event.event_type === COOLDOWN_SKIP_EVENT_TYPE
      )).map((event) => ({
        id: event.id,
        lead_id: event.lead_id,
        event_type: event.event_type,
        title: event.title,
        created_at: event.created_at,
      }))
      return { rows, rowCount: rows.length }
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
    const earlySkip = await auditFollowupCooldownEarlySkip({ workspaceId, leadId, leadName: 'Telegram Connect Test', userId, skipReason: 'no_matching_rule' })

    assert.strictEqual(first.active, true)
    assert.strictEqual(second.active, true)
    assert.strictEqual(earlySkip.hasRecentOutbound, true)
    assert.strictEqual(first.reason, FOLLOWUP_COOLDOWN_SKIP_REASON)
    const cooldownAuditEvents = insertedEvents.filter((event) => (
      event.workspace_id === workspaceId &&
      event.lead_id === leadId &&
      event.event_type === COOLDOWN_SKIP_EVENT_TYPE
    ))
    assert.strictEqual(cooldownAuditEvents.length, 1, 'cooldown audit event should be inserted only once per lead per 24 hours')
    assert.strictEqual(cooldownAuditEvents[0].event_type, COOLDOWN_SKIP_EVENT_TYPE)
    assert.strictEqual(cooldownAuditEvents[0].title, COOLDOWN_SKIP_EVENT_TITLE)
    assert.strictEqual(cooldownAuditEvents[0].body, COOLDOWN_SKIP_EVENT_BODY)
    assert.strictEqual(cooldownAuditEvents[0].source, 'ai')
    assert.strictEqual(cooldownAuditEvents[0].metadata.reason, FOLLOWUP_COOLDOWN_SKIP_REASON)

    const earlySkipLog = logs.find((entry) => entry[0] === '[followup-cooldown] early skip audit check')
    const auditCheckLogs = logs.filter((entry) => entry[0] === '[followup-cooldown] timeline audit check')
    const createdLog = logs.find((entry) => entry[0] === '[followup-cooldown] timeline audit event created')
    const existingLog = logs.find((entry) => entry[0] === '[followup-cooldown] timeline audit already exists')
    const verifyLog = logs.find((entry) => entry[0] === '[followup-cooldown] timeline audit verify')
    assert.deepStrictEqual(earlySkipLog[1], {
      leadId,
      leadName: 'Telegram Connect Test',
      skipReason: 'no_matching_rule',
      hasRecentOutbound: true,
    })
    assert.strictEqual(auditCheckLogs.length, 3)
    assert.deepStrictEqual(auditCheckLogs[0][1], {
      leadId,
      leadName: 'Telegram Connect Test',
      workspaceId,
      eventType: COOLDOWN_SKIP_EVENT_TYPE,
      existingAuditCount: 0,
      existingAuditRows: [],
    })
    assert.deepStrictEqual(auditCheckLogs[1][1], {
      leadId,
      leadName: 'Telegram Connect Test',
      workspaceId,
      eventType: COOLDOWN_SKIP_EVENT_TYPE,
      existingAuditCount: 1,
      existingAuditRows: [{
        id: cooldownAuditEvents[0].id,
        lead_id: leadId,
        event_type: COOLDOWN_SKIP_EVENT_TYPE,
        title: COOLDOWN_SKIP_EVENT_TITLE,
        created_at: cooldownAuditEvents[0].created_at,
      }],
    })
    assert.deepStrictEqual(verifyLog[1], { leadId, inserted: true, verifyCount: 1 })
    assert.deepStrictEqual(createdLog[1], { leadId, leadName: 'Telegram Connect Test' })
    assert.deepStrictEqual(existingLog[1], auditCheckLogs[1][1])
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
