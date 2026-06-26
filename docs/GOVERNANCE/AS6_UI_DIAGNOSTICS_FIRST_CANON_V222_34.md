# AS6 UI Diagnostics First Canon V222.34

Status: PASS
Readiness: 100% for V221 scope; V222.34 completed

## Mandatory Rule

Before any AS6 interface change, run full interface diagnostics first.

## Required Diagnostics Before UI Change

- Git HEAD and clean worktree check before runtime artifact creation.
- Route ownership check.
- Component ownership check.
- Full text search for visible UI strings.
- Full DOM marker search in source.
- CSS import graph check.
- CSS source-to-dist verification.
- Inline style and wrapper slot verification.
- Frontend build artifact verification.
- Docker nginx deployment target verification.
- Public HTTPS asset marker verification.
- Saved HTML/DOM evidence check.
- Screenshot visual comparison check.
- Registry, coverage, governance, state and detected-errors update.

## Registered Failure Classes

- UI_CHANGE_WITHOUT_FULL_DIAGNOSTIC_GATE
- COMPONENT_OWNERSHIP_NOT_PROVEN
- CSS_SOURCE_NOT_IMPORTED
- CSS_PATCH_NOT_IN_DIST
- WRAPPER_SLOT_NOT_CONTROLLED
- PUBLIC_BUNDLE_MISMATCH
- VISUAL_CHANGE_WITHOUT_DOM_PROOF
- DEPLOY_TARGET_MISMATCH
- BROWSER_CACHE_FALSE_NEGATIVE
- SELF_GENERATED_RUNTIME_DIRTY_TREE_CHECK
- CSS_EXPERIMENT_TAILS_LEFT_IN_WORKTREE

## AEC Rules

- Never change UI before proving the active rendered component.
- Never edit CSS before proving it is imported and present in dist.
- Never judge UI only by screenshot; verify DOM and public bundle marker.
- Runtime artifacts must be created after clean worktree check or excluded from that check.
- Every UI cycle must explicitly report what was added to diagnostics and GitHub.
