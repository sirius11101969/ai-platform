# AS6 Workspace Persistence Contract V99

Stage: AS6_WORKSPACE_PERSISTENCE_MULTI_SESSION_ENGINE_V99

Purpose:
- Add versioned multi-session Workspace storage.
- Support create, save, switch, rename, clone, delete and pin operations.
- Support export/import JSON foundation.
- Prevent localStorage duplication across Shell surfaces.

Storage key:
- as6-workspace-persistence:v99

Workspace model:
- id
- title
- activeLivingSpace
- openedPanels
- filters
- commandHistory
- contextState
- intelligenceState
- pinned
- createdAt
- updatedAt
- version

Validation:
- AS6_WORKSPACE_PERSISTENCE_MULTI_SESSION_ENGINE_V99=PASS
