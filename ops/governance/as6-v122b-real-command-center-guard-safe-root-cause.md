# AS6 V122B Root Cause

V122 stopped because sed tried to inject JSX with an unsafe delimiter expression.
Root cause: JSX injection into CommandCenterPage.jsx is fragile and caused command failure before build/deploy.
Deeper UI root cause: Command Center content should be restored from the real page source, while body-level AS6 overlay roots must be hidden separately.
Repair: restore CommandCenterPage.jsx from reference commit 155975f and add a side-effect route-aware guard imported from main.jsx. No JSX injection.
