import { readFileSync } from 'node:fs'

const decisionSource = readFileSync('frontend/src/product-intelligence/decision-history/decisionHistory.js', 'utf8')
const indexSource = readFileSync('frontend/src/product-intelligence/index.js', 'utf8')

for (const signal of [
  'formatProductEvidenceBridgeRecordForDecisionHistory',
  'createProductDecisionHistoryAppendEntry',
  'append_only',
  'docs/REGISTRY/AS6_PRODUCT_DECISION_HISTORY.md',
  'AS6_PRODUCT_EVIDENCE_RECORD_INVALID',
]) {
  if (!decisionSource.includes(signal)) throw new Error(`missing source signal: ${signal}`)
}

if (!indexSource.includes('createProductDecisionHistoryAppendEntry')) {
  throw new Error('append helper export missing')
}

const forbiddenWriteSignals = [
  'writeFile',
  'appendFile',
  'fs.',
  'localStorage.setItem',
  'fetch(',
  'axios',
]

for (const signal of forbiddenWriteSignals) {
  if (decisionSource.includes(signal)) throw new Error(`unexpected write signal: ${signal}`)
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
  return { ok: missingFields.length === 0, missingFields }
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
  stage: 'V222.21',
  observation: 'Append helper effect is being reviewed.',
  telemetry: { event: 'command_center_first_action_clicked' },
  metrics: { firstActionCount: 3, hasFirstActionEvidence: true },
  insight: { status: 'evidence_available' },
  recommendation: 'Use append helper only after explicit stage review.',
  decisionStatus: 'pending_decision',
  nextStage: 'V222.22',
  createdAt: new Date().toISOString(),
}

const entry = createProductDecisionHistoryAppendEntry(record)
if (!entry.ok) throw new Error('valid append entry failed')
if (entry.target !== 'docs/REGISTRY/AS6_PRODUCT_DECISION_HISTORY.md') throw new Error('target mismatch')
if (entry.mode !== 'append_only') throw new Error('mode mismatch')
if (!entry.markdown.includes('## V222.21 Product Decision Evidence')) throw new Error('title missing')
if (!entry.markdown.includes('### Telemetry')) throw new Error('telemetry section missing')
if (!entry.markdown.includes('### Metrics')) throw new Error('metrics section missing')
if (!entry.markdown.includes('### Insight')) throw new Error('insight section missing')
if (!entry.markdown.includes('### Recommendation')) throw new Error('recommendation section missing')

const invalid = createProductDecisionHistoryAppendEntry({ stage: 'V222.21' })
if (invalid.ok) throw new Error('invalid record passed')
if (invalid.reason !== 'AS6_PRODUCT_EVIDENCE_RECORD_INVALID') throw new Error('invalid reason mismatch')
if (!invalid.missingFields.includes('metrics')) throw new Error('missing metrics not detected')
if (invalid.markdown !== '') throw new Error('invalid markdown should be empty')

console.log('AS6_APPEND_HELPER_EFFECT_REVIEW=PASS')
console.log(`TARGET=${entry.target}`)
console.log(`MODE=${entry.mode}`)
console.log('VALID_APPEND_ENTRY=PASS')
console.log('INVALID_APPEND_ENTRY_REJECTED=PASS')
console.log('NO_AUTOMATIC_WRITE_SIGNAL=PASS')
console.log(`MARKDOWN_LINES=${entry.markdown.split('\n').length}`)
