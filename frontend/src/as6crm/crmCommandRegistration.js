export const as6CrmCommandRegistration = {
  id: 'crm.open',
  label: 'Open CRM',
  capability: 'crm.commands',
};

export function getAS6CrmCommandRegistration() {
  return { ...as6CrmCommandRegistration };
}
