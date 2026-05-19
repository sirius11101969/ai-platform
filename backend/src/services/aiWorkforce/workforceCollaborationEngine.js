function buildCollaborationPlan({ task, primaryAgent, supportAgents = [] }) {
  const collaborators = [primaryAgent, ...supportAgents].filter(Boolean)
  return {
    taskId: task.id,
    collaborationState: collaborators.length > 1 ? 'collaborating' : 'solo',
    collaborators: collaborators.map((agent) => ({ id: agent.id, type: agent.type })),
    dependencies: task.dependencies || [],
    suggestedActions: task.suggestedActions || []
  }
}

module.exports = { buildCollaborationPlan }
