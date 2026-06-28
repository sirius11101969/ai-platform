# AS6 ONE Shell Real Wiring Root Cause V86

Stage: AS6_ONE_SHELL_REAL_WIRING_V86

Root cause: V85E created a shell adapter contract, but /as6-one still needs real route-level wiring into AS6Shell.

Risk: Living Spaces migration may remain theoretical if /as6-one is not actually routed through the unified AS6 shell.

Repair: create AS6OneShellAdapter.jsx that wraps existing AS6OnePage with AS6Shell and redirect the /as6-one route import to this adapter without changing page business logic.
