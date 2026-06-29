# AS6 Workspace Layout Runtime AEC P8

Failure classes

- AS6_WORKSPACE_LAYOUT_RUNTIME_DRIFT
- AS6_WORKSPACE_LAYOUT_CORRUPTION
- AS6_WIDGET_LAYOUT_GAP
- AS6_WORKSPACE_RESTORE_FAILURE

Rules

- Every workspace owns widget layout.
- Widget attachment must use Workspace Runtime.
- Workspace lifecycle emits Service Bus events.
