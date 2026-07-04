export const CRM_FOLLOWUP_DOMAIN = 'crm.followups'

export const CRM_FOLLOWUP_ENTITY = 'followup'

export const crmFollowupContract = Object.freeze({
  domain: CRM_FOLLOWUP_DOMAIN,
  entity: CRM_FOLLOWUP_ENTITY,
  version: '1.0.0',
  requiredFields: Object.freeze([
    'id',
    'title',
    'status',
    'priority',
    'dueAt',
    'owner',
    'relatedEntityType',
    'relatedEntityId',
  ]),
  statuses: Object.freeze([
    'planned',
    'due_today',
    'overdue',
    'completed',
  ]),
  priorities: Object.freeze([
    'low',
    'normal',
    'high',
    'urgent',
  ]),
})
