# AS6 Tenant / Organization Boundary Engine Contract P9

Stage: AS6_PLATFORM_V2_TENANT_BOUNDARY_ENGINE_P9

Purpose:
- Isolate organizations, workspaces, widgets, living spaces and AI context.
- Prepare AS6 Platform V2 for SaaS multi-tenant operation.
- Prevent cross-tenant access.

Tenant owns:
- workspaces
- widgets
- livingSpaces
- aiContexts
- policies

Required:
- registerAS6Tenant
- activateAS6Tenant
- getCurrentTenant
- assertAS6TenantAccess
- canAccessAS6Workspace
- canAccessAS6Widget
- canAccessAS6AIContext
- validateAS6TenantPolicy
