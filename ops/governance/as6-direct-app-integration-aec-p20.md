# AS6 Direct App Integration AEC P20

Failure classes:
- AS6_DIRECT_APP_INTEGRATION_DRIFT
- AS6_MARKETPLACE_APP_ROUTE_GAP
- AS6_APP_ROUTE_VISIBILITY_GAP
- AS6_MANUAL_PLUGIN_PAGE_WIRING_RISK

AEC rules:
- App.jsx must expose `/marketplace` through AS6RealAppWiring.
- Direct app integration must keep a backup artifact before patching.
- Build must pass after route wiring.
