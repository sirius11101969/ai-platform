import { defineAS6CrmEntity } from './crmContract.js';

export const as6CrmEntities = [
  defineAS6CrmEntity({
    id: 'crm.contact',
    label: 'CRM Contact',
    fields: ['id', 'name', 'email', 'phone', 'status'],
    capabilities: ['crm.entities'],
  }),
  defineAS6CrmEntity({
    id: 'crm.company',
    label: 'CRM Company',
    fields: ['id', 'name', 'industry', 'status'],
    capabilities: ['crm.entities'],
  }),
  defineAS6CrmEntity({
    id: 'crm.deal',
    label: 'CRM Deal',
    fields: ['id', 'title', 'stage', 'amount', 'status'],
    capabilities: ['crm.entities'],
  }),
];

export function getAS6CrmEntities() {
  return [...as6CrmEntities];
}
