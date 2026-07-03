import { getAS6CrmDomainDescriptor } from './crmDomainDescriptor.js';
import { getAS6CrmAggregates } from './crmAggregateModel.js';
import { getAS6CrmRelationships } from './crmRelationshipModel.js';
import { getAS6CrmDomainRegistrySnapshot } from './crmDomainRegistry.js';
import { resolveAS6CrmDomainModel } from './crmDomainResolver.js';

export function createAS6CrmDomainManifest() {
  return {
    descriptor: getAS6CrmDomainDescriptor(),
    aggregates: getAS6CrmAggregates(),
    relationships: getAS6CrmRelationships(),
    registry: getAS6CrmDomainRegistrySnapshot(),
    resolution: resolveAS6CrmDomainModel(),
  };
}
