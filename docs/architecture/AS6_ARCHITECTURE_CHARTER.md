# AS6 Architecture Charter

DOCUMENT_TYPE=ARCHITECTURE_CHARTER
DOCUMENT_STATUS=NORMATIVE
CHARTER_VERSION=2
ARCHITECTURE_ERA=UNIFIED_AI_WORKSPACE
BASELINE=EPIC006_COMPLETE

FOUNDATION_STATUS=COMPLETE
EXECUTION_LAYER_STATUS=COMPLETE
WORKSPACE_STATUS=IN_PROGRESS
PROJECT_PHASE=WORKSPACE_EVOLUTION
ARCHITECTURE_STATUS=STABLE_FOUNDATION
CURRENT_BASELINE=EPIC006_COMPLETE
NEXT_BASELINE=EPIC007_WORKSPACE_COMPLETE
PRIMARY_ENGINEERING_GOAL=PLATFORM_CONSOLIDATION
PRIMARY_PRODUCT_GOAL=UNIFIED_AI_WORKSPACE

## Architecture Principles

- PRN-001 Workspace First.
- PRN-002 Reuse Before Build.
- PRN-003 Evolution Over Replacement.

## Architecture Constraints

- CNS-001 Stable Foundation.
- CNS-002 No Parallel Workspaces.
- CNS-003 No Duplicate Contexts.
- CNS-004 No Duplicate Design System.

## Architecture Invariants

- INV-001 Single Workspace.
- INV-002 Single Navigation.
- INV-003 Single Context.
- INV-004 Single Design System.
- INV-005 Single Governance.
- INV-006 Single Automation Runtime.
- INV-007 Single Execution Engine.
- INV-008 Single Knowledge Model.

## Quality Gates

- QGT-001 Navigation Consistency.
- QGT-002 Component Consistency.
- QGT-003 Interaction Consistency.
- QGT-004 Context Consistency.
- QGT-005 Visual Consistency.
- QGT-006 AI Consistency.

## Primary Risk

PRIMARY_ARCHITECTURE_RISK=WORKSPACE_FRAGMENTATION

## EPIC-007 PR3 Quality Gate Addition

- QGT-007 Context Awareness.

Rule: AI features must use Workspace Context before introducing local AI state.

## EPIC-007 PR4 Architecture Invariant Addition

- INV-009 Single AI Workspace.

Rule: all intelligent platform features must work through the unified AI Workspace and Workspace Context.

## EPIC-007 Complete — Era 3 Principle Addition

- PRN-003 Intelligence Uses Platform.

Rule: every intelligence feature must use Workspace Context, Module Registry, Executive Runtime, Governance, Execution Engine and AI Workspace before creating new independent mechanisms.

## EPIC-008 PR2 Principle Addition

- PRN-004 Intelligence Uses Context.

Rule: every intelligence capability must use Context Intelligence Snapshot as the primary source of user and platform state.

## EPIC-008 PR2 Invariant Addition

- INV-010 Single Intelligence Context.

Rule: Recommendation Engine, Scenario Planner, Predictive Execution and future AI Workforce must use one Context Intelligence model.

## EPIC-008 PR2 Quality Gate Addition

- QGT-008 Recommendation Explainability.

Rule: every recommendation must include reason, context source, confidence and safe alternative.
