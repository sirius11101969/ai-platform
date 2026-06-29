# AS6 Release Evidence Gate Root Cause V119

Root cause: V118 created a release evidence manifest, but release readiness did not yet enforce that evidence exists and contains required PASS markers.

Risk: a release cycle could pass validation but lose audit evidence, or commit without a complete evidence file.

Repair: add AS6 Release Evidence Gate to require evidence manifest, validate/release/build PASS markers, target, head and readiness.
