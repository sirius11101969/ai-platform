import { defineAS6ApplicationContext } from './applicationContract.js';

export function createAS6ApplicationContext(application, context = {}) {
  if (!application || !application.id) throw new Error('AS6_APPLICATION_RUNTIME_CONTEXT_MISSING');
  return defineAS6ApplicationContext({
    applicationId: application.id,
    applicationLabel: application.label,
    capabilities: application.capabilities || [],
    dependencies: application.dependencies || [],
    ...context,
  });
}
