# AS6 EPIC016 CRM Followups Workspace Integration Governance

GOVERNANCE=AS6_EPIC016_CRM_FOLLOWUPS_WORKSPACE_INTEGRATION
STATUS=ACTIVE

Rules:
- CRM Followups must integrate through the existing AS6 Workspace foundation.
- No separate Followups shell, router or store may be created.
- UI wiring must depend on a reusable Workspace adapter.
- Workspace runtime must emit traceable runtime events.
- Final logs must not be mutated after commit; final evidence is emitted before commit in this cycle.
