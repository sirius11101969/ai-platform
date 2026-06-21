# AS6 V112 Root Cause

Base commit: 4adf981.

V111 added Design Token Registry and raised component consolidation to 95%.
Remaining gap: local KPI/card/table/filter/action/state implementations can still appear unless primitive usage is enforced.
Repair/prevention: add Real Primitive Enforcement Engine diagnostics/control/governance to detect local primitive drift and enforce AS6 unified primitives.
