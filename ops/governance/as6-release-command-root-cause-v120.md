# AS6 Release Command Root Cause V120

Root cause: AS6 has validate, release gate, release evidence and evidence gate, but they still require manual sequencing.

Risk: operators can run only part of the release chain or skip evidence validation.

Repair: add ops/bin/as6-release as the canonical release command that runs validate, release gate, evidence generation and evidence gate in order.
