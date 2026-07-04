# AS6 EPIC016 JSX Node Check Repair Governance

GOVERNANCE=AS6_EPIC016_CRM_FOLLOWUPS_UI_WIRING_JSX_NODE_CHECK_REPAIR
STATUS=ACTIVE

Rules:
- Do not run node --check directly on .jsx files.
- Validate JSX through the frontend build pipeline.
- Register unsupported validation-tool usage as a diagnostics gap.
