# AS6 V116B Root Cause

Previous V116 command did not run because the worktree was dirty.
Detected leftovers: deleted frontend/src/components/AS6CommandCenterClassicRestore.jsx and untracked old governance file.
Root cause: earlier failed V115/V115B attempts left uncommitted cleanup artifacts, so Diagnostics stopped before applying the real Command Center reference fix.
Repair: remove stale untracked governance artifact, keep intentional deletion of unused stale component, then apply source-level Command Center CSS fix and deploy.
