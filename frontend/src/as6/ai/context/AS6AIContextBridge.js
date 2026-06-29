import {
  getContextSnapshot,
  getCurrentCustomer,
  getCurrentDeal,
  getCurrentLivingSpace,
  getCurrentPipeline,
  getMergedContext,
  registerLivingSpaceContext,
} from "./AS6AIContextEngine";

export function publishAS6LivingSpaceContext(spaceId, context = {}, options = {}) {
  return registerLivingSpaceContext(spaceId, context, options);
}

export function getAS6AIContextForPrompt() {
  return {
    livingSpace: getCurrentLivingSpace(),
    customer: getCurrentCustomer(),
    deal: getCurrentDeal(),
    pipeline: getCurrentPipeline(),
    context: getMergedContext(),
    snapshot: getContextSnapshot(),
  };
}

export function createAS6AIContextPromptPrefix() {
  const context = getAS6AIContextForPrompt();

  return [
    `Living Space: ${context.livingSpace || "unknown"}`,
    `Customer: ${context.customer || "none"}`,
    `Deal: ${context.deal || "none"}`,
    `Pipeline: ${context.pipeline || "none"}`,
  ].join("\n");
}
