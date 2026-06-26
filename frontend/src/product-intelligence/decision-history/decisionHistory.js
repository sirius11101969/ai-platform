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
