# AS6 Marketplace E2E Plugin Validation AEC P22

Failure classes:
- AS6_MARKETPLACE_E2E_PLUGIN_VALIDATION_DRIFT
- AS6_PLUGIN_LIFECYCLE_VALIDATION_GAP
- AS6_GENERATED_PLUGIN_MARKETPLACE_VISIBILITY_GAP
- AS6_PLUGIN_E2E_SMOKE_GAP

AEC rules:
- Marketplace lifecycle must include generated plugin smoke validation.
- Generated plugin must pass AS6 generated plugin diagnostic.
- Build must pass after generated plugin lifecycle validation.
