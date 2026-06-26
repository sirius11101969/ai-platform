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
