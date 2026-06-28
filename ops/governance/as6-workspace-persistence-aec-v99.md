# AS6 Workspace Persistence AEC V99

Failure classes:
- AS6_WORKSPACE_PERSISTENCE_DRIFT
- AS6_WORKSPACE_STORAGE_DUPLICATION_RISK
- AS6_WORKSPACE_EXPORT_IMPORT_GAP
- AS6_WORKSPACE_SESSION_MODEL_DRIFT
- AS6_WORKSPACE_MIGRATION_GAP

AEC rules:
- Workspace persistence must live in as6WorkspaceStorage.js.
- Workspace sessions must be versioned.
- Export/import must use the versioned Workspace Store.
- Shell surfaces must not duplicate workspace localStorage logic.
- Future migrations must pass through migrateAS6WorkspaceStore().
