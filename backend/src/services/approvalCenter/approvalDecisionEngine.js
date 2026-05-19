const ALLOWED_TYPES = new Set(['next_best_action','crm_action','followup_strategy','handoff_recommendation','sales_stage_recommendation'])
const ALLOWED_ACTIONS = new Set(['approve','reject','snooze','escalate','assign_manager'])
const TRANSITIONS = { pending_approval: new Set(ALLOWED_ACTIONS), snoozed: new Set(['approve','reject','escalate','assign_manager']), escalated: new Set(['approve','reject','snooze','assign_manager']), approved: new Set(), rejected: new Set() }
function assertRecommendationType(type) { if (!ALLOWED_TYPES.has(type)) throw Object.assign(new Error('Unsupported recommendation type'), { statusCode: 400 }) }
function assertActionAllowed(status, action) { if (!ALLOWED_ACTIONS.has(action)) throw Object.assign(new Error('Unsupported approval action'), { statusCode: 400 }); if (!(TRANSITIONS[status] || new Set()).has(action)) throw Object.assign(new Error(`Action ${action} is not allowed from status ${status}`), { statusCode: 400 }) }
function mapActionToStatus(action) { return ({ approve: 'approved', reject: 'rejected', snooze: 'snoozed', escalate: 'escalated', assign_manager: 'pending_approval' })[action] }
module.exports = { assertRecommendationType, assertActionAllowed, mapActionToStatus }
