# AS6 Registry Auth Route AEC V91B

Failure classes:
- AS6_REGISTRY_AUTH_POLICY_DRIFT
- AS6_MANUAL_AUTH_WRAPPED_ROUTE_DRIFT
- AS6_LIVING_SPACE_AUTH_POLICY_MISSING
- AS6_REGISTRY_ROUTE_AUTH_LOSS_RISK
- AS6_APP_MANUAL_LIVING_SPACE_ROUTE_DRIFT

AEC rules:
- Living Space auth policy must live in as6LivingSpaceRegistry.js.
- AS6LivingSpaceRoutes must wrap protected spaces with RequireAuth.
- App.jsx must not hardcode manual /as6-one or /as6-sales routes.
- Registry-driven route rendering must preserve existing auth behavior.
