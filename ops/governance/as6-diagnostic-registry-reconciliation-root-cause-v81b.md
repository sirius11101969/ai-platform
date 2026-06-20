# AS6 V81B Root Cause

V81 discovered historical diagnostic artifacts present in ops/bin but missing from registry coverage evidence.
V81 also exposed autonomous self-validation allowlist drift.
Repair: reconcile historical artifacts, register drift classes, add permanent reconciliation diagnostic/control and repair V81 self-validation logic.
