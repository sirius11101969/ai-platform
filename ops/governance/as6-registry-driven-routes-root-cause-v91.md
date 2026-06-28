# AS6 Registry-driven Route Rendering Root Cause V91

Root cause: V90 created as6LivingSpaceRegistry.js, but App.jsx still manually renders /as6-one and /as6-sales routes.

Risk: every new Living Space would require manual App.jsx route edits, causing route drift and inconsistent adapter policy.

Repair: introduce AS6LivingSpaceRoutes.jsx and render Living Space routes from the registry-driven route module.
