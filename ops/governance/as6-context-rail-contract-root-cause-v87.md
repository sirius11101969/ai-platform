# AS6 Context Bar + Intelligence Rail Contract Root Cause V87

Root cause: /as6-one is now wired through AS6Shell, but adaptive shell zones need an explicit contract before CRM is moved into the future Living Space /as6-sales.

Risk: without a shell-zone contract, each Living Space can implement its own context/rail behavior, causing UI drift and business-logic coupling.

Repair: register a shell-level Context Bar and Intelligence Rail contract, validate adapter usage, and add prevention controls before /as6-sales migration.
