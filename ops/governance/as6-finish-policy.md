# AS6 Finish Policy

Любой AS6 патч считается незавершённым, если не выполнен:

ops/bin/as6-finish

Required sequence:
1. Update docs/AS6_HANDOFF.md.
2. Run diagnostics.
3. Stage changes.
4. Commit changes.
5. Push changes to GitHub.

New chat must start from:
- docs/AS6_HANDOFF.md
- docs/AS6_CODEX_PROMPT.md

Failure classes:
- HANDOFF_NOT_UPDATED_BEFORE_COMMIT
- PROJECT_STATE_NOT_SYNCHRONIZED
- GOVERNANCE_NOT_UPDATED
- COVERAGE_NOT_UPDATED
- FINISH_PIPELINE_BYPASSED
- CODEX_PROMPT_MISSING
