# AS6 Legacy V89 Diagnostic Root Cause V91D

Root cause: V89 diagnostic correctly removed direct CRMPage lazy entry from App.jsx, but it still expected /as6-sales route evidence directly inside App.jsx.

Risk: after V91 registry-driven route rendering, legacy diagnostics can falsely fail and force manual /as6-sales route drift back into App.jsx.

Repair: update V89 diagnostic to accept /as6-sales evidence from as6LivingSpaceRegistry.js and AS6LivingSpaceRoutes.jsx.
