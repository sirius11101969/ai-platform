export const as6CrmPanelRegistration = {
  id: 'crm.foundation.overview',
  label: 'CRM Overview',
  region: 'application.main',
  capability: 'crm.panels',
};

export function getAS6CrmPanelRegistration() {
  return { ...as6CrmPanelRegistration };
}
