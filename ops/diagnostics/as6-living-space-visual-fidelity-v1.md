# AS6 Living Space Visual Fidelity v1

Status: BASELINE_MANIFEST_REGISTERED / BINARY_BASELINES_PENDING_INGESTION

## Diagnostics

The first four approved Living Space screens existed as external approved images, while the repository runtime had no canonical visual-baseline registry, checksum manifest, layout-anchor contract, or deterministic visual comparison thresholds.

## Root cause

Visual approval and runtime implementation were separated. The runtime could pass structural checks while still drifting in atmosphere, geometry, spacing, right-rail composition, state metric scale, reasoning line, recommendation, or Living Input shape.

## Added diagnostic artifacts

- `architecture/visual-baselines/registry.yaml`
- `architecture/visual-baselines/anchors.yaml`
- this diagnostic record

## Registered source evidence

- Focus Master Screen: 1536x1024, SHA-256 `5e393d23789e21e2f5773521c8e0f2212fa78155a227f063ea90b4f206e422bc`
- CRM: 1536x1024, SHA-256 `c61a4f82196e2c6b56a328d4b4742e1b6417587feaa19eaf9c86bf9e1c7473d9`
- Finance: 1536x1024, SHA-256 `96cf45c9061447312aa1d186974d881fc693446b725937e9f9e94a62a45e1b55`
- Documents: 1536x1024, SHA-256 `1ea1f8ecd7d72a9d56013445d7ffb88d5eb861ea7a5ccf777c610c91ae98e549`

## Failure classes

- `AS6_VISUAL_BASELINE_REGISTRY_MISSING`
- `AS6_VISUAL_BASELINE_BINARY_MISSING`
- `AS6_VISUAL_BASELINE_CHECKSUM_DRIFT`
- `AS6_VISUAL_VIEWPORT_DRIFT`
- `AS6_VISUAL_LAYOUT_ANCHOR_DRIFT`
- `AS6_VISUAL_PIXEL_DIFF_EXCEEDED`
- `AS6_GEOMETRY_FIDELITY_DRIFT`
- `AS6_RIGHT_RAIL_FIDELITY_DRIFT`
- `AS6_REASONING_LINE_FIDELITY_DRIFT`
- `AS6_LIVING_INPUT_FIDELITY_DRIFT`
- `AS6_STATE_METRIC_FIDELITY_DRIFT`
- `AS6_VISUAL_REGRESSION_EVIDENCE_GAP`

## Controls

1. Visual comparisons run only at the canonical 1536x1024 viewport unless a separately registered responsive baseline is approved.
2. Every approved baseline must match its registered SHA-256 before use.
3. Focus remains the Master Screen and sole visual source of truth for shared components.
4. CRM, Finance, and Documents may vary only in semantic content and unique central geometry.
5. Living Input must have no visible enclosing rectangular frame.
6. State metric remains secondary information with approximately 18 px visible character height.
7. Production migration is rejected without screenshot, pixel diff, anchor validation, build, route, rollback, secret-scan, and health evidence.

## AEC rules

- reject unregistered or checksum-mismatched baseline images;
- reject pixel diff above the registered threshold without explicit visual approval;
- reject missing anchors or locked-component drift;
- reject geometry duplication between approved spaces;
- reject production migration when binary baseline ingestion or regression evidence is incomplete.

## Current validation state

- visual baseline metadata and checksums: PASS
- visual anchor contract: PASS
- binary baseline files in repository: PENDING
- automated screenshot capture: PENDING
- pixel/layout comparison evidence: PENDING
- production migration approval: BLOCKED

## Readiness

`AS6_VISUAL_FIDELITY_FOUNDATION_READINESS=100%`

`AS6_VISUAL_REGRESSION_RUNTIME_READINESS=45%`
