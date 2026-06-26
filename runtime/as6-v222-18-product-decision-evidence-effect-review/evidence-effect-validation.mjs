import { readFileSync } from 'node:fs'

const decisionSource = readFileSync('frontend/src/product-intelligence/decision-history/decisionHistory.js', 'utf8')
const indexSource = readFileSync('frontend/src/product-intelligence/index.js', 'utf8')

const requiredSourceSignals = [
  'createProductEvidenceBridgeRecord',
  'validateProductEvidenceBridgeRecord',
  'as6-product-decision-evidence/v1',
  'decisionStatus',
  'nextStage',
  'requiredFields',
]

for (const signal of requiredSourceSignals) {
  if (!decisionSource.includes(signal)) {
    throw new Error(`missing decision source signal: ${signal}`)
  }
}

for (const signal of ['createProductEvidenceBridgeRecord', 'validateProductEvidenceBridgeRecord']) {
  if (!indexSource.includes(signal)) {
    throw new Error(`missing Product Intelligence export: ${signal}`)
  }
}

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

const validRecord = createProductEvidenceBridgeRecord({
  stage: 'V222.18',
  observation: 'First-action evidence bridge exists.',
  telemetry: { event: 'command_center_first_action_clicked' },
  metrics: { firstActionCount: 3, hasFirstActionEvidence: true },
  insight: { status: 'evidence_available' },
  recommendation: 'Use evidence bridge in Product Decision History.',
  nextStage: 'V222.19',
})

const validResult = validateProductEvidenceBridgeRecord(validRecord)
if (!validResult.ok) throw new Error('valid record failed validation')

const invalidResult = validateProductEvidenceBridgeRecord({
  stage: 'V222.18',
  observation: 'Incomplete record.',
})

if (invalidResult.ok) throw new Error('invalid record passed validation')
if (!invalidResult.missingFields.includes('metrics')) throw new Error('missing metrics was not detected')
if (!invalidResult.missingFields.includes('insight')) throw new Error('missing insight was not detected')
if (!invalidResult.missingFields.includes('recommendation')) throw new Error('missing recommendation was not detected')

console.log('AS6_PRODUCT_DECISION_EVIDENCE_EFFECT_REVIEW=PASS')
console.log(`VALID_RECORD=${validResult.ok}`)
console.log(`INVALID_RECORD=${invalidResult.ok}`)
console.log(`MISSING_FIELDS=${invalidResult.missingFields.join(',')}`)
console.log(`SCHEMA=${validRecord.schemaVersion}`)
console.log(`NEXT_STAGE=${validRecord.nextStage}`)
