# AS6 Release Snapshot Gate Root Cause V122

Root cause: V121 created immutable release snapshots, but the snapshot itself was not validated as a release-readiness artifact.

Risk: invalid JSON, missing evidence references, or missing PASS markers could be committed as a release snapshot.

Repair: add AS6 Release Snapshot Gate to validate snapshot schema, PASS markers and evidence file existence.
