# AS6 Auth Wrapper Final Dedupe Root Cause V91F

Root cause: shared AS6RouteAuth was added, but local RequireAuth and ProtectedRoute functions remained in App.jsx.

Repair: remove local auth wrappers from App.jsx and keep the shared AS6RouteAuth import as the single source of route auth.
