# AS6 Agent Task

Source issue: #361
Agent: frontend

## Task

Issue #361: AS6 workflow preference: repository changes via executable command or Codex agent

## AS6 workflow preference

User preference to apply for future AS6 work:

- Repository changes should be delivered as an executable command/script patch or via a Codex/GitHub agent workflow.
- For AS6 requests such as “делай”, the expected output is a complete one-command/script cycle whenever possible.
- The command/script should cover the full AS6 Diagnostics First sequence:
  - Diagnostics
  - Root Cause
  - Structure check
  - Change plan
  - Change
  - Re-diagnostics
  - Diagnostic artifacts
  - Checks
  - Controls
  - Failure classes
  - AEC rules
  - Diagnostic Registry
  - Coverage Registry
  - Governance
  - Project State
  - Validation
  - frontend build
  - secret scan
  - commit
  - push
  - restore tag
  - final markers
- Completion must be confirmed only after locating and reviewing the final execution log.
- Required final markers include:
  - AS6_DONE
  - PROJECT_READINESS
  - CURRENT_COMMIT
  - RESTORE_TAG
  - frontend build=PASS or equivalent build proof
  - SECRET_SCAN_RESULT=OK
  - Commit=PASS
  - Push=PASS

This issue records the working preference so it is visible in GitHub alongside project governance.

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