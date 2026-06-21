# AS6 V115C Root Cause

V115B did not fully restore the classic Command Center because several floating diagnostic and control widgets are mounted as independent DOM roots outside #root.
These roots remain visible even when top health bar and cockpit are partially hidden.
Repair: replace fragile text matching with explicit root-id suppression only on /command-center.
