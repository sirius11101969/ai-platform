# AS6 Autonomous Knowledge Base Diagnostics

Registered diagnostic artifact:

- ops/bin/as6-autonomous-knowledge-base-controller

New diagnostic checks added:

- knowledge_base_controller
- canonical_knowledge_files_presence
- diagnostic_registry_presence
- coverage_registry_presence
- aec_registry_presence
- diagnostics_docs_directory_presence
- coverage_docs_directory_presence
- governance_docs_directory_presence
- l7_controller_presence
- l7_controller_registry_alignment
- root_cause_knowledge_base_gate
- root_cause_governance_gate
- root_cause_router_gate
- diagnostic_doc_linkage_check
- coverage_doc_contract_check
- aec_registration_consistency
- state_freshness_l7_phase_check
- evidence_directory_check
- knowledge_base_secret_scan_gate

New error classes added:

- KNOWLEDGE_BASE_CONTROLLER_EVIDENCE_MISSING
- KNOWLEDGE_BASE_REGISTRY_DRIFT
- KNOWLEDGE_BASE_COVERAGE_DRIFT
- KNOWLEDGE_BASE_AEC_DRIFT
- KNOWLEDGE_BASE_GOVERNANCE_DRIFT
- KNOWLEDGE_BASE_STATE_DRIFT
- KNOWLEDGE_BASE_ORPHAN_DIAGNOSTIC
- KNOWLEDGE_BASE_ORPHAN_COVERAGE
- KNOWLEDGE_BASE_ORPHAN_AEC_RULE
- KNOWLEDGE_BASE_L7_CONTROLLER_UNREGISTERED

New AEC rules added:

- AEC_KNOWLEDGE_BASE_REQUIRES_EVIDENCE
- AEC_KNOWLEDGE_BASE_REQUIRES_REGISTRY_ALIGNMENT
- AEC_KNOWLEDGE_BASE_REQUIRES_COVERAGE_ALIGNMENT
- AEC_KNOWLEDGE_BASE_REQUIRES_AEC_ALIGNMENT
- AEC_KNOWLEDGE_BASE_REQUIRES_STATE_FRESHNESS
