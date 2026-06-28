# AS6 Legacy V89 Diagnostic AEC V91D

Failure classes:
- AS6_LEGACY_CRM_ENTRY_DIAGNOSTIC_ROUTE_MODEL_DRIFT
- AS6_CRM_DIAGNOSTIC_FORCES_MANUAL_ROUTE_DRIFT
- AS6_REGISTRY_CRM_ENTRY_COMPATIBILITY_GAP

AEC rules:
- V89 CRM lazy diagnostic must accept registry-driven /as6-sales evidence.
- CRM entry evidence may live in App.jsx manual route or AS6LivingSpaceRoutes + registry.
- Diagnostics must not force manual /as6-sales route regression.
