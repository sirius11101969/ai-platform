export const AS6_PRODUCT_EVENTS = Object.freeze({
  LANDING_DEMO_CLICKED: 'landing_demo_clicked',
  LANDING_EFFECT_CLICKED: 'landing_effect_clicked',
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  LOGIN_SUCCESS: 'login_success',
  COMMAND_CENTER_OPENED: 'command_center_opened',
  COMMAND_CENTER_FIRST_ACTION_CLICKED: 'command_center_first_action_clicked',
  CRM_OPENED: 'crm_opened',
  DASHBOARD_OPENED: 'dashboard_opened',
  LEAD_CREATED: 'lead_created',
  FIRST_LEAD_CREATED: 'first_lead_created',
  AI_WORKER_STARTED: 'ai_worker_started',
  AI_ACTION_APPROVED: 'ai_action_approved',
})

export const AS6_PRODUCT_EVENT_CATEGORIES = Object.freeze({
  NAVIGATION: 'navigation',
  ACTIVATION: 'activation',
  FIRST_ACTION: 'first_action',
  CTA: 'cta',
  CRM: 'crm',
  AI: 'ai',
  REVENUE: 'revenue',
})

export function isRegisteredProductEvent(eventName) {
  return Object.values(AS6_PRODUCT_EVENTS).includes(eventName)
}
