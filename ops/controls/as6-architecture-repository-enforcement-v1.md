# AS6 Architecture Repository Enforcement Control v1

Status: ACTIVE

## Control objective

Prevent architecture drift by ensuring every commit/push runs the canonical Architecture-as-Code validator before the enforcement workflow can pass.

## Control path

1. `ops/bin/as6-pre-commit-push-enforcement`
2. `architecture/validation/validate-architecture-repository.sh`
3. deterministic PASS/FAIL evidence
4. secret scan
5. production health validation
6. final enforcement PASS

## Mandatory PASS evidence

- `AS6_ARCHITECTURE_REPOSITORY=PASS`
- `AS6_ARCHITECTURE_INVARIANTS=PASS`
- `AS6_LIVING_SPACE_REGISTRY=PASS`
- `AS6_MASTER_SCREEN_LOCKED_COMPONENTS=PASS`
- `AS6_ARCHITECTURE_QUALITY_GATES=PASS`
- `AS6_ARCHITECTURE_REPOSITORY_READINESS=100%`
- `AS6_ARCHITECTURE_ENFORCEMENT=PASS`

## Failure behavior

Any missing file, invariant, Living Space registration, Master Screen lock, checksum, state-metric rule, input-frame rule, or quality gate terminates enforcement with a non-zero result.

## Rollback

Remove the validator call from the enforcement script only through an explicitly approved architecture decision that updates Governance, State, Diagnostic Registry, Coverage Registry, and detected errors in the same cycle.

`AS6_CONTROL_ARCHITECTURE_REPOSITORY_ENFORCEMENT_V1=REGISTERED`
