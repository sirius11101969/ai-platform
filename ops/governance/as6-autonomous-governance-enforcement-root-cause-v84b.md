# AS6 V84B Root Cause

V84 stopped during re-diagnostics.
Root cause: V84 diagnostic checked governance artifact coverage strings before V84 self-registration aliases were written into registry/state/status.
Repair: register V84 governance artifact aliases explicitly and make the diagnostic validate exact V84 files plus class registration evidence.
