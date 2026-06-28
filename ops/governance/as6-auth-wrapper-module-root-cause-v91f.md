# AS6 Auth Wrapper Module Root Cause V91F

Root cause: V91B moved auth-aware Living Space routes into AS6LivingSpaceRoutes, but imported RequireAuth from a non-existent components/RequireAuth module. In the current app, RequireAuth was local to App.jsx.

Risk: registry-driven routing cannot preserve route auth while RequireAuth is trapped inside App.jsx.

Repair: create shared AS6RouteAuth.jsx with RequireAuth and ProtectedRoute, update App.jsx and AS6LivingSpaceRoutes to import from the shared module.
