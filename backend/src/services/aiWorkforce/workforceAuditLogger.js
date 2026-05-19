function createWorkforceAuditLogger({ persist }) {
  return {
    async log(eventType, payload) {
      const event = { eventType, payload, createdAt: new Date().toISOString() }
      if (persist) await persist(event)
      return event
    }
  }
}

const WORKFORCE_AUDIT_EVENTS = [
  'ai_worker_assigned',
  'ai_worker_collaboration_started',
  'ai_execution_plan_created',
  'ai_workforce_task_completed',
  'ai_workforce_escalation_detected'
]

module.exports = { createWorkforceAuditLogger, WORKFORCE_AUDIT_EVENTS }
