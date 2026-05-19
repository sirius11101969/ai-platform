const { WORKER_TYPES } = require('./workforceAgentRegistry')

const WORKER_SKILLS = {
  lead_qualification: [WORKER_TYPES.SDR_WORKER],
  followup_suggestion: [WORKER_TYPES.SDR_WORKER],
  objection_analysis: [WORKER_TYPES.SDR_WORKER, WORKER_TYPES.TECHNICAL_CONSULTANT_WORKER],
  negotiation_preparation: [WORKER_TYPES.CLOSER_WORKER],
  enterprise_escalation: [WORKER_TYPES.CLOSER_WORKER],
  proposal_preparation: [WORKER_TYPES.CLOSER_WORKER],
  crm_hygiene: [WORKER_TYPES.REVOPS_WORKER],
  stage_recommendation: [WORKER_TYPES.REVOPS_WORKER],
  pipeline_analysis: [WORKER_TYPES.REVOPS_WORKER],
  onboarding_preparation: [WORKER_TYPES.CUSTOMER_SUCCESS_WORKER],
  retention_risk_analysis: [WORKER_TYPES.CUSTOMER_SUCCESS_WORKER],
  technical_objection_support: [WORKER_TYPES.TECHNICAL_CONSULTANT_WORKER],
  implementation_guidance: [WORKER_TYPES.TECHNICAL_CONSULTANT_WORKER],
  meeting_preparation: [WORKER_TYPES.EXECUTIVE_ASSISTANT_WORKER],
  summary: [WORKER_TYPES.EXECUTIVE_ASSISTANT_WORKER],
  scheduling_suggestion: [WORKER_TYPES.EXECUTIVE_ASSISTANT_WORKER]
}

function routeTask(task = {}) {
  const candidateTypes = WORKER_SKILLS[task.taskType] || [WORKER_TYPES.REVOPS_WORKER]
  return { candidateTypes, requiresApproval: true, autonomousOutreachAllowed: false }
}

module.exports = { routeTask, WORKER_SKILLS }
