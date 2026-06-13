# AS6 Autonomous Engineering Constitution

Version: 1.0
Short prompt identifier: AS6 MODE

## Purpose

Canonical standard for ChatGPT -> GitHub -> Codex -> AI Platform -> Production.

## AS6 MODE Prompt

AS6 MODE

Diagnostics First.
Root Cause First.
Backup Before Change.
Every Incident Becomes Diagnostic.
Coverage + Registry Mandatory.
Production Validation Mandatory.
Git Clean Before Commit.
Codex Review Before Merge.
Diagnostics Show Only Real Problems.
Maximum Automation.
Minimum Manual Work.
Always write correct heredoc in code so scripts never hang.

## Mandatory Workflow

PRE_INSPECTION -> DIAGNOSTICS -> FACT_CONFIRMATION -> ROOT_CAUSE -> BACKUP -> STRUCTURE_REVIEW -> FIX -> POST_FIX_DIAGNOSTICS -> PRODUCTION_VALIDATION -> RESULT_CONFIRMATION -> COVERAGE_UPDATE -> REGISTRY_UPDATE -> ERROR_TO_DIAGNOSTICS -> AUTO_DETECTION -> AUTO_REMEDIATION -> ARTIFACT_CAPTURE -> GIT_CLEAN -> COMMIT -> PR -> CODEX_REVIEW -> GUARDIAN_REVIEW -> MERGE -> POST_MERGE_VALIDATION -> KNOWLEDGE_CAPTURE

## Mandatory Gates

AS6_PRE_INSPECTION=PASS
AS6_DIAGNOSTICS=PASS
AS6_FACT_CONFIRMATION=PASS
AS6_ROOT_CAUSE_CONFIRMED=PASS
AS6_ROLLBACK_READY=PASS
AS6_ARCHITECTURE_VALIDATED=PASS
AS6_POST_FIX_DIAGNOSTICS=PASS
AS6_PRODUCTION_VALIDATED=PASS
AS6_FIX_CONFIRMED=PASS
AS6_COVERAGE_UPDATED=PASS
AS6_REGISTRY_UPDATED=PASS
AS6_ERROR_ADDED_TO_DIAGNOSTICS=PASS
AS6_AUTO_DETECTION_ENABLED=PASS
AS6_ARTIFACTS_CAPTURED=PASS
AS6_GIT_CLEAN=PASS
AS6_PR_ALLOWED=PASS
AS6_CODEX_REVIEW=PASS
AS6_GUARDIAN_REVIEW=PASS
AS6_MERGE_ALLOWED=PASS
AS6_POST_MERGE_VALIDATED=PASS
AS6_HEREDOC_SAFETY=PASS

## Heredoc Safety Rule

Always write correct heredoc in code so scripts never hang. Unsafe heredoc is a product defect.

## Zero Trust Rules

No assumptions. No guessing. No fix before diagnostics. No merge before validation. Diagnostics are the source of truth.

## Incident Rule

Every incident must become a diagnostic.

## Diagnostic Quality Rule

Diagnostics must show only real problems. False positives must be fixed.
\n## Executable Heredoc Safety Gate\n\nHeredoc safety is enforced by diagnostics. Required signals: AS6_HEREDOC_SAFETY=PASS, AS6_HEREDOC_REAL_SCAN=PASS, AS6_HEREDOC_SHORT_MARKER_POLICY=PASS. Short generic heredoc markers are forbidden unless explicitly documented as known-safe.\n\n## Diagnostic Self-Match Rule\n\nDiagnostics must not fail by matching their own source code. Required signal: AS6_FALSE_POSITIVE_SUPPRESSION=PASS.\n\nDetected classes: DIAGNOSTIC_SELF_MATCH, DIAGNOSTIC_SELF_REFERENCE.\n
## AS6 Safe Code Generation Rule

Generated commands must be terminal-safe, short, validated, and reproducible.

Forbidden:
- unfinished heredoc blocks;
- multiline python -c patches;
- giant base64 one-line patches;
- oversized single-line commands;
- patches that depend on fragile browser copy-paste.

Required signals:

```text
AS6_CODE_GENERATION_SAFETY=PASS
AS6_COMMAND_LENGTH_SAFETY=PASS
AS6_NO_GIANT_BASE64_PATCH=PASS
AS6_NO_UNFINISHED_HEREDOC=PASS
AS6_NEW_ARTIFACTS_DIAGNOSTICALLY_REGISTERED=PASS
AS6_NEW_CONTROLS_DIAGNOSTICALLY_REGISTERED=PASS
AS6_NEW_ERROR_CLASSES_DIAGNOSTICALLY_REGISTERED=PASS
AS6_AEC_RULES_EXECUTABLE=PASS
```

## AS6 Patch Mode Rule

All generated changes must use AS6 Patch Mode.

Required priority:

1. File-based patch or script.
2. One external quoted heredoc only when needed.
3. No nested heredoc patches.
4. No giant base64 one-line patches.
5. No long multiline python -c patches.
6. bash -n before execution.
7. diagnostics before and after change.
8. coverage and registry refresh after new diagnostics.

Required signals:

```text
AS6_PATCH_MODE=PASS
AS6_NO_NESTED_HEREDOC_PATCH=PASS
AS6_COMMAND_LENGTH_SAFETY=PASS
AS6_NO_GIANT_BASE64_PATCH=PASS
AS6_CODE_GENERATION_SAFETY=PASS
AS6_AEC_RULES_EXECUTABLE=PASS
```

Root cause classes:

```text
NESTED_HEREDOC_PATCH
OVERSIZED_SINGLE_LINE_PATCH
GIANT_BASE64_PATCH
COPY_PASTE_CORRUPTED_PATCH
UNFINISHED_HEREDOC_BLOCK
```

## AS6 Root Cause Knowledge Base Rule

Every ROOT_CAUSE_CLASS must have a catalog entry with severity, symptoms, verification, fix, rollback, and prevention.

Required signals:

```text
AS6_ROOT_CAUSE_KNOWLEDGE_BASE=PASS
AS6_ROOT_CAUSE_CATALOG_EXISTS=PASS
AS6_ROOT_CAUSE_HAS_SEVERITY=PASS
AS6_ROOT_CAUSE_HAS_SYMPTOMS=PASS
AS6_ROOT_CAUSE_HAS_VERIFICATION=PASS
AS6_ROOT_CAUSE_HAS_FIX=PASS
AS6_ROOT_CAUSE_HAS_ROLLBACK=PASS
AS6_ROOT_CAUSE_HAS_PREVENTION=PASS
```

Controls:

```text
root_cause_knowledge_base
mandatory_fix_definition
mandatory_rollback_definition
mandatory_prevention_definition
mandatory_verification_definition
```

## AS6 Reference Source Suppression Rule

Diagnostics must distinguish executable evidence from reference sources such as governance catalogs, knowledge bases, and policy documents.

Required signals:

```text
AS6_REFERENCE_SOURCE_SUPPRESSION=PASS
AS6_KNOWLEDGE_BASE_REFERENCE_EXCLUSION=PASS
```

Controls:

```text
knowledge_base_reference_exclusion
patch_mode_reference_source_suppression
```

Root cause classes:

```text
KNOWLEDGE_BASE_REFERENCE_FALSE_POSITIVE
```

## AS6 Root Cause Governance Rule

Every root cause must be governed by diagnostics, coverage, registry, prevention, and rollback controls.

Required signals:

```text
AS6_ROOT_CAUSE_GOVERNANCE=PASS
AS6_ROOT_CAUSE_DIAGNOSTIC=PASS
AS6_ROOT_CAUSE_COVERAGE=PASS
AS6_ROOT_CAUSE_REGISTRY=PASS
AS6_ROOT_CAUSE_PREVENTION=PASS
AS6_ROOT_CAUSE_ROLLBACK=PASS
```

Controls:

```text
root_cause_governance
root_cause_diagnostic_registration
root_cause_coverage_registration
root_cause_registry_registration
root_cause_prevention_required
root_cause_rollback_required
```

Root cause governance error classes:

```text
ROOT_CAUSE_WITHOUT_DIAGNOSTIC
ROOT_CAUSE_WITHOUT_COVERAGE
ROOT_CAUSE_WITHOUT_REGISTRY
ROOT_CAUSE_WITHOUT_PREVENTION
ROOT_CAUSE_WITHOUT_ROLLBACK
```

## AS6 Diagnostic Contract Layer Rule

Governance artifacts must be read through diagnostic contracts, not ad-hoc grep commands.

Required signals:

```text
AS6_DIAGNOSTIC_CONTRACT=PASS
AS6_REGISTRY_CONTRACT=PASS
AS6_REGISTRY_CONTRACT_COUNT=PASS
AS6_NO_AD_HOC_REGISTRY_GREP=PASS
```

Controls:

```text
diagnostic_contract_validation
registry_contract_count
no_ad_hoc_registry_grep
schema_aware_metric_queries
```

Root cause classes:

```text
REGISTRY_METRIC_QUERY_DRIFT
REGISTRY_SCHEMA_DRIFT
METRIC_QUERY_DRIFT
```

AS6_NO_RUNTIME_HEREDOC_IN_GENERATED_DIAGNOSTICS=PASS

## AS6 Root Cause Routing, Remediation and Validation Rule

Every root cause must be routable to a diagnostic, remediation plan, rollback plan, prevention controls and validation plan.

Required signals:

```text
AS6_ROOT_CAUSE_ROUTER=PASS
AS6_ROOT_CAUSE_REMEDIATION=PASS
AS6_ROOT_CAUSE_VALIDATION=PASS
AS6_ROOT_CAUSE_ROUTE_COUNT=PASS
AS6_ROOT_CAUSE_REMEDIATION_PLAN=PASS
AS6_ROOT_CAUSE_VALIDATION_PLAN=PASS
```

Controls:

```text
root_cause_router
root_cause_remediation_required
root_cause_validation_required
mandatory_route_for_root_cause
post_fix_validation_gate
route_count_matches_catalog
```

Root cause classes:

```text
ROOT_CAUSE_ROUTER_MISSING_ROUTE
ROOT_CAUSE_WITHOUT_REMEDIATION_PLAN
ROOT_CAUSE_WITHOUT_VALIDATION_PLAN
ROOT_CAUSE_ROUTING_CONTRACT_DRIFT
```

AS6_DIAGNOSTIC_CONTRACT_NO_RECURSION=PASS

## AS6 Diagnostic Registration Governance Rule

Every diagnostic artifact must be registered in git, registry, coverage, and the root-cause governance chain when applicable.

Required signals:

```text
AS6_DIAGNOSTIC_REGISTRATION=PASS
AS6_DIAGNOSTIC_FILE_EXISTS=PASS
AS6_DIAGNOSTIC_GIT_TRACKED=PASS
AS6_DIAGNOSTIC_IN_REGISTRY=PASS
AS6_DIAGNOSTIC_IN_COVERAGE=PASS
AS6_DIAGNOSTIC_HELPER_GIT_TRACKED=PASS
```

Controls:

```text
git_tracked_diagnostic_required
registry_item_must_be_git_tracked
diagnostic_helper_must_be_git_tracked
coverage_after_new_diagnostic
registry_after_new_diagnostic
```

Root cause classes:

```text
DIAGNOSTIC_GIT_REGISTRATION_DRIFT
DIAGNOSTIC_HELPER_GIT_REGISTRATION_DRIFT
DIAGNOSTIC_REGISTRY_GIT_HYGIENE_DRIFT
DIAGNOSTIC_COVERAGE_REGISTRATION_DRIFT
```

## AS6 Generated Python Variable Contract Rule

Generated Python helpers and diagnostics must prove that generated variable references match assigned variable names and that runtime NameError signatures are not present.

Required signals:

```text
AS6_GENERATED_VARIABLE_CONTRACT=PASS
AS6_VARIABLE_CONTRACT=PASS
AS6_NAMEERROR_SIGNATURES=PASS
AS6_GENERATED_PYTHON_SAFETY=PASS
AS6_REBOOT_FORENSICS_RUNTIME=PASS
```

Root cause classes:

```text
GENERATED_VARIABLE_NAME_DRIFT
GENERATED_TEMPLATE_REFERENCE_DRIFT
REBOOT_FORENSICS_RUNTIME_FAILURE
```

## AS6 Generated Python Safety Scope Rule

Generated Python safety must fail on newly generated unsafe helpers and diagnostics, but legacy heredoc findings are warnings until migrated. Diagnostic self-reference must be excluded from failure evidence.

Required signals:

```text
AS6_GENERATED_PYTHON_SAFETY_SCOPE=PASS
AS6_GENERATED_PYTHON_SELF_REFERENCE_EXCLUSION=PASS
```

## AS6 Python Variable Contract Exception Handler Rule

Python variable-contract diagnostics must understand exception-handler bindings such as `except SyntaxError as exc` and must not report exception classes or handler variables as unresolved generated-variable drift.

Required signals:

```text
AS6_VARIABLE_CONTRACT_EXCEPT_HANDLER=PASS
AS6_VARIABLE_CONTRACT_FALSE_POSITIVE_SUPPRESSION=PASS
```

## AS6 Python Artifact Git Hygiene Rule

Generated Python helpers must not leave `__pycache__` or `.pyc` artifacts in the repository or git index.

Required signals:

```text
AS6_NO_PYCACHE_ARTIFACTS=PASS
AS6_NO_PYC_FILES=PASS
AS6_NO_TRACKED_PYCACHE=PASS
AS6_NO_UNTRACKED_PYCACHE=PASS
AS6_PYTHON_ARTIFACT_GIT_HYGIENE=PASS
```

## AS6 NameError Signature Backup Scope Rule

NameError signature diagnostics must scan active runtime evidence only. Diagnostic backups and forensic archives are evidence snapshots and must not be treated as active source failures.

Required signals:

```text
AS6_BACKUP_ARTIFACT_EXCLUSION=PASS
AS6_RUNTIME_DIAGNOSTIC_BACKUP_NOT_SCANNED=PASS
AS6_NAMEERROR_SIGNATURE_SCOPE=PASS
```

## AS6 Generated Python Runtime Contract Rule

Generated Python helper diagnostics must compile, import safely where applicable, avoid NameError regressions, and pass regression execution before registry/coverage are considered complete.

Required signals:

```text
AS6_GENERATED_PYTHON_RUNTIME=PASS
AS6_GENERATED_PYTHON_IMPORTS=PASS
AS6_GENERATED_PYTHON_NAMEERROR=PASS
AS6_GENERATED_PYTHON_REGRESSION=PASS
AS6_GENERATED_PYTHON_RUNTIME_CONTRACT=PASS
```

## AS6 Generated Python Self Import Guard Rule

Generated Python runtime-contract diagnostics must not import their own runtime-contract checker during import validation. Self import is a recursion risk and must be explicitly excluded while still compiling the checker.

Required signals:

```text
AS6_GENERATED_PYTHON_SELF_IMPORT_EXCLUSION=PASS
AS6_GENERATED_PYTHON_SELF_IMPORT_GUARD=PASS
```

## AS6 Generated Python Pycache Cleanup Rule

Generated Python runtime-contract diagnostics must prevent and clean `__pycache__` and `.pyc` artifacts before and after compile, import, and regression phases.

Required signals:

```text
AS6_GENERATED_PYTHON_RUNTIME_CLEANUP=PASS
AS6_GENERATED_PYTHON_PYCACHE_CLEANUP=PASS
AS6_GENERATED_PYTHON_IMPORT_SAFE=PASS
```

## AS6 Generated Python Compile Target Safety Rule

Generated Python compile checks must use safe temporary compile targets and must not use `/dev/null` as a py_compile cfile target.

Required signals:

```text
AS6_GENERATED_PYTHON_COMPILE_TARGET_SAFE=PASS
```

## AS6 Diagnostic Git Tracking Rule

Every diagnostic that is present in registry and coverage must also be tracked by git or staged for tracking before governance can pass.

Required signals:

```text
AS6_DIAGNOSTIC_GIT_TRACKING=PASS
AS6_DIAGNOSTIC_TRACKING_CONSISTENCY=PASS
AS6_DIAGNOSTIC_TRACKING_COVERAGE=PASS
```

## AS6 Generated Python Contracts Rule

Generated Python diagnostics must pass runtime, import, nameerror, compile, regression, and helper tracking contracts before governance can pass.

Required signals:

```text
AS6_GENERATED_PYTHON_IMPORT_CONTRACT=PASS
AS6_GENERATED_PYTHON_NAMEERROR_CONTRACT=PASS
AS6_GENERATED_PYTHON_RUNTIME_CONTRACT_AGGREGATE=PASS
AS6_GENERATED_PYTHON_COMPILE_CONTRACT=PASS
AS6_GENERATED_PYTHON_REGRESSION_CONTRACT=PASS
AS6_GENERATED_PYTHON_HELPER_TRACKING=PASS
AS6_GENERATED_PYTHON_CONTRACTS=PASS
```

## AS6 Generated Python Contract Import Guard Rule

Generated Python aggregate contract helpers must be import-safe. Contract execution must be guarded by `if __name__ == "__main__"` to prevent recursive runpy/import side effects.

Required signals:

```text
AS6_GENERATED_PYTHON_CONTRACT_IMPORT_GUARD=PASS
AS6_GENERATED_PYTHON_CONTRACT_HELPER_IMPORT_SAFE=PASS
```

## AS6 Diagnostic Single File Tracking Rule

A registered diagnostic must not remain as `??` in git status. Single-file registration drift must be fixed immediately by staging the diagnostic and rerunning tracking diagnostics.

Required signal:

```text
AS6_DIAGNOSTIC_TRACKING_SINGLE_FILE_DRIFT=PASS
```

## AS6 Generated Python Contract Coverage Rule

Every generated-python diagnostic and helper must be covered by aggregate contracts, registry, coverage, git tracking, and registration governance.

Required signals:

```text
AS6_GENERATED_PYTHON_DIAGNOSTIC_CONTRACT_COVERAGE=PASS
AS6_GENERATED_PYTHON_HELPER_CONTRACT_COVERAGE=PASS
AS6_GENERATED_PYTHON_CONTRACT_REGISTRY_COVERAGE=PASS
AS6_GENERATED_PYTHON_CONTRACT_TRACKING_COVERAGE=PASS
AS6_GENERATED_PYTHON_CONTRACT_COVERAGE=PASS
```

## AS6 SSH Interactive Heredoc Guard Rule

Large patches must not be pasted into interactive SSH sessions as huge heredocs.

Required rule:

## AS6 SSH Interactive Heredoc Guard Rule

Large patches must not be pasted into interactive SSH sessions as huge heredocs.

Required rule:
- interactive SSH patch blocks must stay small, preferably under 100 lines;
- large patches must use file upload, tmux, nohup, or small staged chunks;
- SSH disconnect during huge heredoc paste is classified as SSH_INTERACTIVE_HEREDOC_SESSION_DROP.

Required signals:

```text
AS6_SSH_SESSION_STABILITY=PASS
AS6_INTERACTIVE_HEREDOC_SIZE_CONTROL=PASS
AS6_LARGE_PATCH_DELIVERY_GUARD=PASS
AS6_SSH_TRANSPORT_RESILIENCE=PASS
AS6_SSH_INTERACTIVE_HEREDOC_SESSION_DROP=PASS
```
