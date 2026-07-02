# AS6 EPIC-009 Rollback Strategy

ROLLBACK_STRATEGY=APPROVED

## Strategy

- Use restore tags for every implementation slice.
- Keep Executive Intelligence v1 baseline immutable.
- Keep Reference Meta-Model unchanged unless separate ADR approves change.
- Roll back OS shell changes independently from Executive Intelligence modules.
- Do not mix CRM migration with OS foundation rollback.
