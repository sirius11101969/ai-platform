# AS6 Design System

Use this skill for UI and CRM visual migration.

Rules:
- new UI must use AS6 Design System;
- do not introduce duplicate UI primitives;
- preserve existing business logic;
- preserve legacy panels during migration;
- migrate one CRM module per cycle;
- validate visual adoption with build and guardian;
- if adoption is documentation-only, register a diagnostic gap and repair it.

Required checks:
- Design System imports exist;
- real component usage exists;
- legacy rollback path exists;
- no business logic drift;
- runtime/** is not committed.
