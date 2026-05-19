function createExecutionPlan({ task, assignment, approvalRequired = true }) {
  return {
    taskId: task.id,
    assignedAgentId: assignment.agentId,
    status: approvalRequired ? 'waiting_approval' : 'executing',
    approvalRequired,
    noAutonomousExecutionChains: true,
    steps: (task.steps || []).map((step, index) => ({ order: index + 1, ...step, mode: 'sequential' })),
    escalationChain: task.escalationChain || ['human_manager']
  }
}

function routeExecutionTask({ taskId, executionType = 'workforce_execution', requiresApproval = true }) {
  return {
    taskId,
    executionType,
    route: requiresApproval ? 'approval_center_queue' : 'execution_layer',
    policyGate: 'ai_execution_policies',
    noAutonomousOutreach: true
  }
}

module.exports = { createExecutionPlan, routeExecutionTask }
