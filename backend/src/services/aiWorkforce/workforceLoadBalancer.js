function pickLeastLoadedAgent(agents = [], candidateTypes = []) {
  const filtered = agents.filter((agent) => !candidateTypes.length || candidateTypes.includes(agent.type))
  if (!filtered.length) return null
  return filtered
    .slice()
    .sort((a, b) => (a.workload - b.workload) || a.id.localeCompare(b.id))[0]
}

function updateAgentLoad(agent, delta = 1) {
  return { ...agent, workload: Math.max(0, (agent.workload || 0) + delta) }
}

module.exports = { pickLeastLoadedAgent, updateAgentLoad }
