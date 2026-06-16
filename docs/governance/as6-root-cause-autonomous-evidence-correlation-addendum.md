# AS6 Root Cause Addendum: Autonomous Evidence Correlation

## EVIDENCE_CORRELATION_MISSING
Severity: high
Symptoms: controller evidence exists but is not correlated.
Verification: run evidence correlation controller.
Fix: generate evidence matrix.
Rollback: block evidence promotion.
Prevention: enforce AEC_EVIDENCE_CORRELATION_REQUIRED.

## EVIDENCE_MATRIX_MISSING
Severity: high
Symptoms: no evidence matrix exists.
Verification: check runtime/evidence-correlation/evidence-correlation-matrix.tsv.
Fix: run evidence correlation controller.
Rollback: block autonomous promotion.
Prevention: enforce AEC_EVIDENCE_MATRIX_REQUIRED.

## EVIDENCE_RESULT_MARKER_MISSING
Severity: medium
Symptoms: evidence artifact lacks result marker.
Verification: inspect evidence matrix.
Fix: add result marker to controller output.
Rollback: treat evidence as weak.
Prevention: enforce AEC_EVIDENCE_RESULT_MARKER_REQUIRED.

## EVIDENCE_ORPHAN_ARTIFACT
Severity: medium
Symptoms: runtime evidence is not linked to governance or diagnostics.
Verification: run orphan evidence scan.
Fix: register or clean up evidence artifact.
Rollback: do not use orphan evidence for promotion.
Prevention: enforce AEC_EVIDENCE_ORPHAN_SCAN_REQUIRED.
