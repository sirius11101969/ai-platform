# AS6 Real App Wiring AEC P19

Failure classes:
- AS6_REAL_APP_WIRING_DRIFT
- AS6_APP_WIRING_BRIDGE_GAP
- AS6_DIRECT_APP_ROUTE_EDIT_RISK
- AS6_RUNTIME_PANEL_VISIBILITY_GAP
- AS6_APP_INDEX_EXPORT_GAP

AEC rules:
- Real App wiring must consume App Runtime Integration.
- Direct App.jsx route placement should happen after wiring diagnostics pass.
- App-level exports must include wiring bridge.
- Visible App route/menu placement is next stage.
