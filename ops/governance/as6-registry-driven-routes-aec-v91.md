# AS6 Registry-driven Route Rendering AEC V91

Failure classes:
- AS6_REGISTRY_ROUTE_RENDERING_DRIFT
- AS6_APP_MANUAL_LIVING_SPACE_ROUTE_DRIFT
- AS6_LIVING_SPACE_ADAPTER_MAP_DRIFT
- AS6_REGISTRY_ROUTE_BUILD_REGRESSION
- AS6_LIVING_SPACE_ROUTE_ORPHAN

AEC rules:
- App.jsx must render Living Spaces through AS6LivingSpaceRoutes.
- App.jsx must not hardcode /as6-one or /as6-sales after V91.
- AS6LivingSpaceRoutes must map as6LivingSpaces to Route elements.
- Every active Living Space id must have an adapter mapping.
- Build validation is mandatory after registry-driven route rendering changes.
