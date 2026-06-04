# AS6 Agent Task

Source issue: #274
Agent: frontend

## Task

Issue #274: [frontend] AI Workforce v5 final E2E test

Final AI Workforce v5 chain test.

Expected flow:

Issue
→ Router
→ PR Factory
→ Draft PR
→ Issue comment

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