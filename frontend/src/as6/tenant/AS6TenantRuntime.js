import { emitAS6BusEvent } from "../bus";

export const AS6_TENANT_RUNTIME_VERSION = "P9";

const tenantRegistry = new Map();
let activeTenantId = null;

export function registerAS6Tenant(tenant) {
  if (!tenant?.id) return { ok: false, error: "AS6_TENANT_ID_MISSING" };
  if (!tenant?.name) return { ok: false, error: "AS6_TENANT_NAME_MISSING" };

  tenantRegistry.set(tenant.id, {
    status: "registered",
    owner: null,
    policies: [],
    workspaces: [],
    livingSpaces: [],
    widgets: [],
    aiContexts: [],
    version: AS6_TENANT_RUNTIME_VERSION,
    ...tenant,
  });

  emitAS6BusEvent("tenant.registered", { tenantId: tenant.id });

  return { ok: true, tenantId: tenant.id };
}

export function activateAS6Tenant(tenantId) {
  const tenant = tenantRegistry.get(tenantId);
  if (!tenant) return { ok: false, error: "AS6_TENANT_NOT_FOUND", tenantId };

  activeTenantId = tenantId;
  tenantRegistry.set(tenantId, {
    ...tenant,
    status: "active",
    activatedAt: new Date().toISOString(),
  });

  emitAS6BusEvent("tenant.activated", { tenantId });

  return { ok: true, tenant: tenantRegistry.get(tenantId) };
}

export function getCurrentTenant() {
  return activeTenantId ? tenantRegistry.get(activeTenantId) || null : null;
}

export function getCurrentTenantId() {
  return activeTenantId;
}

export function getTenantById(tenantId) {
  return tenantRegistry.get(tenantId) || null;
}

export function getTenantState() {
  return {
    version: AS6_TENANT_RUNTIME_VERSION,
    activeTenantId,
    tenantCount: tenantRegistry.size,
    tenants: [...tenantRegistry.values()],
  };
}

export function ensureAS6DefaultTenant() {
  if (!tenantRegistry.has("default")) {
    registerAS6Tenant({
      id: "default",
      name: "Default Organization",
      owner: "system",
      policies: ["default_policy"],
      workspaces: ["default-workspace"],
      livingSpaces: ["crm", "ai"],
      widgets: [
        "crm.dashboard.widget",
        "crm.customers.widget",
        "crm.deals.widget",
        "ai.context.widget",
      ],
      aiContexts: ["crm"],
    });
  }

  if (!activeTenantId) {
    activateAS6Tenant("default");
  }

  return getCurrentTenant();
}
