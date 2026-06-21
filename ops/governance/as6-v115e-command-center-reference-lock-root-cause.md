# AS6 V115E Root Cause

V115D removed most overlay drift, but Command Center still needs exact reference-layout locking.
Root cause: Command Center visual shell is correct, but global sizing, spacing, root sibling overlays and optional lower recommendation blocks can still make the page differ from the approved reference screenshot.
Repair: add a final reference lock CSS layer only for /command-center to match the approved classic AS6 Command Center layout.
