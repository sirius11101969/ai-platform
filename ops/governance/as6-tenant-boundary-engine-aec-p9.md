# AS6 Tenant / Organization Boundary Engine AEC P9

Failure classes:
- AS6_TENANT_BOUNDARY_DRIFT
- AS6_TENANT_ISOLATION_GAP
- AS6_TENANT_POLICY_GAP
- AS6_CROSS_TENANT_ACCESS
- AS6_WORKSPACE_TENANT_MISMATCH
- AS6_AI_CONTEXT_TENANT_MISMATCH

AEC rules:
- Workspaces must belong to the active tenant.
- Widgets must belong to the active tenant.
- AI context must belong to the active tenant.
- Cross-tenant access must be denied.
- SaaS-ready features must use Tenant Boundary before execution.
