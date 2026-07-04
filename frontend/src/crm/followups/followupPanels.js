export const crmFollowupPanels = Object.freeze([
  Object.freeze({
    id: 'crm.followups.queue',
    title: 'Follow-up Queue',
    zone: 'main',
  }),
  Object.freeze({
    id: 'crm.followups.intelligence',
    title: 'Follow-up Intelligence',
    zone: 'rightRail',
  }),
])

export function listCrmFollowupPanels() {
  return crmFollowupPanels
}
