import { getAS6CapabilityById } from "../capabilities/as6CapabilityRegistry";

export const AS6_PERMISSION_ENGINE_VERSION = "V114";

const permissionMatrix = {
  admin: ["*"],
  manager: [
    "customers",
    "deals",
    "analytics",
    "workspace",
    "pipeline"
  ],
  operator: [
    "customers",
    "workspace"
  ],
  viewer: [
    "analytics"
  ]
};

export function getPermissionMatrix() {
  return permissionMatrix;
}

export function hasCapability(role, capabilityId) {
  const capability = getAS6CapabilityById(capabilityId);
  if (!capability) return false;

  const permissions = permissionMatrix[role] || [];
  return permissions.includes("*") || permissions.includes(capabilityId);
}

export function validatePermissionPolicy() {
  const failures = [];

  for (const role of Object.keys(permissionMatrix)) {
    for (const capability of permissionMatrix[role]) {
      if (capability !== "*" && !getAS6CapabilityById(capability)) {
        failures.push(`${role}:${capability}`);
      }
    }
  }

  return {
    ok: failures.length === 0,
    failures,
    version: AS6_PERMISSION_ENGINE_VERSION
  };
}
