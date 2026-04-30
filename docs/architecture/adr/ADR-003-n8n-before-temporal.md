# ADR-003: n8n Before Temporal

## Status

Accepted

## Date

2026-04-30

## Context

Early-stage automation workflows are needed quickly.
Complex distributed orchestration is not yet required.

## Decision

Use n8n for workflow automation during MVP/Growth stages.
Introduce Temporal only when orchestration complexity requires it.

## Consequences

### Positive

* Rapid workflow prototyping
* Low engineering overhead
* Business users can inspect flows
* Faster time-to-market

### Negative

* Limited scalability for highly complex orchestration
* Event/state management less robust than Temporal

## Migration Trigger

Adopt Temporal when:

* Workflow complexity becomes hard to manage in n8n
* Need durable execution/stateful retries
* High concurrency/agent orchestration emerges

## Alternatives Considered

* Temporal from day one
* Custom orchestration engine

## Why Rejected

Too much complexity for current stage.
