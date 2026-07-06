# AS6 Diagnostics First

Use this skill for every AS6 development cycle.

Before changes:
- determine current HEAD;
- determine restore tag at HEAD;
- check clean worktree;
- determine current active EPIC;
- determine NEXT_STAGE;
- use current HEAD as BASE_EXPECTED unless explicitly overridden.

Diagnose:
- Root Cause;
- Architecture Drift;
- Deployment Drift;
- Monitoring Gaps;
- Validation Gaps;
- Governance Gaps;
- Failure Classes.

Implementation:
- make minimal changes;
- do not modify unrelated code;
- do not duplicate existing architecture;
- prefer extending existing modules and registries.

Documentation:
- update Project State when needed;
- update Governance when needed;
- update Diagnostic Registry when needed;
- update Coverage Registry when needed;
- update AEC Rules when needed.

Never commit:
- runtime/**;
- temp files;
- cache;
- logs.

Validation:
- npm build;
- Docker Build when affected;
- Architecture Guardian;
- Secret Scan.

Finish with:
PROJECT_READINESS=
AS6_DONE=
CURRENT_COMMIT=
RESTORE_TAG=
NEXT_STAGE=
