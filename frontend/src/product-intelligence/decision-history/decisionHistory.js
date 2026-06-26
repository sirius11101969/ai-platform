export function createProductDecisionRecord({
  stage,
  observation,
  telemetry,
  metrics,
  insight,
  decision,
  implementation,
  effectReview,
}) {
  return {
    stage,
    observation,
    telemetry,
    metrics,
    insight,
    decision,
    implementation,
    effectReview,
    createdAt: new Date().toISOString(),
  }
}

export function createProductEvidenceBridgeRecord({
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

export function validateProductEvidenceBridgeRecord(record) {
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

export function formatProductEvidenceBridgeRecordForDecisionHistory(record) {
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

  return {
    ok: true,
    markdown,
  }
}

export function createProductDecisionHistoryAppendEntry(record) {
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
