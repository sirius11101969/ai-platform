const { routeTask } = require('./workforceTaskRouter')
const { pickLeastLoadedAgent } = require('./workforceLoadBalancer')
const { buildCollaborationPlan } = require('./workforceCollaborationEngine')
const { createExecutionPlan } = require('./workforceExecutionPlanner')

function createWorkforceCoordinator({ eventBus, auditLogger }) {
  return {
    coordinate({ task, agents }) {
      const route = routeTask(task)
      const agent = pickLeastLoadedAgent(agents, route.candidateTypes)
      if (!agent) return { blocked: true, reason: 'no_agent_available' }

      const assignment = { taskId: task.id, agentId: agent.id, status: 'assigned' }
      eventBus?.emit('worker_assigned', assignment)
      auditLogger?.log('ai_worker_assigned', assignment)

      const collaboration = buildCollaborationPlan({ task, primaryAgent: agent })
      if (collaboration.collaborationState === 'collaborating') {
        eventBus?.emit('worker_collaboration_started', collaboration)
        auditLogger?.log('ai_worker_collaboration_started', collaboration)
      }

      const executionPlan = createExecutionPlan({ task, assignment, approvalRequired: route.requiresApproval })
      eventBus?.emit('execution_plan_generated', executionPlan)
      auditLogger?.log('ai_execution_plan_created', executionPlan)

      return { route, assignment, collaboration, executionPlan }
    }
  }
}

module.exports = { createWorkforceCoordinator }
