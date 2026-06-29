import { hasCapability } from "./as6PermissionEngine";
import { getAS6CapabilityById } from "../capabilities/as6CapabilityRegistry";
import { getAS6ServiceById } from "../services/as6ServiceRegistry";

export const AS6_POLICY_ENGINE_VERSION = "V115";

export const as6PolicyRegistry = [
  {
    id: "admin_all_access",
    effect: "allow",
    roles: ["admin"],
    capabilities: ["*"],
    services: ["*"],
    livingSpaces: ["*"],
    priority: 1000,
  },
  {
    id: "manager_sales_access",
    effect: "allow",
    roles: ["manager"],
    capabilities: ["customers", "deals", "analytics", "pipeline"],
    services: ["crm", "pipeline-copilot", "revenue"],
    livingSpaces: ["as6-sales"],
    priority: 800,
  },
  {
    id: "operator_workspace_access",
    effect: "allow",
    roles: ["operator"],
    capabilities: ["customers", "workspace"],
    services: ["crm", "as6-one"],
    livingSpaces: ["as6-one", "as6-sales"],
    priority: 700,
  },
  {
    id: "viewer_analytics_access",
    effect: "allow",
    roles: ["viewer"],
    capabilities: ["analytics"],
    services: ["dashboard", "revenue"],
    livingSpaces: ["*"],
    priority: 500,
  },
];

function matchesList(list, value) {
  return Array.isArray(list) && (list.includes("*") || list.includes(value));
}

export function getAS6Policies() {
  return as6PolicyRegistry;
}

export function getAS6PoliciesForRole(role) {
  return as6PolicyRegistry.filter((policy) => matchesList(policy.roles, role));
}

export function evaluateAS6Policy(input = {}) {
  const {
    role,
    capability,
    service,
    livingSpace,
    context = {},
  } = input;

  if (!role || !capability) {
    return {
      ok: false,
      decision: "deny",
      reason: "AS6_POLICY_INPUT_INCOMPLETE",
    };
  }

  if (!getAS6CapabilityById(capability) && capability !== "*") {
    return {
      ok: false,
      decision: "deny",
      reason: "AS6_POLICY_CAPABILITY_UNKNOWN",
    };
  }

  if (service && !getAS6ServiceById(service) && service !== "*") {
    return {
      ok: false,
      decision: "deny",
      reason: "AS6_POLICY_SERVICE_UNKNOWN",
    };
  }

  const roleHasCapability = hasCapability(role, capability);

  const matchedPolicies = as6PolicyRegistry
    .filter((policy) => matchesList(policy.roles, role))
    .filter((policy) => matchesList(policy.capabilities, capability))
    .filter((policy) => !service || matchesList(policy.services, service))
    .filter((policy) => !livingSpace || matchesList(policy.livingSpaces, livingSpace))
    .sort((a, b) => b.priority - a.priority);

  const matchedPolicy = matchedPolicies[0] || null;

  if (!matchedPolicy) {
    return {
      ok: false,
      decision: "deny",
      reason: "AS6_POLICY_NO_MATCH",
      roleHasCapability,
      context,
    };
  }

  if (!roleHasCapability && !matchedPolicy.capabilities.includes("*")) {
    return {
      ok: false,
      decision: "deny",
      reason: "AS6_PERMISSION_ENGINE_DENIED",
      matchedPolicy,
      context,
    };
  }

  return {
    ok: matchedPolicy.effect === "allow",
    decision: matchedPolicy.effect,
    reason: matchedPolicy.effect === "allow" ? "AS6_POLICY_ALLOW" : "AS6_POLICY_DENY",
    matchedPolicy,
    roleHasCapability,
    context,
  };
}

export function canAccessAS6Capability(role, capability, options = {}) {
  return evaluateAS6Policy({
    role,
    capability,
    service: options.service,
    livingSpace: options.livingSpace,
    context: options.context || {},
  }).ok;
}

export function validateAS6PolicyEnginePolicy() {
  const failures = [];
  const ids = new Set();

  for (const policy of as6PolicyRegistry) {
    if (!policy.id) failures.push("policy_missing_id");
    if (!policy.effect) failures.push(`${policy.id || "unknown"}_missing_effect`);
    if (!Array.isArray(policy.roles)) failures.push(`${policy.id || "unknown"}_roles_not_array`);
    if (!Array.isArray(policy.capabilities)) failures.push(`${policy.id || "unknown"}_capabilities_not_array`);
    if (!Array.isArray(policy.services)) failures.push(`${policy.id || "unknown"}_services_not_array`);
    if (!Array.isArray(policy.livingSpaces)) failures.push(`${policy.id || "unknown"}_living_spaces_not_array`);
    if (ids.has(policy.id)) failures.push(`${policy.id}_duplicate_policy_id`);
    ids.add(policy.id);
  }

  return {
    ok: failures.length === 0,
    failures,
    count: as6PolicyRegistry.length,
    version: AS6_POLICY_ENGINE_VERSION,
  };
}
