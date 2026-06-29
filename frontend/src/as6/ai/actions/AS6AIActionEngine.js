import { getAS6AIContextForPrompt } from "../context";
import { canAccessAS6Capability } from "../../security";

export const AS6_AI_ACTION_ENGINE_VERSION = "P5";

const actionRegistry = new Map();

export function registerAS6AIAction(action) {
  if (!action?.id) {
    return { ok: false, error: "AS6_AI_ACTION_ID_MISSING" };
  }

  if (!action?.capability) {
    return { ok: false, error: "AS6_AI_ACTION_CAPABILITY_MISSING" };
  }

  if (typeof action.execute !== "function") {
    return { ok: false, error: "AS6_AI_ACTION_EXECUTOR_MISSING" };
  }

  actionRegistry.set(action.id, {
    status: "active",
    risk: "low",
    ...action,
  });

  return { ok: true, actionId: action.id };
}

export function getAS6AIActions() {
  return [...actionRegistry.values()];
}

export function getAS6AIActionById(actionId) {
  return actionRegistry.get(actionId) || null;
}

export function validateAS6AIActionRequest(request = {}) {
  const failures = [];

  if (!request.actionId) failures.push("action_id_missing");
  if (!request.role) failures.push("role_missing");

  const action = getAS6AIActionById(request.actionId);
  if (!action) failures.push("action_not_registered");
  if (action?.status !== "active") failures.push("action_not_active");

  if (action && !canAccessAS6Capability(request.role, action.capability, {
    service: action.service,
    livingSpace: action.livingSpace,
    context: request.context || {},
  })) {
    failures.push("policy_denied");
  }

  return {
    ok: failures.length === 0,
    failures,
    action,
  };
}

export async function executeAS6AIAction(request = {}) {
  const validation = validateAS6AIActionRequest(request);

  if (!validation.ok) {
    return {
      ok: false,
      error: "AS6_AI_ACTION_VALIDATION_FAILED",
      failures: validation.failures,
    };
  }

  const aiContext = getAS6AIContextForPrompt();
  const result = await validation.action.execute({
    ...request,
    aiContext,
  });

  return {
    ok: true,
    actionId: request.actionId,
    result,
    aiContext,
  };
}

export function getAS6AIActionEngineState() {
  return {
    version: AS6_AI_ACTION_ENGINE_VERSION,
    actionCount: actionRegistry.size,
    actions: getAS6AIActions().map((action) => ({
      id: action.id,
      title: action.title,
      capability: action.capability,
      service: action.service,
      livingSpace: action.livingSpace,
      status: action.status,
      risk: action.risk,
    })),
  };
}

export function validateAS6AIActionEnginePolicy() {
  const failures = [];

  if (typeof registerAS6AIAction !== "function") failures.push("register_missing");
  if (typeof executeAS6AIAction !== "function") failures.push("execute_missing");
  if (typeof validateAS6AIActionRequest !== "function") failures.push("validator_missing");

  return {
    ok: failures.length === 0,
    failures,
    version: AS6_AI_ACTION_ENGINE_VERSION,
  };
}
