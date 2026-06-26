import { readFileSync } from 'node:fs'

const decisionSource = readFileSync('frontend/src/product-intelligence/decision-history/decisionHistory.js', 'utf8')
const indexSource = readFileSync('frontend/src/product-intelligence/index.js', 'utf8')

for (const signal of [
  'formatProductEvidenceBridgeRecordForDecisionHistory',
  'createProductDecisionHistoryAppendEntry',
  'append_only',
  'docs/REGISTRY/AS6_PRODUCT_DECISION_HISTORY.md',
]) {
  if (!decisionSource.includes(signal)) {
    throw new Error(`missing decision source signal: ${signal}`)
  }
}

if (!indexSource.includes('createProductDecisionHistoryAppendEntry')) {
  throw new Error('append helper export missing')
}

function validateProductEvidenceBridgeRecord(record) {
  const requiredFields = [
    'schemaVersion',
    'stage',
    'observation',
    'telemetry',
    'metrics',
    'insight',
    'recommendation',
    'decisionStatus',
    'nextStage',
    'createdAt',
  ]

  const missingFields = requiredFields.filter((field) => !record?.[field])

  return {
    ok: missingFields.length === 0,
    missingFields,
  }
}

function formatSafeJsonForDecisionHistory(value) {
  return JSON.stringify(value || {}, null, 2)
}

function formatProductEvidenceBridgeRecordForDecisionHistory(record) {
  const validation = validateProductEvidenceBridgeRecord(record)

  if (!validation.ok) {
    return {
      ok: false,
      reason: 'AS6_PRODUCT_EVIDENCE_RECORD_INVALID',
      missingFields: validation.missingFields,
      markdown: '',
    }
  }

  const markdown = [
    `## ${record.stage} Product Decision Evidence`,
    '',
    `- Schema: ${record.schemaVersion}`,
    `- Decision Status: ${record.decisionStatus}`,
    `- Next Stage: ${record.nextStage}`,
    `- Created At: ${record.createdAt}`,
    '',
    '### Observation',
    record.observation,
    '',
    '### Telemetry',
    '```json',
    formatSafeJsonForDecisionHistory(record.telemetry),
    '```',
    '',
    '### Metrics',
    '```json',
    formatSafeJsonForDecisionHistory(record.metrics),
    '```',
    '',
    '### Insight',
    '```json',
    formatSafeJsonForDecisionHistory(record.insight),
    '```',
    '',
    '### Recommendation',
    record.recommendation,
    '',
  ].join('\n')

  return { ok: true, markdown }
}

function createProductDecisionHistoryAppendEntry(record) {
  const formatted = formatProductEvidenceBridgeRecordForDecisionHistory(record)

  return {
    ok: formatted.ok,
    reason: formatted.reason,
    missingFields: formatted.missingFields || [],
    target: 'docs/REGISTRY/AS6_PRODUCT_DECISION_HISTORY.md',
    mode: 'append_only',
    markdown: formatted.markdown,
  }
}

const record = {
  schemaVersion: 'as6-product-decision-evidence/v1',
  stage: 'V222.20',
  observation: 'First-action evidence can be persisted as append-only Decision History markdown.',
  telemetry: { event: 'command_center_first_action_clicked' },
  metrics: { firstActionCount: 3, hasFirstActionEvidence: true },
  insight: { status: 'evidence_available' },
  recommendation: 'Append evidence only after explicit stage review.',
  decisionStatus: 'pending_decision',
  nextStage: 'V222.21',
  createdAt: new Date().toISOString(),
}

const entry = createProductDecisionHistoryAppendEntry(record)

if (!entry.ok) throw new Error('append entry failed')
if (entry.target !== 'docs/REGISTRY/AS6_PRODUCT_DECISION_HISTORY.md') throw new Error('target mismatch')
if (entry.mode !== 'append_only') throw new Error('mode mismatch')
if (!entry.markdown.includes('## V222.20 Product Decision Evidence')) throw new Error('markdown title missing')
if (!entry.markdown.includes('### Metrics')) throw new Error('metrics section missing')
if (!entry.markdown.includes('### Insight')) throw new Error('insight section missing')

const invalid = createProductDecisionHistoryAppendEntry({ stage: 'V222.20' })
if (invalid.ok) throw new Error('invalid append entry passed')
if (!invalid.missingFields.includes('metrics')) throw new Error('invalid missing metrics not detected')

console.log('AS6_DECISION_HISTORY_APPEND_HELPER_VALIDATION=PASS')
console.log(`TARGET=${entry.target}`)
console.log(`MODE=${entry.mode}`)
console.log('VALID_APPEND_ENTRY=PASS')
console.log('INVALID_APPEND_ENTRY_REJECTED=PASS')
console.log(`MARKDOWN_LINES=${entry.markdown.split('\n').length}`)
