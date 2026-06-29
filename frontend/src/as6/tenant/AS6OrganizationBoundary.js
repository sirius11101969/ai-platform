import { ensureAS6DefaultTenant, getCurrentTenant, getTenantById } from "./AS6TenantRuntime";

export const AS6_ORGANIZATION_BOUNDARY_VERSION = "P9";

export function assertAS6TenantAccess(resource = {}) {
  const tenant = getCurrentTenant() || ensureAS6DefaultTenant();

  if (!tenant) {
    return { ok: false, error: "AS6_TENANT_CONTEXT_MISSING" };
  }

  if (resource.tenantId && resource.tenantId !== tenant.id) {
    return {
      ok: false,
      error: "AS6_CROSS_TENANT_ACCESS",
      tenantId: tenant.id,
      resourceTenantId: resource.tenantId,
    };
  }

  return { ok: true, tenantId: tenant.id };
}

export function canAccessAS6Workspace(workspaceId, tenantId) {
  const tenant = getTenantById(tenantId) || getCurrentTenant() || ensureAS6DefaultTenant();

  return {
    ok: Boolean(tenant?.workspaces?.includes(workspaceId)),
    tenantId: tenant?.id || null,
    workspaceId,
  };
}

export function canAccessAS6Widget(widgetId, tenantId) {
  const tenant = getTenantById(tenantId) || getCurrentTenant() || ensureAS6DefaultTenant();

  return {
    ok: Boolean(tenant?.widgets?.includes(widgetId)),
    tenantId: tenant?.id || null,
    widgetId,
  };
}

export function canAccessAS6AIContext(spaceId, tenantId) {
  const tenant = getTenantById(tenantId) || getCurrentTenant() || ensureAS6DefaultTenant();

  return {
    ok: Boolean(tenant?.aiContexts?.includes(spaceId)),
    tenantId: tenant?.id || null,
    spaceId,
  };
}

export function canAccessAS6LivingSpace(spaceId, tenantId) {
  const tenant = getTenantById(tenantId) || getCurrentTenant() || ensureAS6DefaultTenant();

  return {
    ok: Boolean(tenant?.livingSpaces?.includes(spaceId)),
    tenantId: tenant?.id || null,
    spaceId,
  };
}
