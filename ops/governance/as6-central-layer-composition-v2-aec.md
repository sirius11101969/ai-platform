# AS6 Central Layer Composition v2

## Root cause

- The editing surface painted a translucent rectangle underneath an elliptical connection mask, producing mixed-shape corners in dark mode.
- Dynamic connections terminated at node centers, so translucent node surfaces allowed lines to remain visually present inside icons.
- Editing actions used a top override and competed with the centered screen header.
- The active route occupied the same lower composition zone as layout and intent controls.

## Failure classes

- `AS6_CENTRAL_MASK_MIXED_SHAPE_ARTIFACT`
- `AS6_CONNECTION_NODE_OVERPAINT`
- `AS6_LAYOUT_TOOLBAR_HEADER_COLLISION`
- `AS6_CENTRAL_ROUTE_BOTTOM_COLLISION`

## AEC rules

- The central goal uses one borderless, theme-matched rounded mask; edit mode may add only a dashed outline.
- Connection paths stop before node centers and remain below node and focus layers.
- Normal and editing layout actions share the bottom action slot.
- The active route stays in the upper workspace and does not compete with bottom controls.

## Validation

- `ops/bin/as6-control-customizable-central-layout-v1`
- `ops/diagnostics/as6-customizable-central-layout-v1.mjs`
- frontend production build
- Architecture Guardian
- secret scan
