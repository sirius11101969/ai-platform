# AS6 Service Registry Contract V108

Stage: AS6_SERVICE_REGISTRY_V108

Purpose:
- Provide a single source of truth for AS6 services.
- Prepare dependency graph, plugin API, capability registry and permission engine.
- Prevent duplicated service lists across Runtime, Navigation, Command Palette and Workspace.

Required:
- as6ServiceRegistry.js exports as6ServiceRegistry.
- as6ServiceEngine.js exports service query helpers.
- Services include id, title, route, permissions, capabilities and status.
- CRM and AS6 One must be registered.

Validation:
- AS6_SERVICE_REGISTRY_V108=PASS
