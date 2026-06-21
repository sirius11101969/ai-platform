# AS6 V105 Root Cause

Base commit: 0be019b.
V104 added backend connector registry and operational store, raising live operational data to 90%.
Remaining gap: Dashboard page family needs explicit wiring to AS6OperationalStore, freshness badges, stale detection and cached fallback contract.
Repair/prevention: add dashboard live data wiring, status component, CSS, contract docs, diagnostics/control/governance and dashboard data drift classes.
