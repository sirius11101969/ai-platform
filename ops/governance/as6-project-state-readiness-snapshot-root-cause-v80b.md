# AS6 V80B Root Cause

V80 stopped during re-diagnostics.
Root cause 1: readiness diagnostic required exact State marker AS6_DONE=CRM_ANALYTICS_REMOVE_LEGACY_ROLLBACK_COPY_V78D, but project state records the V78 completion section differently while final terminal status was V78D.
Root cause 2: readiness diagnostic treated its own staged V80 changes as unexpected worktree drift.
Repair: allow committed baseline plus staged V80 readiness files during self-validation, and accept V78/V78D baseline evidence through project state, registry and detected errors.
