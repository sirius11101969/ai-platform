# ADR-004: PostgreSQL as Primary Database

## Status

Accepted

## Date

2026-04-30

## Context

Platform requires relational CRM data, reporting, workflow state, and transactional consistency.

## Decision

Use PostgreSQL as the primary database.

## Consequences

### Positive

* Strong relational modeling
* ACID compliance
* Mature ecosystem
* Supports JSON fields when flexibility needed

### Negative

* Not optimized for high-scale analytics workloads
* May require read replicas at scale

## Migration Trigger

Add specialized stores when:

* Analytics workloads impact OLTP performance
* Vector search becomes core requirement
* Read scaling exceeds single-node capacity

## Alternatives Considered

* MongoDB
* MySQL

## Why Rejected

MongoDB weaker for relational CRM modeling.
MySQL offers fewer advanced features/flexibility.
