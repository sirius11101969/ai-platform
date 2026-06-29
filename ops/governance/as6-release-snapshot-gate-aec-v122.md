# AS6 Release Snapshot Gate AEC V122

Failure classes:
- AS6_RELEASE_SNAPSHOT_GATE_DRIFT
- AS6_RELEASE_SNAPSHOT_JSON_INVALID
- AS6_RELEASE_SNAPSHOT_EVIDENCE_MISSING
- AS6_RELEASE_SNAPSHOT_PASS_MARKER_INVALID
- AS6_RELEASE_SNAPSHOT_SCHEMA_GAP

AEC rules:
- Release snapshots must be valid JSON.
- Release snapshots must include required release fields.
- Release snapshots must reference an existing evidence file.
- Release snapshots must include validate/release_gate/release PASS markers.
