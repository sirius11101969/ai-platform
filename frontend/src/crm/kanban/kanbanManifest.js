import { crmKanbanContract } from './kanbanContract.js'
import { crmKanbanDescriptor } from './kanbanDescriptor.js'
import { crmKanbanCapabilities } from './kanbanCapabilities.js'

export const crmKanbanManifest = Object.freeze({
  id: 'crm.kanban.manifest',
  domain: crmKanbanContract.domain,
  entity: crmKanbanContract.entity,
  descriptor: crmKanbanDescriptor,
  contract: crmKanbanContract,
  capabilities: crmKanbanCapabilities,
  diagnostics: Object.freeze([
    'AS6_CRM_KANBAN_FOUNDATION_PRESENT',
    'AS6_CRM_KANBAN_CONTRACT_REGISTERED',
    'AS6_CRM_KANBAN_RUNTIME_TRACEABLE',
  ]),
})
