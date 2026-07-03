export const AS6_OS_STAGE = 'AS6_EPIC009_SLICE01_OS_FOUNDATION';
export const AS6_OS_READINESS = 99;

export const as6RuntimeContext = {
  stage: AS6_OS_STAGE,
  phase: 'EXECUTION',
  workspace: 'AS6_WORKSPACE_FOUNDATION',
  diagnostics: {
    enabled: true,
    trace: 'AS6_OS_FOUNDATION_TRACE',
  },
};

export const as6ModuleRegistry = new Map();
export const as6ServiceRegistry = new Map();
export const as6EventBus = {
  listeners: new Map(),
  publish(event, payload) {
    const handlers = this.listeners.get(event) || [];
    handlers.forEach((handler) => handler(payload));
  },
  subscribe(event, handler) {
    const handlers = this.listeners.get(event) || [];
    handlers.push(handler);
    this.listeners.set(event, handlers);
    return () => this.listeners.set(event, handlers.filter((item) => item !== handler));
  },
};

export const registerAS6Module = (name, definition) => {
  as6ModuleRegistry.set(name, definition);
  return as6ModuleRegistry.get(name);
};

export const registerAS6Service = (name, service) => {
  as6ServiceRegistry.set(name, service);
  return as6ServiceRegistry.get(name);
};
export * from './workspace/index.js';
export * from './navigation/index.js';
export * from './modules/index.js';
export * from './services/index.js';
export * from './experience/index.js';
export * from './workspaceExperience/index.js';
export * from './workspaceLayout/index.js';
export * from './workspaceNavigation/index.js';
export * from './workspacePanels/index.js';
export * from './commandPalette/index.js';
export * from './workspaceAssistant/index.js';
export * from './workspaceIntegration/index.js';
export * from './applicationFoundation/index.js';
export * from './applicationHost/index.js';
export * from './applicationShell/index.js';
export * from './applicationRuntimeServices/index.js';
export * from './applicationExtensionPoints/index.js';
export * from './applicationServices/index.js';
