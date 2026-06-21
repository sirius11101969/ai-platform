# AS6 Manual Safe Rollback V114 Root Cause

Previous revert of 457f23d stopped on documentation conflicts.
Root cause: git revert tried to merge docs/AS6_PROJECT_STATE.md and ops/status/as6-detected-errors.md with later rollback entries.
Repair: abort conflicted revert, manually remove V114 shell overlay files/imports, rebuild frontend, redeploy nginx static dist, validate and commit.
