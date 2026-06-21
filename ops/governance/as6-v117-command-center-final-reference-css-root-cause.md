# AS6 V117 Command Center Final Reference CSS Root Cause

Previous fixes reached production, but the visual result still did not match the approved reference.
Root cause: fixes were bundled before or together with main app styles and did not reliably become the final browser-applied CSS layer.
Repair: add a public final reference CSS file loaded from index.html after app bundle CSS, then additionally inject the same link into built dist/index.html before deploy.
