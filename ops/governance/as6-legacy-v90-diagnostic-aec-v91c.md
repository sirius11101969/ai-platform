# AS6 Legacy V90 Diagnostic AEC V91C

Failure classes:
- AS6_LEGACY_DIAGNOSTIC_ROUTE_MODEL_DRIFT
- AS6_DIAGNOSTIC_BLOCKS_VALID_ARCHITECTURE_EVOLUTION
- AS6_REGISTRY_ROUTE_MODEL_COMPATIBILITY_GAP

AEC rules:
- Legacy diagnostics must evolve when routing model moves from manual routes to registry-driven routes.
- V90 Living Space Registry diagnostic must accept AS6LivingSpaceRoutes as valid route evidence.
- Diagnostics must not force App.jsx manual Living Space route drift.
