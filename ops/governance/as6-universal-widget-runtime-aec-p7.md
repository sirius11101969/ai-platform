# AS6 Universal Widget Runtime AEC P7

Failure classes:
- AS6_UNIVERSAL_WIDGET_RUNTIME_DRIFT
- AS6_WIDGET_REGISTRY_GAP
- AS6_WIDGET_LIFECYCLE_GAP
- AS6_WIDGET_BUS_INTEGRATION_GAP
- AS6_WORKSPACE_COMPOSITION_GAP

AEC rules:
- Widgets must register through Universal Widget Runtime.
- Widgets must support activation/deactivation lifecycle.
- Widgets must publish lifecycle events through Universal Service Bus.
- Product UI modules should become widgets before workspace composition.
