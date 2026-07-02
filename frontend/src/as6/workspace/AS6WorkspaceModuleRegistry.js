export const AS6_WORKSPACE_MODULE_REGISTRY_VERSION = 'EPIC007_PR5';

export const AS6_WORKSPACE_MODULE_STATUS = {
  READY: 'ready',
  COMPATIBLE_ENTRY: 'compatible-entry',
  INTEGRATION_READY: 'integration-ready',
};

export const AS6_WORKSPACE_MODULE_REGISTRY = [
  {
    id: 'business-home',
    label: 'Business Home',
    route: '/',
    legacyEntryPoint: '/',
    status: AS6_WORKSPACE_MODULE_STATUS.READY,
    slot: 'workspace-main',
    source: 'existing-route',
    description: 'Main business overview entry point.',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    route: '/dashboard',
    legacyEntryPoint: '/dashboard',
    status: AS6_WORKSPACE_MODULE_STATUS.COMPATIBLE_ENTRY,
    slot: 'workspace-main',
    source: 'existing-route',
    description: 'Existing Dashboard module exposed through Workspace registry.',
  },
  {
    id: 'crm',
    label: 'CRM',
    route: '/crm',
    legacyEntryPoint: '/crm',
    status: AS6_WORKSPACE_MODULE_STATUS.INTEGRATION_READY,
    slot: 'workspace-main',
    source: 'existing-route',
    description: 'Existing CRM module prepared for Workspace slot integration.',
  },
  {
    id: 'executive',
    label: 'Executive',
    route: '/command-center',
    legacyEntryPoint: '/command-center',
    status: AS6_WORKSPACE_MODULE_STATUS.COMPATIBLE_ENTRY,
    slot: 'workspace-main',
    source: 'existing-route',
    description: 'Executive and Command Center entry point reused by Workspace.',
  },
  {
    id: 'automation',
    label: 'Automation',
    route: '/pipeline-copilot',
    legacyEntryPoint: '/pipeline-copilot',
    status: AS6_WORKSPACE_MODULE_STATUS.COMPATIBLE_ENTRY,
    slot: 'workspace-main',
    source: 'existing-route',
    description: 'Automation module registered without changing Execution Layer.',
  },
  {
    id: 'audit',
    label: 'Audit',
    route: '/ai-enterprise-command-center',
    legacyEntryPoint: '/ai-enterprise-command-center',
    status: AS6_WORKSPACE_MODULE_STATUS.COMPATIBLE_ENTRY,
    slot: 'workspace-main',
    source: 'existing-route',
    description: 'Audit and executive visibility exposed as Workspace module.',
  },
];

export function getAS6WorkspaceModule(moduleId = 'business-home') {
  return AS6_WORKSPACE_MODULE_REGISTRY.find((module) => module.id === moduleId) || AS6_WORKSPACE_MODULE_REGISTRY[0];
}

export function listAS6WorkspaceModules() {
  return AS6_WORKSPACE_MODULE_REGISTRY;
}

export function validateAS6WorkspaceModuleRegistry(modules = AS6_WORKSPACE_MODULE_REGISTRY) {
  const ids = new Set();
  const duplicateIds = [];
  const missingRoutes = [];

  modules.forEach((module) => {
    if (ids.has(module.id)) {
      duplicateIds.push(module.id);
    }

    ids.add(module.id);

    if (!module.route || !module.legacyEntryPoint || !module.slot) {
      missingRoutes.push(module.id);
    }
  });

  return {
    valid: duplicateIds.length === 0 && missingRoutes.length === 0,
    duplicateIds,
    missingRoutes,
    moduleCount: modules.length,
  };
}
