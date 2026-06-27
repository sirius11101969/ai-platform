# AS6 OS Interactive Command Palette Governance

- Rule: Command Palette must be reusable across AS6 modules.
- Rule: First implementation is safe and local: it does not mutate CRM data.
- Rule: Palette actions may navigate/prepare actions later through AS6 Command Bus.
- Rule: Keyboard shortcut Ctrl+K / Cmd+K must open the palette.
- Rule: Escape must close the palette.
- AEC rule: interactive-command-palette-requires-build-import-count-keyboard-control.
- Failure class: static-command-layer-without-interaction.
