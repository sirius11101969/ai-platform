# AS6 Autonomous Evidence Correlation Diagnostics

Registered diagnostic artifact:

- ops/bin/as6-autonomous-evidence-correlation-controller

New diagnostic checks added:

- evidence_correlation_controller
- evidence_directory_presence_check
- evidence_live_gate_capture
- evidence_matrix_generation
- evidence_result_marker_check
- evidence_pointer_check
- expected_evidence_contract_check
- orphan_evidence_scan
- evidence_summary_generation
- evidence_secret_scan_gate

New error classes added:

- EVIDENCE_CORRELATION_MISSING
- EVIDENCE_MATRIX_MISSING
- EVIDENCE_RESULT_MARKER_MISSING
- EVIDENCE_POINTER_MISSING
- EVIDENCE_CONTRACT_DRIFT
- EVIDENCE_ORPHAN_ARTIFACT
- EVIDENCE_BUNDLE_INCOMPLETE
- EVIDENCE_SUMMARY_MISSING
- EVIDENCE_SECRET_SCAN_FAILED
- EVIDENCE_RUNTIME_DRIFT

New AEC rules added:

- AEC_EVIDENCE_CORRELATION_REQUIRED
- AEC_EVIDENCE_MATRIX_REQUIRED
- AEC_EVIDENCE_RESULT_MARKER_REQUIRED
- AEC_EVIDENCE_POINTER_REQUIRED
- AEC_EVIDENCE_ORPHAN_SCAN_REQUIRED
- AEC_EVIDENCE_SECRET_SCAN_REQUIRED
