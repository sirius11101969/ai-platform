# AS6 Runtime Orchestrator AEC V100

Failure classes:
- AS6_RUNTIME_ORCHESTRATOR_DRIFT
- AS6_RUNTIME_STATE_DUPLICATION_RISK
- AS6_RUNTIME_SUBSCRIPTION_GAP
- AS6_RUNTIME_SNAPSHOT_RESTORE_GAP
- AS6_RUNTIME_PLUGIN_READINESS_GAP

AEC rules:
- Runtime state must be exposed through as6Runtime.js.
- Future Shell surfaces must integrate through Runtime APIs.
- Runtime snapshot/export/import must remain available.
- Runtime dispatch must not throw on unknown actions.
- Runtime subscribers must not break AS6Shell.
