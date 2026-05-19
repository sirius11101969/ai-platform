const WORKER_TYPES = {
  SDR_WORKER: 'sdr_worker',
  CLOSER_WORKER: 'closer_worker',
  REVOPS_WORKER: 'revops_worker',
  CUSTOMER_SUCCESS_WORKER: 'customer_success_worker',
  TECHNICAL_CONSULTANT_WORKER: 'technical_consultant_worker',
  EXECUTIVE_ASSISTANT_WORKER: 'executive_assistant_worker'
}

const WORKFORCE_STATUSES = ['idle', 'assigned', 'collaborating', 'waiting_approval', 'executing', 'completed', 'blocked']

const WORKER_RESPONSIBILITIES = {
  [WORKER_TYPES.SDR_WORKER]: ['lead qualification', 'follow-up suggestions', 'objection analysis'],
  [WORKER_TYPES.CLOSER_WORKER]: ['negotiation preparation', 'enterprise escalation', 'proposal preparation'],
  [WORKER_TYPES.REVOPS_WORKER]: ['CRM hygiene', 'stage recommendations', 'pipeline analysis'],
  [WORKER_TYPES.CUSTOMER_SUCCESS_WORKER]: ['onboarding preparation', 'retention risk analysis'],
  [WORKER_TYPES.TECHNICAL_CONSULTANT_WORKER]: ['technical objection support', 'implementation guidance'],
  [WORKER_TYPES.EXECUTIVE_ASSISTANT_WORKER]: ['meeting preparation', 'summaries', 'scheduling suggestions']
}

function createDefaultAgentRegistry() {
  return Object.values(WORKER_TYPES).map((type, index) => ({
    id: `wf-agent-${index + 1}`,
    type,
    responsibilities: WORKER_RESPONSIBILITIES[type],
    status: 'idle',
    workload: 0,
    collaborationState: 'solo'
  }))
}

module.exports = { WORKER_TYPES, WORKFORCE_STATUSES, WORKER_RESPONSIBILITIES, createDefaultAgentRegistry }
