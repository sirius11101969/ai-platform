import {
  getAS6WorkspaceModule,
  listAS6WorkspaceModules,
  validateAS6WorkspaceModuleRegistry,
} from './AS6WorkspaceModuleRegistry.js';

export const AS6_CONTEXT_INTELLIGENCE_VERSION = 'EPIC008_PR1';

export const AS6_CONTEXT_INTELLIGENCE_SOURCES = [
  'workspace-context',
  'module-registry',
  'ai-workspace',
  'executive-runtime',
  'governance',
  'execution-engine',
  'audit-trail',
];

export function createAS6ContextIntelligenceSnapshot(workspaceState = {}) {
  const activeModuleId = workspaceState.activeModule || 'business-home';
  const activeModule = getAS6WorkspaceModule(activeModuleId);
  const registryValidation = validateAS6WorkspaceModuleRegistry();
  const allModules = listAS6WorkspaceModules();

  const focusMode = workspaceState.focusContext?.mode || 'overview';
  const rightRailOpen = Boolean(workspaceState.rightRail?.isOpen);
  const actionCount = Array.isArray(workspaceState.actions) ? workspaceState.actions.length : 0;
  const eventCount = Array.isArray(workspaceState.events) ? workspaceState.events.length : 0;

  const contextSignals = [
    {
      id: 'signal.active-module',
      label: 'Active Module',
      value: activeModule.id,
      source: 'workspace-context',
    },
    {
      id: 'signal.focus-mode',
      label: 'Focus Mode',
      value: focusMode,
      source: 'workspace-context',
    },
    {
      id: 'signal.module-registry',
      label: 'Module Registry',
      value: registryValidation.valid ? 'valid' : 'invalid',
      source: 'module-registry',
    },
    {
      id: 'signal.right-rail',
      label: 'Right Rail',
      value: rightRailOpen ? 'open' : 'closed',
      source: 'workspace-context',
    },
    {
      id: 'signal.activity',
      label: 'Workspace Activity',
      value: String(actionCount + eventCount),
      source: 'audit-trail',
    },
  ];

  const intelligenceLevel = registryValidation.valid && activeModule ? 'ready' : 'limited';

  return {
    version: AS6_CONTEXT_INTELLIGENCE_VERSION,
    intelligenceLevel,
    activeModule,
    focusMode,
    rightRailOpen,
    actionCount,
    eventCount,
    moduleCount: allModules.length,
    registryValidation,
    sources: AS6_CONTEXT_INTELLIGENCE_SOURCES,
    contextSignals,
    interpretation: buildAS6ContextInterpretation({
      activeModule,
      focusMode,
      rightRailOpen,
      actionCount,
      eventCount,
      registryValidation,
    }),
  };
}

export function buildAS6ContextInterpretation({
  activeModule,
  focusMode,
  rightRailOpen,
  actionCount,
  eventCount,
  registryValidation,
}) {
  if (!registryValidation.valid) {
    return {
      status: 'blocked',
      summary: 'Module Registry validation failed. Context Intelligence cannot safely interpret Workspace state.',
      safeNextStep: 'Fix module registry bindings before using Executive Intelligence.',
    };
  }

  return {
    status: 'ready',
    summary: 'User is working in ' + activeModule.label + ' with focus mode ' + focusMode + '.',
    safeNextStep: rightRailOpen
      ? 'Use AI Workspace to suggest the next contextual action.'
      : 'Open Right Rail to improve context visibility before recommendation.',
    evidence: 'actions=' + actionCount + ', events=' + eventCount + ', module=' + activeModule.id,
  };
}

export function validateAS6ContextIntelligence(snapshot) {
  const missingSources = AS6_CONTEXT_INTELLIGENCE_SOURCES.filter((source) => !snapshot.sources.includes(source));

  return {
    valid: missingSources.length === 0 && snapshot.registryValidation.valid,
    missingSources,
    storageMutation: false,
    parallelContextCreated: false,
    executionEngineReplaced: false,
  };
}
