# AS6 V113B Root Cause

V113 diagnostics passed, but control stopped because npm was not available in the current shell.
Root cause: V113 control directly called npm and missed the docker/node fallback pattern already repaired in V112B.
Repair/prevention: repair V113 control to use local npm when available and docker node fallback otherwise. Register UI_GOVERNANCE_BUILD_RUNNER_FALLBACK_GAP.
