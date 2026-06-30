# AS6 Real App Wiring Root Cause P19

Root cause: P18 added App Runtime Integration, but real application wiring still needed a safe bridge before direct App.jsx route/menu placement.

Risk: directly editing App.jsx before compatibility validation can create routing regressions.

Repair: add Real App Wiring bridge, config, diagnostics and governance controls.
