export const AS6_MODULE_HOST_STAGE = 'AS6_EPIC009_SLICE04_MODULE_HOST';

export const as6ModuleHostState = {
  activeModuleId: 'workspace',
  initializedModules: new Set(),
};

export function defineAS6Module(definition) {
  if (!definition || !definition.id || !definition.label) {
    throw new Error('AS6_MODULE_DEFINITION_INVALID');
  }
  return {
    lifecycle: {
      initialize: null,
      activate: null,
      deactivate: null,
    },
    ...definition,
  };
}

export const as6CoreModules = [
  defineAS6Module({ id: 'workspace', label: 'Workspace', navigationId: 'workspace', status: 'foundation' }),
  defineAS6Module({ id: 'modules', label: 'Modules', navigationId: 'modules', status: 'foundation' }),
  defineAS6Module({ id: 'diagnostics', label: 'Diagnostics', navigationId: 'diagnostics', status: 'foundation' }),
];

export const as6ModuleHostRegistry = new Map(as6CoreModules.map((module) => [module.id, module]));

export function registerAS6HostedModule(moduleDefinition) {
  const module = defineAS6Module(moduleDefinition);
  as6ModuleHostRegistry.set(module.id, module);
  return module;
}

export function getAS6HostedModules() {
  return Array.from(as6ModuleHostRegistry.values());
}

export function resolveAS6HostedModule(moduleId) {
  return as6ModuleHostRegistry.get(moduleId) || null;
}

export function initializeAS6HostedModule(moduleId) {
  const module = resolveAS6HostedModule(moduleId);
  if (!module) throw new Error('AS6_MODULE_NOT_FOUND');
  if (typeof module.lifecycle.initialize === 'function') module.lifecycle.initialize(module);
  as6ModuleHostState.initializedModules.add(moduleId);
  return module;
}

export function activateAS6HostedModule(moduleId) {
  const module = initializeAS6HostedModule(moduleId);
  as6ModuleHostState.activeModuleId = moduleId;
  if (typeof module.lifecycle.activate === 'function') module.lifecycle.activate(module);
  return module;
}
