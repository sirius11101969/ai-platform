# Continue AS6

Use the AS6 Autonomous Engineer skill.

Automatically:

1. Determine:
   - current HEAD
   - restore tag
   - current PROJECT_READINESS
   - current active EPIC
   - current NEXT_STAGE
   - clean worktree

2. Use current HEAD as BASE_EXPECTED unless explicitly overridden.

3. Run AS6 Diagnostics First.

4. If diagnostics pass:

   - inspect existing architecture;
   - implement the current NEXT_STAGE;
   - reuse existing components;
   - reuse AS6 Design System;
   - avoid duplicate architecture.

5. Validate:

   - frontend production build;
   - Docker build when affected;
   - Architecture Guardian;
   - Secret Scan.

6. Never commit:

   - runtime/**
   - *.log
   - cache
   - temp files

7. Only after successful validation:

   - commit;
   - create restore tag;
   - push commit;
   - push tag.

8. Finish with:

PROJECT_READINESS=
AS6_DONE=
AS6_REPAIR=
CURRENT_COMMIT=
RESTORE_TAG=
NEXT_STAGE=

VALIDATION_GIT_HEAD=
VALIDATION_RESTORE_TAG=
VALIDATION_FRONTEND_BUILD=
VALIDATION_GUARDIAN=
VALIDATION_SECRET_SCAN=
VALIDATION_COMMIT=
VALIDATION_PUSH=

Summary:
- changed
- validated
- documented
- committed
- pushed
