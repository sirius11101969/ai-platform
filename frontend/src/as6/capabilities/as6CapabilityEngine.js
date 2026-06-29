import {
  getAS6ActiveCapabilities,
  getAS6Capabilities,
  getAS6CapabilitiesByService,
  getAS6CapabilityById,
  getAS6CapabilityPriority,
  validateAS6CapabilityRegistryPolicy,
} from "./as6CapabilityRegistry";

import { resolveCapability } from "./as6CapabilityResolver";
import { getAS6ServiceById } from "../services/as6ServiceRegistry";

export function getAS6CapabilityEngineState() {
  return {
    capabilities: getAS6Capabilities(),
    activeCapabilities: getAS6ActiveCapabilities(),
    validation: validateAS6CapabilityRegistryPolicy(),
  };
}

export function resolveAS6CapabilityWithRegistry(capabilityId) {
  const capability = getAS6CapabilityById(capabilityId);

  if (!capability) {
    return {
      ok: false,
      error: "AS6_CAPABILITY_REGISTRY_NOT_FOUND",
      capabilityId,
    };
  }

  if (capability.status !== "active") {
    return {
      ok: false,
      error: "AS6_CAPABILITY_DISABLED",
      capabilityId,
    };
  }

  const resolverResult = resolveCapability(capabilityId);

  return {
    ok: resolverResult.ok,
    capability,
    resolverResult,
    priority: getAS6CapabilityPriority(capabilityId),
  };
}

export function getAS6ServiceCapabilities(serviceId) {
  const service = getAS6ServiceById(serviceId);

  if (!service) {
    return [];
  }

  return getAS6CapabilitiesByService(serviceId);
}

export function validateAS6CapabilityEnginePolicy() {
  const registryValidation = validateAS6CapabilityRegistryPolicy();
  const failures = [...registryValidation.failures];

  if (typeof resolveCapability !== "function") failures.push("resolver_missing");
  if (!getAS6CapabilityById("customers")) failures.push("customers_capability_missing");
  if (!getAS6CapabilityById("workspace")) failures.push("workspace_capability_missing");

  return {
    ok: failures.length === 0,
    failures,
    capabilityCount: registryValidation.count,
  };
}
