const pool = require('../db/pool')

const DEFAULT_FOLLOWUP_RULES = [
  { ruleType: 'no_reply_24h', suggestedChannel: 'crm', config: { thresholdHours: 24 }, reason: 'нет ответа больше 24 часов', urgency: 'medium', scheduledHours: 1 },
  { ruleType: 'no_reply_3d', suggestedChannel: 'crm', config: { thresholdHours: 72 }, reason: 'нет ответа больше 3 дней', urgency: 'high', scheduledHours: 1 },
  { ruleType: 'no_reply_7d', suggestedChannel: 'crm', config: { thresholdHours: 168 }, reason: 'нет ответа больше 7 дней', urgency: 'high', scheduledHours: 1 },
  { ruleType: 'proposal_no_reply', suggestedChannel: 'crm', config: { stage: 'proposal', thresholdHours: 48 }, reason: 'предложение отправлено, ответа пока нет', urgency: 'high', scheduledHours: 2 },
  { ruleType: 'meeting_no_next_step', suggestedChannel: 'crm', config: { stage: 'booked', thresholdHours: 24 }, reason: 'встреча забронирована, следующий шаг не зафиксирован', urgency: 'high', scheduledHours: 2 },
  { ruleType: 'hot_lead_inactive', suggestedChannel: 'crm', config: { minScore: 70, thresholdHours: 24 }, reason: 'горячий лид без свежего контакта', urgency: 'critical', scheduledHours: 1 },
]

async function ensureDefaultRulesForWorkspace(workspaceId, client = pool) {
  const existing = await client.query('SELECT rule_type FROM ai_followup_rules WHERE workspace_id = $1', [workspaceId])
  const existingTypes = new Set(existing.rows.map((row) => row.rule_type))
  const missingTypes = DEFAULT_FOLLOWUP_RULES.filter((rule) => !existingTypes.has(rule.ruleType)).map((rule) => rule.ruleType)

  for (const rule of DEFAULT_FOLLOWUP_RULES) {
    await client.query(
      `INSERT INTO ai_followup_rules(workspace_id, rule_type, status, suggested_channel, config)
       VALUES($1, $2, 'active', $3, $4)
       ON CONFLICT (workspace_id, rule_type) DO UPDATE
          SET status = 'active',
              suggested_channel = COALESCE(ai_followup_rules.suggested_channel, EXCLUDED.suggested_channel),
              config = ai_followup_rules.config || EXCLUDED.config,
              updated_at = NOW()`,
      [workspaceId, rule.ruleType, rule.suggestedChannel, rule.config]
    )
  }

  return { seeded: missingTypes.length, seededRuleTypes: missingTypes }
}

async function ensureDefaultRulesForAllWorkspaces() {
  const workspaces = await pool.query('SELECT id FROM workspaces')
  let seeded = 0
  for (const workspace of workspaces.rows) {
    const result = await ensureDefaultRulesForWorkspace(workspace.id)
    seeded += result.seeded
  }
  return { workspaces: workspaces.rowCount, seeded }
}

module.exports = { DEFAULT_FOLLOWUP_RULES, ensureDefaultRulesForAllWorkspaces, ensureDefaultRulesForWorkspace }
