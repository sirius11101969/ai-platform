# AS6 Architecture Repository v1.0

Status: ACTIVE / EXECUTABLE ARCHITECTURE / SOURCE OF TRUTH

## Purpose

This directory materializes the approved AS6 architecture as machine-readable registries and deterministic controls.

The repository follows the chain:

`Constitution -> Master Screen -> Living Space -> Intent -> Capability -> Domain -> Knowledge -> Engineering -> Validation`

## Canonical sources

1. `docs/architecture/10_AS6_MASTER_SCREEN_STANDARD_V1.md`
2. `docs/AS6_LIVING_SPACE_RULES.md`
3. `docs/architecture/09_AS6_CORE_SPECIFICATION.md`
4. `ops/governance/as6-master-screen-freeze-v1.md`

## Initial executable artifacts

- `constitution/invariants.yaml` — immutable product and architecture rules.
- `master-screen/locked-components.yaml` — locked visual components inherited by every Living Space.
- `spaces/registry.yaml` — canonical twelve-space registry.
- `governance/quality-gates.yaml` — mandatory acceptance gates.
- `registry/objects.yaml` — architecture object registry and traceability links.
- `validation/validate-architecture-repository.sh` — deterministic structural validator.

## Change rule

Every architecture change must update the relevant registry, validation control, governance evidence, and source specification in the same change cycle.

No lower-level artifact may override a canonical higher-level rule.
