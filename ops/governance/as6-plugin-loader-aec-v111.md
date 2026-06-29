# AS6 Plugin Loader AEC V111

Failure classes:
- AS6_PLUGIN_LOADER_DRIFT
- AS6_PLUGIN_LOAD_FAILURE
- AS6_PLUGIN_DEPENDENCY_FAILURE
- AS6_PLUGIN_ACTIVATION_FAILURE
- AS6_PLUGIN_DIRECT_ACTIVATION_RISK
- AS6_PLUGIN_RUNTIME_STATUS_GAP

AEC rules:
- Plugins must be activated through AS6 Plugin Loader.
- Plugin service references must resolve before activation.
- Plugin lifecycle status must be tracked.
- Plugin lifecycle events must use AS6 Event Bus.
- Plugin dependency resolution must use AS6 Dependency Engine.
