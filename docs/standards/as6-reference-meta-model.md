# AS6 Reference Meta-Model

DOCUMENT_TYPE=REFERENCE_META_MODEL
STATUS=CANONICAL
MODEL_SCOPE=AS6_ENGINEERING_SYSTEM_DESCRIPTION

## I. Scope

The AS6 Reference Meta-Model is a descriptive semantic framework that defines the descriptive vocabulary and semantic relations through which the AS6 engineering system can be consistently represented, analyzed, and evaluated.

It is intentionally independent of representation syntax and does not prescribe engineering practice, implementation processes, documentation formats, or normative content.

Instead, it establishes the fundamental descriptive primitives that enable normative standards, operational artifacts, and runtime evidence to be represented and related within a coherent, evolvable, and semantically consistent engineering system.

## Scope Boundaries

The AS6 Reference Meta-Model:

- does not define product architecture;
- does not define engineering processes;
- does not define governance policies;
- does not define business functionality;
- does not define documentation syntax;
- does not prescribe Markdown, UML, YAML, JSON or any other representation format;
- does not replace AS6 Architecture Standard;
- does not replace AS6 Engineering Lifecycle;
- does not replace AS6 Governance Standard;
- is not a superstandard.

## II. Descriptive Vocabulary

### Constraint Space

Constraint Space describes the admissible class of engineering organizations within the AS6 normative system.

### Invariant Mapping

Invariant Mapping describes the invariant structure by which managed objects are mapped to ordered engineering phases.

### Context

Context describes the managed object to which the engineering lifecycle is instantiated.

### Conformance Relation

Conformance Relation describes the evaluation of expected runtime evidence against observed runtime evidence.

## III. Semantic Relations

### Reference Meta-Model to Normative Standards

Reference Meta-Model defines descriptive vocabulary and semantic relations.

Normative Standards define normative requirements.

### Normative Standards to Operational Artifacts

Operational Artifacts document the application of normative requirements.

### Operational Artifacts to Runtime Evidence

Runtime Evidence demonstrates requirement fulfillment.

### Governance Relation

Governance evaluates conformance between expected and observed runtime evidence under the applicable normative system.

Observed Evidence ⊨ Expected Evidence

## IV. Syntax Independence

The AS6 Reference Meta-Model is independent of representation syntax.

It does not prescribe:

- document formats;
- modeling notations;
- serialization formats;
- repository structures;
- documentation templates.

Any representation that preserves the descriptive vocabulary and semantic relations is semantically equivalent with respect to the AS6 Reference Meta-Model.

## V. Semantic Definitions

### Definition 1 — Engineering Meta-Architecture

Engineering Meta-Architecture defines the admissible constraint space of the normative system.

### Definition 2 — Engineering Lifecycle

Engineering Lifecycle defines an invariant mapping from managed objects to ordered engineering phases.

### Definition 3 — Managed Objects

Managed Objects provide the context in which the lifecycle is instantiated.

### Definition 4 — Governance

Governance evaluates conformance between expected and observed runtime evidence.

## VI. Derived Concepts

Operational Artifacts are derived from the application of the invariant lifecycle to a managed object.

Runtime Evidence is derived from the need to demonstrate fulfillment of expectations documented by operational artifacts under applicable normative standards.

Decision Records, EPIC Charters, ADRs, Baseline Manifests, Production Readiness Reviews, Runtime Traces, Build Artifacts, Guardian Reports and Secret Scan Reports are specializations within the Reference Meta-Model, not new fundamental meta-categories.

## VII. Quality Properties

### Semantic Expressiveness

A Reference Meta-Model is semantically expressive if every engineering situation within its intended project domain can be represented without extending its descriptive vocabulary or semantic relations.

### Structural Stability

A Reference Meta-Model is structurally stable when repeated application to independent engineering situations does not require modification of its descriptive vocabulary or semantic relations.

## VIII. Final Statement

The AS6 Reference Meta-Model does not prescribe engineering practice.

It provides the descriptive vocabulary and semantic relations required to consistently represent, analyze and evaluate the AS6 engineering system.
