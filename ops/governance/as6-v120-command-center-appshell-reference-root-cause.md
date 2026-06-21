# AS6 V120 Root Cause

V119 rewrote CommandCenterPage.jsx as a full-page shell, but /command-center is already rendered inside the global AppShell.
Root cause: V119 introduced an internal sidebar, creating a duplicate left navigation next to the existing AppShell sidebar.
Repair: rewrite CommandCenterPage.jsx as workspace content only. Keep the existing AppShell sidebar and render only the approved Command Center dashboard content.
