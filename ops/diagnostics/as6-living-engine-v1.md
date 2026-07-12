# AS6 Living Engine v1

Status: FOUNDATION_IMPLEMENTED / RUNTIME_VALIDATION_PENDING

## Diagnostics

The Living Space framework and preview runtime already existed, but each state still depended on component-level composition. A canonical configuration compiler did not yet connect Space Registry metadata, geometry, nodes, connections, lighting, motion, context, and recommendation ownership into one deterministic runtime state.

## Root cause

The project had shared React components and approved visual states, but no single engine contract that could reject unknown spaces, missing blueprint fields, or geometry drift before rendering.

## Structure added

- `frontend/src/living/engine-v1/spaceBlueprints.js`
- `frontend/src/living/engine-v1/compileLivingState.js`
- `frontend/src/living/engine-v1/LivingEngine.jsx`
- `frontend/src/living/engine-v1/index.js`

## Diagnostics added

- detect unknown Living Engine space IDs;
- detect missing blueprint fields;
- detect empty node definitions;
- detect divergence between Space Registry geometry and engine geometry;
- detect page-local runtime composition that bypasses the compiler;
- detect space definitions without context, recommendation, motion, lighting, node, or connection ownership.

## Failure classes

- `AS6_LIVING_ENGINE_MISSING`
- `AS6_LIVING_ENGINE_UNKNOWN_SPACE`
- `AS6_LIVING_ENGINE_BLUEPRINT_FIELD_MISSING`
- `AS6_LIVING_ENGINE_BLUEPRINT_NODES_INVALID`
- `AS6_LIVING_ENGINE_GEOMETRY_DRIFT`
- `AS6_LIVING_ENGINE_COMPILER_BYPASS`
- `AS6_LIVING_ENGINE_RUNTIME_DUPLICATION_DRIFT`
- `AS6_LIVING_ENGINE_VALIDATION_GAP`

## Controls

1. Every approved runtime state resolves through `getLivingSpaceDefinition` and `getLivingSpaceBlueprint`.
2. Every blueprint declares geometry, context, recommendation, motion, nodes, connections, and lighting.
3. Geometry in the engine must exactly match the canonical Space Registry.
4. New spaces are configuration entries, not independent pages.
5. Production adoption is blocked until build, deterministic tests, visual fidelity, rollback, and production health pass.

## AEC rules

- reject unknown or unregistered engine spaces;
- reject incomplete state blueprints;
- reject geometry mismatch between registry and engine;
- reject local JSX state composition that bypasses `compileLivingState`;
- reject production migration without visual-regression evidence;
- preserve the current preview and legacy runtime as rollback until validation closes.

## Current validation state

- engine source structure: PASS
- four approved space blueprints: PASS
- deterministic compiler contract: PASS
- framework integration source: ADDED
- component compatibility tests: PENDING
- preview migration: PENDING
- build and visual regression: PENDING
- production migration: BLOCKED

## Readiness

`AS6_LIVING_ENGINE_FOUNDATION_READINESS=100%`

`AS6_LIVING_ENGINE_RUNTIME_READINESS=45%`
