# AS6 Plugin SDK AEC V109

Failure classes:
- AS6_PLUGIN_SDK_DRIFT
- AS6_PLUGIN_REGISTRY_DRIFT
- AS6_PLUGIN_SERVICE_REFERENCE_DRIFT
- AS6_PLUGIN_EVENT_BUS_INTEGRATION_GAP
- AS6_PLUGIN_CORE_MODIFICATION_RISK

AEC rules:
- Plugins must register through AS6 Plugin SDK.
- Plugin service references must resolve through AS6 Service Registry.
- Plugin lifecycle events must use AS6 Event Bus.
- Plugins must not modify AS6Shell core directly.
- New plugin capabilities must be registered and validated.
