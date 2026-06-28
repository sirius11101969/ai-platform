# AS6 Auth Wrapper Module AEC V91F

Failure classes:
- AS6_AUTH_WRAPPER_MODULE_DRIFT
- AS6_REQUIRE_AUTH_LOCAL_SCOPE_DRIFT
- AS6_REGISTRY_ROUTE_AUTH_IMPORT_DRIFT
- AS6_AUTH_POLICY_BUILD_REGRESSION

AEC rules:
- RequireAuth must be reusable outside App.jsx.
- Registry-driven route rendering must import auth from AS6RouteAuth.
- App.jsx and AS6LivingSpaceRoutes must share the same auth wrapper.
- Build validation is mandatory after auth wrapper extraction.
