# AS6 V121 Root Cause

V119/V120 did not fully match the approved reference because the page-level CSS could not reliably suppress independent body-level overlay roots.
Actual HTML shows external root siblings outside #root: as6-global-health-bar-root, as6-mission-control-layout-engine-root, as6-ai-copilot-rail-root, live data widgets and command palette.
Root cause: these overlays are not children of CommandCenterPage.jsx, so component CSS alone is not enough.
Repair: keep CommandCenterPage as AppShell workspace content only and add mount/unmount inline suppression for exact external root IDs while /command-center is active.
