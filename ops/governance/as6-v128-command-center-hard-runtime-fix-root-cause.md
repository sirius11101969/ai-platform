# AS6 V128 Root Cause

V127 committed and deployed, but visible UI did not change.
Root cause: React-bundle/import based polish is not reliably applied to the final rendered Command Center state.
Repair: add a hard runtime script from frontend/public and load it directly from frontend/index.html so it executes independently of React chunks and CSS order.
