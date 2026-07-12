#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

required=(
  "architecture/README.md"
  "architecture/constitution/invariants.yaml"
  "architecture/master-screen/locked-components.yaml"
  "architecture/spaces/registry.yaml"
  "architecture/governance/quality-gates.yaml"
  "architecture/registry/objects.yaml"
  "docs/architecture/10_AS6_MASTER_SCREEN_STANDARD_V1.md"
  "docs/AS6_LIVING_SPACE_RULES.md"
  "docs/architecture/09_AS6_CORE_SPECIFICATION.md"
  "ops/governance/as6-master-screen-freeze-v1.md"
)

for rel in "${required[@]}"; do
  test -f "$ROOT/$rel" || { echo "AS6_ARCHITECTURE_MISSING_FILE=$rel"; exit 1; }
done

for id in INV-001 INV-002 INV-003 INV-004 INV-005 INV-006 INV-007 INV-008 INV-009 INV-010 INV-011; do
  grep -q "id: $id" "$ROOT/architecture/constitution/invariants.yaml" || {
    echo "AS6_ARCHITECTURE_MISSING_INVARIANT=$id"; exit 1;
  }
done

space_count="$(grep -c '^  - id: SPACE-' "$ROOT/architecture/spaces/registry.yaml")"
test "$space_count" -eq 12 || {
  echo "AS6_ARCHITECTURE_SPACE_COUNT_DRIFT=$space_count"; exit 1;
}

grep -q 'visible_enclosing_frame: false' "$ROOT/architecture/master-screen/locked-components.yaml" || {
  echo 'AS6_MASTER_SCREEN_INPUT_FRAME_POLICY=FAIL'; exit 1;
}
grep -q 'visible_character_height_px: 18' "$ROOT/architecture/master-screen/locked-components.yaml" || {
  echo 'AS6_MASTER_SCREEN_STATE_METRIC_POLICY=FAIL'; exit 1;
}
grep -q 'sha256: 5e393d23789e21e2f5773521c8e0f2212fa78155a227f063ea90b4f206e422bc' "$ROOT/architecture/master-screen/locked-components.yaml" || {
  echo 'AS6_MASTER_SCREEN_CHECKSUM_REGISTRY=FAIL'; exit 1;
}

for gate in GATE-ARCHITECTURE GATE-MASTER-SCREEN GATE-SPACE GATE-INTENT GATE-KNOWLEDGE GATE-DOMAIN GATE-DIAGNOSTICS GATE-VALIDATION; do
  grep -q "id: $gate" "$ROOT/architecture/governance/quality-gates.yaml" || {
    echo "AS6_ARCHITECTURE_MISSING_GATE=$gate"; exit 1;
  }
done

echo 'AS6_ARCHITECTURE_REPOSITORY=PASS'
echo 'AS6_ARCHITECTURE_INVARIANTS=PASS'
echo 'AS6_LIVING_SPACE_REGISTRY=PASS'
echo 'AS6_MASTER_SCREEN_LOCKED_COMPONENTS=PASS'
echo 'AS6_ARCHITECTURE_QUALITY_GATES=PASS'
echo 'AS6_ARCHITECTURE_REPOSITORY_READINESS=100%'
