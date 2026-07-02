import {
  createAS6ContextIntelligenceSnapshot,
  validateAS6ContextIntelligence,
} from './AS6ContextIntelligence.js';

export const AS6_RECOMMENDATION_ENGINE_VERSION = 'EPIC008_PR2';

export const AS6_RECOMMENDATION_SOURCES = [
  'context-intelligence',
  'workspace-context',
  'module-registry',
  'governance',
  'execution-engine',
  'audit-trail',
];

export const AS6_RECOMMENDATION_CANDIDATES = [
  {
    id: 'recommend.open-right-rail',
    title: 'Открыть контекстную панель',
    actionId: 'workspace.rightRail.open',
    requiredSignal: 'right-rail',
    baseScore: 72,
    safeAlternative: 'Продолжить работу без Right Rail, но с меньшей видимостью контекста.',
  },
  {
    id: 'recommend.review-active-module',
    title: 'Проверить активный модуль',
    actionId: 'workspace.module.review',
    requiredSignal: 'signal.active-module',
    baseScore: 80,
    safeAlternative: 'Вернуться в Business Home для общего обзора.',
  },
  {
    id: 'recommend.trace-context',
    title: 'Зафиксировать Context Intelligence Snapshot',
    actionId: 'context.snapshot.trace',
    requiredSignal: 'signal.activity',
    baseScore: 68,
    safeAlternative: 'Пропустить трассировку и продолжить работу вручную.',
  },
  {
    id: 'recommend.prepare-scenario-plan',
    title: 'Подготовить план сценария',
    actionId: 'scenario.plan.prepare',
    requiredSignal: 'signal.module-registry',
    baseScore: 76,
    safeAlternative: 'Сначала проверить Governance и доступность модуля.',
  },
];

export function createAS6RecommendationEngineSnapshot(workspaceState = {}) {
  const contextSnapshot = createAS6ContextIntelligenceSnapshot(workspaceState);
  const contextValidation = validateAS6ContextIntelligence(contextSnapshot);

  const recommendations = rankAS6Recommendations({
    contextSnapshot,
    contextValidation,
    candidates: AS6_RECOMMENDATION_CANDIDATES,
  });

  return {
    version: AS6_RECOMMENDATION_ENGINE_VERSION,
    contextSnapshot,
    contextValidation,
    sources: AS6_RECOMMENDATION_SOURCES,
    recommendations,
    topRecommendation: recommendations[0] || null,
    engineStatus: contextValidation.valid ? 'ready' : 'limited',
  };
}

export function rankAS6Recommendations({ contextSnapshot, contextValidation, candidates }) {
  return candidates
    .map((candidate) => explainAS6Recommendation(candidate, contextSnapshot, contextValidation))
    .sort((a, b) => b.score - a.score);
}

export function explainAS6Recommendation(candidate, contextSnapshot, contextValidation) {
  const activeModuleBoost = candidate.requiredSignal === 'signal.active-module' ? 12 : 0;
  const registryBoost = contextSnapshot.registryValidation.valid ? 8 : -30;
  const rightRailBoost = contextSnapshot.rightRailOpen ? 4 : candidate.requiredSignal === 'right-rail' ? 14 : 0;
  const activityBoost = Math.min(10, contextSnapshot.actionCount + contextSnapshot.eventCount);
  const validityPenalty = contextValidation.valid ? 0 : -40;

  const score = Math.max(
    0,
    Math.min(100, candidate.baseScore + activeModuleBoost + registryBoost + rightRailBoost + activityBoost + validityPenalty)
  );

  const confidence = score >= 85 ? 'high' : score >= 65 ? 'medium' : 'low';

  return {
    id: candidate.id,
    title: candidate.title,
    actionId: candidate.actionId,
    score,
    confidence,
    reason: buildAS6RecommendationReason(candidate, contextSnapshot, contextValidation),
    contextSource: 'Context Intelligence Snapshot',
    governanceStatus: contextValidation.valid ? 'allowed-for-recommendation' : 'blocked-by-context-validation',
    executionStatus: 'not-executed',
    safeAlternative: candidate.safeAlternative,
  };
}

export function buildAS6RecommendationReason(candidate, contextSnapshot, contextValidation) {
  if (!contextValidation.valid) {
    return 'Context Intelligence validation is limited, so this recommendation is advisory only.';
  }

  return 'Recommendation ranked from active module ' +
    contextSnapshot.activeModule.label +
    ', focus mode ' +
    contextSnapshot.focusMode +
    ', registry status ' +
    (contextSnapshot.registryValidation.valid ? 'valid' : 'invalid') +
    ', using candidate ' +
    candidate.actionId +
    '.';
}

export function validateAS6RecommendationEngine(engineSnapshot) {
  const missingSources = AS6_RECOMMENDATION_SOURCES.filter((source) => !engineSnapshot.sources.includes(source));
  const invalidRecommendations = engineSnapshot.recommendations.filter((item) => {
    return !item.reason || !item.contextSource || !item.confidence || !item.safeAlternative;
  });

  return {
    valid: missingSources.length === 0 && invalidRecommendations.length === 0,
    missingSources,
    invalidRecommendations: invalidRecommendations.map((item) => item.id),
    executesScenario: false,
    createsStorage: false,
    bypassesContextIntelligence: false,
  };
}
