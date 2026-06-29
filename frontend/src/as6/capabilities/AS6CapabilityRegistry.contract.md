# AS6 Capability Registry Contract V113

Stage: AS6_CAPABILITY_REGISTRY_V113

Purpose:
- Provide a single source of truth for AS6 capabilities.
- Allow capabilities to have priority, status, services and plugin bindings.
- Prepare permission engine, marketplace and enterprise capability routing.

Required:
- as6CapabilityRegistry.js exports as6CapabilityRegistry.
- as6CapabilityEngine.js exports registry-aware capability resolution.
- Capabilities must include id, title, category, status, priority, services and plugins.
- Capability Engine must integrate with Capability Resolver.

Validation:
- AS6_CAPABILITY_REGISTRY_V113=PASS
