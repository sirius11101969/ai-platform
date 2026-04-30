# ADR-001: Monolith First Architecture

## Status

Accepted

## Date

2026-04-30

## Context

The platform is in MVP stage targeting 0–50 clients.
Engineering resources are limited.
Fast delivery and iteration speed are prioritized over infrastructure complexity.

## Decision

Build backend initially as a modular monolith.

## Consequences

### Positive

* Faster implementation speed
* Simpler deployment pipeline
* Lower DevOps overhead
* Easier local development/debugging

### Negative

* Future service decomposition may be required
* Risk of tighter coupling if boundaries are not respected

## Migration Trigger

Split into services when:

* Active clients exceed 50–100
* Background jobs/agents create scaling bottlenecks
* Team grows beyond 5 engineers
* Deployment frequency causes coordination issues

## Alternatives Considered

* Microservices from day one
* Service-oriented backend

## Why Rejected

Premature complexity for current product stage.
