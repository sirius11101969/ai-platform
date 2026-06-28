# AS6 Legacy V90 Diagnostic Root Cause V91C

Root cause: V91B correctly moved Living Space routes from App.jsx into AS6LivingSpaceRoutes, but the V90 diagnostic still required manual App.jsx routes for /as6-one and /as6-sales.

Risk: legacy diagnostics can block valid architecture evolution and force manual route drift back into App.jsx.

Repair: update V90 diagnostic to accept registry-driven routing: registry contains routes, AS6LivingSpaceRoutes renders them, and App.jsx delegates via <AS6LivingSpaceRoutes />.
