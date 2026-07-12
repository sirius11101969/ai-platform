# AS6 Architecture Repository Enforcement v1

Status: ACTIVE / APPROVED / ENFORCED

## Decision

The executable Architecture-as-Code validator is mandatory in the established AS6 pre-commit/push enforcement path.

## Canonical paths

- validator: `architecture/validation/validate-architecture-repository.sh`
- enforcement: `ops/bin/as6-pre-commit-push-enforcement`
- diagnostic: `ops/diagnostics/as6-architecture-repository-v1.md`
- invariant registry: `architecture/constitution/invariants.yaml`
- Living Space registry: `architecture/spaces/registry.yaml`
- locked Master components: `architecture/master-screen/locked-components.yaml`
- quality gates: `architecture/governance/quality-gates.yaml`
- architecture object registry: `architecture/registry/objects.yaml`

## Required execution evidence

- `AS6_ARCHITECTURE_REPOSITORY=PASS`
- `AS6_ARCHITECTURE_INVARIANTS=PASS`
- `AS6_LIVING_SPACE_REGISTRY=PASS`
- `AS6_MASTER_SCREEN_LOCKED_COMPONENTS=PASS`
- `AS6_ARCHITECTURE_QUALITY_GATES=PASS`
- `AS6_ARCHITECTURE_REPOSITORY_READINESS=100%`
- `AS6_ARCHITECTURE_ENFORCEMENT=PASS`
- `AS6_ENFORCEMENT_WORKFLOW=PASS`

## Failure classes

- `AS6_ARCHITECTURE_REPOSITORY_MISSING`
- `AS6_ARCHITECTURE_INVARIANT_DRIFT`
- `AS6_ARCHITECTURE_OBJECT_UNREGISTERED`
- `AS6_LIVING_SPACE_REGISTRY_DRIFT`
- `AS6_MASTER_COMPONENT_REGISTRY_DRIFT`
- `AS6_ARCHITECTURE_QUALITY_GATE_GAP`
- `AS6_ARCHITECTURE_VALIDATION_GAP`
- `AS6_ARCHITECTURE_ENFORCEMENT_BYPASS`

## Prevention controls

1. Architecture validation executes before secret scan and production health completion.
2. A validation failure stops commit/push enforcement.
3. No parallel architecture validation framework may be introduced.
4. New architecture objects must be registered before acceptance.
5. New or changed Living Spaces must preserve the canonical count and architecture approval rules.
6. Locked Master Screen component rules remain mandatory.
7. Diagnostic Registry, Coverage Registry, Project State, Governance, and detected-errors records must remain synchronized.

## Acceptance

The architecture repository is governed as executable product infrastructure rather than optional documentation.

`AS6_ARCHITECTURE_REPOSITORY_ENFORCEMENT_READINESS=100%`
