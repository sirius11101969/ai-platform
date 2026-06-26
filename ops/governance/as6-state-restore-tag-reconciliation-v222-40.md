# AS6 V222_40 Governance — State Restore Tag Reconciliation

- Failure class: MARKDOWN_STATE_RESTORE_TAG_DRIFT
- Root cause: markdown_state_lagged_behind_restore_tag
- AEC rule: restore tag must be resolved from git tags at HEAD, not copied from memory.
- Prevention: every continuation must compare docs stage against HEAD restore tag.
- Rollback: restore docs from runtime/as6-v222-40/*.before.md and reset commit if validation fails.
- Readiness: 99%.
