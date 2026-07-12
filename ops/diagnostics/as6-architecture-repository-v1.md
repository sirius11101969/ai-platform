# AS6 Executable Architecture Repository v1

Status: IMPLEMENTED / VALIDATION CONTROL ADDED

## Diagnostics

The approved AS6 architecture existed across canonical documents but lacked a dedicated machine-readable repository, object registry, invariant registry, and deterministic structural validator.

## Root cause

Architecture rules were human-readable but not yet materialized as Architecture as Code. This created risks of document drift, component regeneration drift, unregistered spaces, missing traceability, and inconsistent quality-gate application.

## Structure added

- `architecture/README.md`
- `architecture/constitution/invariants.yaml`
- `architecture/master-screen/locked-components.yaml`
- `architecture/spaces/registry.yaml`
- `architecture/governance/quality-gates.yaml`
- `architecture/registry/objects.yaml`
- `architecture/validation/validate-architecture-repository.sh`

## New failure classes

- `AS6_ARCHITECTURE_REPOSITORY_MISSING`
- `AS6_ARCHITECTURE_INVARIANT_DRIFT`
- `AS6_ARCHITECTURE_OBJECT_UNREGISTERED`
- `AS6_LIVING_SPACE_REGISTRY_DRIFT`
- `AS6_MASTER_COMPONENT_REGISTRY_DRIFT`
- `AS6_ARCHITECTURE_QUALITY_GATE_GAP`
- `AS6_ARCHITECTURE_VALIDATION_GAP`

## New controls

- exact registry of eleven initial invariants;
- exact registry of twelve Living Spaces;
- locked Master Screen component registry;
- mandatory architecture, Master Screen, space, intent, knowledge, domain, diagnostics, and validation gates;
- deterministic file, invariant, space-count, metric, input-line, checksum, and gate checks;
- architecture object traceability registry.

## AEC rules

- reject an architecture change when its object is not registered;
- reject a Living Space count other than twelve without explicit architecture approval;
- reject missing canonical invariants;
- reject a visible enclosing frame on the Master communication line;
- reject state-metric scale drift;
- reject a change that omits affected quality gates or validation coverage.

## Validation target

Run:

`bash architecture/validation/validate-architecture-repository.sh`

Expected:

- `AS6_ARCHITECTURE_REPOSITORY=PASS`
- `AS6_ARCHITECTURE_INVARIANTS=PASS`
- `AS6_LIVING_SPACE_REGISTRY=PASS`
- `AS6_MASTER_SCREEN_LOCKED_COMPONENTS=PASS`
- `AS6_ARCHITECTURE_QUALITY_GATES=PASS`
- `AS6_ARCHITECTURE_REPOSITORY_READINESS=100%`

## Readiness

Architecture-as-Code foundation: `100%`.
Repository-wide CI wiring and execution evidence: pending Codex validation cycle.
