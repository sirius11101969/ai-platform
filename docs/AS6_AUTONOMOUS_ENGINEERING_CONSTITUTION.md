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