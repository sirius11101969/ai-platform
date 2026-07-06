# AS6 EPIC023 Architecture Reset Audit Coverage

Stage: AS6_EPIC023_ARCHITECTURE_RESET_AUDIT

Coverage:

- Current reality documented: docs/epic023/AS6_EPIC023_ARCHITECTURE_RESET_AUDIT.md
- Route map documented: PASS
- Shell map documented: PASS
- Workspace map documented: PASS
- CRM map documented: PASS
- Final target architecture documented: PASS
- Delete later list documented: PASS
- Do not delete list documented: PASS
- Root cause registered: AS6_PARALLEL_UI_ARCHITECTURE_DRIFT
- Failure classes registered: AS6_MULTIPLE_PRIMARY_SHELLS_GAP, AS6_MULTIPLE_CRM_ENTRYPOINTS_GAP, AS6_PRODUCTION_VISUAL_VALIDATION_GAP, AS6_ROUTE_OWNERSHIP_DRIFT
- Architecture rules registered: AS6_SINGLE_PRIMARY_SHELL_RULE, AS6_SINGLE_PUBLIC_CRM_ENTRYPOINT_RULE, AS6_PRODUCTION_VISUAL_VALIDATION_REQUIRED_RULE, AS6_NO_NEW_SHELL_WITHOUT_ARCHITECTURE_APPROVAL_RULE

Validated evidence:

- `frontend/src/App.jsx`
- `frontend/src/main.jsx`
- `frontend/src/as6/living-spaces/as6LivingSpaceRegistry.js`
- `frontend/src/as6/living-spaces/AS6LivingSpaceRoutes.jsx`
- `frontend/src/as6/shell/AS6Shell.jsx`
- `frontend/src/as6-crm/AS6CrmOneWorkspace.jsx`
- `frontend/src/as6-one/AS6OneShellAdapter.jsx`
- `frontend/src/as6-crm/AS6CrmShellAdapter.jsx`
- `frontend/src/as6-sales/AS6SalesShellAdapter.jsx`
- `frontend/src/pages/CRMPage.jsx`
- `frontend/src/pages/CRMWorkspacePage.jsx`
- `frontend/src/pages/LandingPage.jsx`
- `.github/workflows/deploy.yml`

Out of scope:

- No UI code edits.
- No route redirects implemented.
- No shell/workspace deletion.
- No CRM module deletion.

Result:

- AS6_EPIC023_ARCHITECTURE_RESET_AUDIT_COVERAGE=PASS
