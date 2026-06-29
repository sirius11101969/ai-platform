# AS6 Build Once Validation Root Cause V117

Root cause: after V106 Release Gate, stage scripts still executed an additional frontend build after release gate had already performed build validation.

Risk: validation time grows unnecessarily and logs contain duplicate build sections.

Repair: establish Release Gate as the single owner of build validation. Stage-level scripts should rely on as6-release-gate for build evidence instead of running a second npm build.
