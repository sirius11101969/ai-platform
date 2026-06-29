# AS6 Service Registry AEC V108

Failure classes:
- AS6_SERVICE_REGISTRY_DRIFT
- AS6_SERVICE_METADATA_DUPLICATION_RISK
- AS6_SERVICE_CAPABILITY_GAP
- AS6_SERVICE_PERMISSION_METADATA_GAP
- AS6_SERVICE_ENGINE_BYPASS_RISK

AEC rules:
- Product services must be registered in as6ServiceRegistry.js.
- Service metadata must include id, title, route, permissions and capabilities.
- Runtime, Command Palette and future Plugin SDK should consume Service Engine.
- New services must not be hardcoded in multiple shell surfaces.
