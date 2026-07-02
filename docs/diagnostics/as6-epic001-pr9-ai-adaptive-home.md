# AS6 EPIC-001 PR-9 Diagnostic

- AS6_BUSINESS_HOME_AI_RECOMMENDATION_DRIFT: recommendations are derived from live Business Home state.
- AS6_BUSINESS_HOME_AI_LAYOUT_APPLY_VALIDATION: layout changes only after explicit Apply action.
- AS6_BUSINESS_HOME_AI_RECOMMENDATION_SCHEMA_MISMATCH: suggestions use id, title, reason and action.
- AI never overrides user layout automatically.
- contextState.businessHome schema is unchanged.
- Workspace Storage V99 and debounce autosave are reused.
