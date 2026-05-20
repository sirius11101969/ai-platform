function buildWorkflowInsights(snapshot = {}) {
  return {
    approvalBottleneckCount: Number(snapshot.pendingApprovals || 0),
    executionPressure: Number(snapshot.executionPressure || 0),
    workforceUtilization: Number(snapshot.workforceUtilization || 0),
    note: 'Recommendation-only governance enforced. No autonomous execution.',
  }
}
module.exports = { buildWorkflowInsights }
