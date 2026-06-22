
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

## 20260622T003632Z AEC real-visual-etalon-v134
- Visual repair must be validated against real production DOM selectors.
- Runtime JS visual injection remains forbidden.
- Source CSS lock is allowed only after DOM diagnostics identifies concrete selectors.

## 20260622T004134Z AEC copilot-etalon-v135
- AI Copilot visual fixes must be source CSS only.
- Runtime JS injection remains forbidden.

## 20260622T004822Z AEC bottom-neon-line-v136
- Bottom visual artifacts must be removed by source CSS only.
- Runtime JS visual injection remains forbidden.

## 20260622T010732Z AEC overlay-sources-v141
- Command Center must not mount global overlay/control-tower/mission layers.
- Overlay source components must stay no-op unless explicitly re-enabled through diagnostics.
