# AS6 V104 Root Cause

Base commit: f36373a.
V103 added live operational data integration and raised live operational data to 70%.
Remaining gap: live layer still needs real backend connector contracts, unified operational store, cache, stale source detection and failover governance.
Repair/prevention: add backend data connectors, operational store, cache/freshness logic, connector contract docs, diagnostics/control/governance and connector drift classes.
