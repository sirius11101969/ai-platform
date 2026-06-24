# AS6 Design System Foundation AEC V220

## Status
AEC_DESIGN_SYSTEM_FOUNDATION_V220=REGISTERED

## Root Cause
DESIGN_SYSTEM_FOUNDATION_DRIFT

## Failure Class
AS6_FAILURE_CLASS_DESIGN_SYSTEM_FOUNDATION_DRIFT

## Rule
All new AS6 UI screens must reuse the governed V220 foundation layer before adding page-specific visual rules.

## Prevention Controls
- Keep `frontend/src/styles/as6-design-system-foundation-v220.css` imported from `frontend/src/App.jsx`.
- Keep runtime evidence through `frontend/src/utils/as6RuntimeTracer.js`.
- Validate card, button, readable width, mobile and guidance contracts through `ops/bin/as6-diagnose-design-system-foundation-v220`.

## Human UX Contract
Every screen must help the user quickly understand what is happening, what is important and what to do next.
