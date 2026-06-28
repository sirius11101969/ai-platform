# AS6 Legacy V87 Diagnostic Root Cause V91E

Root cause: V87 diagnostic correctly required /as6-one adapter evidence, but after V91 registry-driven routing it still looked for AS6OneShellAdapter directly in App.jsx/main files.

Risk: legacy diagnostics can force manual route references back into App.jsx and block registry-driven route rendering.

Repair: update V87 diagnostic to accept AS6LivingSpaceRoutes as route evidence and validate adapter zone modes through AS6OneShellAdapter plus registry metadata.
