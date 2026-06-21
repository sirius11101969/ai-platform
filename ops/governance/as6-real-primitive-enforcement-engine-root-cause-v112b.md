# AS6 V112B Root Cause

V112 diagnostics passed, but control stopped at AS6_FRONTEND_BUILD_RUNNER_FAIL.
Root cause: V112 control only accepted local npm and did not include docker/node fallback used by previous successful frontend controls.
Repair/prevention: add build runner fallback to V112 control and register BUILD_RUNNER_FALLBACK_GAP.
