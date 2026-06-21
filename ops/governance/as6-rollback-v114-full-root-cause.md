# AS6 Full Rollback V114 Root Cause

V114C rollback reverted d5ad4a3 only, but V114 shell overlay commit 457f23d remained active.
Root cause: production still included AS6MissionControlShellAdapter from V114.
Rollback: revert 457f23d, rebuild frontend, redeploy restored dist into nginx, reload nginx.
