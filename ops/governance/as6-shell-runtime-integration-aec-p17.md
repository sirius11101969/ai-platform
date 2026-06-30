# AS6 Shell Runtime Integration AEC P17

Failure classes:
- AS6_SHELL_RUNTIME_INTEGRATION_DRIFT
- AS6_SHELL_RUNTIME_ROUTE_CONSUMER_GAP
- AS6_SHELL_RUNTIME_NAVIGATION_CONSUMER_GAP
- AS6_DYNAMIC_ROUTE_OUTLET_GAP
- AS6_PLUGIN_ROUTE_VISIBILITY_GAP

AEC rules:
- Shell runtime must consume Dynamic Shell Registry.
- Shell runtime must expose route and navigation getters.
- Shell runtime must provide a route outlet for dynamic components.
- Visible App/Shell wiring should consume P17 helpers in next stage.
