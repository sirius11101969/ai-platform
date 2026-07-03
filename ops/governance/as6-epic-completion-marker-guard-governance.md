# AS6 Governance — Epic Completion Marker Guard

Stage: AS6_EPIC_COMPLETION_MARKER_GUARD

- Every final epic validation must expose AS6_DONE.
- Every final epic validation must expose production status flag.
- Every final epic validation must expose restore tag at HEAD.
- Every final epic validation must preserve runtime evidence.
- Truncated logs are not sufficient for closing an epic.
- The reusable guard is ops/bin/as6-diagnose-epic-completion-markers.
