# AS6 Vite Config Syntax Repair Root Cause

- Previous automatic regex patch partially replaced manualChunks and left orphan if statements outside the function body.
- Effect: Vite config became invalid JavaScript.
- Resolution: rewrite frontend/vite.config.js to a clean, explicit, stable config.
- Interface changed: none.
- Pages changed: none.
