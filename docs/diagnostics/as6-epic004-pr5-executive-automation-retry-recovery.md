# AS6 EPIC-004 PR-5 Diagnostic

- AS6_EXECUTIVE_AUTOMATION_RETRY_GAP: added runtime retry controls for full scenario and individual step.
- AS6_EXECUTIVE_AUTOMATION_RECOVERY_DRIFT: added runtime recovery from last known execution step.
- AS6_EXECUTIVE_AUTOMATION_RETRY_STATE_GAP: retryCount, retrying and recovering states are visible.
- AS6_EXECUTIVE_AUTOMATION_RUNTIME_RECOVERY_DRIFT: retry/recovery state is runtime-only and does not mutate persistent storage.
- AS6_EXECUTIVE_AUTOMATION_FAILURE_REASON_GAP: last failure reason is displayed in Retry & Recovery UI.
- Workspace Storage V99, contextState.businessHome, layout schema, localStorage and Live Data were not changed.
