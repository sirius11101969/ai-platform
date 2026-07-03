# AS6 EPIC011 Application Foundation Rollback Strategy

ROLLBACK_STRATEGY=APPROVED

Rollback source:
- Restore to AS6_RESTORE_NEXT_MAJOR_EPIC_SELECTION_AFTER_EPIC010_20260703T022931Z if Planning must be reverted.
- Restore to AS6_RESTORE_WORKSPACE_EXPERIENCE_V1_20260703T021612Z if application-era selection must be reverted to Workspace Experience V1 baseline.

Rules:
- No secrets are included in rollback artifacts.
- No runtime evidence is normally staged.
- Rollback must preserve AS6 Operating System V1 and Workspace Experience V1 baselines.
