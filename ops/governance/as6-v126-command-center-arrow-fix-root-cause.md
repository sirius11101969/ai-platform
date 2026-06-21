# AS6 V126 Root Cause

V125B deployed but did not commit because explicit pre-commit enforcement was run after normal staged patch changes.
Remaining visual drift shown by user red arrows: hero bottom border/empty gradient, sidebar separators, Copilot double border, right rail spacing, bottom gradient line.
Rendered HTML confirms Command Center uses real classes: command-hero, command-sidebar, quick-actions-primary, copilot-hero, command-main-grid, command-center-page.
Repair: apply one scoped CSS layer for these exact classes and use normal commit flow without explicit baseline enforcement call.
