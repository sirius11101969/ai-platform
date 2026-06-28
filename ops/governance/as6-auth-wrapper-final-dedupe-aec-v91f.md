# AS6 Auth Wrapper Final Dedupe AEC V91F

Failure classes:
- AS6_AUTH_WRAPPER_DUPLICATE_SYMBOL_DRIFT
- AS6_APP_LOCAL_AUTH_WRAPPER_REGRESSION
- AS6_SHARED_AUTH_IMPORT_CONFLICT

AEC rules:
- App.jsx must import RequireAuth and ProtectedRoute from AS6RouteAuth.
- App.jsx must not declare local RequireAuth or ProtectedRoute.
- Registry-driven routes and App.jsx must share one auth implementation.
