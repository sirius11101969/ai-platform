# AS6 Master Screen Freeze v1

Status: ACTIVE / APPROVED / ENFORCED

## Diagnostic conclusion

The previously recorded rule «Screen 1 is the Master Screen» was too general to prevent visual drift in shared components. Repeated regeneration produced inconsistent percentage metrics, input-line frames, microphone placement, typography color, glow, and spacing across CRM, Finance, and Documents.

## Root cause

Failure to distinguish between:

- the Master Screen as a general visual reference; and
- locked shared components that must be reused without independent interpretation.

## Canonical artifact

- screen: `Фокус — Пространство концентрации`
- canonical source filename: `ЭКРАН 1 ПРОСТРАНСТВО КОНЦЕНТРАЦИИ(5).png`
- dimensions: `1536 × 1024 px`
- SHA-256: `95b21330030a963f0a1886da2c7ddc008afd785f945569df29aadfaf86371693`
- canonical specification: `docs/architecture/10_AS6_MASTER_SCREEN_STANDARD_V1.md`

## Locked controls

The following controls are mandatory:

1. No independent redesign of shared components.
2. Bottom input line has no visible enclosing rectangular frame.
3. State percentages reuse the Master Screen metric hierarchy and approximately 18 px visible character height at 1536×1024.
4. Typography color and opacity are inherited globally.
5. The central living object remains the primary focus.
6. Every new space must be visually compared against the canonical Master Screen before approval.

## Failure classes

- `AS6_MASTER_SCREEN_REFERENCE_AMBIGUITY`
- `AS6_SHARED_COMPONENT_REGENERATION_DRIFT`
- `AS6_INPUT_LINE_FRAME_DRIFT`
- `AS6_STATE_METRIC_SCALE_DRIFT`
- `AS6_TYPOGRAPHY_COLOR_DRIFT`
- `AS6_CENTRAL_GLOW_QUALITY_DRIFT`

## AEC rules

- Reject a space when a locked component is independently restyled.
- Reject any bottom input line with a visible rectangular enclosing border.
- Reject a state metric that visually dominates the central object.
- Reject typography whose hue, opacity, weight, or hierarchy differs from the Master Screen.
- Require a new checksum and explicit product-owner approval before replacing the canonical Master Screen.

## Coverage

Covered areas:

- Focus;
- CRM;
- Finance;
- Documents;
- all future Living Spaces;
- design prompts;
- design tokens;
- React shared components;
- visual regression checks;
- interface governance.

## Validation state

- canonical artifact identified: PASS
- dimensions registered: PASS
- checksum registered: PASS
- locked component policy registered: PASS
- failure classes registered: PASS
- AEC prevention rules registered: PASS
- architecture freeze registered: PASS

## Readiness

`AS6_MASTER_SCREEN_STANDARD_READINESS=100%`
