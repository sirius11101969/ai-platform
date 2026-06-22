
## 20260622T002129Z AEC COMMAND_CENTER_VISUAL_DRIFT_FROM_RUNTIME_STYLE_PATCHES
- Block blind CSS fixes for Command Center.
- Block runtime style injection outside React.
- Restore from visual etalon before adding new visual logic.

## 20260622T002731Z AEC command-center-etalon
- Block runtime style injection outside React.
- Block blind CSS patches.
- Block Docker build as mandatory step for visual-only repair when build layer has known infra failure.

## 20260622T003142Z AEC frontend-build-required
- Frontend visual repair is not complete until npm build succeeds.
- Production must be validated after nginx web root replacement.
