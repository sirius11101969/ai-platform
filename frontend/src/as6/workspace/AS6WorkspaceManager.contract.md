# AS6 Universal Workspace Manager Contract V98

Stage: AS6_UNIVERSAL_WORKSPACE_MANAGER_V98

Purpose:
- Provide shared workspace/session state for AS6Shell surfaces.
- Prevent duplicated workspace state in Navigation, Command Palette, Context Bar and Intelligence Rail.
- Prepare recent, pinned, history and restore behavior.

Exports:
- createEmptyWorkspaceState()
- getAS6WorkspaceState()
- setAS6ActiveWorkspace(pathname)
- getAS6ActiveWorkspace()
- getAS6RecentWorkspaces()
- getAS6PinnedWorkspaces()
- toggleAS6PinnedWorkspace(route)
- getAS6WorkspaceHistory()
- restoreAS6Workspace()
- validateAS6WorkspaceManagerPolicy()

Persistence:
- localStorage key: as6-workspace-manager:v98

Validation:
- AS6_UNIVERSAL_WORKSPACE_MANAGER_V98=PASS
