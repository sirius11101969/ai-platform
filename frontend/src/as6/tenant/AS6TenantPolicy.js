import {
  assertAS6TenantAccess,
  canAccessAS6AIContext,
  canAccessAS6LivingSpace,
  canAccessAS6Widget,
  canAccessAS6Workspace,
} from "./AS6OrganizationBoundary";
import { ensureAS6DefaultTenant, getCurrentTenant } from "./AS6TenantRuntime";

export const AS6_TENANT_POLICY_VERSION = "P9";

export function validateAS6TenantPolicy(resource = {}) {
  const tenant = getCurrentTenant() || ensureAS6DefaultTenant();
  const failures = [];

  if (!tenant) failures.push("tenant_missing");
  if (tenant?.status !== "active") failures.push("tenant_not_active");

  const access = assertAS6TenantAccess(resource);
  if (!access.ok) failures.push(access.error);

  if (resource.workspaceId && !canAccessAS6Workspace(resource.workspaceId, tenant.id).ok) {
    failures.push("workspace_tenant_mismatch");
  }

  if (resource.widgetId && !canAccessAS6Widget(resource.widgetId, tenant.id).ok) {
    failures.push("widget_tenant_mismatch");
  }

  if (resource.aiContextSpaceId && !canAccessAS6AIContext(resource.aiContextSpaceId, tenant.id).ok) {
    failures.push("ai_context_tenant_mismatch");
  }

  if (resource.livingSpaceId && !canAccessAS6LivingSpace(resource.livingSpaceId, tenant.id).ok) {
    failures.push("living_space_tenant_mismatch");
  }

  return {
    ok: failures.length === 0,
    failures,
    tenantId: tenant?.id || null,
    version: AS6_TENANT_POLICY_VERSION,
  };
}
