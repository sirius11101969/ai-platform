# AS6 EPIC-001 PR-7 Diagnostic

- AS6_BUSINESS_HOME_WIDGET_ORDER_DRIFT: guarded by numeric order normalization.
- AS6_BUSINESS_HOME_WIDGET_VISIBILITY_DRIFT: guarded by boolean visible normalization.
- AS6_BUSINESS_HOME_PINNED_WIDGET_DRIFT: guarded by boolean pinned normalization.
- AS6_BUSINESS_HOME_LAYOUT_RESTORE_GAP: guarded by known widget registry reconciliation.
- AS6_BUSINESS_HOME_LAYOUT_SCHEMA_MISMATCH: guarded by schemaVersion validation.
- AS6_BUSINESS_HOME_JSX_STRUCTURE_DRIFT: prevented by whole-component JSX replacement instead of partial string replacement.
- Layout is stored only in Workspace contextState.businessHome.
- Existing as6-workspace-persistence:v99 storage is reused.
- No new localStorage key is introduced.
