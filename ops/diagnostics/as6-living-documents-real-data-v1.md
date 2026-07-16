# AS6 Living Documents Real Data v1

## Diagnostics
The workspace-isolated attachments endpoint existed, while the Living Documents experience required a real-data spatial composition and durable controls.

## Root Cause
Real attachment metrics, type nodes, recent activity and safe open actions were absent from the shared Living Space language. Two closure scripts were then blocked by shell quoting defects.

## Change
- normalize safe document URLs;
- render real workspace documents through LivingDocumentsSpace;
- derive metrics only from returned attachments;
- preserve loading, empty and error states;
- keep mutation actions disabled;
- validate safe read-only opening;
- add a syntax-validated prevention control.

## Repair closure
v3 removes nested quote ambiguity and the trailing quote parse defect, validates the generated control with bash -n, and completes registration and deployment.

## Failure classes
- AS6_DOCUMENT_SPACE_ENGINE_DATA_ADAPTER_GAP
- AS6_DOCUMENT_SPACE_REAL_DATA_RENDERING_GAP
- AS6_DOCUMENT_NODE_METRICS_PLACEHOLDER_GAP
- AS6_DOCUMENT_ACTIVITY_TIMELINE_DATA_GAP
- AS6_DOCUMENT_EMPTY_STATE_ENGINE_GAP
- AS6_DOCUMENT_ERROR_STATE_ENGINE_GAP
- AS6_DOCUMENT_READ_ONLY_ENGINE_CONTROL_GAP
- AS6_DOCUMENT_WORKSPACE_ISOLATION_ENGINE_GAP
- AS6_DOCUMENT_CONTROL_NESTED_QUOTE_SYNTAX_GAP
- AS6_MUTATION_PATTERN_SHELL_PARSING_FAILURE
- AS6_REPAIR_SCRIPT_TRAILING_QUOTE_SYNTAX_GAP
- AS6_VALID_DOCUMENT_CHANGE_BLOCKED_BY_SCRIPT_PARSE
