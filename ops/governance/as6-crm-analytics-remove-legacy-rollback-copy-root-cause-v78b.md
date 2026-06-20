# AS6 V78B Root Cause

V78 did not fail on production or build.
V78 failed because the markdown URL detector matched the diagnostic script itself.
Repair: rewrite diagnostic to avoid self-match and scan only target source/governance/state files safely.
