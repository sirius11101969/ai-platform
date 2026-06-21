# AS6 V118 Root Cause

Previous V115-V117 fixes changed CSS layers but did not restore the approved reference layout.
Root cause: the approved Command Center layout must be restored from the known-good source state, not approximated through overlay CSS patches.
Verified: production deploy was successful and health OK, so the remaining issue is source/layout drift, not cache or deployment.
Repair: restore CommandCenterPage.jsx from reference commit 155975f and remove all temporary command-center CSS/JS patch layers.
