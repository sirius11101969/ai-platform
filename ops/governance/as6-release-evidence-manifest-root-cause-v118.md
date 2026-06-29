# AS6 Release Evidence Manifest Root Cause V118

Root cause: validation and release gate logs exist, but there is no single release evidence manifest that links branch, head, target, validate result, release gate result, build result and readiness.

Repair: add ops/bin/as6-release-evidence and ops/evidence manifests.
