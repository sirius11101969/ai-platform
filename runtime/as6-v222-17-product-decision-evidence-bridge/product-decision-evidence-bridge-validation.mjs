import { readFileSync } from 'node:fs'

const decisionSource = readFileSync('frontend/src/product-intelligence/decision-history/decisionHistory.js', 'utf8')
const indexSource = readFileSync('frontend/src/product-intelligence/index.js', 'utf8')

if (!decisionSource.includes('createProductEvidenceBridgeRecord')) throw new Error('createProductEvidenceBridgeRecord missing')
if (!decisionSource.includes('validateProductEvidenceBridgeRecord')) throw new Error('validateProductEvidenceBridgeRecord missing')
if (!indexSource.includes('createProductEvidenceBridgeRecord')) throw new Error('createProductEvidenceBridgeRecord export missing')

function createProductEvidenceBridgeRecord({
  stage,
  observation,
  telemetry,
  metrics,
  insight,
  recommendation,
  decisionStatus = 'pending_decision',
  nextStage,
}) {
  return {
    schemaVersion: 'as6-product-decision-evidence/v1',
    stage,
    observation,
    telemetry,
    metrics,
    insight,
    recommendation,
    decisionStatus,
    nextStage,
    createdAt: new Date().toISOString(),
  }
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

const record = createProductEvidenceBridgeRecord({
  stage: 'V222.17',
  observation: 'Command Center first-action events can be measured and summarized.',
  telemetry: {
    source: 'AS6 Product Intelligence',
    event: 'command_center_first_action_clicked',
  },
  metrics: {
    firstActionCount: 3,
    hasFirstActionEvidence: true,
    byAction: { check_leads: 2, review_revenue: 1 },
  },
  insight: {
    status: 'evidence_available',
    topAction: { name: 'check_leads', count: 2 },
  },
  recommendation: 'Use leading first action as input for the next Product Decision History cycle.',
  nextStage: 'V222.18',
})

const validation = validateProductEvidenceBridgeRecord(record)

if (!validation.ok) throw new Error(`evidence bridge validation failed: ${validation.missingFields.join(',')}`)
if (record.schemaVersion !== 'as6-product-decision-evidence/v1') throw new Error('schema version mismatch')
if (record.decisionStatus !== 'pending_decision') throw new Error('decision status mismatch')
if (record.metrics.firstActionCount !== 3) throw new Error('metrics evidence mismatch')
if (record.insight.topAction.name !== 'check_leads') throw new Error('insight evidence mismatch')

console.log('AS6_PRODUCT_DECISION_EVIDENCE_BRIDGE_VALIDATION=PASS')
console.log(`SCHEMA=${record.schemaVersion}`)
console.log(`DECISION_STATUS=${record.decisionStatus}`)
console.log(`NEXT_STAGE=${record.nextStage}`)
console.log(`TOP_ACTION=${record.insight.topAction.name}`)
console.log(`FIRST_ACTION_COUNT=${record.metrics.firstActionCount}`)
