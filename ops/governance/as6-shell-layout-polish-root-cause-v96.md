# AS6 Shell Layout Polish Root Cause V96

Root cause: V93-V95 added Nav, Context Bar and Intelligence Rail into AS6Shell, but the Shell still needs a governed responsive composition layer so these surfaces remain visually coherent on desktop and mobile.

Risk: shell-level UI surfaces can stack inconsistently, overlap business content, or drift into page-specific layout fixes.

Repair: add explicit AS6Shell layout classes, responsive CSS and diagnostics for Nav + Context Bar + Intelligence Rail composition.
