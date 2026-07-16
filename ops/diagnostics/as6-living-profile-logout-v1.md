# AS6 Living Profile Logout v1

## Diagnostics
Living Space displayed an authenticated avatar without a discoverable logout action.

## Root Cause
The profile control was visual-only. The v2 patch also leaked a template interpolation marker into the patch generator and stopped before applying the UI change.

## Change
- add accessible profile menu;
- show stored name and email;
- add settings and public-site actions;
- clear auth and workspace state on logout;
- redirect deterministically to /login;
- close by Escape and outside click;
- add reduced-motion and prevention control.

## Failure classes
- AS6_LIVING_LOGOUT_ACTION_MISSING
- AS6_PROFILE_MENU_INTERACTION_GAP
- AS6_AUTH_SESSION_TERMINATION_UI_GAP
- AS6_WORKSPACE_ID_REMAINS_AFTER_LOGOUT
- AS6_LOGOUT_ACCESSIBILITY_CONTROL_GAP
- AS6_PATCH_GENERATOR_TEMPLATE_INTERPOLATION_LEAK
- AS6_PROFILE_NAME_REFERENCE_EVALUATED_DURING_PATCH
- AS6_VALID_LOGOUT_UI_CHANGE_NOT_APPLIED
