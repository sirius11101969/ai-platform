# AS6 Agent Task

Source issue: #330
Agent: frontend

## Task

Issue #330: AS6 V209 handoff docs and finish policy

Create AS6 repository-backed handoff and finish automation.

Required files:
- docs/AS6_HANDOFF.md
- docs/AS6_CODEX_PROMPT.md
- ops/bin/as6-update-handoff
- ops/bin/as6-finish
- ops/governance/as6-finish-policy.md
- ops/bin/as6-diagnose-handoff-finish-policy-v209

Rule to enforce:
Any AS6 patch is incomplete until ops/bin/as6-finish is executed.

Required behavior:
- as6-update-handoff updates docs/AS6_HANDOFF.md with current timestamp, branch, commit, project status, and new-chat instruction.
- as6-finish runs as6-update-handoff, stages changes, commits, and pushes.
- update diagnostic registry, coverage registry, project state, and detected errors.

Register failure classes:
- HANDOFF_NOT_UPDATED_BEFORE_COMMIT
- PROJECT_STATE_NOT_SYNCHRONIZED
- GOVERNANCE_NOT_UPDATED
- COVERAGE_NOT_UPDATED
- FINISH_PIPELINE_BYPASSED
- CODEX_PROMPT_MISSING

Register AEC rules:
- AEC-HANDOFF-001: every AS6 patch must update docs/AS6_HANDOFF.md
- AEC-HANDOFF-002: AS6 patches must finish through ops/bin/as6-finish
- AEC-HANDOFF-003: new chat and Codex sessions must start from docs/AS6_HANDOFF.md and docs/AS6_CODEX_PROMPT.md

Validation:
- run ops/bin/as6-diagnose-handoff-finish-policy-v209
- run ops/bin/as6-update-handoff
- commit and push via ops/bin/as6-finish

AS6 rules:
- Work through PR only.
- Do not mutate production.
- Do not expose secrets.
- Follow diagnostics-first workflow.
- If a recurring issue is found, recommend or add a diagnostic.

## AS6 Rules

- PR only
- No production mutation without diagnostics
- No secret exposure
- Diagnostics-first workflow
- Add recurring checks to diagnostics