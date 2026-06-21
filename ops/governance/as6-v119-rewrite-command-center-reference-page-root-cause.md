# AS6 V119 Root Cause

Rollback to 155975f restored old Command Center overlays instead of the approved reference.
Root cause: the approved reference is not represented by 155975f; global Mission Control/Cockpit widgets and older sidebar badges are still mounted.
Repair: replace only frontend/src/pages/CommandCenterPage.jsx with a clean reference implementation and add an isolated CSS file that hides external overlay roots only while the reference Command Center is active.
