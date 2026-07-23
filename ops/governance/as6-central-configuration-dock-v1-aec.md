# AS6 central configuration dock v1 — AEC

## Failure classes

- `AS6_FOCUS_HEADER_COLLISION`: the movable main goal can enter the Today header area.
- `AS6_FOCUS_MASK_NODE_OCCLUSION`: the theme-matched goal mask paints over a business node circle.
- `AS6_STYLE_PANEL_VERTICAL_OVERLOAD`: selected-object controls consume excessive central height.
- `AS6_CONFIGURATION_CONTROL_FIXED_POSITION`: the customization action or panel cannot be placed where the user needs it.
- `AS6_DECORATIVE_GLYPH_CONTROL_NOISE`: low-value symbol controls compete with the primary size and color controls.

## Prevention contract

- Clamp the main goal and configuration dock to dedicated safe bounds.
- Keep graph connections below the goal, the goal above connections, and business nodes above the goal mask.
- Use one compact dock for the customization action, edit lifecycle, and selected-object controls.
- Persist the dock coordinate through the existing workspace-local layout model and include it in Reset, Cancel, and Save.
- Keep legacy stored glyph values readable, but do not expose decorative glyph controls.
- Validate only on protected staging until visual acceptance; production remains unchanged.

## Control

- `ops/bin/as6-control-central-configuration-dock-v1`
- `ops/diagnostics/as6-central-configuration-dock-v1.mjs`
