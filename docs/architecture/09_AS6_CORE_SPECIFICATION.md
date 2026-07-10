# AS6 Core Specification v1.0

Status: NORMATIVE / ARCHITECTURE FREEZE v1.0

## 1. Definition

AS6 is a Living Business Operating System in which a user works through intent, persistent context, interconnected spaces, knowledge, AI assistance, action, and organizational memory.

AS6 is not a collection of separate modules. CRM, Finance, Documents, Projects, Team, Decisions, Automation, Business Pulse, Collaborative Thinking, Presence, and Knowledge are states of one Living Space.

## 2. Three-layer architecture

### Experience Layer

The user sees one continuous Living Space composed of approved space states.

Responsibilities:

- visual continuity;
- space state rendering;
- calm interaction;
- navigation by intent;
- preservation of active context;
- shared Master Screen components.

### Intelligence Layer

The Intelligence Layer determines meaning and next action.

Core capabilities:

- Intent Engine;
- Context Engine;
- Knowledge Graph;
- Navigation Engine;
- Recommendation Engine;
- AI Orchestrator;
- Memory Engine.

### Execution Layer

The Execution Layer performs operations and stores operational data.

Examples:

- CRM data;
- financial data;
- documents;
- projects;
- tasks;
- integrations;
- APIs;
- automation;
- databases.

Execution details must not define the user experience directly. They are interpreted through the Intelligence Layer and represented through Living Space.

## 3. Approved Living Spaces

1. Focus — Пространство концентрации
2. CRM — Пространство отношений
3. Финансы — Пространство устойчивости
4. Документы — Пространство знаний
5. Проекты — Пространство развития
6. Команда — Пространство взаимодействия
7. Решения — Пространство выбора
8. Автоматизация — Пространство автономности
9. Пульс бизнеса — Пространство состояния
10. Совместное мышление — Пространство синхронизации
11. Присутствие — Пространство сопровождения
12. Знания — Пространство памяти

Each space answers one primary question only. The normative list of questions and visual governance is maintained in `docs/AS6_LIVING_SPACE_RULES.md`.

## 4. Universal interaction lifecycle

Every meaningful interaction follows this sequence:

1. Person.
2. Intent.
3. Active context.
4. Space selection.
5. Relevant knowledge.
6. AI recommendation or explanation.
7. Decision.
8. Action.
9. Event.
10. Memory update.

A feature is incomplete when it bypasses intent, context, knowledge, or memory without an explicit architectural exception.

## 5. Universal entity model

Every major AS6 entity should expose a common conceptual contract:

- stable identifier;
- entity type;
- human-readable name;
- active context;
- relationships;
- events;
- history;
- derived knowledge;
- recommendations;
- automation capabilities;
- access and governance metadata.

Examples include clients, organizations, contacts, deals, invoices, documents, projects, tasks, employees, decisions, automations, and knowledge objects.

## 6. Persistent context

Context belongs to the whole system, not to one space.

When a user activates an entity or business situation, all relevant spaces must be able to resolve that context without requiring repeated selection or data entry.

Example: a selected client may resolve to CRM relationships, financial exposure, documents, active projects, responsible team members, decisions, and organizational memory.

## 7. Intent-first navigation

The primary navigation input is the user’s purpose, not a module menu.

The navigation pipeline is:

1. detect intent;
2. resolve ambiguity;
3. preserve or establish context;
4. select the most relevant space;
5. prepare supporting spaces;
6. present the next useful action.

A single intent may involve several spaces, but one space remains the primary visual state at a time.

## 8. Knowledge and memory

Documents and records are sources. Knowledge is the interpreted value.

Every significant action should produce one or more of:

- new knowledge;
- updated knowledge;
- validated knowledge;
- new relationships;
- a decision record;
- an event in organizational memory.

Knowledge must be reusable by all relevant spaces.

## 9. AI orchestration

The user interacts with AS6, not with individual AI model brands.

AS6 may route work to different models or deterministic services, but the experience remains unified.

The AI layer must help the user understand, decide, and act. Adding a generic chat surface without a defined space question, context, and action is not sufficient.

## 10. Master Screen inheritance

Screen 1 (Focus) is the visual Master Screen.

All spaces inherit:

- AS6 Living Sky;
- Calm Business;
- visual hierarchy;
- typography;
- spacing rhythm;
- component proportions;
- light behavior;
- right information rail;
- lower action area;
- interaction tone;
- motion principles.

Differences between spaces are semantic and contextual. They must not create parallel design systems.

## 11. Feature design sequence

Before implementation, every feature must define:

1. user intent;
2. owning space;
3. primary question improved;
4. active context;
5. entity relationships;
6. knowledge created or updated;
7. role of AI;
8. user decision or action enabled;
9. memory/event output;
10. visual integration with the Master Screen.

Only then may implementation begin.

## 12. Acceptance criteria

A feature or space state is accepted only when it:

- preserves one Living Space;
- improves one primary user question;
- keeps context continuous;
- uses shared components where applicable;
- contributes to knowledge or memory;
- helps the user understand, decide, or act;
- does not increase unnecessary cognitive load;
- conforms to `docs/AS6_LIVING_SPACE_RULES.md`;
- introduces no independent visual system;
- passes project diagnostics and governance controls.

## 13. Change classes

### Content change

Changes meaning, labels, entities, recommendations, or data while preserving architecture and components.

### Component evolution

Improves a shared component while preserving Master Screen inheritance and compatibility across spaces.

### Architecture change

Changes a frozen principle, space list, primary-question model, context model, or layer boundary.

Architecture changes require explicit architecture review, governance updates, diagnostics, coverage registration, validation, and a dedicated commit.

## 14. Frozen principles

The following are frozen at v1.0:

- AS6 as a Living Business Operating System;
- one continuous Living Space;
- twelve approved spaces;
- one primary question per space;
- intent-first navigation;
- persistent context;
- knowledge-first interpretation;
- unified AI orchestration;
- Screen 1 as Master Screen;
- AS6 Living Sky;
- Calm Business;
- evolutionary change over destructive redesign.

## 15. Repository-first rule

The GitHub repository is the source of truth for AS6 architecture and governance.

Before producing a new implementation plan, UI prompt, architecture recommendation, or code change for AS6, the relevant repository specifications must be checked. Chat history, memory, and visual references are secondary to the current committed documents.
