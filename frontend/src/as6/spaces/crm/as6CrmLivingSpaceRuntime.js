import { crmLivingSpaceManifest } from "../examples/crm.space";
import { registerAS6Space, activateAS6Space, deactivateAS6Space } from "../as6SpaceRuntime";
import { registerAS6SpaceManifest } from "../as6SpaceRegistry";
import { createAS6SpaceContext, mergeAS6SpaceContext } from "../as6SpaceContext";
import { publishAS6LivingSpaceContext } from "../../ai/context";
import { registerAS6CrmAIActions } from "../../ai/actions";

export const AS6_CRM_LIVING_SPACE_RUNTIME_VERSION = "P2";

let crmRuntimeState = null;
let crmContext = createAS6SpaceContext("crm", {
  currentCustomer: null,
  currentDeal: null,
  currentView: "dashboard",
});

export function registerAS6CrmLivingSpace() {
  const registration = registerAS6SpaceManifest(crmLivingSpaceManifest);

  if (!registration.ok) {
    return {
      ok: false,
      error: "AS6_CRM_SPACE_MANIFEST_INVALID",
      validation: registration.validation,
    };
  }

  crmRuntimeState = registerAS6Space(crmLivingSpaceManifest);
  registerAS6CrmAIActions();

  return {
    ok: true,
    manifest: crmLivingSpaceManifest,
    runtime: crmRuntimeState,
    context: crmContext,
  };
}

export function activateAS6CrmLivingSpace(contextPatch = {}) {
  if (!crmRuntimeState) {
    const registration = registerAS6CrmLivingSpace();

    if (!registration.ok) {
      return registration;
    }
  }

  crmContext = mergeAS6SpaceContext(crmContext, contextPatch);
  publishAS6LivingSpaceContext("crm", crmContext.values, { priority: 900, source: "crm-runtime" });
  crmRuntimeState = activateAS6Space(crmRuntimeState, crmContext);

  return {
    ok: true,
    manifest: crmLivingSpaceManifest,
    runtime: crmRuntimeState,
    context: crmContext,
  };
}

export function deactivateAS6CrmLivingSpace() {
  if (!crmRuntimeState) {
    return {
      ok: true,
      status: "already_inactive",
      context: crmContext,
    };
  }

  crmRuntimeState = deactivateAS6Space(crmRuntimeState);

  return {
    ok: true,
    runtime: crmRuntimeState,
    context: crmContext,
  };
}

export function updateAS6CrmLivingSpaceContext(contextPatch = {}) {
  crmContext = mergeAS6SpaceContext(crmContext, contextPatch);

  return {
    ok: true,
    context: crmContext,
  };
}

export function getAS6CrmLivingSpaceState() {
  return {
    ok: true,
    version: AS6_CRM_LIVING_SPACE_RUNTIME_VERSION,
    manifest: crmLivingSpaceManifest,
    runtime: crmRuntimeState,
    context: crmContext,
  };
}

export function validateAS6CrmLivingSpaceRuntimePolicy() {
  const failures = [];

  if (crmLivingSpaceManifest.id !== "crm") failures.push("crm_manifest_id_invalid");
  if (!Array.isArray(crmLivingSpaceManifest.routes)) failures.push("crm_routes_not_array");
  if (!Array.isArray(crmLivingSpaceManifest.services)) failures.push("crm_services_not_array");
  if (!Array.isArray(crmLivingSpaceManifest.capabilities)) failures.push("crm_capabilities_not_array");
  if (!crmContext || crmContext.spaceId !== "crm") failures.push("crm_context_invalid");

  return {
    ok: failures.length === 0,
    failures,
    version: AS6_CRM_LIVING_SPACE_RUNTIME_VERSION,
  };
}
