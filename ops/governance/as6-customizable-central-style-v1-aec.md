# AS6 customizable central style v1 — AEC

## Failure classes

- `AS6_CENTRAL_STYLE_GLOBAL_LEAK`: appearance from one company appears in another workspace.
- `AS6_CENTRAL_STYLE_UNBOUNDED_VALUES`: persisted or edited scale, color, or glyph escapes the supported range.
- `AS6_CENTRAL_STYLE_EDIT_MODE_CLUTTER`: appearance controls remain visible outside edit mode or without a selected node.
- `AS6_CENTRAL_STYLE_CANCEL_PERSISTENCE_DRIFT`: Cancel or Reset no longer follows the layout editor lifecycle.

## Prevention contract

- Store a normalized style map under a workspace-specific browser key.
- Whitelist colors and glyphs and clamp icon and label scales.
- Render the compact controls only for the selected business node while editing.
- Snapshot, cancel, reset, and save style together with the existing layout lifecycle.
- Keep production unchanged until protected staging visual acceptance.

## Control

- `ops/bin/as6-control-customizable-central-style-v1`
- `ops/diagnostics/as6-customizable-central-style-v1.mjs`
