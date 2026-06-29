export const AS6_AI_CONTEXT_ENGINE_VERSION = "P4";

const contextProviders = new Map();

export function registerLivingSpaceContext(spaceId, context = {}, options = {}) {
  if (!spaceId) {
    return { ok: false, error: "AS6_AI_CONTEXT_SPACE_ID_MISSING" };
  }

  contextProviders.set(spaceId, {
    spaceId,
    context,
    priority: options.priority || 100,
    updatedAt: new Date().toISOString(),
    source: options.source || "living-space",
  });

  return { ok: true, spaceId, context };
}

export function getCurrentLivingSpace() {
  const providers = [...contextProviders.values()].sort((a, b) => b.priority - a.priority);
  return providers[0]?.spaceId || null;
}

export function getMergedContext() {
  const providers = [...contextProviders.values()].sort((a, b) => a.priority - b.priority);

  return providers.reduce(
    (merged, provider) => ({
      ...merged,
      ...provider.context,
      livingSpace: provider.spaceId,
      updatedAt: provider.updatedAt,
    }),
    {},
  );
}

export function getCurrentCustomer() {
  return getMergedContext().currentCustomer || null;
}

export function getCurrentDeal() {
  return getMergedContext().currentDeal || null;
}

export function getCurrentPipeline() {
  return getMergedContext().pipeline || null;
}

export function getContextSnapshot() {
  return {
    version: AS6_AI_CONTEXT_ENGINE_VERSION,
    currentLivingSpace: getCurrentLivingSpace(),
    mergedContext: getMergedContext(),
    providers: [...contextProviders.values()],
  };
}

export function validateAS6AIContextEnginePolicy() {
  const snapshot = getContextSnapshot();
  const failures = [];

  if (!snapshot.version) failures.push("version_missing");
  if (!Array.isArray(snapshot.providers)) failures.push("providers_not_array");
  if (typeof getMergedContext !== "function") failures.push("merged_context_missing");

  return {
    ok: failures.length === 0,
    failures,
    providerCount: snapshot.providers.length,
    version: AS6_AI_CONTEXT_ENGINE_VERSION,
  };
}
