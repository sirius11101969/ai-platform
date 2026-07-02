# AS6 EPIC-001 PR-8 Diagnostic

- AS6_BUSINESS_HOME_DRAG_DROP_STATE_DRIFT: drag state is local UI state only.
- AS6_BUSINESS_HOME_DROP_TARGET_VALIDATION: drop ignores empty, same or missing targets.
- AS6_BUSINESS_HOME_WIDGET_ORDER_PERSISTENCE_GAP: drop updates only widget order through existing updateBusinessHomeLayout.
- contextState.businessHome schema is unchanged.
- Workspace Storage V99 and debounce autosave are reused.
- No new localStorage key is introduced.
