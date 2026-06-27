# AS6 OS Interactive Command Palette Root Cause

- Root cause: AS6 Command Layer exists visually, but it is not interactive yet.
- Interface gap: user sees command affordance, but cannot open a real command palette with keyboard or click.
- Risk: AS6 may feel like a static dashboard instead of an active AI Operating System.
- Resolution: add reusable AS6CommandPalette component, Ctrl+K listener and clickable floating command button on /crm.
- Page changed: /crm.
- UI changed: overlay command palette, bottom-right clickable command entry, keyboard shortcut hint.
