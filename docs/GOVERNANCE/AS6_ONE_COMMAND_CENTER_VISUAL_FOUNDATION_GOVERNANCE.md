# AS6 ONE Command Center Visual Foundation Governance

## Rule
AS6 ONE must reuse Command Center visual foundation before CRM cutover.

## Guardrail
Do not create a separate AS6 ONE dashboard shell, sidebar, header, right rail, grid, card system, or visual language when an equivalent Command Center primitive exists.

## Required validation
- `/command-center` remains available and visually unchanged.
- `/as6-one` renders through the Command Center AppShell mode.
- `/crm-enterprise` and `/crm-v3` remain available as AS6 ONE aliases.
- `/crm` and `/crm-v2` are not changed by this cutover.
