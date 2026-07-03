export const as6CrmNavigationRegistration = {
  id: 'crm.foundation',
  label: 'CRM',
  order: 100,
  route: '/crm',
  capability: 'crm.navigation',
};

export function getAS6CrmNavigationRegistration() {
  return { ...as6CrmNavigationRegistration };
}
