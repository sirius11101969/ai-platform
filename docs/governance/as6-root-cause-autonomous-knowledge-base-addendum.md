# AS6 Root Cause Addendum: Autonomous Knowledge Base

## KNOWLEDGE_BASE_CONTROLLER_EVIDENCE_MISSING
Severity: high
Symptoms: knowledge-base state is claimed but no evidence exists.
Verification: check runtime/knowledge-base-controller/latest.out.
Fix: run ops/bin/as6-autonomous-knowledge-base-controller.
Rollback: block knowledge-base promotion.
Prevention: enforce AEC_KNOWLEDGE_BASE_REQUIRES_EVIDENCE.

## KNOWLEDGE_BASE_REGISTRY_DRIFT
Severity: high
Symptoms: diagnostics or controllers are not registered.
Verification: compare ops/bin with ops/registry.
Fix: register missing artifacts.
Rollback: block L7 promotion.
Prevention: enforce AEC_KNOWLEDGE_BASE_REQUIRES_REGISTRY_ALIGNMENT.

## KNOWLEDGE_BASE_COVERAGE_DRIFT
Severity: high
Symptoms: diagnostic exists without coverage.
Verification: inspect docs/coverage and coverage registry.
Fix: add coverage document and registry entry.
Rollback: block L7 promotion.
Prevention: enforce AEC_KNOWLEDGE_BASE_REQUIRES_COVERAGE_ALIGNMENT.

## KNOWLEDGE_BASE_AEC_DRIFT
Severity: high
Symptoms: control exists without AEC rule.
Verification: inspect ops/registry/as6-aec-registry.md.
Fix: add missing AEC rule.
Rollback: block autonomous action.
Prevention: enforce AEC_KNOWLEDGE_BASE_REQUIRES_AEC_ALIGNMENT.

## KNOWLEDGE_BASE_STATE_DRIFT
Severity: high
Symptoms: AS6_PROJECT_STATE.md is stale compared with implemented controllers.
Verification: run knowledge-base controller.
Fix: update docs/AS6_PROJECT_STATE.md.
Rollback: block state promotion.
Prevention: enforce AEC_KNOWLEDGE_BASE_REQUIRES_STATE_FRESHNESS.
