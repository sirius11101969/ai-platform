# AS6 ONE Command Center Shell Foundation Root Cause

Root cause: `/as6-one` was not registered as a Command Center based workspace and had no reusable AS6 ONE implementation in the current frontend route table. That made the preview unable to inherit the existing premium Command Center shell, density, right rail, header/search area, card language, and sidebar behavior.

Fix: add `AS6OnePage` as a route-compatible page that renders inside the existing `ProtectedLayout` Command Center mode, reuse Command Center classes (`command-center-page`, `command-hero`, `quick-actions-primary`, `command-main-grid`, `command-core`, `command-right-rail`, `command-card`, `copilot-hero`) and add only scoped AS6 ONE refinements.

Scope constraints: `/crm`, `/crm-v2`, and `/command-center` page content remain untouched. The shared AppShell now treats `/as6-one`, `/crm-enterprise`, and `/crm-v3` as Command Center shell routes while keeping `/command-center` navigation unchanged.
