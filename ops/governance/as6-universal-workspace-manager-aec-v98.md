# AS6 Universal Workspace Manager AEC V98

Failure classes:
- AS6_WORKSPACE_MANAGER_DRIFT
- AS6_WORKSPACE_STATE_DUPLICATION_RISK
- AS6_WORKSPACE_SESSION_RESTORE_GAP
- AS6_WORKSPACE_HISTORY_GAP
- AS6_WORKSPACE_PINNING_GAP

AEC rules:
- Workspace state must be centralized in AS6WorkspaceManager.
- Recent workspace logic must not be duplicated in Shell components.
- Pinned workspace logic must not be duplicated in Navigation or Command Palette.
- Session restore must use AS6WorkspaceManager.
- Workspace history must use AS6WorkspaceManager.
