# AS6 V123C Root Cause

V123B failed because git add referenced governance files that did not exist.
Root cause: cleanup scripts used explicit pathspecs for optional/missing files.
Repair: use hardened cleanup and final git add -A only, so missing optional files cannot stop the cycle.
Remaining UI drift versus reference: legacy sidebar badges, logo frame, action strip background, extra Copilot/card outlines and residual bottom/right visual noise.
