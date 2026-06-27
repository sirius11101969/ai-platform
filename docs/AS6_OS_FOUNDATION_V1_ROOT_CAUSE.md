# AS6 OS Foundation V1 Root Cause

- AS6 already has Workspace and CRM migration route, but OS-level reusable shell is not yet separated as a canonical platform layer.
- Risk: CRM, Revenue, Dashboard and AI modules may continue to duplicate shell, assistant, right rail and action center patterns.
- Resolution: introduce AS6 OS Foundation V1 with dedicated OS shell, Today layer, Action Center, Revenue Brain, Right Rail and Module Host.
- Rule: CRM becomes one module inside AS6 OS, not the center of the product.
