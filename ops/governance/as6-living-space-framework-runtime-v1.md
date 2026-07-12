# AS6 Living Space Framework Runtime v1

Status: PREVIEW_RUNTIME_IMPLEMENTED / PRODUCTION_MIGRATION_GATED

## Governance decision

The canonical Living Space Framework is now the required implementation boundary for preview states. Production route migration remains prohibited until build, visual regression, route, rollback, secret-scan, and production-health evidence are recorded.

## Required shared components

- `LivingFrame`
- `LivingInput`
- `LivingGeometry`
- `livingSpaceRegistry`
- canonical framework tokens

## Locked controls

- Master Screen remains the sole visual source of truth.
- Focus, CRM, Finance, and Documents are states of one frame.
- The communication line has no visible enclosing rectangle.
- The state percentage remains a secondary 18 px role at the reference viewport.
- Unknown space identifiers fail explicitly.
- The legacy dark engine remains rollback-only.
- Production adoption requires visual regression evidence.

## Enforcement

`ops/bin/as6-control-living-space-framework-v1` is invoked by `ops/bin/as6-pre-commit-push-enforcement`.

## Failure classes governed

- `AS6_LIVING_PREVIEW_FRAMEWORK_BYPASS`
- `AS6_LIVING_INPUT_VISIBLE_FRAME_DRIFT`
- `AS6_LIVING_SPACE_RUNTIME_REGISTRY_DRIFT`
- `AS6_LIVING_SPACE_UNKNOWN_REJECTION_GAP`
- `AS6_LIVING_GEOMETRY_RENDERER_GAP`
- `AS6_LIVING_FRAMEWORK_EXPORT_GAP`
- `AS6_LIVING_SPACE_FRAMEWORK_ENFORCEMENT_BYPASS`
- `AS6_PRODUCTION_LIVING_FRAME_MIGRATION_WITHOUT_VISUAL_EVIDENCE`

## Next gate

Run the repository checkout validation cycle and attach exact PASS evidence for build, framework control, architecture control, secret scan, routes, production health, and visual comparison before closing issue #365.
